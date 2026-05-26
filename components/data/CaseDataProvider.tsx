'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';
import { getFirebaseClientDb, isFirebaseAuthMode, isFirebaseDataMode } from '@/lib/firebase/client';
import type {
  Caso,
  ConexionTablero,
  Evidencia,
  EstadoHallazgo,
  EstadoRevisionEvidencia,
  Hallazgo,
  MiembroCaso,
  NodoTablero,
  RespuestaAuditado,
  TipoRelacion,
} from '@/lib/types';
import { calculateRiskLevel, calculateSeveridad } from '@/lib/risk';

type EvidenceInput = Omit<Evidencia, 'id'> & { id?: string };
type FindingInput = Omit<Hallazgo, 'id' | 'severidad' | 'nivelRiesgo'> & { id?: string };
type ResponseInput = Omit<RespuestaAuditado, 'id'> & { id?: string };
type BoardNodeInput = Omit<NodoTablero, 'id'> & { id?: string };
type BoardConnectionInput = Omit<ConexionTablero, 'id'> & { id?: string };

interface CaseDataContextValue {
  caso: Caso;
  isHydrated: boolean;
  resetDemo: () => void;
  updateCaso: (updater: (caso: Caso) => Caso) => void;
  upsertEvidencia: (input: EvidenceInput, options?: { addToBoard?: boolean }) => Evidencia;
  discardEvidencia: (id: string) => void;
  updateEvidenciaStatus: (id: string, estadoRevision: EstadoRevisionEvidencia) => void;
  upsertHallazgo: (input: FindingInput, options?: { addToBoard?: boolean }) => Hallazgo;
  discardHallazgo: (id: string) => void;
  updateHallazgoStatus: (id: string, estado: EstadoHallazgo) => void;
  upsertRespuestaAuditado: (input: ResponseInput) => RespuestaAuditado;
  updateBoardNodes: (nodos: NodoTablero[]) => void;
  addBoardNode: (input: BoardNodeInput) => NodoTablero;
  updateBoardNode: (id: string, patch: Partial<NodoTablero>) => void;
  deleteBoardNode: (id: string) => void;
  addBoardConnection: (desde: string, hacia: string, etiqueta: TipoRelacion, options?: Partial<BoardConnectionInput>) => ConexionTablero;
  updateBoardConnection: (id: string, patch: Partial<ConexionTablero>) => void;
  deleteBoardConnection: (id: string) => void;
  syncStatus: 'local' | 'idle' | 'saving' | 'error' | 'conflict';
  syncMessage: string | null;
  reloadRemoteCase: () => Promise<void>;
}

const CaseDataContext = createContext<CaseDataContextValue | null>(null);
const FIREBASE_DATA_ENABLED = isFirebaseDataMode();
const FIREBASE_AUTH_ENABLED = isFirebaseAuthMode();

function cloneCase(caso: Caso): Caso {
  return JSON.parse(JSON.stringify(caso)) as Caso;
}

function storageKey(id: string) {
  return `true-audit:case:${id}`;
}

function boardLineStyleMigrationKey(id: string) {
  return `true-audit:case:${id}:board-lines-curved-v3`;
}

function migrateBoardLineStyle(caso: Caso): Caso {
  return {
    ...caso,
    conexionesTablero: caso.conexionesTablero.map(connection => (
      connection.estilo === 'curva' ? connection : { ...connection, estilo: 'curva' }
    )),
  };
}

function nextNumericId(prefix: string, existingIds: string[]) {
  const max = existingIds.reduce((current, id) => {
    const match = id.match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

function evidenceNodeType(evidencia: Evidencia): NodoTablero['tipo'] {
  if (evidencia.tipo === 'entrevista') return 'entrevista';
  if (evidencia.tipo === 'ficha-prueba' || evidencia.tipo === 'prueba' || evidencia.tipo === 'checklist') return 'prueba';
  if (['registro-sistema', 'captura', 'fotografia', 'evidencia-tecnica'].includes(evidencia.tipo)) return 'evidencia';
  return 'documento';
}

function nodeShapeForType(tipo: NodoTablero['tipo']): NodoTablero['shape'] {
  if (tipo === 'documento') return 'documento';
  if (tipo === 'hallazgo') return 'rombo';
  if (tipo === 'criterio') return 'badge';
  if (tipo === 'respuesta' || tipo === 'observacion') return 'nota';
  if (tipo === 'prueba') return 'cilindro';
  return 'rectangulo';
}

function appendTimeline(caso: Caso, event: Caso['timeline'][number]): Caso {
  return { ...caso, timeline: [...caso.timeline, event] };
}

function normalizeCase(caso: Caso): Caso {
  return {
    ...caso,
    revision: caso.revision ?? 0,
  };
}

function caseSignature(caso: Caso) {
  return JSON.stringify(caso);
}

async function loadFirebaseCase(caseId: string, token?: string | null): Promise<{ caso: Caso | null; member?: MiembroCaso | null }> {
  const response = await fetch(`/api/casos/${caseId}/data`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
  });

  if (response.status === 404) return { caso: null };
  if (!response.ok) {
    throw new Error(`Firebase devolvio ${response.status} al cargar el caso.`);
  }

  const body = await response.json() as { caso?: Caso | null; member?: MiembroCaso | null };
  return { caso: body.caso ? normalizeCase(body.caso) : null, member: body.member ?? null };
}

async function saveFirebaseCase(caso: Caso, options?: { token?: string | null; baseRevision?: number }) {
  const response = await fetch(`/api/casos/${caso.id}/data`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify({
      caso,
      baseRevision: options?.baseRevision,
      action: 'case.update',
      entity: 'caso',
    }),
  });

  if (response.status === 409) {
    const body = await response.json() as { currentRevision?: number; expectedRevision?: number };
    const error = new Error('conflict') as Error & { currentRevision?: number; expectedRevision?: number; conflict?: boolean };
    error.conflict = true;
    error.currentRevision = body.currentRevision;
    error.expectedRevision = body.expectedRevision;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Firebase devolvio ${response.status} al guardar el caso.`);
  }

  return response.json() as Promise<{ caso?: Caso; revision?: number }>;
}

export default function CaseDataProvider({
  initialCaso,
  children,
}: {
  initialCaso: Caso;
  children: React.ReactNode;
}) {
  const {
    authReady,
    idToken,
    isAuthenticated,
    canEditAuditWork,
    canRegisterResponse,
    setCaseMembership,
  } = useAuth();
  const [caso, setCaso] = useState<Caso>(() => normalizeCase(cloneCase(initialCaso)));
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CaseDataContextValue['syncStatus']>(FIREBASE_DATA_ENABLED ? 'idle' : 'local');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const firebaseSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseRevisionRef = useRef(initialCaso.revision ?? 0);
  const lastSavedSignatureRef = useRef(caseSignature(normalizeCase(cloneCase(initialCaso))));
  const skipNextRemoteSaveRef = useRef(false);

  const applyRemoteCase = useCallback((remoteCaso: Caso) => {
    const normalized = normalizeCase(remoteCaso);
    baseRevisionRef.current = normalized.revision ?? 0;
    lastSavedSignatureRef.current = caseSignature(normalized);
    setCaso(normalized);
    window.localStorage.setItem(storageKey(initialCaso.id), JSON.stringify(normalized));
  }, [initialCaso.id]);

  const reloadRemoteCase = useCallback(async () => {
    if (!FIREBASE_DATA_ENABLED) return;
    if (FIREBASE_AUTH_ENABLED && !idToken) return;
    const remote = await loadFirebaseCase(initialCaso.id, idToken);
    if (remote.member !== undefined) setCaseMembership(remote.member ?? null);
    if (remote.caso) {
      applyRemoteCase(migrateBoardLineStyle(remote.caso));
      setSyncStatus('idle');
      setSyncMessage('Version remota recargada.');
    }
  }, [applyRemoteCase, idToken, initialCaso.id, setCaseMembership]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (FIREBASE_AUTH_ENABLED && !authReady) return;

      try {
        const saved = window.localStorage.getItem(storageKey(initialCaso.id));
        const lineStyleMigrated = window.localStorage.getItem(boardLineStyleMigrationKey(initialCaso.id));

        if (FIREBASE_AUTH_ENABLED && !isAuthenticated) {
          const demoCaso = migrateBoardLineStyle(normalizeCase(cloneCase(initialCaso)));
          if (!cancelled) {
            setCaseMembership(null);
            applyRemoteCase(demoCaso);
          }
          if (!lineStyleMigrated) window.localStorage.setItem(boardLineStyleMigrationKey(initialCaso.id), '1');
          return;
        }

        if (saved && !FIREBASE_AUTH_ENABLED) {
          const parsed = JSON.parse(saved) as Caso;
          const localCaso = lineStyleMigrated ? normalizeCase(parsed) : migrateBoardLineStyle(normalizeCase(parsed));
          if (!cancelled) applyRemoteCase(localCaso);
          if (!lineStyleMigrated) {
            window.localStorage.setItem(boardLineStyleMigrationKey(initialCaso.id), '1');
          }
          return;
        }

        if (!lineStyleMigrated) {
          window.localStorage.setItem(boardLineStyleMigrationKey(initialCaso.id), '1');
        }

        if (FIREBASE_DATA_ENABLED) {
          const remote = await loadFirebaseCase(initialCaso.id, idToken);
          if (cancelled) return;

          if (remote.member !== undefined) setCaseMembership(remote.member ?? null);

          if (remote.caso) {
            applyRemoteCase(migrateBoardLineStyle(remote.caso));
            return;
          }

          const demoCaso = migrateBoardLineStyle(normalizeCase(cloneCase(initialCaso)));
          applyRemoteCase(demoCaso);
          if (!FIREBASE_AUTH_ENABLED) await saveFirebaseCase(demoCaso);
        }
      } catch {
        if (!cancelled) {
          setSyncStatus(FIREBASE_DATA_ENABLED ? 'error' : 'local');
          setSyncMessage('No se pudo cargar Firestore. Se mantiene el modo demo/local.');
          setCaso(normalizeCase(cloneCase(initialCaso)));
        }
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
      if (firebaseSaveTimerRef.current) {
        clearTimeout(firebaseSaveTimerRef.current);
        firebaseSaveTimerRef.current = null;
      }
    };
  }, [applyRemoteCase, authReady, idToken, initialCaso, isAuthenticated, setCaseMembership]);

  useEffect(() => {
    if (!FIREBASE_AUTH_ENABLED || !isAuthenticated || !idToken) return;
    const db = getFirebaseClientDb();
    if (!db) return;

    const unsubscribe = onSnapshot(doc(db, 'casos', initialCaso.id), snapshot => {
      const remote = snapshot.data()?.payload as Caso | undefined;
      if (!remote) return;
      const remoteRevision = remote.revision ?? snapshot.data()?.revision ?? 0;
      if (remoteRevision <= baseRevisionRef.current) return;
      if (syncStatus === 'saving') {
        setSyncStatus('conflict');
        setSyncMessage('Hay una version mas reciente del expediente. Recarga antes de seguir editando.');
        return;
      }
      applyRemoteCase(migrateBoardLineStyle(remote));
      setSyncMessage('Se recibieron cambios remotos del expediente.');
    });

    return unsubscribe;
  }, [applyRemoteCase, idToken, initialCaso.id, isAuthenticated, syncStatus]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(storageKey(initialCaso.id), JSON.stringify(caso));

    const signature = caseSignature(caso);
    if (signature === lastSavedSignatureRef.current) return;

    if (!FIREBASE_DATA_ENABLED) {
      lastSavedSignatureRef.current = signature;
      return;
    }

    if (skipNextRemoteSaveRef.current) {
      skipNextRemoteSaveRef.current = false;
      lastSavedSignatureRef.current = signature;
      return;
    }

    if (FIREBASE_AUTH_ENABLED && (!idToken || (!canEditAuditWork && !canRegisterResponse))) return;

    if (firebaseSaveTimerRef.current) clearTimeout(firebaseSaveTimerRef.current);
    firebaseSaveTimerRef.current = setTimeout(() => {
      setSyncStatus('saving');
      setSyncMessage(null);
      void saveFirebaseCase(caso, { token: idToken, baseRevision: baseRevisionRef.current })
        .then(result => {
          const savedCase = result.caso ? normalizeCase(result.caso) : { ...caso, revision: result.revision ?? caso.revision };
          baseRevisionRef.current = savedCase.revision ?? baseRevisionRef.current;
          lastSavedSignatureRef.current = caseSignature(savedCase);
          setCaso(savedCase);
          setSyncStatus('idle');
        })
        .catch(error => {
          if ((error as { conflict?: boolean }).conflict) {
            setSyncStatus('conflict');
            setSyncMessage('Hay una version mas reciente del expediente. Recarga antes de seguir editando.');
            return;
          }
          setSyncStatus('error');
          setSyncMessage('No se pudo sincronizar con Firebase. Se mantiene copia local.');
          console.warn('[true-audit] No se pudo sincronizar con Firebase. Se mantiene copia local.', error);
        });
    }, 700);

    return () => {
      if (firebaseSaveTimerRef.current) {
        clearTimeout(firebaseSaveTimerRef.current);
        firebaseSaveTimerRef.current = null;
      }
    };
  }, [canEditAuditWork, canRegisterResponse, caso, idToken, initialCaso.id, isHydrated]);

  const updateCaso = useCallback((updater: (caso: Caso) => Caso) => {
    setCaso(prev => updater(cloneCase(prev)));
  }, []);

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(storageKey(initialCaso.id));
    window.localStorage.setItem(boardLineStyleMigrationKey(initialCaso.id), '1');
    skipNextRemoteSaveRef.current = true;
    setCaso(normalizeCase(cloneCase(initialCaso)));
  }, [initialCaso]);

  const upsertEvidencia = useCallback((input: EvidenceInput, options?: { addToBoard?: boolean }) => {
    let saved!: Evidencia;
    setCaso(prev => {
      const current = cloneCase(prev);
      const isNew = !input.id;
      const id = input.id ?? nextNumericId('EVD', current.evidencias.map(e => e.id));
      saved = {
        ...input,
        id,
        estadoRevision: input.estadoRevision ?? 'pendiente',
        criterios: input.criterios ?? [],
        hallazgos: input.hallazgos ?? [],
        descartada: input.descartada ?? false,
      };

      const evidencias = current.evidencias.some(e => e.id === id)
        ? current.evidencias.map(e => e.id === id ? saved : e)
        : [...current.evidencias, saved];

      const hallazgos = current.hallazgos.map(h => {
        const linked = saved.hallazgos?.includes(h.id) ?? false;
        const evidenciasSet = new Set(h.evidencias);
        if (linked) evidenciasSet.add(id);
        else evidenciasSet.delete(id);
        return { ...h, evidencias: Array.from(evidenciasSet) };
      });

      let next: Caso = { ...current, evidencias, hallazgos };

      if (options?.addToBoard && !next.nodosTablero.some(n => n.refId === id)) {
        next = {
          ...next,
          nodosTablero: [
            ...next.nodosTablero,
            {
              id: `N-${id}`,
              tipo: evidenceNodeType(saved),
              titulo: saved.titulo.slice(0, 28),
              subtitulo: id,
              refId: id,
              x: 120,
              y: 1220 + next.nodosTablero.filter(n => n.refId.startsWith('EVD')).length * 120,
            },
          ],
        };
      }

      if (isNew) {
        next = appendTimeline(next, {
          id: nextNumericId('EVT', next.timeline.map(e => e.id)),
          tipo: 'registro-evidencia',
          fecha: saved.fecha,
          titulo: `Registro de evidencia ${id}`,
          descripcion: saved.titulo,
          evidenciasVinculadas: [id],
          hallazgosVinculados: saved.hallazgos ?? [],
        });
      }

      return next;
    });
    return saved;
  }, []);

  const discardEvidencia = useCallback((id: string) => {
    updateCaso(current => ({
      ...current,
      evidencias: current.evidencias.map(e => e.id === id
        ? { ...e, descartada: true, estadoRevision: 'descartada' }
        : e),
      hallazgos: current.hallazgos.map(h => ({ ...h, evidencias: h.evidencias.filter(eid => eid !== id) })),
    }));
  }, [updateCaso]);

  const updateEvidenciaStatus = useCallback((id: string, estadoRevision: EstadoRevisionEvidencia) => {
    updateCaso(current => ({
      ...current,
      evidencias: current.evidencias.map(e => e.id === id
        ? { ...e, estadoRevision, descartada: estadoRevision === 'descartada' ? true : e.descartada }
        : e),
    }));
  }, [updateCaso]);

  const upsertHallazgo = useCallback((input: FindingInput, options?: { addToBoard?: boolean }) => {
    let saved!: Hallazgo;
    setCaso(prev => {
      const current = cloneCase(prev);
      const isNew = !input.id;
      const id = input.id ?? nextNumericId('H', current.hallazgos.map(h => h.id));
      const numero = input.numero || id;
      const nivelRiesgo = calculateRiskLevel(input.probabilidad, input.impacto);
      saved = {
        ...input,
        id,
        numero,
        nivelRiesgo,
        severidad: calculateSeveridad(input.probabilidad, input.impacto),
        evidencias: input.evidencias ?? [],
        criterios: input.criterios ?? [],
        respuestasAuditado: input.respuestasAuditado ?? [],
      };

      const hallazgos = current.hallazgos.some(h => h.id === id)
        ? current.hallazgos.map(h => h.id === id ? saved : h)
        : [...current.hallazgos, saved];

      const evidencias = current.evidencias.map(e => {
        const set = new Set(e.hallazgos ?? []);
        if (saved.evidencias.includes(e.id)) set.add(id);
        else set.delete(id);
        return { ...e, hallazgos: Array.from(set) };
      });

      let next: Caso = { ...current, hallazgos, evidencias };

      if (options?.addToBoard && !next.nodosTablero.some(n => n.refId === id)) {
        next = {
          ...next,
          nodosTablero: [
            ...next.nodosTablero,
            {
              id: `N-${id}`,
              tipo: 'hallazgo',
              titulo: `${numero}: ${saved.titulo}`.slice(0, 34),
              subtitulo: `Riesgo ${saved.nivelRiesgo}`,
              refId: id,
              x: 640,
              y: 1220 + next.hallazgos.length * 120,
              severidad: saved.severidad,
            },
          ],
        };
      }

      if (isNew) {
        next = appendTimeline(next, {
          id: nextNumericId('EVT', next.timeline.map(e => e.id)),
          tipo: 'hallazgo-emitido',
          fecha: saved.fechaEmision,
          titulo: `Nuevo hallazgo ${numero}`,
          descripcion: saved.titulo,
          evidenciasVinculadas: saved.evidencias,
          hallazgosVinculados: [id],
        });
      }

      return next;
    });
    return saved;
  }, []);

  const discardHallazgo = useCallback((id: string) => {
    updateCaso(current => ({
      ...current,
      hallazgos: current.hallazgos.map(h => h.id === id
        ? { ...h, descartado: true, estado: 'descartado' }
        : h),
    }));
  }, [updateCaso]);

  const updateHallazgoStatus = useCallback((id: string, estado: EstadoHallazgo) => {
    updateCaso(current => ({
      ...current,
      hallazgos: current.hallazgos.map(h => h.id === id
        ? { ...h, estado, descartado: estado === 'descartado' ? true : h.descartado }
        : h),
    }));
  }, [updateCaso]);

  const upsertRespuestaAuditado = useCallback((input: ResponseInput) => {
    let saved!: RespuestaAuditado;
    setCaso(prev => {
      const current = cloneCase(prev);
      const isNew = !input.id;
      const id = input.id ?? nextNumericId('RSP', current.respuestasAuditado.map(r => r.id));
      saved = { ...input, id };
      const respuestasAuditado = current.respuestasAuditado.some(r => r.id === id)
        ? current.respuestasAuditado.map(r => r.id === id ? saved : r)
        : [...current.respuestasAuditado, saved];

      const hallazgos = current.hallazgos.map(h => {
        if (h.id !== saved.hallazgoId) return h;
        const responseIds = new Set(h.respuestasAuditado ?? []);
        responseIds.add(id);
        const estadoRespuesta: Hallazgo['estadoRespuesta'] = saved.postura === 'acepta'
          ? 'aceptada'
          : saved.postura === 'acepta-parcialmente'
            ? 'parcial'
            : 'rechazada';
        const estado: Hallazgo['estado'] = saved.decisionAuditor === 'descartar' ? 'descartado' : 'respondido';
        return {
          ...h,
          respuestaBanco: saved.argumento,
          estadoRespuesta,
          estado,
          respuestasAuditado: Array.from(responseIds),
        };
      });

      let next: Caso = { ...current, respuestasAuditado, hallazgos };
      if (isNew) {
        next = appendTimeline(next, {
          id: nextNumericId('EVT', next.timeline.map(e => e.id)),
          tipo: 'respuesta-banco',
          fecha: saved.fecha,
          titulo: `Respuesta del auditado ${id}`,
          descripcion: saved.argumento,
          hallazgosVinculados: [saved.hallazgoId],
          respuestasVinculadas: [id],
        });
      }
      return next;
    });
    return saved;
  }, []);

  const updateBoardNodes = useCallback((nodos: NodoTablero[]) => {
    updateCaso(current => ({ ...current, nodosTablero: nodos }));
  }, [updateCaso]);

  const addBoardNode = useCallback((input: BoardNodeInput) => {
    let saved!: NodoTablero;
    setCaso(prev => {
      const current = cloneCase(prev);
      const id = input.id ?? nextNumericId('NOD', current.nodosTablero.map(n => n.id));
      saved = {
        ...input,
        id,
        refId: input.refId || id,
        shape: input.shape ?? nodeShapeForType(input.tipo),
      };

      return {
        ...current,
        nodosTablero: current.nodosTablero.some(n => n.id === id)
          ? current.nodosTablero.map(n => n.id === id ? saved : n)
          : [...current.nodosTablero, saved],
      };
    });
    return saved;
  }, []);

  const updateBoardNode = useCallback((id: string, patch: Partial<NodoTablero>) => {
    updateCaso(current => ({
      ...current,
      nodosTablero: current.nodosTablero.map(n => n.id === id ? { ...n, ...patch, id } : n),
    }));
  }, [updateCaso]);

  const deleteBoardNode = useCallback((id: string) => {
    updateCaso(current => ({
      ...current,
      nodosTablero: current.nodosTablero.filter(n => n.id !== id || n.locked),
      conexionesTablero: current.conexionesTablero.filter(c => c.desde !== id && c.hacia !== id),
    }));
  }, [updateCaso]);

  const addBoardConnection = useCallback((
    desde: string,
    hacia: string,
    etiqueta: TipoRelacion,
    options?: Partial<BoardConnectionInput>,
  ) => {
    let saved!: ConexionTablero;
    setCaso(prev => {
      const current = cloneCase(prev);
      saved = {
        id: options?.id ?? nextNumericId('C', current.conexionesTablero.map(c => c.id)),
        desde,
        hacia,
        etiqueta,
        estilo: options?.estilo ?? 'curva',
        flecha: options?.flecha ?? true,
      };

      return {
        ...current,
        conexionesTablero: current.conexionesTablero.some(c => c.id === saved.id)
          ? current.conexionesTablero.map(c => c.id === saved.id ? saved : c)
          : [...current.conexionesTablero, saved],
      };
    });
    return saved;
  }, []);

  const updateBoardConnection = useCallback((id: string, patch: Partial<ConexionTablero>) => {
    updateCaso(current => ({
      ...current,
      conexionesTablero: current.conexionesTablero.map(c => c.id === id ? { ...c, ...patch, id } : c),
    }));
  }, [updateCaso]);

  const deleteBoardConnection = useCallback((id: string) => {
    updateCaso(current => ({
      ...current,
      conexionesTablero: current.conexionesTablero.filter(c => c.id !== id),
    }));
  }, [updateCaso]);

  const value = useMemo<CaseDataContextValue>(() => ({
    caso,
    isHydrated,
    resetDemo,
    updateCaso,
    upsertEvidencia,
    discardEvidencia,
    updateEvidenciaStatus,
    upsertHallazgo,
    discardHallazgo,
    updateHallazgoStatus,
    upsertRespuestaAuditado,
    updateBoardNodes,
    addBoardNode,
    updateBoardNode,
    deleteBoardNode,
    addBoardConnection,
    updateBoardConnection,
    deleteBoardConnection,
    syncStatus,
    syncMessage,
    reloadRemoteCase,
  }), [
    caso,
    isHydrated,
    resetDemo,
    updateCaso,
    upsertEvidencia,
    discardEvidencia,
    updateEvidenciaStatus,
    upsertHallazgo,
    discardHallazgo,
    updateHallazgoStatus,
    upsertRespuestaAuditado,
    updateBoardNodes,
    addBoardNode,
    updateBoardNode,
    deleteBoardNode,
    addBoardConnection,
    updateBoardConnection,
    deleteBoardConnection,
    syncStatus,
    syncMessage,
    reloadRemoteCase,
  ]);

  return (
    <CaseDataContext.Provider value={value}>
      {syncMessage && (
        <div className="fixed bottom-4 right-4 z-[80] max-w-sm border border-rule bg-[#0B0F15] p-3 text-xs text-ink shadow-2xl">
          <div className="mb-1 font-mono uppercase tracking-[0.12em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
            {syncStatus === 'conflict' ? 'Conflicto de version' : 'Sincronizacion'}
          </div>
          <p className="leading-relaxed text-ink-muted">{syncMessage}</p>
          {syncStatus === 'conflict' && (
            <button
              type="button"
              onClick={() => void reloadRemoteCase()}
              className="mt-3 border border-signal/45 bg-signal/10 px-3 py-1.5 text-[11px] font-semibold text-ink hover:border-signal"
            >
              Recargar version remota
            </button>
          )}
        </div>
      )}
      {children}
    </CaseDataContext.Provider>
  );
}

export function useCaseData() {
  const context = useContext(CaseDataContext);
  if (!context) {
    throw new Error('useCaseData must be used inside CaseDataProvider');
  }
  return context;
}
