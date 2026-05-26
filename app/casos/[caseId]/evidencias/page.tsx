'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { todosLosCriterios } from '@/lib/frameworks';
import type { ArchivoEvidencia, Evidencia, TipoEvidencia } from '@/lib/types';
import { useCaseData } from '@/components/data/CaseDataProvider';
import EvidenceCard from '@/components/data/EvidenceCard';
import CriterioBadge from '@/components/data/CriterioBadge';
import SectionRule from '@/components/shell/SectionRule';
import { useAuth } from '@/components/auth/AuthProvider';

const MAX_LOCAL_ATTACHMENT_BYTES = 2 * 1024 * 1024;

const tipoLabels: Record<TipoEvidencia, string> = {
  documento: 'Documento',
  acta: 'Acta',
  politica: 'Politica',
  procedimiento: 'Procedimiento',
  inventario: 'Inventario',
  entrevista: 'Entrevista',
  checklist: 'Checklist',
  captura: 'Captura',
  fotografia: 'Fotografia',
  'registro-sistema': 'Registro sistema',
  'ficha-prueba': 'Ficha de prueba',
  'respuesta-auditado': 'Respuesta auditado',
  'evidencia-tecnica': 'Evidencia tecnica',
  prueba: 'Prueba',
  contrato: 'Contrato',
};

const tipos: TipoEvidencia[] = [
  'documento',
  'politica',
  'procedimiento',
  'inventario',
  'acta',
  'contrato',
  'entrevista',
  'checklist',
  'captura',
  'fotografia',
  'registro-sistema',
  'ficha-prueba',
  'respuesta-auditado',
];

type EvidenceDraft = {
  id?: string;
  tipo: TipoEvidencia;
  titulo: string;
  descripcion: string;
  fecha: string;
  fuente: string;
  formato: string;
  paginas: string;
  estadoRevision: NonNullable<Evidencia['estadoRevision']>;
  criterios: string[];
  hallazgos: string[];
  nombreArchivo: string;
  archivoAdjunto?: ArchivoEvidencia;
  enTablero: boolean;
};

function emptyDraft(): EvidenceDraft {
  return {
    tipo: 'documento',
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().slice(0, 10),
    fuente: '',
    formato: '',
    paginas: '',
    estadoRevision: 'pendiente',
    criterios: [],
    hallazgos: [],
    nombreArchivo: '',
    archivoAdjunto: undefined,
    enTablero: true,
  };
}

function draftFromEvidence(evidencia: Evidencia): EvidenceDraft {
  return {
    id: evidencia.id,
    tipo: evidencia.tipo,
    titulo: evidencia.titulo,
    descripcion: evidencia.descripcion,
    fecha: evidencia.fecha,
    fuente: evidencia.fuente,
    formato: evidencia.formato ?? '',
    paginas: evidencia.paginas ? String(evidencia.paginas) : '',
    estadoRevision: evidencia.estadoRevision ?? 'pendiente',
    criterios: evidencia.criterios ?? [],
    hallazgos: evidencia.hallazgos ?? [],
    nombreArchivo: evidencia.nombreArchivo ?? '',
    archivoAdjunto: evidencia.archivoAdjunto,
    enTablero: evidencia.enTablero ?? false,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function EvidenciasPage() {
  const { caso, upsertEvidencia, discardEvidencia } = useCaseData();
  const { canEditAuditWork, isReadOnlyDemo } = useAuth();
  const [selectedTipo, setSelectedTipo] = useState<TipoEvidencia | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EvidenceDraft | null>(null);

  const evidenciasActivas = useMemo(
    () => caso.evidencias.filter(e => !e.descartada),
    [caso.evidencias]
  );

  const filtered = selectedTipo
    ? evidenciasActivas.filter(e => e.tipo === selectedTipo)
    : evidenciasActivas;

  const selectedEvidencia = selectedId ? caso.evidencias.find(e => e.id === selectedId) : null;
  const hallazgosDeEvidencia = selectedId
    ? caso.hallazgos.filter(h => h.evidencias.includes(selectedId) && !h.descartado)
    : [];

  const startNew = () => {
    if (!canEditAuditWork) return;
    setSelectedId(null);
    setDraft(emptyDraft());
  };

  const startEdit = (evidencia: Evidencia) => {
    if (!canEditAuditWork) return;
    setSelectedId(evidencia.id);
    setDraft(draftFromEvidence(evidencia));
  };

  const saveDraft = () => {
    if (!canEditAuditWork || !draft || !draft.titulo.trim()) return;
    const saved = upsertEvidencia({
      id: draft.id,
      tipo: draft.tipo,
      titulo: draft.titulo.trim(),
      descripcion: draft.descripcion.trim(),
      fecha: draft.fecha,
      fuente: draft.fuente.trim(),
      formato: draft.formato.trim() || undefined,
      paginas: draft.paginas ? Number(draft.paginas) : undefined,
      estadoRevision: draft.estadoRevision,
      criterios: draft.criterios,
      hallazgos: draft.hallazgos,
      nombreArchivo: draft.nombreArchivo.trim() || undefined,
      archivoAdjunto: draft.archivoAdjunto,
      enTablero: draft.enTablero,
    }, { addToBoard: draft.enTablero });
    setSelectedId(saved.id);
    setDraft(null);
  };

  const discardSelected = () => {
    if (!canEditAuditWork || !selectedEvidencia) return;
    discardEvidencia(selectedEvidencia.id);
    setSelectedId(null);
    setDraft(null);
  };

  return (
    <div className="max-w-7xl p-8">
      <div className="audit-file-surface mb-8 p-6">
        <div
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-node-doc"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Archivo documental / Expediente {caso.numero}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="font-display text-4xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              Evidencias recolectadas
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              {evidenciasActivas.length} evidencias activas / {caso.evidencias.filter(e => e.descartada).length} descartadas / asociacion con hallazgos, criterios y tablero.
            </p>
          </div>
          <button
            type="button"
            onClick={startNew}
            disabled={!canEditAuditWork}
            className="border border-node-doc/55 bg-node-doc/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-node-doc disabled:cursor-not-allowed disabled:opacity-45"
          >
            Nueva evidencia
          </button>
        </div>
        {isReadOnlyDemo && (
          <div className="mt-4 border border-rule bg-[#0B0F15]/70 p-3 text-xs text-ink-muted">
            Modo demo activo: el expediente se muestra en solo lectura para exposicion.
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterButton active={selectedTipo === null} onClick={() => setSelectedTipo(null)}>
          Todo ({evidenciasActivas.length})
        </FilterButton>
        {tipos.filter(t => evidenciasActivas.some(e => e.tipo === t)).map(tipo => {
          const count = evidenciasActivas.filter(e => e.tipo === tipo).length;
          return (
            <FilterButton
              key={tipo}
              active={selectedTipo === tipo}
              onClick={() => setSelectedTipo(selectedTipo === tipo ? null : tipo)}
            >
              {tipoLabels[tipo]} ({count})
            </FilterButton>
          );
        })}
      </div>

      <SectionRule label="Inventario de evidencias" />

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-2">
          {filtered.map((evd, i) => (
            <div
              key={evd.id}
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
            >
              <EvidenceCard
                evidencia={evd}
                onClick={() => {
                  setSelectedId(selectedId === evd.id ? null : evd.id);
                  setDraft(null);
                }}
                selected={selectedId === evd.id}
              />
            </div>
          ))}
        </div>

        <div className="sticky top-6 self-start">
          {draft ? (
            <EvidenceForm
              draft={draft}
              setDraft={setDraft}
              onSave={saveDraft}
              onCancel={() => setDraft(null)}
              hallazgos={caso.hallazgos.filter(h => !h.descartado)}
            />
          ) : selectedEvidencia ? (
            <div className="audit-file-surface animate-slide-in-right p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div
                    className="mb-1 font-mono text-[10px] uppercase tracking-widest text-node-doc"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {selectedEvidencia.id} / {tipoLabels[selectedEvidencia.tipo]}
                  </div>
                  <h2
                    className="font-display text-xl font-bold text-ink"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                  >
                    {selectedEvidencia.titulo}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(selectedEvidencia)} disabled={!canEditAuditWork} className="border border-rule px-3 py-1.5 text-xs text-ink-muted hover:border-signal hover:text-ink disabled:cursor-not-allowed disabled:opacity-45">
                    Editar
                  </button>
                  <button type="button" onClick={discardSelected} disabled={!canEditAuditWork} className="border border-vermilion/45 px-3 py-1.5 text-xs text-vermilion hover:border-vermilion disabled:cursor-not-allowed disabled:opacity-45">
                    Descartar
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <PanelBlock title="Descripcion">
                  <p className="text-sm leading-relaxed text-ink-soft">{selectedEvidencia.descripcion}</p>
                </PanelBlock>

                <div className="grid grid-cols-2 gap-3">
                  <PanelMetric label="Fecha" value={selectedEvidencia.fecha} />
                  <PanelMetric label="Estado" value={selectedEvidencia.estadoRevision ?? 'pendiente'} />
                  {selectedEvidencia.formato && (
                    <PanelMetric
                      label="Formato"
                      value={`${selectedEvidencia.formato}${selectedEvidencia.paginas ? ` / ${selectedEvidencia.paginas} pags.` : ''}`}
                    />
                  )}
                  {selectedEvidencia.nombreArchivo && (
                    <PanelMetric label="Archivo" value={selectedEvidencia.nombreArchivo} />
                  )}
                  {selectedEvidencia.archivoAdjunto && (
                    <PanelMetric label="Tamano" value={formatBytes(selectedEvidencia.archivoAdjunto.tamanoBytes)} />
                  )}
                </div>

                {selectedEvidencia.archivoAdjunto && (
                  <PanelBlock title="Adjunto local">
                    <div className="space-y-3 text-sm text-ink-muted">
                      <div>
                        {selectedEvidencia.archivoAdjunto.nombre} / {selectedEvidencia.archivoAdjunto.tipoMime || 'tipo no informado'}
                      </div>
                      {selectedEvidencia.archivoAdjunto.dataUrl ? (
                        <a
                          href={selectedEvidencia.archivoAdjunto.dataUrl}
                          download={selectedEvidencia.archivoAdjunto.nombre}
                          className="inline-flex border border-node-doc/50 bg-node-doc/10 px-3 py-1.5 text-xs font-semibold text-ink hover:border-node-doc"
                        >
                          Descargar copia local
                        </a>
                      ) : (
                        <div className="border border-rule bg-[#0B0F15]/70 p-3 text-xs leading-relaxed">
                          El archivo supera {formatBytes(MAX_LOCAL_ATTACHMENT_BYTES)}. Para no saturar el navegador se guardaron solo sus metadatos.
                        </div>
                      )}
                    </div>
                  </PanelBlock>
                )}

                <PanelBlock title="Fuente">
                  <div className="text-sm text-ink-muted">{selectedEvidencia.fuente}</div>
                </PanelBlock>

                {(selectedEvidencia.criterios ?? []).length > 0 && (
                  <PanelBlock title="Criterios asociados">
                    <div className="flex flex-wrap gap-2">
                      {(selectedEvidencia.criterios ?? []).map(id => {
                        const criterio = todosLosCriterios.find(c => c.id === id);
                        return criterio ? <CriterioBadge key={id} codigo={criterio.codigo} marco={criterio.marco} size="sm" /> : null;
                      })}
                    </div>
                  </PanelBlock>
                )}

                {hallazgosDeEvidencia.length > 0 && (
                  <PanelBlock title="Hallazgos que sustenta">
                    <div className="space-y-2">
                      {hallazgosDeEvidencia.map(h => (
                        <Link
                          key={h.id}
                          href={`/casos/${caso.id}/hallazgos/${h.id}`}
                          className="block border-l border-rule pl-3 text-xs text-ink-muted transition-colors hover:border-signal hover:text-ink"
                        >
                          <span className="font-mono text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{h.numero}</span>
                          <span className="ml-2">{h.titulo}</span>
                        </Link>
                      ))}
                    </div>
                  </PanelBlock>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-rule bg-[#101721]/70 p-8 text-center">
              <div className="text-sm text-ink-muted">Selecciona una evidencia</div>
              <div className="mt-2 text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                para ver detalle, fuente, criterios y hallazgos vinculados
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  hallazgos,
}: {
  draft: EvidenceDraft;
  setDraft: Dispatch<SetStateAction<EvidenceDraft | null>>;
  onSave: () => void;
  onCancel: () => void;
  hallazgos: Array<{ id: string; numero: string; titulo: string }>;
}) {
  const update = <K extends keyof EvidenceDraft>(key: K, value: EvidenceDraft[K]) => {
    setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  };
  const toggle = (key: 'criterios' | 'hallazgos', id: string) => {
    setDraft(prev => {
      if (!prev) return prev;
      const set = new Set(prev[key]);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, [key]: Array.from(set) };
    });
  };
  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    const extension = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() : '';
    const archivoAdjunto: ArchivoEvidencia = {
      nombre: file.name,
      tipoMime: file.type,
      tamanoBytes: file.size,
      ultimaModificacion: new Date(file.lastModified).toISOString(),
      almacenamiento: 'local-demo',
    };

    if (file.size <= MAX_LOCAL_ATTACHMENT_BYTES) {
      archivoAdjunto.dataUrl = await readAsDataUrl(file);
    }

    setDraft(prev => prev
      ? {
          ...prev,
          nombreArchivo: file.name,
          formato: prev.formato || extension || prev.formato,
          archivoAdjunto,
        }
      : prev
    );
  };

  return (
    <div className="audit-file-surface animate-slide-in-right p-6">
      <div
        className="mb-1 font-mono text-[10px] uppercase tracking-widest text-node-doc"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {draft.id ? `Editar ${draft.id}` : 'Nueva evidencia'}
      </div>
      <h2 className="mb-5 font-display text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
        Ficha documental
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <select value={draft.tipo} onChange={e => update('tipo', e.target.value as TipoEvidencia)} className="field-input">
              {tipos.map(tipo => <option key={tipo} value={tipo}>{tipoLabels[tipo]}</option>)}
            </select>
          </Field>
          <Field label="Fecha obtencion">
            <input type="date" value={draft.fecha} onChange={e => update('fecha', e.target.value)} className="field-input" />
          </Field>
        </div>

        <Field label="Titulo">
          <input value={draft.titulo} onChange={e => update('titulo', e.target.value)} className="field-input" placeholder="Nombre de la evidencia" />
        </Field>

        <Field label="Descripcion">
          <textarea value={draft.descripcion} onChange={e => update('descripcion', e.target.value)} className="field-input min-h-24 resize-y" placeholder="Que demuestra y como se obtuvo" />
        </Field>

        <Field label="Fuente">
          <input value={draft.fuente} onChange={e => update('fuente', e.target.value)} className="field-input" placeholder="Area, sistema, entrevista o documento origen" />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Formato">
            <input value={draft.formato} onChange={e => update('formato', e.target.value)} className="field-input" placeholder="PDF, CSV" />
          </Field>
          <Field label="Paginas">
            <input type="number" min="0" value={draft.paginas} onChange={e => update('paginas', e.target.value)} className="field-input" />
          </Field>
          <Field label="Estado">
            <select value={draft.estadoRevision} onChange={e => update('estadoRevision', e.target.value as EvidenceDraft['estadoRevision'])} className="field-input">
              <option value="pendiente">Pendiente</option>
              <option value="revisado">Revisado</option>
              <option value="observado">Observado</option>
              <option value="descartada">Descartada</option>
            </select>
          </Field>
        </div>

        <Field label="Nombre de archivo">
          <input value={draft.nombreArchivo} onChange={e => update('nombreArchivo', e.target.value)} className="field-input" placeholder="Nombre referencial o archivo adjunto" />
        </Field>

        <Field label="Seleccionar archivo local">
          <input
            type="file"
            onChange={e => void handleFileSelected(e.target.files?.[0])}
            className="field-input"
          />
          {draft.archivoAdjunto && (
            <div className="mt-2 border border-rule bg-[#0B0F15]/70 p-3 text-xs text-ink-muted">
              <span className="text-ink-soft">{draft.archivoAdjunto.nombre}</span>
              <span> / {formatBytes(draft.archivoAdjunto.tamanoBytes)}</span>
              <span> / {draft.archivoAdjunto.dataUrl ? 'copia local guardada' : 'solo metadatos'}</span>
            </div>
          )}
        </Field>

        <Checklist title="Hallazgos asociados">
          {hallazgos.map(h => (
            <label key={h.id} className="check-row">
              <input type="checkbox" checked={draft.hallazgos.includes(h.id)} onChange={() => toggle('hallazgos', h.id)} />
              <span className="font-mono text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{h.numero}</span>
              <span>{h.titulo}</span>
            </label>
          ))}
        </Checklist>

        <Checklist title="Criterios relacionados">
          {todosLosCriterios.map(c => (
            <label key={c.id} className="check-row">
              <input type="checkbox" checked={draft.criterios.includes(c.id)} onChange={() => toggle('criterios', c.id)} />
              <span className="font-mono text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{c.marco} {c.codigo}</span>
              <span>{c.nombre}</span>
            </label>
          ))}
        </Checklist>

        <label className="flex items-center gap-2 border border-rule bg-[#0B0F15]/70 px-3 py-2 text-xs text-ink-muted">
          <input type="checkbox" checked={draft.enTablero} onChange={e => update('enTablero', e.target.checked)} />
          Agregar o mantener como nodo en el tablero visual
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="border border-rule px-4 py-2 text-sm text-ink-muted hover:text-ink">
            Cancelar
          </button>
          <button type="button" onClick={onSave} className="border border-node-doc/55 bg-node-doc/15 px-4 py-2 text-sm font-semibold text-ink hover:border-node-doc">
            Guardar evidencia
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-xs transition-colors ${
        active
          ? 'border-node-doc/55 bg-node-doc/15 text-ink'
          : 'border-rule text-ink-muted hover:border-ink-muted hover:text-ink'
      }`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      {children}
    </label>
  );
}

function Checklist({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-rule bg-[#0B0F15]/70 p-3">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {title}
      </div>
      <div className="max-h-44 space-y-1 overflow-auto pr-1">
        {children}
      </div>
    </div>
  );
}

function PanelBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule pt-4">
      <div
        className="mb-2 text-[10px] uppercase tracking-widest text-ink-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function PanelMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-rule bg-[#0B0F15]/70 p-3">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <div className="font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}
