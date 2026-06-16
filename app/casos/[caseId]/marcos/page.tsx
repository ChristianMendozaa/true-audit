'use client';

import { Fragment, useMemo } from 'react';
import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import CriterioBadge from '@/components/data/CriterioBadge';
import { marcosMeta } from '@/lib/frameworks';
import {
  calculateFrameworkCoverage,
  coverageStatusLabel,
  type FrameworkCoverageItem,
  type FrameworkCoverageStatus,
} from '@/lib/audit-analysis';

type CoverageItem = FrameworkCoverageItem;

const coverageClasses: Record<FrameworkCoverageStatus, string> = {
  cubierto: 'border-olive/50 bg-olive/10 text-olive',
  parcial: 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal',
  debil: 'border-vermilion/45 bg-vermilion/10 text-vermilion',
  'sin-cubrir': 'border-rule bg-[#0B0F15] text-ink-muted',
};

const coverageBarColor: Record<FrameworkCoverageStatus, string> = {
  cubierto: 'var(--color-olive)',
  parcial: 'var(--color-amber-signal)',
  debil: 'var(--color-vermilion)',
  'sin-cubrir': 'var(--color-rule)',
};

export default function MarcosCasoPage() {
  const { caso } = useCaseData();
  const coverage = useMemo(() => calculateFrameworkCoverage(caso), [caso]);

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <header className="mb-6">
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
          Cobertura COBIT 4.1, COSO 2013 y RGSI calculada desde el motor de aseguramiento. Cada criterio se agrupa por su dominio o sección real del alcance.
        </p>
      </header>

      <section className="mb-6 flex flex-wrap gap-3">
        <Metric value={coverage.summary.covered} label="Cubiertos" detail={`de ${coverage.summary.total} criterios`} tone="ok" />
        <Metric value={coverage.summary.partial} label="Parciales" detail="requieren refuerzo" tone="warning" />
        <Metric value={coverage.summary.weak} label="Débiles" detail="falta sustento" tone="critical" />
        <Metric value={coverage.summary.uncovered} label="Sin cubrir" detail="sin evidencia" tone={coverage.summary.uncovered === 0 ? 'ok' : 'warning'} />
      </section>

      <div className="space-y-5">
        {marcosMeta.map(meta => {
          const items = coverage.byMarco[meta.id] ?? [];
          const cubiertos = items.filter(i => i.status === 'cubierto').length;
          const atencion = items.filter(i => i.status === 'debil' || i.status === 'sin-cubrir').length;
          const grupos = groupByDominio(items);

          return (
            <section key={meta.id} className="audit-file-surface overflow-hidden" style={{ borderTop: `3px solid ${meta.accent}` }}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule px-5 py-4">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-display text-xl font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: meta.accent, letterSpacing: '0em' }}
                  >
                    {meta.id}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                    {meta.version}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <CoverageBar items={items} accent={meta.accent} />
                  <div className="text-right">
                    <div className="font-mono text-sm text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
                      {cubiertos}/{items.length}
                    </div>
                    <div className="text-[10px] text-ink-muted">
                      cubiertos{atencion > 0 ? ` · ${atencion} en riesgo` : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#0B0F15] text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                      <th className="px-4 py-2.5 font-medium">Código</th>
                      <th className="px-4 py-2.5 font-medium">Criterio</th>
                      <th className="px-4 py-2.5 text-center font-medium">Vínculos</th>
                      <th className="px-4 py-2.5 text-center font-medium">Riesgo</th>
                      <th className="px-4 py-2.5 text-center font-medium">Sustento</th>
                      <th className="px-4 py-2.5 text-center font-medium">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupos.map(grupo => (
                      <Fragment key={grupo.dominio}>
                        <tr>
                          <td colSpan={6} className="border-y border-rule bg-paper-warm/40 px-4 py-1.5">
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-mono)', color: meta.accent }}>
                              {grupo.dominio}
                            </span>
                            <span className="ml-2 text-[10px] text-ink-muted">
                              {grupo.items.length} {grupo.items.length === 1 ? 'criterio' : 'criterios'}
                            </span>
                          </td>
                        </tr>
                        {grupo.items.map(item => (
                          <tr key={item.criterio.id} className="border-b border-rule/40 align-top last:border-b-0 hover:bg-paper-warm/30">
                            <td className="px-4 py-3">
                              <CriterioBadge codigo={item.criterio.codigo} marco={item.criterio.marco} size="sm" />
                            </td>
                            <td className="max-w-md px-4 py-3 text-xs leading-snug text-ink-soft">
                              {item.criterio.nombre}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <LinkCounts e={item.evidencias.length} h={item.hallazgos.length} r={item.respuestas.length} />
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-ink-muted">
                              {item.maxRisk ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
                                {item.hallazgos.length > 0 ? `${item.avgSupportScore}%` : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex whitespace-nowrap border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${coverageClasses[item.status]}`} style={{ fontFamily: 'var(--font-mono)' }}>
                                {coverageStatusLabel(item.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-muted">
        <Link href="/marcos" className="text-signal transition-colors hover:text-ink">Catálogo completo de marcos</Link> para explorar criterios fuera de este expediente. Para huecos y semáforo de sustentación, usa <Link href={`/casos/${caso.id}/aseguramiento`} className="text-signal transition-colors hover:text-ink">aseguramiento</Link>.
      </p>
    </div>
  );
}

function groupByDominio(items: CoverageItem[]): Array<{ dominio: string; items: CoverageItem[] }> {
  const out: Array<{ dominio: string; items: CoverageItem[] }> = [];
  for (const item of items) {
    const dominio = item.criterio.dominio?.trim() || 'Sin dominio';
    const grupo = out.find(g => g.dominio === dominio);
    if (grupo) grupo.items.push(item);
    else out.push({ dominio, items: [item] });
  }
  return out;
}

function CoverageBar({ items, accent }: { items: CoverageItem[]; accent: string }) {
  const order: FrameworkCoverageStatus[] = ['cubierto', 'parcial', 'debil', 'sin-cubrir'];
  const total = items.length || 1;
  return (
    <div className="hidden h-2 w-32 overflow-hidden rounded-sm border border-rule sm:flex" title={`${items.length} criterios`} style={{ borderColor: `${accent}40` }}>
      {order.map(status => {
        const count = items.filter(i => i.status === status).length;
        if (count === 0) return null;
        return (
          <span
            key={status}
            style={{ width: `${(count / total) * 100}%`, background: coverageBarColor[status] }}
          />
        );
      })}
    </div>
  );
}

function LinkCounts({ e, h, r }: { e: number; h: number; r: number }) {
  const parts: Array<[string, number]> = [['E', e], ['H', h], ['R', r]];
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
      {parts.map(([label, value]) => (
        <span key={label} className={value > 0 ? 'text-ink' : 'text-ink-muted/50'}>
          <span className="text-[9px] text-ink-muted">{label}</span>
          {value}
        </span>
      ))}
    </span>
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
  const borderColor = tone === 'ok' ? 'border-olive/40' : tone === 'warning' ? 'border-amber-signal/40' : 'border-vermilion/40';

  return (
    <div className={`min-w-[150px] flex-1 border ${borderColor} bg-[#101721] px-4 py-3`}>
      <div className="flex items-baseline gap-2">
        <span className={`font-display text-2xl font-bold ${valueColor}`} style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
          {value}
        </span>
        <span className="text-sm text-ink">{label}</span>
      </div>
      <div className="mt-0.5 font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{detail}</div>
    </div>
  );
}
