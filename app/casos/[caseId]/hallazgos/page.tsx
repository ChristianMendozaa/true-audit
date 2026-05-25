import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCasoById } from '@/lib/mock-data';
import { getCriterioById } from '@/lib/frameworks';
import StatusPill from '@/components/data/StatusPill';
import CriterioBadge from '@/components/data/CriterioBadge';
import SectionRule from '@/components/shell/SectionRule';

interface HallazgosPageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: HallazgosPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Hallazgos · ${caso.numero} · True Audit` : 'Hallazgos · True Audit' };
}

const severidadOrder = { critico: 0, medio: 1, bajo: 2 };

export default async function HallazgosPage({ params }: HallazgosPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  if (!caso) notFound();

  const sorted = [...caso.hallazgos].sort((a, b) => severidadOrder[a.severidad] - severidadOrder[b.severidad]);

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div
          className="font-mono text-[10px] text-ink-muted uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Expediente {caso.numero}
        </div>
        <h1
          className="font-display font-bold text-ink"
          style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '-0.04em' }}
        >
          Hallazgos de auditoría
        </h1>
        <p className="text-ink-muted text-sm mt-2">
          {caso.hallazgos.length} hallazgos identificados · {caso.hallazgos.filter(h => h.estadoRespuesta === 'pendiente').length} sin respuesta del banco
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-8">
        {[
          { label: 'Críticos', count: sorted.filter(h => h.severidad === 'critico').length, status: 'critico' as const },
          { label: 'Medios',   count: sorted.filter(h => h.severidad === 'medio').length,   status: 'medio' as const },
          { label: 'Bajos',    count: sorted.filter(h => h.severidad === 'bajo').length,    status: 'bajo' as const },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="font-display text-3xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
            >
              {item.count}
            </span>
            <StatusPill status={item.status} size="sm" />
          </div>
        ))}
      </div>

      <SectionRule />

      {/* Findings list */}
      <div className="space-y-3 mt-6">
        {sorted.map((hallazgo, i) => {
          const criterios = hallazgo.criterios
            .map(id => getCriterioById(id))
            .filter(Boolean) as NonNullable<ReturnType<typeof getCriterioById>>[];

          const borderColor = hallazgo.severidad === 'critico' ? '#C8412C'
            : hallazgo.severidad === 'medio' ? '#B88A1C'
            : '#5B7034';

          return (
            <Link
              key={hallazgo.id}
              href={`/casos/${caso.id}/hallazgos/${hallazgo.id}`}
              className="block border border-rule hover:border-ink-muted transition-all group animate-fade-up opacity-0"
              style={{
                animationDelay: `${i * 60}ms`,
                animationFillMode: 'forwards',
                borderLeft: `3px solid ${borderColor}`,
              }}
            >
              <div className="p-5 flex items-start gap-5">
                {/* Number */}
                <div className="shrink-0 w-16">
                  <div
                    className="font-mono text-[10px] text-ink-muted"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {hallazgo.numero}
                  </div>
                  <div
                    className="font-mono text-[10px] text-ink-muted mt-0.5"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {hallazgo.fechaEmision}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h2
                      className="font-display text-base font-semibold text-ink leading-snug group-hover:text-ink-soft transition-colors"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
                    >
                      {hallazgo.titulo}
                    </h2>
                    <StatusPill status={hallazgo.severidad} size="sm" className="shrink-0 mt-0.5" />
                    <StatusPill status={hallazgo.estadoRespuesta} size="sm" className="shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2 mb-3">
                    {hallazgo.condicion}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {criterios.map(c => (
                      <CriterioBadge key={c.id} codigo={c.codigo} marco={c.marco} size="sm" />
                    ))}
                    <span
                      className="text-[10px] text-ink-muted font-mono ml-1"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {hallazgo.evidencias.length} evidencia{hallazgo.evidencias.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="shrink-0 self-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-rule group-hover:text-ink-muted transition-colors">
                    <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              {/* Evidence count bar */}
              <div className="px-5 pb-3 flex items-center gap-2">
                <div className="flex-1 h-0.5 bg-rule-light rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: borderColor,
                      width: `${(hallazgo.evidencias.length / Math.max(...caso.hallazgos.map(h => h.evidencias.length))) * 100}%`,
                      opacity: 0.5,
                    }}
                  />
                </div>
                <span
                  className="text-[9px] text-ink-muted font-mono shrink-0"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {hallazgo.evidencias.length} EVD
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
