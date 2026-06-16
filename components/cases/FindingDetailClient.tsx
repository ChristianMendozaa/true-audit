'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import FindingChain from '@/components/visual/FindingChain';
import StatusPill from '@/components/data/StatusPill';
import SectionRule from '@/components/shell/SectionRule';
import { useAuth } from '@/components/auth/AuthProvider';
import { calculateFindingSupport, supportStatusLabel, type FindingSupportStatus } from '@/lib/audit-analysis';
import type { DecisionAuditor, RespuestaAuditado } from '@/lib/types';

type ResponseDraft = {
  id?: string;
  fecha: string;
  postura: RespuestaAuditado['postura'];
  argumento: string;
  evidenciaPresentada: string;
  comentarioAuditor: string;
  decisionAuditor: DecisionAuditor;
};

const supportClasses: Record<FindingSupportStatus, string> = {
  defendible: 'border-olive/50 bg-olive/10 text-olive',
  parcial: 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal',
  debil: 'border-vermilion/55 bg-vermilion/10 text-vermilion',
};

function emptyResponse(): ResponseDraft {
  return {
    fecha: new Date().toISOString().slice(0, 10),
    postura: 'acepta-parcialmente',
    argumento: '',
    evidenciaPresentada: '',
    comentarioAuditor: '',
    decisionAuditor: 'mantener',
  };
}

export default function FindingDetailClient({ caseId, findingId }: { caseId: string; findingId: string }) {
  const { caso, upsertRespuestaAuditado } = useCaseData();
  const { canRegisterResponse, canReviewResponse, isReadOnlyDemo, usuario } = useAuth();
  const hallazgo = caso.hallazgos.find(h => h.id === findingId);
  const [draft, setDraft] = useState<ResponseDraft | null>(null);

  const allIds = caso.hallazgos.filter(h => !h.descartado).map(h => h.id);
  const currentIdx = allIds.indexOf(findingId);
  const prevId = currentIdx > 0 ? allIds[currentIdx - 1] : null;
  const nextId = currentIdx < allIds.length - 1 ? allIds[currentIdx + 1] : null;

  const respuestas = useMemo(() => {
    if (!hallazgo) return [];
    return caso.respuestasAuditado.filter(r => r.hallazgoId === hallazgo.id);
  }, [caso.respuestasAuditado, hallazgo]);
  const support = useMemo(() => hallazgo ? calculateFindingSupport(caso, hallazgo) : null, [caso, hallazgo]);

  if (!hallazgo) {
    return (
      <div className="p-8">
        <div className="audit-file-surface p-6 text-ink-muted">Hallazgo no encontrado en el expediente local.</div>
      </div>
    );
  }

  const severidadColor = hallazgo.severidad === 'critico' ? '#C8412C'
    : hallazgo.severidad === 'medio' ? '#B88A1C'
    : '#5B7034';

  const saveResponse = () => {
    if (!canRegisterResponse || !draft || !draft.argumento.trim()) return;
    upsertRespuestaAuditado({
      id: draft.id,
      hallazgoId: hallazgo.id,
      fecha: draft.fecha,
      postura: draft.postura,
      argumento: draft.argumento.trim(),
      evidenciaPresentada: draft.evidenciaPresentada.trim() || undefined,
      comentarioAuditor: canReviewResponse ? draft.comentarioAuditor.trim() : '',
      decisionAuditor: canReviewResponse ? draft.decisionAuditor : 'pendiente',
    });
    setDraft(null);
  };

  return (
    <div className="max-w-6xl p-8">
      <div className="mb-8 flex items-center gap-2 text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        <Link href={`/casos/${caseId}/hallazgos`} className="hover:text-ink transition-colors flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          Hallazgos
        </Link>
        <span>/</span>
        <span>{hallazgo.numero}</span>
      </div>

      <div className="mb-8 border-l-4 pl-6" style={{ borderColor: severidadColor }}>
        <div className="mb-2 flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
              {hallazgo.numero}
            </span>
            <StatusPill status={hallazgo.severidad} />
            <StatusPill status={hallazgo.estadoRespuesta} />
            {support && <SupportBadge score={support.score} status={support.status} />}
          </div>
          <div className="font-mono text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            Emitido {hallazgo.fechaEmision}
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
          {hallazgo.titulo}
        </h1>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-4">
        <Metric label="Probabilidad" value={String(hallazgo.probabilidad)} />
        <Metric label="Impacto" value={String(hallazgo.impacto)} />
        <Metric label="Riesgo" value={hallazgo.nivelRiesgo.toUpperCase()} />
        <Metric label="Estado" value={hallazgo.estado} />
      </div>

      {support && (
        <div className="audit-file-surface mb-8 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="label-eyebrow" style={{ fontFamily: 'var(--font-mono)' }}>
              Semáforo de sustentación
            </div>
            <Link
              href={`/casos/${caseId}/hallazgos/${hallazgo.id}/defensa`}
              className="border border-signal/45 bg-signal/10 px-3 py-1.5 text-xs text-signal transition-colors hover:border-signal hover:text-ink"
            >
              Abrir vista defensa
            </Link>
          </div>
          {support.missingItems.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {support.missingItems.slice(0, 6).map(item => (
                <div key={item.id} className="border-l border-rule pl-3">
                  <div className="text-sm text-ink">{item.label}</div>
                  <div className="mt-0.5 text-xs text-ink-muted">{item.action}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-olive">El hallazgo no tiene faltantes materiales para defensa documental.</p>
          )}
        </div>
      )}

      <SectionRule label="Cadena de trazabilidad" number={1} />
      <div className="mb-10 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '100ms' }}>
        <FindingChain hallazgo={hallazgo} caso={caso} />
      </div>

      <SectionRule label="Ficha tecnica del hallazgo" number={2} />
      <div className="my-6 grid gap-4 md:grid-cols-2">
        <TextBlock title="Condicion" text={hallazgo.condicion} />
        <TextBlock title="Criterio" text={hallazgo.criterio} />
        <TextBlock title="Causa" text={hallazgo.causa} />
        <TextBlock title="Efecto" text={hallazgo.efecto} />
        <TextBlock title="Conclusion" text={hallazgo.conclusion} />
        <TextBlock title="Recomendacion" text={hallazgo.recomendacion} />
      </div>

      <SectionRule label="Respuesta del auditado" number={3} />
      <div className="my-6 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-3">
          {respuestas.length > 0 ? respuestas.map(r => (
            <div key={r.id} className="audit-file-surface p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="label-eyebrow text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                  {r.id} / {r.fecha}
                </span>
                <span className="border border-rule px-2 py-0.5 label-eyebrow" style={{ fontFamily: 'var(--font-mono)' }}>
                  {r.postura}
                </span>
                <span className="border border-rule px-2 py-0.5 label-eyebrow" style={{ fontFamily: 'var(--font-mono)' }}>
                  Auditor: {r.decisionAuditor}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{r.argumento}</p>
              {r.evidenciaPresentada && (
                <p className="mt-3 text-xs text-ink-muted"><span className="text-ink-soft">Evidencia banco:</span> {r.evidenciaPresentada}</p>
              )}
              <p className="mt-3 border-t border-rule pt-3 text-xs leading-relaxed text-ink-muted">
                <span className="text-ink-soft">Comentario auditor:</span> {r.comentarioAuditor}
              </p>
            </div>
          )) : (
            <div className="border border-dashed border-rule bg-[#101721]/70 p-6 text-sm text-ink-muted">
              No hay respuesta del auditado registrada para este hallazgo.
            </div>
          )}
        </div>

        <div className="audit-file-surface p-5">
          <div className="mb-4 border border-rule bg-[#0B0F15]/70 p-3 text-xs text-ink-muted">
            Sesion: <span className="text-ink-soft">{usuario.nombre}</span>. {isReadOnlyDemo ? 'Modo solo lectura para exposicion.' : 'Puede registrar o revisar respuestas segun el rol activo.'}
          </div>
          {draft ? (
            <div className="space-y-4">
              <Field label="Fecha">
                <input type="date" value={draft.fecha} onChange={e => setDraft({ ...draft, fecha: e.target.value })} className="field-input" />
              </Field>
              <Field label="Postura del banco">
                <select value={draft.postura} onChange={e => setDraft({ ...draft, postura: e.target.value as ResponseDraft['postura'] })} className="field-input">
                  <option value="acepta">Acepta</option>
                  <option value="acepta-parcialmente">Acepta parcialmente</option>
                  <option value="no-acepta">No acepta</option>
                </select>
              </Field>
              <Field label="Argumento del banco">
                <textarea value={draft.argumento} onChange={e => setDraft({ ...draft, argumento: e.target.value })} className="field-input min-h-24 resize-y" />
              </Field>
              <Field label="Evidencia o descargo presentado">
                <textarea value={draft.evidenciaPresentada} onChange={e => setDraft({ ...draft, evidenciaPresentada: e.target.value })} className="field-input min-h-16 resize-y" />
              </Field>
              <Field label="Comentario del auditor">
                <textarea
                  value={draft.comentarioAuditor}
                  onChange={e => setDraft({ ...draft, comentarioAuditor: e.target.value })}
                  disabled={!canReviewResponse}
                  className="field-input min-h-20 resize-y disabled:cursor-not-allowed disabled:opacity-45"
                />
              </Field>
              <Field label="Decision del auditor">
                <select
                  value={canReviewResponse ? draft.decisionAuditor : 'pendiente'}
                  onChange={e => setDraft({ ...draft, decisionAuditor: e.target.value as DecisionAuditor })}
                  disabled={!canReviewResponse}
                  className="field-input disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <option value="mantener">Mantener hallazgo</option>
                  <option value="ajustar">Ajustar hallazgo</option>
                  <option value="descartar">Descartar hallazgo</option>
                  <option value="pendiente">Pendiente de revision</option>
                </select>
              </Field>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setDraft(null)} className="border border-rule px-4 py-2 text-sm text-ink-muted hover:text-ink">
                  Cancelar
                </button>
                <button type="button" onClick={saveResponse} disabled={!canRegisterResponse} className="border border-olive/55 bg-olive/15 px-4 py-2 text-sm font-semibold text-ink hover:border-olive disabled:cursor-not-allowed disabled:opacity-45">
                  Guardar respuesta
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => canRegisterResponse && setDraft(emptyResponse())} disabled={!canRegisterResponse} className="w-full border border-olive/55 bg-olive/15 px-4 py-3 text-sm font-semibold text-ink hover:border-olive disabled:cursor-not-allowed disabled:opacity-45">
              Registrar respuesta del auditado
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-rule pt-6">
        {prevId ? <NavLink href={`/casos/${caseId}/hallazgos/${prevId}`} label="Hallazgo anterior" dir="prev" /> : <div />}
        <Link href={`/casos/${caseId}/hallazgos`} className="text-xs text-ink-muted hover:text-ink transition-colors font-mono" style={{ fontFamily: 'var(--font-mono)' }}>
          Ver todos los hallazgos
        </Link>
        {nextId ? <NavLink href={`/casos/${caseId}/hallazgos/${nextId}`} label="Hallazgo siguiente" dir="next" /> : <div />}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="audit-file-surface p-4">
      <div className="mb-1 label-field" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div className="font-mono text-sm text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}

function SupportBadge({ score, status }: { score: number; status: FindingSupportStatus }) {
  return (
    <span
      className={`border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] ${supportClasses[status]}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {score}% {supportStatusLabel(status)}
    </span>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="audit-file-surface p-5">
      <div className="mb-2 label-eyebrow text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{title}</div>
      <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 label-field" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
      {children}
    </label>
  );
}

function NavLink({ href, label, dir }: { href: string; label: string; dir: 'prev' | 'next' }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
      {dir === 'prev' && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L5 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      {label}
      {dir === 'next' && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 2L9 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </Link>
  );
}
