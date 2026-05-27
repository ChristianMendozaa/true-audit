'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { todosLosCriterios } from '@/lib/frameworks';
import { calculateRiskLevel, calculateRiskScore, calculateSeveridad } from '@/lib/risk';
import type { EstadoHallazgo, Hallazgo } from '@/lib/types';
import { useCaseData } from '@/components/data/CaseDataProvider';
import StatusPill from '@/components/data/StatusPill';
import CriterioBadge from '@/components/data/CriterioBadge';
import { useAuth } from '@/components/auth/AuthProvider';

const severidadOrder = { critico: 0, medio: 1, bajo: 2 };

type FindingDraft = {
  id?: string;
  numero: string;
  titulo: string;
  condicion: string;
  criterio: string;
  causa: string;
  efecto: string;
  conclusion: string;
  probabilidad: number;
  impacto: number;
  recomendacion: string;
  procesoCobit: string;
  componenteCoso: string;
  seccionRgsi: string;
  estado: EstadoHallazgo;
  estadoRespuesta: Hallazgo['estadoRespuesta'];
  fechaEmision: string;
  criterios: string[];
  evidencias: string[];
  respuestaBanco: string;
  respuestasAuditado: string[];
  addToBoard: boolean;
};

function emptyDraft(nextNumber: string): FindingDraft {
  return {
    numero: nextNumber,
    titulo: '',
    condicion: '',
    criterio: '',
    causa: '',
    efecto: '',
    conclusion: '',
    probabilidad: 3,
    impacto: 3,
    recomendacion: '',
    procesoCobit: 'PO1',
    componenteCoso: 'Evaluacion de riesgos',
    seccionRgsi: 'Seccion 6',
    estado: 'abierto',
    estadoRespuesta: 'pendiente',
    fechaEmision: new Date().toISOString().slice(0, 10),
    criterios: [],
    evidencias: [],
    respuestaBanco: '',
    respuestasAuditado: [],
    addToBoard: true,
  };
}

function draftFromFinding(h: Hallazgo): FindingDraft {
  return {
    id: h.id,
    numero: h.numero,
    titulo: h.titulo,
    condicion: h.condicion,
    criterio: h.criterio,
    causa: h.causa,
    efecto: h.efecto,
    conclusion: h.conclusion,
    probabilidad: h.probabilidad,
    impacto: h.impacto,
    recomendacion: h.recomendacion,
    procesoCobit: h.procesoCobit ?? '',
    componenteCoso: h.componenteCoso ?? '',
    seccionRgsi: h.seccionRgsi ?? '',
    estado: h.estado,
    estadoRespuesta: h.estadoRespuesta,
    fechaEmision: h.fechaEmision,
    criterios: h.criterios,
    evidencias: h.evidencias,
    respuestaBanco: h.respuestaBanco ?? '',
    respuestasAuditado: h.respuestasAuditado ?? [],
    addToBoard: true,
  };
}

function nextFindingNumber(hallazgos: Hallazgo[]) {
  const max = hallazgos.reduce((current, h) => {
    const match = h.numero.match(/^H-(\d+)$/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `H-${String(max + 1).padStart(3, '0')}`;
}

type SeverityFilter = 'todos' | 'critico' | 'medio' | 'bajo';
type ResponseFilter = 'todos' | 'pendiente' | 'respondido';

export default function HallazgosPage() {
  const { caso, upsertHallazgo, discardHallazgo } = useCaseData();
  const { canEditAuditWork, isReadOnlyDemo } = useAuth();
  const [draft, setDraft] = useState<FindingDraft | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('todos');
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>('todos');

  const hallazgosActivos = useMemo(
    () => caso.hallazgos.filter(h => !h.descartado && h.estado !== 'descartado'),
    [caso.hallazgos]
  );

  const filtered = useMemo(() => {
    let result = [...hallazgosActivos];
    if (severityFilter !== 'todos') result = result.filter(h => h.severidad === severityFilter);
    if (responseFilter === 'pendiente') result = result.filter(h => h.estadoRespuesta === 'pendiente');
    if (responseFilter === 'respondido') result = result.filter(h => h.estadoRespuesta !== 'pendiente');
    return result.sort((a, b) => severidadOrder[a.severidad] - severidadOrder[b.severidad]);
  }, [hallazgosActivos, severityFilter, responseFilter]);

  const selectedHallazgo = selectedId ? caso.hallazgos.find(h => h.id === selectedId) : null;

  const startNew = () => {
    if (!canEditAuditWork) return;
    setSelectedId(null);
    setDraft(emptyDraft(nextFindingNumber(caso.hallazgos)));
  };
  const startEdit = (hallazgo: Hallazgo) => {
    if (!canEditAuditWork) return;
    setSelectedId(hallazgo.id);
    setDraft(draftFromFinding(hallazgo));
  };

  const saveDraft = () => {
    if (!canEditAuditWork || !draft || !draft.titulo.trim()) return;
    upsertHallazgo({
      id: draft.id,
      numero: draft.numero,
      titulo: draft.titulo.trim(),
      condicion: draft.condicion.trim(),
      criterio: draft.criterio.trim(),
      causa: draft.causa.trim(),
      efecto: draft.efecto.trim(),
      conclusion: draft.conclusion.trim(),
      probabilidad: draft.probabilidad,
      impacto: draft.impacto,
      recomendacion: draft.recomendacion.trim(),
      respuestaBanco: draft.respuestaBanco.trim() || null,
      estadoRespuesta: draft.estadoRespuesta,
      criterios: draft.criterios,
      evidencias: draft.evidencias,
      respuestasAuditado: draft.respuestasAuditado,
      procesoCobit: draft.procesoCobit,
      componenteCoso: draft.componenteCoso,
      seccionRgsi: draft.seccionRgsi,
      estado: draft.estado,
      fechaEmision: draft.fechaEmision,
    }, { addToBoard: draft.addToBoard });
    setDraft(null);
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-6 xl:p-8">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="font-display text-2xl font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
          >
            Hallazgos de auditoría
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {hallazgosActivos.length} activos · {hallazgosActivos.filter(h => h.estadoRespuesta === 'pendiente').length} sin respuesta
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          disabled={!canEditAuditWork}
          className="border border-vermilion/50 bg-vermilion/10 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-vermilion disabled:cursor-not-allowed disabled:opacity-45"
        >
          Nuevo hallazgo
        </button>
      </div>

      {isReadOnlyDemo && (
        <div className="mb-4 border border-rule bg-[#0B0F15]/70 p-3 text-xs text-ink-muted">
          Modo demo: los hallazgos se muestran en solo lectura.
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(['todos', 'critico', 'medio', 'bajo'] as SeverityFilter[]).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setSeverityFilter(f)}
            className={`border px-3 py-1.5 text-xs transition-colors ${
              severityFilter === f
                ? 'border-signal/50 bg-signal/10 text-ink'
                : 'border-rule text-ink-muted hover:text-ink'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {f === 'todos' ? `Todo (${hallazgosActivos.length})` :
             f === 'critico' ? `Alto (${hallazgosActivos.filter(h => h.severidad === 'critico').length})` :
             f === 'medio' ? `Medio (${hallazgosActivos.filter(h => h.severidad === 'medio').length})` :
             `Bajo (${hallazgosActivos.filter(h => h.severidad === 'bajo').length})`}
          </button>
        ))}
        <div className="w-px bg-rule" />
        {(['todos', 'pendiente', 'respondido'] as ResponseFilter[]).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setResponseFilter(f)}
            className={`border px-3 py-1.5 text-xs transition-colors ${
              responseFilter === f
                ? 'border-signal/50 bg-signal/10 text-ink'
                : 'border-rule text-ink-muted hover:text-ink'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {f === 'todos' ? 'Todas' : f === 'pendiente' ? 'Sin respuesta' : 'Con respuesta'}
          </button>
        ))}
      </div>

      {/* Split view */}
      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1fr_0.95fr]">
        {/* Left: table/list */}
        <div className="min-h-0 overflow-auto border border-rule">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-[#0B0F15] text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
              <tr>
                <th className="border-b border-rule px-3 py-2.5 font-medium">Código</th>
                <th className="border-b border-rule px-3 py-2.5 font-medium">Hallazgo</th>
                <th className="border-b border-rule px-3 py-2.5 font-medium">Riesgo</th>
                <th className="border-b border-rule px-3 py-2.5 font-medium">Respuesta</th>
                <th className="border-b border-rule px-3 py-2.5 font-medium text-center">Evd.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => {
                const isSelected = selectedId === h.id && !draft;
                return (
                  <tr
                    key={h.id}
                    className={`cursor-pointer border-b border-rule/50 transition-colors last:border-b-0 ${
                      isSelected ? 'bg-paper-warm' : 'hover:bg-paper-warm/50'
                    }`}
                    onClick={() => { setSelectedId(h.id); setDraft(null); }}
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                      {h.numero}
                    </td>
                    <td className="max-w-64 truncate px-3 py-2.5 text-ink">{h.titulo}</td>
                    <td className="px-3 py-2.5"><StatusPill status={h.severidad} size="sm" /></td>
                    <td className="px-3 py-2.5"><StatusPill status={h.estadoRespuesta} size="sm" /></td>
                    <td className="px-3 py-2.5 text-center font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                      {h.evidencias.length}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-ink-muted">
                    No hay hallazgos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right: detail/form */}
        <div className="min-h-0 overflow-auto">
          {draft ? (
            <FindingForm
              draft={draft}
              setDraft={setDraft}
              onSave={saveDraft}
              onCancel={() => setDraft(null)}
              evidencias={caso.evidencias.filter(e => !e.descartada)}
            />
          ) : selectedHallazgo ? (
            <FindingDetail
              hallazgo={selectedHallazgo}
              caso={caso}
              canEdit={canEditAuditWork}
              onEdit={() => startEdit(selectedHallazgo)}
              onDiscard={() => { if (canEditAuditWork) { discardHallazgo(selectedHallazgo.id); setSelectedId(null); } }}
            />
          ) : (
            <div className="flex h-full items-center justify-center border border-dashed border-rule p-8 text-center">
              <div>
                <div className="text-sm text-ink-muted">Selecciona un hallazgo de la lista</div>
                <div className="mt-2 text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                  o crea uno nuevo para ver su ficha completa
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Panel ─── */
function FindingDetail({
  hallazgo,
  caso,
  canEdit,
  onEdit,
  onDiscard,
}: {
  hallazgo: Hallazgo;
  caso: { id: string; evidencias: Array<{ id: string; titulo: string }>; respuestasAuditado: Array<{ hallazgoId: string; argumento: string; postura: string; fecha: string }> };
  canEdit: boolean;
  onEdit: () => void;
  onDiscard: () => void;
}) {
  const criterios = hallazgo.criterios
    .map(id => todosLosCriterios.find(c => c.id === id))
    .filter(Boolean) as typeof todosLosCriterios;

  const evidenciasVinculadas = hallazgo.evidencias
    .map(id => caso.evidencias.find(e => e.id === id))
    .filter(Boolean);

  const respuestas = caso.respuestasAuditado.filter(r => r.hallazgoId === hallazgo.id);

  const borderColor = hallazgo.severidad === 'critico' ? 'border-vermilion/60'
    : hallazgo.severidad === 'medio' ? 'border-amber-signal/60'
    : 'border-olive/60';

  return (
    <div className={`audit-file-surface border-l-4 ${borderColor} p-5`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{hallazgo.numero}</span>
            <span className="font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{hallazgo.fechaEmision}</span>
          </div>
          <h2
            className="font-display text-lg font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
          >
            {hallazgo.titulo}
          </h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <StatusPill status={hallazgo.severidad} size="sm" />
          <StatusPill status={hallazgo.estadoRespuesta} size="sm" />
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Condición', text: hallazgo.condicion },
          { label: 'Criterio', text: hallazgo.criterio },
          { label: 'Causa', text: hallazgo.causa },
          { label: 'Efecto', text: hallazgo.efecto },
          { label: 'Recomendación', text: hallazgo.recomendacion },
        ].map(({ label, text }) => text && (
          <div key={label} className="border-t border-rule pt-3">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
            <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
          </div>
        ))}

        {criterios.length > 0 && (
          <div className="border-t border-rule pt-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>Criterios normativos</div>
            <div className="flex flex-wrap gap-1.5">
              {criterios.map(c => <CriterioBadge key={c.id} codigo={c.codigo} marco={c.marco} size="sm" />)}
            </div>
          </div>
        )}

        {evidenciasVinculadas.length > 0 && (
          <div className="border-t border-rule pt-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>Evidencias vinculadas ({evidenciasVinculadas.length})</div>
            <div className="space-y-1">
              {evidenciasVinculadas.map(e => e && (
                <div key={e.id} className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{e.id}</span>
                  <span className="truncate">{e.titulo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {respuestas.length > 0 && (
          <div className="border-t border-rule pt-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>Respuesta del auditado</div>
            {respuestas.map((r, i) => (
              <div key={i} className="border border-rule bg-[#0B0F15]/70 p-3 text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-[9px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{r.fecha}</span>
                  <span className="border border-rule px-1.5 py-0.5 text-[9px] uppercase text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{r.postura}</span>
                </div>
                <p className="text-xs leading-relaxed text-ink-soft">{r.argumento}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-rule pt-4">
        <Link
          href={`/casos/${caso.id}/hallazgos/${hallazgo.id}`}
          className="border border-rule px-3 py-1.5 text-xs text-ink-muted hover:border-signal hover:text-ink"
        >
          Ver trazabilidad completa
        </Link>
        <button type="button" onClick={onEdit} disabled={!canEdit} className="border border-rule px-3 py-1.5 text-xs text-ink-muted hover:border-signal hover:text-ink disabled:cursor-not-allowed disabled:opacity-45">
          Editar
        </button>
        <button type="button" onClick={onDiscard} disabled={!canEdit} className="border border-vermilion/45 px-3 py-1.5 text-xs text-vermilion hover:border-vermilion disabled:cursor-not-allowed disabled:opacity-45">
          Descartar
        </button>
      </div>
    </div>
  );
}

/* ─── Form Panel ─── */
function FindingForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  evidencias,
}: {
  draft: FindingDraft;
  setDraft: Dispatch<SetStateAction<FindingDraft | null>>;
  onSave: () => void;
  onCancel: () => void;
  evidencias: Array<{ id: string; titulo: string; tipo: string }>;
}) {
  const riskScore = calculateRiskScore(draft.probabilidad, draft.impacto);
  const riskLevel = calculateRiskLevel(draft.probabilidad, draft.impacto);
  const severidad = calculateSeveridad(draft.probabilidad, draft.impacto);

  const update = <K extends keyof FindingDraft>(key: K, value: FindingDraft[K]) => {
    setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  };
  const toggle = (key: 'criterios' | 'evidencias', id: string) => {
    setDraft(prev => {
      if (!prev) return prev;
      const set = new Set(prev[key]);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, [key]: Array.from(set) };
    });
  };

  return (
    <div className="audit-file-surface p-5">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-vermilion" style={{ fontFamily: 'var(--font-mono)' }}>
        {draft.id ? `Editar ${draft.numero}` : 'Nuevo hallazgo'}
      </div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Ficha de hallazgo
        </h2>
        <StatusPill status={severidad} size="sm" />
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Código">
            <input value={draft.numero} onChange={e => update('numero', e.target.value)} className="field-input" />
          </Field>
          <Field label="Fecha">
            <input type="date" value={draft.fechaEmision} onChange={e => update('fechaEmision', e.target.value)} className="field-input" />
          </Field>
          <Field label="Estado">
            <select value={draft.estado} onChange={e => update('estado', e.target.value as EstadoHallazgo)} className="field-input">
              <option value="abierto">Abierto</option>
              <option value="en-revision">En revisión</option>
              <option value="pendiente-respuesta">Pendiente respuesta</option>
              <option value="respondido">Respondido</option>
              <option value="cerrado">Cerrado</option>
              <option value="descartado">Descartado</option>
            </select>
          </Field>
        </div>

        <Field label="Título">
          <input value={draft.titulo} onChange={e => update('titulo', e.target.value)} className="field-input" />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Proceso COBIT">
            <select value={draft.procesoCobit} onChange={e => update('procesoCobit', e.target.value)} className="field-input">
              {['PO1', 'PO2', 'PO3', 'PO4', 'PO7', 'ME2', 'PO1 / ME2', 'PO2 / ME2'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Componente COSO">
            <select value={draft.componenteCoso} onChange={e => update('componenteCoso', e.target.value)} className="field-input">
              {['Ambiente de control', 'Evaluacion de riesgos', 'Actividades de control', 'Informacion y comunicacion', 'Supervision'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Sección RGSI">
            <select value={draft.seccionRgsi} onChange={e => update('seccionRgsi', e.target.value)} className="field-input">
              {['', 'Seccion 2', 'Seccion 6', 'Seccion 11', 'Seccion 12'].map(v => <option key={v || 'none'} value={v}>{v || 'No aplica'}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Probabilidad">
            <input type="number" min="1" max="5" value={draft.probabilidad} onChange={e => update('probabilidad', Number(e.target.value))} className="field-input" />
          </Field>
          <Field label="Impacto">
            <input type="number" min="1" max="5" value={draft.impacto} onChange={e => update('impacto', Number(e.target.value))} className="field-input" />
          </Field>
          <div className="border border-rule bg-[#0B0F15]/70 p-3">
            <div className="mb-1 text-[10px] uppercase tracking-widest text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
              Riesgo
            </div>
            <div className="font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
              {riskScore} / {riskLevel.toUpperCase()}
            </div>
          </div>
        </div>

        {[
          ['Condición', 'condicion'],
          ['Criterio', 'criterio'],
          ['Causa', 'causa'],
          ['Efecto', 'efecto'],
          ['Conclusión', 'conclusion'],
          ['Recomendación', 'recomendacion'],
        ].map(([label, key]) => (
          <Field key={key} label={label}>
            <textarea
              value={String(draft[key as keyof FindingDraft] ?? '')}
              onChange={e => update(key as keyof FindingDraft, e.target.value as never)}
              className="field-input min-h-16 resize-y"
            />
          </Field>
        ))}

        <Checklist title="Evidencias vinculadas">
          {evidencias.map(e => (
            <label key={e.id} className="check-row">
              <input type="checkbox" checked={draft.evidencias.includes(e.id)} onChange={() => toggle('evidencias', e.id)} />
              <span className="font-mono text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{e.id}</span>
              <span>{e.titulo}</span>
            </label>
          ))}
        </Checklist>

        <Checklist title="Criterios normativos">
          {todosLosCriterios.map(c => (
            <label key={c.id} className="check-row">
              <input type="checkbox" checked={draft.criterios.includes(c.id)} onChange={() => toggle('criterios', c.id)} />
              <span className="font-mono text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{c.marco} {c.codigo}</span>
              <span>{c.nombre}</span>
            </label>
          ))}
        </Checklist>

        <label className="flex items-center gap-2 border border-rule bg-[#0B0F15]/70 px-3 py-2 text-xs text-ink-muted">
          <input type="checkbox" checked={draft.addToBoard} onChange={e => update('addToBoard', e.target.checked)} />
          Agregar o mantener como nodo en el tablero visual
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="border border-rule px-4 py-2 text-sm text-ink-muted hover:text-ink">
            Cancelar
          </button>
          <button type="button" onClick={onSave} className="border border-vermilion/55 bg-vermilion/15 px-4 py-2 text-sm font-semibold text-ink hover:border-vermilion">
            Guardar hallazgo
          </button>
        </div>
      </div>
    </div>
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
