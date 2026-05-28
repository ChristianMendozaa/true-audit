'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import CriterioBadge from '@/components/data/CriterioBadge';
import {
  calculateFrameworkCoverage,
  coverageStatusLabel,
  type FrameworkCoverageStatus,
} from '@/lib/audit-analysis';

const coverageClasses: Record<FrameworkCoverageStatus, string> = {
  cubierto: 'border-olive/50 bg-olive/10 text-olive',
  parcial: 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal',
  debil: 'border-vermilion/45 bg-vermilion/10 text-vermilion',
  'sin-cubrir': 'border-rule bg-[#0B0F15] text-ink-muted',
};

const marcos = [
  { id: 'COBIT', nombre: 'COBIT 2019', desc: 'Gobierno y gestion de TI', accent: '#6FA8D8' },
  { id: 'COSO', nombre: 'COSO 2013', desc: 'Control interno', accent: '#9E80D8' },
  { id: 'RGSI', nombre: 'RGSI', desc: 'Regulacion financiera', accent: '#D8A437' },
] as const;

export default function MarcosCasoPage() {
  const { caso } = useCaseData();
  const coverage = useMemo(() => calculateFrameworkCoverage(caso), [caso]);

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <section className="audit-file-surface mb-6 p-6">
        <div
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Biblioteca normativa / Expediente {caso.numero}
        </div>
        <h1
          className="font-display text-3xl font-bold text-ink"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
        >
          Marcos normativos del caso
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          Cobertura COBIT, COSO y RGSI calculada desde el motor de aseguramiento del expediente. Cada criterio muestra su respaldo documental, hallazgos, respuestas y nivel de cobertura.
        </p>
      </section>

      <section className="mb-6 grid gap-3 md:grid-cols-4">
        <Metric value={coverage.summary.covered} label="Cubiertos" detail={`${coverage.summary.total} criterios del alcance`} tone="ok" />
        <Metric value={coverage.summary.partial} label="Parciales" detail="Tienen sustento, pero aun requieren refuerzo" tone="warning" />
        <Metric value={coverage.summary.weak} label="Debiles" detail="Falta evidencia, hallazgo o sustento suficiente" tone="critical" />
        <Metric value={coverage.summary.uncovered} label="Sin cubrir" detail="Sin evidencia ni conclusion asociada" tone={coverage.summary.uncovered === 0 ? 'ok' : 'warning'} />
      </section>

      <div className="space-y-6">
        {marcos.map(marco => {
          const criteriosMarco = coverage.byMarco[marco.id];
          const cubiertos = criteriosMarco.filter(item => item.status === 'cubierto').length;
          const debiles = criteriosMarco.filter(item => item.status === 'debil' || item.status === 'sin-cubrir').length;

          return (
            <section key={marco.id} className="audit-file-surface overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule p-5" style={{ borderTop: `3px solid ${marco.accent}` }}>
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-display text-xl font-bold"
                      style={{ fontFamily: 'var(--font-display)', color: marco.accent, letterSpacing: '0em' }}
                    >
                      {marco.id}
                    </span>
                    <span className="text-sm text-ink-muted">{marco.nombre}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{marco.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-5 text-right">
                  <div>
                    <div className="font-mono text-sm text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
                      {cubiertos}/{criteriosMarco.length}
                    </div>
                    <div className="text-[10px] text-ink-muted">criterios cubiertos</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
                      {debiles}
                    </div>
                    <div className="text-[10px] text-ink-muted">requieren atencion</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#0B0F15] text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                      <th className="border-b border-rule px-4 py-2.5 font-medium">Codigo</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium">Criterio</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Evid.</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Hall.</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Resp.</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Riesgo max.</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Sustento prom.</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteriosMarco.map(item => (
                      <tr key={item.criterio.id} className="border-b border-rule/50 last:border-b-0">
                        <td className="px-4 py-2.5">
                          <CriterioBadge codigo={item.criterio.codigo} marco={item.criterio.marco} size="sm" />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="text-xs text-ink-soft">{item.criterio.nombre}</div>
                          <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">{item.criterio.descripcion}</div>
                        </td>
                        <CounterCell value={item.evidencias.length} />
                        <CounterCell value={item.hallazgos.length} />
                        <CounterCell value={item.respuestas.length} />
                        <td className="px-4 py-2.5 text-center text-xs text-ink-muted">{item.maxRisk ?? 'sin riesgo'}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
                            {item.hallazgos.length > 0 ? `${item.avgSupportScore}%` : '--'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <StatusPill className={coverageClasses[item.status]} label={coverageStatusLabel(item.status)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      <div className="audit-file-surface mt-6 p-4">
        <p className="text-xs leading-relaxed text-ink-muted">
          <Link href="/marcos" className="text-signal transition-colors hover:text-ink">Ver catalogo completo de marcos normativos</Link> para explorar criterios fuera del contexto de este expediente. Para huecos, acciones sugeridas y semaforo de sustentacion, usa la vista de <Link href={`/casos/${caso.id}/aseguramiento`} className="text-signal transition-colors hover:text-ink">aseguramiento</Link>.
        </p>
      </div>
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

function CounterCell({ value }: { value: number }) {
  return (
    <td className="px-4 py-2.5 text-center">
      {value > 0 ? (
        <span className="font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
      ) : (
        <span className="text-xs text-ink-muted">--</span>
      )}
    </td>
  );
}

function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex whitespace-nowrap border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${className}`} style={{ fontFamily: 'var(--font-mono)' }}>
      {label}
    </span>
  );
}
