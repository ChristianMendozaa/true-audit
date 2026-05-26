'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { todosLosCriterios } from '@/lib/frameworks';
import { calculateRiskLevel, calculateRiskScore, calculateSeveridad } from '@/lib/risk';
import type { EstadoHallazgo, Hallazgo } from '@/lib/types';
import { useCaseData } from '@/components/data/CaseDataProvider';
import StatusPill from '@/components/data/StatusPill';
import CriterioBadge from '@/components/data/CriterioBadge';
import SectionRule from '@/components/shell/SectionRule';
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

export default function HallazgosPage() {
  const { caso, upsertHallazgo, discardHallazgo } = useCaseData();
  const { canEditAuditWork, isReadOnlyDemo } = useAuth();
  const [draft, setDraft] = useState<FindingDraft | null>(null);

  const hallazgosActivos = useMemo(
    () => caso.hallazgos.filter(h => !h.descartado && h.estado !== 'descartado'),
    [caso.hallazgos]
  );
  const sorted = [...hallazgosActivos].sort((a, b) => severidadOrder[a.severidad] - severidadOrder[b.severidad]);
  const maxEvidence = Math.max(1, ...hallazgosActivos.map(h => h.evidencias.length));

  const startNew = () => {
    if (!canEditAuditWork) return;
    setDraft(emptyDraft(nextFindingNumber(caso.hallazgos)));
  };
  const startEdit = (hallazgo: Hallazgo) => {
    if (!canEditAuditWork) return;
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
    <div className="max-w-7xl p-8">
      <div className="audit-file-surface mb-8 p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className="border border-vermilion/45 bg-vermilion/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-vermilion"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Carpeta de hallazgos
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Expediente {caso.numero}
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="font-display text-4xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              Hallazgos de auditoria
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              {hallazgosActivos.length} hallazgos activos / {hallazgosActivos.filter(h => h.estadoRespuesta === 'pendiente').length} sin respuesta del banco.
            </p>
          </div>
          <button
            type="button"
            onClick={startNew}
            disabled={!canEditAuditWork}
            className="border border-vermilion/55 bg-vermilion/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-vermilion disabled:cursor-not-allowed disabled:opacity-45"
          >
            Nuevo hallazgo
          </button>
        </div>
        {isReadOnlyDemo && (
          <div className="mt-4 border border-rule bg-[#0B0F15]/70 p-3 text-xs text-ink-muted">
            Modo demo activo: los hallazgos se muestran en solo lectura.
          </div>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {[
          { label: 'Riesgo alto', count: sorted.filter(h => h.severidad === 'critico').length, status: 'critico' as const },
          { label: 'Riesgo medio', count: sorted.filter(h => h.severidad === 'medio').length, status: 'medio' as const },
          { label: 'Riesgo bajo', count: sorted.filter(h => h.severidad === 'bajo').length, status: 'bajo' as const },
        ].map(item => (
          <div key={item.label} className="audit-file-surface flex items-center gap-3 px-4 py-3">
            <span
              className="font-display text-3xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              {item.count}
            </span>
            <StatusPill status={item.status} size="sm" />
          </div>
        ))}
      </div>

      <SectionRule label="Indice de hallazgos" />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-3">
          {sorted.map((hallazgo, i) => {
            const criterios = hallazgo.criterios
              .map(id => todosLosCriterios.find(c => c.id === id))
              .filter(Boolean) as typeof todosLosCriterios;
            const borderColor = hallazgo.severidad === 'critico' ? '#F06A49'
              : hallazgo.severidad === 'medio' ? '#D8A437'
              : '#78A85A';

            return (
              <div
                key={hallazgo.id}
                className="audit-file-surface group overflow-hidden opacity-0 animate-fade-up transition-all hover:border-signal/55"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: 'forwards',
                  borderLeft: `4px solid ${borderColor}`,
                }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-5">
                    <div className="w-20 shrink-0">
                      <div className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                        {hallazgo.numero}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                        {hallazgo.fechaEmision}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-start gap-2">
                        <h2
                          className="font-display min-w-0 flex-1 text-base font-semibold leading-snug text-ink transition-colors group-hover:text-signal"
                          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                        >
                          {hallazgo.titulo}
                        </h2>
                        <StatusPill status={hallazgo.severidad} size="sm" className="mt-0.5 shrink-0" />
                        <StatusPill status={hallazgo.estadoRespuesta} size="sm" className="mt-0.5 shrink-0" />
                      </div>
                      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                        {hallazgo.condicion}
                      </p>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {criterios.map(c => (
                          <CriterioBadge key={c.id} codigo={c.codigo} marco={c.marco} size="sm" />
                        ))}
                        <span className="ml-1 font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                          {hallazgo.evidencias.length} evidencia{hallazgo.evidencias.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/casos/${caso.id}/hallazgos/${hallazgo.id}`} className="border border-rule px-3 py-1.5 text-xs text-ink-muted hover:border-signal hover:text-ink">
                          Ver trazabilidad
                        </Link>
                        <button type="button" onClick={() => startEdit(hallazgo)} disabled={!canEditAuditWork} className="border border-rule px-3 py-1.5 text-xs text-ink-muted hover:border-signal hover:text-ink disabled:cursor-not-allowed disabled:opacity-45">
                          Editar
                        </button>
                        <button type="button" onClick={() => canEditAuditWork && discardHallazgo(hallazgo.id)} disabled={!canEditAuditWork} className="border border-vermilion/45 px-3 py-1.5 text-xs text-vermilion hover:border-vermilion disabled:cursor-not-allowed disabled:opacity-45">
                          Descartar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden bg-rule-light">
                      <div
                        className="h-full"
                        style={{
                          background: borderColor,
                          width: `${(hallazgo.evidencias.length / maxEvidence) * 100}%`,
                          opacity: 0.78,
                        }}
                      />
                    </div>
                    <span className="shrink-0 font-mono text-[9px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                      {hallazgo.evidencias.length} EVD
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky top-6 self-start">
          {draft ? (
            <FindingForm
              draft={draft}
              setDraft={setDraft}
              onSave={saveDraft}
              onCancel={() => setDraft(null)}
              evidencias={caso.evidencias.filter(e => !e.descartada)}
            />
          ) : (
            <div className="border border-dashed border-rule bg-[#101721]/70 p-8 text-center">
              <div className="text-sm text-ink-muted">Crea o edita un hallazgo</div>
              <div className="mt-2 text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                para registrar condicion, criterio, causa, efecto, riesgo y recomendacion
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="audit-file-surface animate-slide-in-right p-6">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-vermilion" style={{ fontFamily: 'var(--font-mono)' }}>
        {draft.id ? `Editar ${draft.numero}` : 'Nuevo hallazgo'}
      </div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Ficha de hallazgo
        </h2>
        <StatusPill status={severidad} size="sm" />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Codigo">
            <input value={draft.numero} onChange={e => update('numero', e.target.value)} className="field-input" />
          </Field>
          <Field label="Fecha">
            <input type="date" value={draft.fechaEmision} onChange={e => update('fechaEmision', e.target.value)} className="field-input" />
          </Field>
          <Field label="Estado">
            <select value={draft.estado} onChange={e => update('estado', e.target.value as EstadoHallazgo)} className="field-input">
              <option value="abierto">Abierto</option>
              <option value="en-revision">En revision</option>
              <option value="pendiente-respuesta">Pendiente respuesta</option>
              <option value="respondido">Respondido</option>
              <option value="cerrado">Cerrado</option>
              <option value="descartado">Descartado</option>
            </select>
          </Field>
        </div>

        <Field label="Titulo">
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
          <Field label="Seccion RGSI">
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
          ['Condicion', 'condicion'],
          ['Criterio', 'criterio'],
          ['Causa', 'causa'],
          ['Efecto', 'efecto'],
          ['Conclusion', 'conclusion'],
          ['Recomendacion', 'recomendacion'],
        ].map(([label, key]) => (
          <Field key={key} label={label}>
            <textarea
              value={String(draft[key as keyof FindingDraft] ?? '')}
              onChange={e => update(key as keyof FindingDraft, e.target.value as never)}
              className="field-input min-h-20 resize-y"
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
