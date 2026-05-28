'use client';

import { Children, useMemo } from 'react';
import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import {
  calculateFindingSupport,
  calculateFrameworkCoverage,
  calculateTopologicalImpact,
  coverageStatusLabel,
  detectTraceabilityGaps,
  supportStatusLabel,
  type FindingSupportStatus,
  type FrameworkCoverageStatus,
  type TraceabilityGapSeverity,
} from '@/lib/audit-analysis';

const supportClasses: Record<FindingSupportStatus, string> = {
  defendible: 'border-olive/50 bg-olive/10 text-olive',
  parcial: 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal',
  debil: 'border-vermilion/55 bg-vermilion/10 text-vermilion',
};

const coverageClasses: Record<FrameworkCoverageStatus, string> = {
  cubierto: 'border-olive/50 bg-olive/10 text-olive',
  parcial: 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal',
  debil: 'border-vermilion/45 bg-vermilion/10 text-vermilion',
  'sin-cubrir': 'border-rule bg-[#0B0F15] text-ink-muted',
};

const gapClasses: Record<TraceabilityGapSeverity, string> = {
  critica: 'border-vermilion/50 text-vermilion',
  advertencia: 'border-amber-signal/50 text-amber-signal',
  informativa: 'border-rule text-ink-muted',
};

export default function AseguramientoPage() {
  const { caso } = useCaseData();

  const analysis = useMemo(() => {
    const hallazgosActivos = caso.hallazgos.filter(h => !h.descartado && h.estado !== 'descartado');
    const support = hallazgosActivos.map(hallazgo => ({
      hallazgo,
      support: calculateFindingSupport(caso, hallazgo),
    }));
    const gaps = detectTraceabilityGaps(caso);
    const coverage = calculateFrameworkCoverage(caso);
    const topology = calculateTopologicalImpact(caso);

    return { hallazgosActivos, support, gaps, coverage, topology };
  }, [caso]);

  const defendibles = analysis.support.filter(item => item.support.status === 'defendible').length;
  const parciales = analysis.support.filter(item => item.support.status === 'parcial').length;
  const debiles = analysis.support.filter(item => item.support.status === 'debil').length;
  const avgSupport = analysis.support.length > 0
    ? Math.round(analysis.support.reduce((sum, item) => sum + item.support.score, 0) / analysis.support.length)
    : 0;
  const criticalGaps = analysis.gaps.filter(gap => gap.severidad === 'critica').length;
  const missingJustification = analysis.gaps.filter(gap => gap.id.endsWith('sin-justificacion')).length;

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <section className="audit-file-surface mb-6 p-6">
        <div
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Control de calidad / Expediente {caso.numero}
        </div>
        <h1
          className="font-display text-3xl font-bold text-ink"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
        >
          Aseguramiento del expediente
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          True Audit evalua completitud, trazabilidad y cobertura documental. No declara si un hallazgo es verdadero o falso: senala que falta para defenderlo mejor.
        </p>
      </section>

      <section className="mb-6 grid gap-3 md:grid-cols-5">
        <Metric value={`${avgSupport}%`} label="Sustentacion media" detail={`${defendibles} defendibles / ${parciales} parciales / ${debiles} debiles`} tone={avgSupport >= 80 ? 'ok' : avgSupport >= 50 ? 'warning' : 'critical'} />
        <Metric value={criticalGaps} label="Huecos criticos" detail={`${analysis.gaps.length} observaciones totales`} tone={criticalGaps === 0 ? 'ok' : 'critical'} />
        <Metric value={analysis.coverage.summary.covered} label="Criterios cubiertos" detail={`${analysis.coverage.summary.total} criterios en alcance`} tone={analysis.coverage.summary.uncovered === 0 ? 'ok' : 'warning'} />
        <Metric value={missingJustification} label="Relaciones sin bitacora" detail="Conexiones visuales sin justificacion" tone={missingJustification === 0 ? 'ok' : 'warning'} />
        <Metric value={analysis.topology.highImpactNodes.length} label="Nodos alto impacto" detail="Impacto topologico del expediente" tone={analysis.topology.highImpactNodes.length > 0 ? 'warning' : 'ok'} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="audit-file-surface overflow-hidden">
          <SectionHeader title="Semaforo de sustentacion" detail="Completitud documental por hallazgo" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[#0B0F15] text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                <tr>
                  <th className="border-b border-rule px-4 py-2.5 font-medium">Hallazgo</th>
                  <th className="border-b border-rule px-4 py-2.5 font-medium">Sustento</th>
                  <th className="border-b border-rule px-4 py-2.5 font-medium">Falta principal</th>
                  <th className="border-b border-rule px-4 py-2.5 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {analysis.support.map(({ hallazgo, support }) => (
                  <tr key={hallazgo.id} className="border-b border-rule/50 last:border-b-0">
                    <td className="px-4 py-3">
                      <Link href={`/casos/${caso.id}/hallazgos/${hallazgo.id}`} className="group block">
                        <span className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{hallazgo.numero}</span>
                        <span className="ml-2 text-ink group-hover:text-signal">{hallazgo.titulo}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <SupportMeter score={support.score} status={support.status} />
                        <StatusPill className={supportClasses[support.status]} label={supportStatusLabel(support.status)} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {support.missingItems.length > 0 ? (
                        <div className="space-y-1">
                          {support.missingItems.slice(0, 2).map(item => (
                            <div key={item.id} className="border-l border-rule pl-2">
                              <span className="text-ink-soft">{item.label}</span>
                              <span className="ml-1 text-ink-muted">/ {item.action}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-olive">Sin faltantes materiales.</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/casos/${caso.id}/hallazgos/${hallazgo.id}/defensa`}
                        className="inline-flex border border-signal/40 px-3 py-1.5 text-xs text-signal transition-colors hover:border-ink hover:text-ink"
                      >
                        Preparar defensa
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="audit-file-surface overflow-hidden">
          <SectionHeader title="Huecos de trazabilidad" detail="Problemas detectados y accion sugerida" />
          <div className="max-h-[520px] overflow-auto">
            {analysis.gaps.length === 0 ? (
              <div className="m-5 border border-olive/35 bg-olive/5 p-4 text-sm text-olive">
                No se detectaron huecos relevantes en el expediente.
              </div>
            ) : (
              <div className="divide-y divide-rule/60">
                {analysis.gaps.slice(0, 28).map(gap => (
                  <div key={gap.id} className="px-5 py-3">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <StatusPill className={gapClasses[gap.severidad]} label={gap.severidad} />
                      <span className="font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                        {gap.entidadId}
                      </span>
                    </div>
                    <p className="text-sm leading-snug text-ink-soft">{gap.mensaje}</p>
                    <p className="mt-1 text-xs leading-snug text-ink-muted">{gap.accionSugerida}</p>
                  </div>
                ))}
                {analysis.gaps.length > 28 && (
                  <div className="px-5 py-3 text-xs text-ink-muted">
                    Se muestran 28 de {analysis.gaps.length} huecos. Prioriza los criticos y las relaciones sin justificacion.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="audit-file-surface mt-6 overflow-hidden">
        <SectionHeader title="Mapa de cobertura COBIT / COSO / RGSI" detail="Evidencias, hallazgos, respuestas y riesgo maximo por criterio" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-[#0B0F15] text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
              <tr>
                <th className="border-b border-rule px-4 py-2.5 font-medium">Criterio</th>
                <th className="border-b border-rule px-4 py-2.5 font-medium">Nombre</th>
                <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Evid.</th>
                <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Hall.</th>
                <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Resp.</th>
                <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Riesgo max.</th>
                <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {analysis.coverage.items.map(item => (
                <tr key={item.criterio.id} className="border-b border-rule/50 last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className="font-mono text-xs text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                      {item.criterio.marco} {item.criterio.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-soft">{item.criterio.nombre}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{item.evidencias.length}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{item.hallazgos.length}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{item.respuestas.length}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-ink-muted">{item.maxRisk ?? 'sin riesgo'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <StatusPill className={coverageClasses[item.status]} label={coverageStatusLabel(item.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <TopologyPanel title="Alto impacto topologico" empty="No hay nodos con alto impacto topologico.">
          {analysis.topology.highImpactNodes.slice(0, 6).map(item => (
            <TopologyRow key={item.node.id} code={item.node.refId} title={item.node.titulo} detail={`${item.score}% / grado ${item.degree}`} reason={item.reasons[0]} />
          ))}
        </TopologyPanel>
        <TopologyPanel title="Nodos puente" empty="No hay nodos puente relevantes.">
          {analysis.topology.bridgeNodes.slice(0, 6).map(item => (
            <TopologyRow key={item.node.id} code={item.node.refId} title={item.node.titulo} detail={`${item.pathCount} caminos relacionados`} reason={item.reasons.at(-1) ?? item.reasons[0]} />
          ))}
        </TopologyPanel>
        <TopologyPanel title="Hallazgos sistemicos" empty="No hay hallazgos sistemicos detectados.">
          {analysis.topology.systemicFindings.slice(0, 6).map(item => (
            <TopologyRow key={item.hallazgo.id} code={item.hallazgo.numero} title={item.hallazgo.titulo} detail={item.impact ? `${item.impact.score}% impacto` : 'sin nodo principal'} reason={item.reasons.join(' ')} />
          ))}
        </TopologyPanel>
      </section>
    </div>
  );
}

function Metric({
  value,
  label,
  detail,
  tone,
}: {
  value: string | number;
  label: string;
  detail: string;
  tone: 'ok' | 'warning' | 'critical';
}) {
  const valueColor = tone === 'ok' ? 'text-olive' : tone === 'warning' ? 'text-amber-signal' : 'text-vermilion';
  const borderColor = tone === 'ok' ? 'border-olive/45' : tone === 'warning' ? 'border-amber-signal/45' : 'border-vermilion/45';
  return (
    <div className={`border ${borderColor} bg-[#101721] p-4`}>
      <div className={`font-display text-2xl font-bold ${valueColor}`} style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
        {value}
      </div>
      <div className="mt-1 text-sm text-ink">{label}</div>
      <div className="mt-1 font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{detail}</div>
    </div>
  );
}

function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="border-b border-rule px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {detail}
      </div>
      <h2 className="mt-1 font-display text-lg font-semibold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
        {title}
      </h2>
    </div>
  );
}

function SupportMeter({ score, status }: { score: number; status: FindingSupportStatus }) {
  const color = status === 'defendible' ? '#78A85A' : status === 'parcial' ? '#D8A437' : '#F06A49';
  return (
    <div className="flex min-w-28 items-center gap-2">
      <div className="h-1.5 flex-1 bg-rule-light">
        <div className="h-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px] text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{score}%</span>
    </div>
  );
}

function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex whitespace-nowrap border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${className}`} style={{ fontFamily: 'var(--font-mono)' }}>
      {label}
    </span>
  );
}

function TopologyPanel({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Children.count(children) > 0;
  return (
    <section className="audit-file-surface p-5">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {title}
      </div>
      <div className="space-y-2">
        {hasChildren ? children : <div className="border border-rule bg-[#0B0F15]/70 p-3 text-xs text-ink-muted">{empty}</div>}
      </div>
    </section>
  );
}

function TopologyRow({ code, title, detail, reason }: { code: string; title: string; detail: string; reason: string }) {
  return (
    <div className="border-l border-rule pl-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{code}</span>
        <span className="font-mono text-[9px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{detail}</span>
      </div>
      <div className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{title}</div>
      <div className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{reason}</div>
    </div>
  );
}
