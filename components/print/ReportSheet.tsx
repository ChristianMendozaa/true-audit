import type { Caso } from '@/lib/types';
import StatusPill from '@/components/data/StatusPill';
import CriterioBadge from '@/components/data/CriterioBadge';
import { getCriterioById } from '@/lib/frameworks';
import {
  buildRelationReasoningLog,
  calculateFindingSupport,
  calculateFrameworkCoverage,
  detectTraceabilityGaps,
  supportStatusLabel,
  type FindingSupportStatus,
} from '@/lib/audit-analysis';

interface ReportSheetProps {
  caso: Caso;
}

export default function ReportSheet({ caso }: ReportSheetProps) {
  const criticos = caso.hallazgos.filter(h => h.severidad === 'critico');
  const medios   = caso.hallazgos.filter(h => h.severidad === 'medio');
  const bajos    = caso.hallazgos.filter(h => h.severidad === 'bajo');
  const supportAnalysis = caso.hallazgos.map(hallazgo => ({
    hallazgo,
    support: calculateFindingSupport(caso, hallazgo),
  }));
  const supportByFinding = new Map(supportAnalysis.map(item => [item.hallazgo.id, item.support]));
  const avgSupport = supportAnalysis.length > 0
    ? Math.round(supportAnalysis.reduce((sum, item) => sum + item.support.score, 0) / supportAnalysis.length)
    : 0;
  const defendibles = supportAnalysis.filter(item => item.support.status === 'defendible').length;
  const parciales = supportAnalysis.filter(item => item.support.status === 'parcial').length;
  const debiles = supportAnalysis.filter(item => item.support.status === 'debil').length;
  const coverage = calculateFrameworkCoverage(caso);
  const gaps = detectTraceabilityGaps(caso);
  const criticalGaps = gaps.filter(gap => gap.severidad === 'critica').length;
  const reasoningLog = buildRelationReasoningLog(caso);

  return (
    <div className="print-document font-sans" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ─── PORTADA ─── */}
      <div className="min-h-[297mm] flex flex-col border border-rule p-12 mb-8 relative overflow-hidden">
        {/* Marca de agua */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="font-display font-black text-center leading-none select-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18rem',
              color: '#D9D2C2',
              opacity: 0.12,
              letterSpacing: '0em',
              transform: 'rotate(-15deg)',
            }}
          >
            TA
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-ink pb-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 border-2 border-ink flex items-center justify-center">
                <span
                  className="font-display font-black text-xl"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                >
                  TA
                </span>
              </div>
              <div>
                <div
                  className="font-display text-2xl font-bold text-ink"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                >
                  True Audit
                </div>
                <div
                  className="text-ink-muted text-xs uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Sistema de Auditoría de Sistemas
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className="font-mono text-xs text-ink-muted uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Expediente
              </div>
              <div
                className="font-display text-3xl font-bold text-vermilion"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
              >
                {caso.numero}
              </div>
            </div>
          </div>

          {/* Title block */}
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Informe de Auditoría · Tecnología de la Información
            </div>
            <h1
              className="font-display font-bold text-ink mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', letterSpacing: '0em' }}
            >
              {caso.titulo}
            </h1>
            <div className="space-y-1.5 mb-10">
              <InfoRow label="Entidad auditada" value={caso.banco} />
              <InfoRow label="Período auditado" value={caso.periodo} />
              <InfoRow label="Inicio del trabajo" value={caso.fechaInicio} />
              <InfoRow label="Estado" value={caso.estado} />
            </div>

            {/* Team */}
            <div className="border-t border-rule pt-6">
              <div
                className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Equipo auditor
              </div>
              <div className="grid grid-cols-3 gap-4">
                {caso.auditores.map(a => (
                  <div key={a.id}>
                    <div className="text-sm font-semibold text-ink">{a.nombre}</div>
                    <div className="text-xs text-ink-muted">{a.rol}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KPI summary strip */}
          <div className="border-t-2 border-ink pt-6 mt-8">
            <div className="grid grid-cols-4 gap-0">
              {[
                { n: caso.evidencias.length,  l: 'Evidencias', a: 'text-ink' },
                { n: caso.hallazgos.length,   l: 'Hallazgos',  a: 'text-ink' },
                { n: criticos.length,         l: 'Críticos',   a: 'text-vermilion' },
                { n: caso.hallazgos.filter(h=>h.estadoRespuesta==='pendiente').length, l: 'Sin respuesta', a: 'text-amber-signal' },
              ].map((item, i) => (
                <div key={i} className={`pr-6 ${i > 0 ? 'pl-6 border-l border-rule' : ''}`}>
                  <div
                    className={`font-display font-bold ${item.a}`}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0em' }}
                  >
                    {item.n}
                  </div>
                  <div className="text-xs text-ink-muted">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN 1: OBJETIVO Y ALCANCE ─── */}
      <div className="border border-rule p-10 mb-8 print-break-before">
        <SectionHeader num="01" title="Objetivo y Alcance" />
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Objetivo</h3>
            <p className="text-sm text-ink leading-relaxed">{caso.objetivo}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Alcance</h3>
            <p className="text-sm text-ink leading-relaxed">{caso.alcance}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-rule">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Metodología</h3>
          <p className="text-sm text-ink leading-relaxed">{caso.metodologia}</p>
        </div>
      </div>

      {/* ─── SECCIÓN 2: RESUMEN EJECUTIVO ─── */}
      <div className="border border-rule p-10 mb-8">
        <SectionHeader num="02" title="Resumen Ejecutivo de Hallazgos" />
        <div className="mt-6 space-y-3">
          {caso.hallazgos.map((h, i) => (
            <div key={h.id} className="flex items-center gap-4 border-b border-rule-light pb-3">
              <span
                className="font-mono text-xs text-ink-muted w-8 shrink-0"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className="font-mono text-xs text-ink-muted w-16 shrink-0"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {h.numero}
              </span>
              <span className="text-sm text-ink flex-1">{h.titulo}</span>
              <StatusPill status={h.severidad} size="sm" />
              <StatusPill status={h.estadoRespuesta} size="sm" />
            </div>
          ))}
        </div>

        {/* Distribution */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Críticos', items: criticos, accent: 'bg-vermilion-soft border-vermilion text-vermilion' },
            { label: 'Medios',   items: medios,   accent: 'bg-amber-soft border-amber-signal text-amber-signal' },
            { label: 'Bajos',    items: bajos,    accent: 'bg-olive-soft border-olive text-olive' },
          ].map(group => (
            <div key={group.label} className={`border ${group.accent.split(' ')[1]} p-4`}>
              <div
                className={`font-display font-bold text-4xl ${group.accent.split(' ')[2]}`}
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
              >
                {group.items.length}
              </div>
              <div className="text-xs font-medium text-ink mt-1">{group.label}</div>
              {group.items.map(h => (
                <div key={h.id} className="text-xs text-ink-muted mt-1 truncate">{h.numero} · {h.titulo.slice(0, 40)}…</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Seccion 3: aseguramiento del expediente */}
      <div className="border border-rule p-10 mb-8 print-break-before">
        <SectionHeader num="03" title="Aseguramiento del Expediente" />
        <p className="mt-5 text-sm leading-relaxed text-ink-muted">
          True Audit no reemplaza el juicio profesional del auditor. Esta seccion resume completitud, trazabilidad y cobertura documental del expediente antes de emitir o defender el informe.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AssuranceMetric value={`${avgSupport}%`} label="Sustentacion media" detail={`${defendibles} defendibles / ${parciales} parciales / ${debiles} debiles`} />
          <AssuranceMetric value={criticalGaps} label="Huecos criticos" detail={`${gaps.length} observaciones totales`} />
          <AssuranceMetric value={coverage.summary.covered} label="Criterios cubiertos" detail={`${coverage.summary.total} criterios COBIT/COSO/RGSI`} />
          <AssuranceMetric value={coverage.summary.uncovered} label="Sin cubrir" detail="Criterios sin evidencia ni conclusion" />
        </div>

        <div className="mt-8 overflow-x-auto border border-rule">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#0B0F15] text-[10px] uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                <th className="border-b border-rule px-3 py-2 font-medium">Hallazgo</th>
                <th className="border-b border-rule px-3 py-2 font-medium">Sustento</th>
                <th className="border-b border-rule px-3 py-2 font-medium">Estado</th>
                <th className="border-b border-rule px-3 py-2 font-medium">Faltantes principales</th>
              </tr>
            </thead>
            <tbody>
              {supportAnalysis.map(({ hallazgo, support }) => (
                <tr key={hallazgo.id} className="border-b border-rule-light last:border-b-0">
                  <td className="px-3 py-2">
                    <div className="font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{hallazgo.numero}</div>
                    <div className="text-xs text-ink">{hallazgo.titulo}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-sm text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{support.score}%</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${supportStatusClass(support.status)}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {supportStatusLabel(support.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-muted">
                    {support.missingItems.length > 0
                      ? support.missingItems.slice(0, 3).map(item => item.label).join(', ')
                      : 'Sin faltantes materiales'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border border-rule p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            Bitacora de razonamiento del tablero
          </div>
          {reasoningLog.length > 0 ? (
            <div className="mt-3 space-y-3">
              {reasoningLog.slice(0, 5).map(entry => (
                <div key={entry.id} className="border-l border-rule pl-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                    {entry.connection.id} / {entry.relationLabel} / {formatReportDate(entry.fecha)}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink">{entry.detalle}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
                    {entry.sourceLabel} -&gt; {entry.targetLabel}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              No hay justificaciones de relaciones registradas en el tablero.
            </p>
          )}
        </div>
      </div>

      {/* Seccion 4: hallazgos detallados */}
      <div className="border border-rule p-10 mb-8 print-break-before">
        <SectionHeader num="04" title="Hallazgos Detallados" />
        <div className="mt-6 space-y-10">
          {caso.hallazgos.map(h => {
            const criterios = h.criterios.map(id => getCriterioById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getCriterioById>>[];
            const support = supportByFinding.get(h.id);
            return (
              <div key={h.id} className="border-l-4 pl-6" style={{ borderColor: h.severidad === 'critico' ? '#C8412C' : h.severidad === 'medio' ? '#B88A1C' : '#5B7034' }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div
                      className="font-mono text-xs text-ink-muted mb-1"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {h.numero}
                    </div>
                    <h3
                      className="font-display text-xl font-bold text-ink"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                    >
                      {h.titulo}
                    </h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <StatusPill status={h.severidad} size="sm" />
                    <StatusPill status={h.estadoRespuesta} size="sm" />
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap mb-4">
                  {criterios.map(c => (
                    <CriterioBadge key={c.id} codigo={c.codigo} marco={c.marco} size="sm" />
                  ))}
                </div>

                {support && (
                  <div className="mb-4 border border-rule bg-[#0B0F15]/50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                          Sustentacion True Audit
                        </div>
                        <div className="mt-1 text-sm text-ink">
                          {support.score}% - {supportStatusLabel(support.status)}
                        </div>
                      </div>
                      <div className="max-w-md text-right text-xs text-ink-muted">
                        {support.missingItems.length > 0
                          ? `Falta reforzar: ${support.missingItems.slice(0, 3).map(item => item.label).join(', ')}.`
                          : 'El hallazgo tiene trazabilidad documental suficiente para defensa.'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4 grid grid-cols-4 gap-2 text-sm">
                  <FindingBlock label="Probabilidad" text={String(h.probabilidad)} />
                  <FindingBlock label="Impacto" text={String(h.impacto)} />
                  <FindingBlock label="Nivel de riesgo" text={h.nivelRiesgo.toUpperCase()} />
                  <FindingBlock label="Estado" text={h.estado} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <FindingBlock label="Condición" text={h.condicion} />
                  <FindingBlock label="Criterio" text={h.criterio} />
                  <FindingBlock label="Causa" text={h.causa} />
                  <FindingBlock label="Efecto / Riesgo" text={h.efecto} />
                  <FindingBlock label="Conclusión" text={h.conclusion} />
                  <FindingBlock label="Recomendación" text={h.recomendacion} />
                </div>

                {h.respuestaBanco && (
                  <div className="mt-4 p-3 bg-olive-soft border border-olive">
                    <div
                      className="font-mono text-[10px] text-olive uppercase tracking-wider mb-1"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Respuesta del banco auditado
                    </div>
                    <p className="text-sm text-ink leading-relaxed">{h.respuestaBanco}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Seccion 5: conclusiones */}
      <div className="border border-rule p-10 print-break-before">
        <SectionHeader num="05" title="Conclusiones" />
        <div className="mt-6 text-sm text-ink leading-relaxed space-y-4">
          <p>
            Con base en el trabajo de auditoría realizado, el equipo concluye que <strong>{caso.banco}</strong> presenta
            <strong> {criticos.length} hallazgos de severidad crítica</strong> en materia de continuidad operativa de TI,
            que requieren atención inmediata por parte de la alta gerencia.
          </p>
          <p>
            Los hallazgos críticos identificados (H-001, H-002, H-003) son sistémicos y están interrelacionados: la ausencia
            de pruebas del BCP, la falta de verificación de integridad de respaldos y la inexistencia de cláusulas
            de continuidad en contratos con proveedores cloud configuran una exposición regulatoria y operacional alta
            ante el RGSI y el marco COBIT.
          </p>
          <p>
            Se recomienda al banco implementar un plan de acción correctiva con un Comité de seguimiento mensual,
            priorizar los hallazgos críticos antes de fin de Q3 2026, y reportar el avance formalmente al equipo auditor
            en un plazo no superior a 30 días hábiles desde la emisión de este informe.
          </p>
          <p>
            Los hallazgos medios y bajos, si bien menos urgentes, representan brechas de control que de no subsanarse
            pueden derivar en hallazgos críticos en la siguiente auditoría.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t-2 border-ink">
          {caso.auditores.map(a => (
            <div key={a.id} className="text-center">
              <div className="h-12 border-b border-ink mb-2" />
              <div className="text-sm font-semibold text-ink">{a.nombre}</div>
              <div className="text-xs text-ink-muted">{a.rol}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="font-display text-5xl font-black text-rule leading-none select-none"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
      >
        {num}
      </span>
      <div className="h-px flex-1 bg-rule" />
      <h2
        className="font-display text-xl font-bold text-ink"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
      >
        {title}
      </h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span
        className="font-mono text-ink-muted min-w-36 shrink-0"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', paddingTop: '2px' }}
      >
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function formatReportDate(value: string) {
  const [datePart, timePart] = value.split('T');
  const [year = '', month = '', day = ''] = datePart.split('-');
  return `${day}/${month}/${year}${timePart ? ` ${timePart.slice(0, 5)}` : ''}`;
}

function AssuranceMetric({ value, label, detail }: { value: string | number; label: string; detail: string }) {
  return (
    <div className="border border-rule bg-[#0B0F15]/45 p-4">
      <div className="font-display text-2xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-ink">{label}</div>
      <div className="mt-1 text-[10px] leading-snug text-ink-muted">{detail}</div>
    </div>
  );
}

function supportStatusClass(status: FindingSupportStatus) {
  if (status === 'defendible') return 'border-olive/50 bg-olive/10 text-olive';
  if (status === 'parcial') return 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal';
  return 'border-vermilion/55 bg-vermilion/10 text-vermilion';
}

function FindingBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div
        className="font-mono text-[10px] text-ink-muted uppercase tracking-wider mb-1"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
      <p className="text-ink leading-relaxed">{text}</p>
    </div>
  );
}
