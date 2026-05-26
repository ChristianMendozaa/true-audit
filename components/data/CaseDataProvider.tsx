'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Caso,
  ConexionTablero,
  Evidencia,
  EstadoHallazgo,
  EstadoRevisionEvidencia,
  Hallazgo,
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
}

const CaseDataContext = createContext<CaseDataContextValue | null>(null);
const FIREBASE_STORAGE_ENABLED = process.env.NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE === 'firebase';

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

async function loadFirebaseCase(caseId: string): Promise<Caso | null> {
  const response = await fetch(`/api/casos/${caseId}/data`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Firebase devolvio ${response.status} al cargar el caso.`);
  }

  const body = await response.json() as { caso?: Caso | null };
  return body.caso ?? null;
}

async function saveFirebaseCase(caso: Caso) {
  const response = await fetch(`/api/casos/${caso.id}/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caso }),
  });

  if (!response.ok) {
    throw new Error(`Firebase devolvio ${response.status} al guardar el caso.`);
  }
}

export default function CaseDataProvider({
  initialCaso,
  children,
}: {
  initialCaso: Caso;
  children: React.ReactNode;
}) {
  const [caso, setCaso] = useState<Caso>(() => cloneCase(initialCaso));
  const [isHydrated, setIsHydrated] = useState(false);
  const firebaseSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const saved = window.localStorage.getItem(storageKey(initialCaso.id));
        const lineStyleMigrated = window.localStorage.getItem(boardLineStyleMigrationKey(initialCaso.id));

        if (saved) {
          const parsed = JSON.parse(saved) as Caso;
          const localCaso = lineStyleMigrated ? parsed : migrateBoardLineStyle(parsed);
          if (!cancelled) setCaso(localCaso);
          if (!lineStyleMigrated) {
            window.localStorage.setItem(boardLineStyleMigrationKey(initialCaso.id), '1');
          }
          return;
        }

        if (!lineStyleMigrated) {
          window.localStorage.setItem(boardLineStyleMigrationKey(initialCaso.id), '1');
        }

        if (FIREBASE_STORAGE_ENABLED) {
          const remoteCaso = await loadFirebaseCase(initialCaso.id);
          if (cancelled) return;

          if (remoteCaso) {
            const migratedRemote = migrateBoardLineStyle(remoteCaso);
            setCaso(migratedRemote);
            window.localStorage.setItem(storageKey(initialCaso.id), JSON.stringify(migratedRemote));
            return;
          }

          const demoCaso = migrateBoardLineStyle(cloneCase(initialCaso));
          setCaso(demoCaso);
          window.localStorage.setItem(storageKey(initialCaso.id), JSON.stringify(demoCaso));
          await saveFirebaseCase(demoCaso);
        }
      } catch {
        if (!cancelled) setCaso(cloneCase(initialCaso));
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
  }, [initialCaso]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(storageKey(initialCaso.id), JSON.stringify(caso));

    if (!FIREBASE_STORAGE_ENABLED) return;

    if (firebaseSaveTimerRef.current) clearTimeout(firebaseSaveTimerRef.current);
    firebaseSaveTimerRef.current = setTimeout(() => {
      void saveFirebaseCase(caso).catch(error => {
        console.warn('[true-audit] No se pudo sincronizar con Firebase. Se mantiene copia local.', error);
      });
    }, 700);

    return () => {
      if (firebaseSaveTimerRef.current) {
        clearTimeout(firebaseSaveTimerRef.current);
        firebaseSaveTimerRef.current = null;
      }
    };
  }, [caso, initialCaso.id, isHydrated]);

  const updateCaso = useCallback((updater: (caso: Caso) => Caso) => {
    setCaso(prev => updater(cloneCase(prev)));
  }, []);

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(storageKey(initialCaso.id));
    window.localStorage.setItem(boardLineStyleMigrationKey(initialCaso.id), '1');
    setCaso(cloneCase(initialCaso));
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
  ]);

  return (
    <CaseDataContext.Provider value={value}>
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
