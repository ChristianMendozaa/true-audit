'use client';

import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import CriterioBadge from '@/components/data/CriterioBadge';
import StatusPill from '@/components/data/StatusPill';
import {
  buildFindingDefenseSheet,
  supportStatusLabel,
  type FindingSupportStatus,
} from '@/lib/audit-analysis';

const supportClasses: Record<FindingSupportStatus, string> = {
  defendible: 'border-olive/50 bg-olive/10 text-olive',
  parcial: 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal',
  debil: 'border-vermilion/55 bg-vermilion/10 text-vermilion',
};

export default function FindingDefenseClient({ caseId, findingId }: { caseId: string; findingId: string }) {
  const { caso } = useCaseData();
  const sheet = buildFindingDefenseSheet(caso, findingId);

  if (!sheet) {
    return (
      <div className="p-8">
        <div className="audit-file-surface p-6 text-ink-muted">Hallazgo no encontrado en el expediente local.</div>
      </div>
    );
  }

  const { hallazgo, support } = sheet;

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <div className="mb-6 flex items-center gap-2 text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        <Link href={`/casos/${caseId}/hallazgos`} className="hover:text-ink">&lt;- Hallazgos</Link>
        <span>/</span>
        <Link href={`/casos/${caseId}/hallazgos/${findingId}`} className="hover:text-ink">{hallazgo.numero}</Link>
        <span>/ defensa</span>
      </div>

      <section className="audit-file-surface mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{hallazgo.numero}</span>
              <StatusPill status={hallazgo.severidad} size="sm" />
              <StatusPill status={hallazgo.estadoRespuesta} size="sm" />
              <SupportPill score={support.score} status={support.status} />
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
              Defensa del hallazgo
            </h1>
            <p className="mt-2 text-lg leading-snug text-ink-soft">{hallazgo.titulo}</p>
          </div>
          <Link
            href={sheet.boardUrl}
            className="border border-signal/45 bg-signal/10 px-4 py-2 text-sm font-semibold text-signal transition-colors hover:border-signal hover:text-ink"
          >
            Abrir tablero
          </Link>
        </div>
      </section>

      <section className="mb-6 grid gap-3 md:grid-cols-4">
        <Metric label="Probabilidad" value={String(hallazgo.probabilidad)} />
        <Metric label="Impacto" value={String(hallazgo.impacto)} />
        <Metric label="Riesgo" value={hallazgo.nivelRiesgo.toUpperCase()} />
        <Metric label="Decision auditor" value={sheet.decisionAuditor} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="audit-file-surface p-5">
          <SectionTitle title="Ficha tecnica para defensa" />
          <div className="grid gap-4 md:grid-cols-2">
            <TextBlock title="Condicion" text={hallazgo.condicion} />
            <TextBlock title="Criterio" text={hallazgo.criterio} />
            <TextBlock title="Causa" text={hallazgo.causa} />
            <TextBlock title="Efecto / riesgo" text={hallazgo.efecto} />
            <TextBlock title="Conclusion" text={hallazgo.conclusion} />
            <TextBlock title="Recomendacion" text={hallazgo.recomendacion} />
          </div>

          <div className="mt-5 border-t border-rule pt-4">
            <SectionTitle title="Trazabilidad textual" compact />
            <p className="text-sm leading-relaxed text-ink-soft">{sheet.traceabilityText}</p>
          </div>

          <div className="mt-5 border-t border-rule pt-4">
            <SectionTitle title="Decision y justificacion" compact />
            <p className="text-sm leading-relaxed text-ink-soft">{sheet.decisionJustification}</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="audit-file-surface p-5">
            <SectionTitle title="Debilidades pendientes" />
            {support.missingItems.length === 0 ? (
              <div className="border border-olive/35 bg-olive/5 p-3 text-sm text-olive">
                El hallazgo no tiene faltantes materiales para defensa documental.
              </div>
            ) : (
              <div className="space-y-2">
                {support.missingItems.map(item => (
                  <div key={item.id} className="border-l border-rule pl-3">
                    <div className="text-sm text-ink">{item.label}</div>
                    <div className="mt-0.5 text-xs text-ink-muted">{item.action}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <TracePanel title={`Evidencias vinculadas (${sheet.evidencias.length})`}>
            {sheet.evidencias.map(evidencia => (
              <TraceRow key={evidencia.id} code={evidencia.id} title={evidencia.titulo} detail={evidencia.descripcion} />
            ))}
          </TracePanel>

          <TracePanel title={`Criterios COBIT / COSO / RGSI (${sheet.criterios.length})`}>
            {sheet.criterios.map(criterio => (
              <div key={criterio.id} className="border-l border-rule pl-3">
                <CriterioBadge codigo={criterio.codigo} marco={criterio.marco} size="sm" />
                <div className="mt-1 text-sm text-ink-soft">{criterio.nombre}</div>
                <div className="mt-0.5 text-xs text-ink-muted">{criterio.descripcion}</div>
              </div>
            ))}
          </TracePanel>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <TracePanel title={`Respuesta del auditado (${sheet.respuestas.length})`}>
          {sheet.respuestas.map(respuesta => (
            <TraceRow
              key={respuesta.id}
              code={`${respuesta.id} / ${respuesta.postura}`}
              title={respuesta.argumento}
              detail={`Decision auditor: ${respuesta.decisionAuditor}. ${respuesta.comentarioAuditor}`}
            />
          ))}
        </TracePanel>

        <TracePanel title={`Linea de tiempo (${sheet.timelineEvents.length})`}>
          {sheet.timelineEvents.map(evento => (
            <TraceRow key={evento.id} code={evento.fecha.slice(0, 10)} title={evento.titulo} detail={evento.descripcion} />
          ))}
        </TracePanel>

        <TracePanel title={`Relaciones del tablero (${sheet.boardConnections.length})`}>
          {sheet.boardConnections.map(conexion => (
            <TraceRow
              key={conexion.id}
              code={`${conexion.id} / ${conexion.etiqueta ?? 'relacion'}`}
              title={conexion.justificacion || 'Relacion sin justificacion registrada'}
              detail={`${conexion.desde} -> ${conexion.hacia}`}
            />
          ))}
        </TracePanel>
      </div>
    </div>
  );
}

function SupportPill({ score, status }: { score: number; status: FindingSupportStatus }) {
  return (
    <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${supportClasses[status]}`} style={{ fontFamily: 'var(--font-mono)' }}>
      {score}% {supportStatusLabel(status)}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-rule bg-[#101721] p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div className="mt-1 font-mono text-sm text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}

function SectionTitle({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className={`${compact ? 'mb-2' : 'mb-4'} font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted`} style={{ fontFamily: 'var(--font-mono)' }}>
      {title}
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-rule bg-[#0B0F15]/70 p-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{title}</div>
      <p className="text-sm leading-relaxed text-ink-soft">{text || 'Sin informacion registrada.'}</p>
    </div>
  );
}

function TracePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="audit-file-surface p-5">
      <SectionTitle title={title} />
      <div className="space-y-3">
        {children && (Array.isArray(children) ? children.length > 0 : true)
          ? children
          : <div className="border border-dashed border-rule p-3 text-xs text-ink-muted">Sin elementos vinculados.</div>}
      </div>
    </section>
  );
}

function TraceRow({ code, title, detail }: { code: string; title: string; detail: string }) {
  return (
    <div className="border-l border-rule pl-3">
      <div className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{code}</div>
      <div className="mt-0.5 text-sm leading-snug text-ink-soft">{title}</div>
      {detail && <div className="mt-0.5 text-xs leading-relaxed text-ink-muted">{detail}</div>}
    </div>
  );
}
