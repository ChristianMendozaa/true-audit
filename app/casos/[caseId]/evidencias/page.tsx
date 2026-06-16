'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { todosLosCriterios } from '@/lib/frameworks';
import type { ArchivoEvidencia, Evidencia, TipoEvidencia } from '@/lib/types';
import { useCaseData } from '@/components/data/CaseDataProvider';
import CriterioBadge from '@/components/data/CriterioBadge';
import { useAuth } from '@/components/auth/AuthProvider';

const tipoLabels: Record<TipoEvidencia, string> = {
  documento: 'Documento',
  acta: 'Acta',
  politica: 'Política',
  procedimiento: 'Procedimiento',
  inventario: 'Inventario',
  entrevista: 'Entrevista',
  checklist: 'Checklist',
  captura: 'Captura',
  fotografia: 'Fotografía',
  'registro-sistema': 'Registro sistema',
  'ficha-prueba': 'Ficha de prueba',
  'respuesta-auditado': 'Respuesta auditado',
  'evidencia-tecnica': 'Evidencia técnica',
  prueba: 'Prueba',
  contrato: 'Contrato',
};

const tipos: TipoEvidencia[] = [
  'documento', 'politica', 'procedimiento', 'inventario', 'acta', 'contrato',
  'entrevista', 'checklist', 'captura', 'fotografia', 'registro-sistema', 'ficha-prueba', 'respuesta-auditado',
];

type ReviewFilter = 'todos' | 'pendiente' | 'revisado' | 'observado';

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
  confidencialidad: NonNullable<Evidencia['confidencialidad']>;
  ubicacionReferencia: string;
  hashDocumento: string;
  enTablero: boolean;
};

function emptyDraft(): EvidenceDraft {
  return {
    tipo: 'documento', titulo: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10),
    fuente: '', formato: '', paginas: '', estadoRevision: 'pendiente', criterios: [], hallazgos: [],
    nombreArchivo: '', archivoAdjunto: undefined, confidencialidad: 'interna',
    ubicacionReferencia: '', hashDocumento: '', enTablero: true,
  };
}

function draftFromEvidence(evidencia: Evidencia): EvidenceDraft {
  return {
    id: evidencia.id, tipo: evidencia.tipo, titulo: evidencia.titulo, descripcion: evidencia.descripcion,
    fecha: evidencia.fecha, fuente: evidencia.fuente, formato: evidencia.formato ?? '',
    paginas: evidencia.paginas ? String(evidencia.paginas) : '', estadoRevision: evidencia.estadoRevision ?? 'pendiente',
    criterios: evidencia.criterios ?? [], hallazgos: evidencia.hallazgos ?? [],
    nombreArchivo: evidencia.nombreArchivo ?? '', archivoAdjunto: evidencia.archivoAdjunto,
    confidencialidad: evidencia.confidencialidad ?? 'interna',
    ubicacionReferencia: evidencia.ubicacionReferencia ?? evidencia.archivoAdjunto?.referencia ?? '',
    hashDocumento: evidencia.hashDocumento ?? evidencia.archivoAdjunto?.hash ?? '', enTablero: evidencia.enTablero ?? false,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EvidenciasPage() {
  const { caso, upsertEvidencia, discardEvidencia } = useCaseData();
  const { canEditAuditWork, isReadOnlyDemo } = useAuth();
  const [selectedTipo, setSelectedTipo] = useState<TipoEvidencia | null>(null);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EvidenceDraft | null>(null);

  const evidenciasActivas = useMemo(
    () => caso.evidencias.filter(e => !e.descartada),
    [caso.evidencias]
  );

  const filtered = useMemo(() => {
    let result = evidenciasActivas;
    if (selectedTipo) result = result.filter(e => e.tipo === selectedTipo);
    if (reviewFilter !== 'todos') result = result.filter(e => (e.estadoRevision ?? 'pendiente') === reviewFilter);
    return result;
  }, [evidenciasActivas, selectedTipo, reviewFilter]);

  const selectedEvidencia = selectedId ? caso.evidencias.find(e => e.id === selectedId) : null;
  const hallazgosDeEvidencia = selectedId
    ? caso.hallazgos.filter(h => h.evidencias.includes(selectedId) && !h.descartado)
    : [];

  const startNew = () => { if (!canEditAuditWork) return; setSelectedId(null); setDraft(emptyDraft()); };
  const startEdit = (evidencia: Evidencia) => { if (!canEditAuditWork) return; setSelectedId(evidencia.id); setDraft(draftFromEvidence(evidencia)); };

  const saveDraft = () => {
    if (!canEditAuditWork || !draft || !draft.titulo.trim()) return;
    const saved = upsertEvidencia({
      id: draft.id, tipo: draft.tipo, titulo: draft.titulo.trim(), descripcion: draft.descripcion.trim(),
      fecha: draft.fecha, fuente: draft.fuente.trim(), formato: draft.formato.trim() || undefined,
      paginas: draft.paginas ? Number(draft.paginas) : undefined, estadoRevision: draft.estadoRevision,
      criterios: draft.criterios, hallazgos: draft.hallazgos, nombreArchivo: draft.nombreArchivo.trim() || undefined,
      confidencialidad: draft.confidencialidad, ubicacionReferencia: draft.ubicacionReferencia.trim() || undefined,
      hashDocumento: draft.hashDocumento.trim() || undefined,
      archivoAdjunto: draft.archivoAdjunto ? { ...draft.archivoAdjunto, hash: draft.hashDocumento.trim() || undefined, referencia: draft.ubicacionReferencia.trim() || undefined } : undefined,
      enTablero: draft.enTablero,
    }, { addToBoard: draft.enTablero });
    setSelectedId(saved.id);
    setDraft(null);
  };

  const discardSelected = () => {
    if (!canEditAuditWork || !selectedEvidencia) return;
    discardEvidencia(selectedEvidencia.id);
    setSelectedId(null); setDraft(null);
  };

  const reviewStatusLabel = (s: string) => {
    switch (s) { case 'revisado': return 'Revisado'; case 'observado': return 'Observado'; case 'descartada': return 'Descartada'; default: return 'Pendiente'; }
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-6 xl:p-8">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
            Archivo documental
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {evidenciasActivas.length} evidencias activas · {caso.evidencias.filter(e => e.descartada).length} descartadas
          </p>
        </div>
        <button type="button" onClick={startNew} disabled={!canEditAuditWork}
          className="border border-node-doc/50 bg-node-doc/10 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-node-doc disabled:cursor-not-allowed disabled:opacity-45">
          Nueva evidencia
        </button>
      </div>

      {isReadOnlyDemo && (
        <div className="mb-4 border border-rule bg-[#0B0F15]/70 p-3 text-xs text-ink-muted">
          Modo demo: el expediente se muestra en solo lectura.
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setSelectedTipo(null)}
          className={`border px-3 py-1.5 text-xs transition-colors ${!selectedTipo ? 'border-signal/50 bg-signal/10 text-ink' : 'border-rule text-ink-muted hover:text-ink'}`}
          style={{ fontFamily: 'var(--font-mono)' }}>
          Todo ({evidenciasActivas.length})
        </button>
        {tipos.filter(t => evidenciasActivas.some(e => e.tipo === t)).map(tipo => (
          <button key={tipo} type="button" onClick={() => setSelectedTipo(selectedTipo === tipo ? null : tipo)}
            className={`border px-3 py-1.5 text-xs transition-colors ${selectedTipo === tipo ? 'border-signal/50 bg-signal/10 text-ink' : 'border-rule text-ink-muted hover:text-ink'}`}
            style={{ fontFamily: 'var(--font-mono)' }}>
            {tipoLabels[tipo]} ({evidenciasActivas.filter(e => e.tipo === tipo).length})
          </button>
        ))}
        <div className="w-px bg-rule" />
        {(['todos', 'pendiente', 'revisado', 'observado'] as ReviewFilter[]).map(f => (
          <button key={f} type="button" onClick={() => setReviewFilter(f)}
            className={`border px-3 py-1.5 text-xs transition-colors ${reviewFilter === f ? 'border-signal/50 bg-signal/10 text-ink' : 'border-rule text-ink-muted hover:text-ink'}`}
            style={{ fontFamily: 'var(--font-mono)' }}>
            {f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendiente' : f === 'revisado' ? 'Revisado' : 'Observado'}
          </button>
        ))}
      </div>

      {/* Split view */}
      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1fr_0.9fr]">
        {/* Left: table */}
        <div className="min-h-0 overflow-auto border border-rule">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-[#0B0F15]" style={{ fontFamily: 'var(--font-mono)' }}>
              <tr className="label-eyebrow text-ink-muted">
                <th className="border-b border-rule px-3 py-2.5 font-medium">Código</th>
                <th className="border-b border-rule px-3 py-2.5 font-medium">Evidencia</th>
                <th className="border-b border-rule px-3 py-2.5 font-medium">Tipo</th>
                <th className="border-b border-rule px-3 py-2.5 font-medium">Estado</th>
                <th className="border-b border-rule px-3 py-2.5 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(evd => {
                const isSelected = selectedId === evd.id && !draft;
                return (
                  <tr key={evd.id}
                    className={`cursor-pointer border-b border-rule/50 transition-colors last:border-b-0 ${isSelected ? 'bg-paper-warm' : 'hover:bg-paper-warm/50'}`}
                    onClick={() => { setSelectedId(selectedId === evd.id ? null : evd.id); setDraft(null); }}>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{evd.id}</td>
                    <td className="max-w-52 px-3 py-2.5 text-ink">
                      <span className="line-clamp-2 leading-snug">{evd.titulo}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-ink-muted">{tipoLabels[evd.tipo]}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${
                        (evd.estadoRevision ?? 'pendiente') === 'revisado' ? 'border-olive/45 text-olive' :
                        (evd.estadoRevision ?? 'pendiente') === 'observado' ? 'border-amber-signal/45 text-amber-signal' :
                        'border-rule text-ink-muted'
                      }`} style={{ fontFamily: 'var(--font-mono)' }}>
                        {reviewStatusLabel(evd.estadoRevision ?? 'pendiente')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{evd.fecha}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-ink-muted">No hay evidencias con esos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right: detail/form */}
        <div className="min-h-0 overflow-auto">
          {draft ? (
            <EvidenceForm draft={draft} setDraft={setDraft} onSave={saveDraft} onCancel={() => setDraft(null)} hallazgos={caso.hallazgos.filter(h => !h.descartado)} />
          ) : selectedEvidencia ? (
            <div className="audit-file-surface p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 label-eyebrow text-marco-cobit" style={{ fontFamily: 'var(--font-mono)' }}>
                    {selectedEvidencia.id} / {tipoLabels[selectedEvidencia.tipo]}
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
                    {selectedEvidencia.titulo}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(selectedEvidencia)} disabled={!canEditAuditWork}
                    className="border border-rule px-3 py-1.5 text-xs text-ink-muted hover:border-signal hover:text-ink disabled:cursor-not-allowed disabled:opacity-45">
                    Editar
                  </button>
                  <button type="button" onClick={discardSelected} disabled={!canEditAuditWork}
                    className="border border-vermilion/45 px-3 py-1.5 text-xs text-vermilion hover:border-vermilion disabled:cursor-not-allowed disabled:opacity-45">
                    Descartar
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <PanelBlock title="Descripción"><p className="text-sm leading-relaxed text-ink-soft">{selectedEvidencia.descripcion}</p></PanelBlock>
                <div className="grid grid-cols-2 gap-3">
                  <PanelMetric label="Fecha" value={selectedEvidencia.fecha} />
                  <PanelMetric label="Estado" value={reviewStatusLabel(selectedEvidencia.estadoRevision ?? 'pendiente')} />
                  {selectedEvidencia.formato && <PanelMetric label="Formato" value={`${selectedEvidencia.formato}${selectedEvidencia.paginas ? ` / ${selectedEvidencia.paginas} págs.` : ''}`} />}
                  {selectedEvidencia.nombreArchivo && <PanelMetric label="Archivo" value={selectedEvidencia.nombreArchivo} />}
                  {selectedEvidencia.archivoAdjunto && <PanelMetric label="Tamaño" value={formatBytes(selectedEvidencia.archivoAdjunto.tamanoBytes)} />}
                  <PanelMetric label="Confidencialidad" value={selectedEvidencia.confidencialidad ?? 'interna'} />
                </div>
                <PanelBlock title="Fuente"><div className="text-sm text-ink-muted">{selectedEvidencia.fuente}</div></PanelBlock>
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
                    <div className="space-y-1">
                      {hallazgosDeEvidencia.map(h => (
                        <Link key={h.id} href={`/casos/${caso.id}/hallazgos/${h.id}`}
                          className="block border-l border-rule pl-3 text-xs text-ink-muted transition-colors hover:border-signal hover:text-ink">
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
            <div className="flex h-full items-center justify-center border border-dashed border-rule p-8 text-center">
              <div>
                <div className="text-sm text-ink-muted">Selecciona una evidencia</div>
                <div className="mt-2 text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                  para ver detalle, fuente, criterios y hallazgos vinculados
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceForm({ draft, setDraft, onSave, onCancel, hallazgos }: {
  draft: EvidenceDraft; setDraft: Dispatch<SetStateAction<EvidenceDraft | null>>;
  onSave: () => void; onCancel: () => void;
  hallazgos: Array<{ id: string; numero: string; titulo: string }>;
}) {
  const update = <K extends keyof EvidenceDraft>(key: K, value: EvidenceDraft[K]) => {
    setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  };
  const toggle = (key: 'criterios' | 'hallazgos', id: string) => {
    setDraft(prev => {
      if (!prev) return prev;
      const set = new Set(prev[key]);
      if (set.has(id)) set.delete(id); else set.add(id);
      return { ...prev, [key]: Array.from(set) };
    });
  };
  const handleFileSelected = (file: File | undefined) => {
    if (!file) return;
    const extension = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() : '';
    const archivoAdjunto: ArchivoEvidencia = {
      nombre: file.name, tipoMime: file.type, tamanoBytes: file.size,
      ultimaModificacion: new Date(file.lastModified).toISOString(), almacenamiento: 'metadata-only',
    };
    setDraft(prev => prev ? { ...prev, nombreArchivo: file.name, formato: prev.formato || extension || prev.formato, archivoAdjunto } : prev);
  };

  return (
    <div className="audit-file-surface p-5">
      <div className="mb-1 label-eyebrow text-marco-cobit" style={{ fontFamily: 'var(--font-mono)' }}>
        {draft.id ? `Editar ${draft.id}` : 'Nueva evidencia'}
      </div>
      <h2 className="mb-4 font-display text-lg font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>Ficha documental</h2>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo"><select value={draft.tipo} onChange={e => update('tipo', e.target.value as TipoEvidencia)} className="field-input">{tipos.map(t => <option key={t} value={t}>{tipoLabels[t]}</option>)}</select></Field>
          <Field label="Fecha"><input type="date" value={draft.fecha} onChange={e => update('fecha', e.target.value)} className="field-input" /></Field>
        </div>
        <Field label="Título"><input value={draft.titulo} onChange={e => update('titulo', e.target.value)} className="field-input" placeholder="Nombre de la evidencia" /></Field>
        <Field label="Descripción"><textarea value={draft.descripcion} onChange={e => update('descripcion', e.target.value)} className="field-input min-h-20 resize-y" placeholder="Qué demuestra y cómo se obtuvo" /></Field>
        <Field label="Fuente"><input value={draft.fuente} onChange={e => update('fuente', e.target.value)} className="field-input" placeholder="Área, sistema o documento origen" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Formato"><input value={draft.formato} onChange={e => update('formato', e.target.value)} className="field-input" placeholder="PDF, CSV" /></Field>
          <Field label="Páginas"><input type="number" min="0" value={draft.paginas} onChange={e => update('paginas', e.target.value)} className="field-input" /></Field>
          <Field label="Estado">
            <select value={draft.estadoRevision} onChange={e => update('estadoRevision', e.target.value as EvidenceDraft['estadoRevision'])} className="field-input">
              <option value="pendiente">Pendiente</option><option value="revisado">Revisado</option><option value="observado">Observado</option><option value="descartada">Descartada</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Confidencialidad">
            <select value={draft.confidencialidad} onChange={e => update('confidencialidad', e.target.value as EvidenceDraft['confidencialidad'])} className="field-input">
              <option value="publica">Pública</option><option value="interna">Interna</option><option value="confidencial">Confidencial</option><option value="restringida">Restringida</option>
            </select>
          </Field>
          <Field label="Hash / checksum"><input value={draft.hashDocumento} onChange={e => update('hashDocumento', e.target.value)} className="field-input" placeholder="SHA-256 opcional" /></Field>
        </div>
        <Field label="Registrar archivo local">
          <input type="file" onChange={e => handleFileSelected(e.target.files?.[0])} className="field-input" />
          {draft.archivoAdjunto && (
            <div className="mt-2 border border-rule bg-[#0B0F15]/70 p-2 text-xs text-ink-muted">
              {draft.archivoAdjunto.nombre} / {formatBytes(draft.archivoAdjunto.tamanoBytes)} / solo metadatos
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
          <button type="button" onClick={onCancel} className="border border-rule px-4 py-2 text-sm text-ink-muted hover:text-ink">Cancelar</button>
          <button type="button" onClick={onSave} className="border border-node-doc/55 bg-node-doc/15 px-4 py-2 text-sm font-semibold text-ink hover:border-node-doc">Guardar evidencia</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><div className="mb-1 label-field" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>{children}</label>);
}
function Checklist({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="border border-rule bg-surface-2/70 p-3"><div className="mb-2 label-eyebrow" style={{ fontFamily: 'var(--font-mono)' }}>{title}</div><div className="max-h-44 space-y-1 overflow-auto pr-1">{children}</div></div>);
}
function PanelBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="border-t border-rule pt-3"><div className="mb-2 label-eyebrow" style={{ fontFamily: 'var(--font-mono)' }}>{title}</div>{children}</div>);
}
function PanelMetric({ label, value }: { label: string; value: string }) {
  return (<div className="border border-rule bg-surface-2/70 p-3"><div className="mb-1 label-field" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div><div className="font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{value}</div></div>);
}
