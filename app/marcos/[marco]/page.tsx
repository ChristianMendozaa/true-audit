import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';
import CriterioBadge from '@/components/data/CriterioBadge';
import StatusPill from '@/components/data/StatusPill';
import { getMarcoMeta, getDominiosByMarco } from '@/lib/frameworks';
import { casosList } from '@/lib/mock-data';

interface MarcoPageProps {
  params: Promise<{ marco: string }>;
}

export async function generateMetadata({ params }: MarcoPageProps) {
  const { marco } = await params;
  const meta = getMarcoMeta(marco);
  return { title: meta ? `${meta.version} / Marcos / True Audit` : 'Marco / True Audit' };
}

export default async function MarcoPage({ params }: MarcoPageProps) {
  const { marco } = await params;
  const meta = getMarcoMeta(marco);
  if (!meta) notFound();

  const dominios = getDominiosByMarco(meta.id);
  const totalCriterios = dominios.reduce((acc, d) => acc + d.criterios.length, 0);
  const caso = casosList[0];
  const linkedCount = caso.hallazgos.filter(h =>
    h.criterios.some(c => c.startsWith(meta.id)),
  ).length;

  return (
    <div className="audit-shell flex min-h-dvh flex-col bg-paper">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div
          className="mb-8 flex items-center gap-2 text-xs text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <Link href="/marcos" className="transition-colors hover:text-ink">&larr; Marcos</Link>
          <span>/</span>
          <span style={{ color: meta.accent }}>{meta.id}</span>
        </div>

        <section className="audit-file-surface mb-10 p-6 sm:p-8" style={{ borderTop: `3px solid ${meta.accent}` }}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div
                className="font-display text-5xl font-bold leading-none"
                style={{ fontFamily: 'var(--font-display)', color: meta.accent, letterSpacing: '0em' }}
              >
                {meta.id}
              </div>
              <div
                className="mt-3 label-eyebrow"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {meta.version} / Índice normativo del alcance
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{meta.descripcion}</p>
            </div>
            <div className="flex gap-8">
              <Stat value={totalCriterios} label="Criterios" accent={meta.accent} />
              <Stat value={dominios.length} label={meta.id === 'RGSI' ? 'Secciones' : 'Dominios'} accent={meta.accent} />
              <Stat value={linkedCount} label="Hallazgos" accent={meta.accent} />
            </div>
          </div>
        </section>

        <div className="space-y-10">
          {dominios.map(({ dominio, criterios }) => (
            <section key={dominio}>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-2 w-2" style={{ background: meta.accent }} />
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-ink">{dominio}</h2>
                <span className="h-px flex-1 bg-rule" />
                <span
                  className="label-eyebrow"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {criterios.length} {criterios.length === 1 ? 'criterio' : 'criterios'}
                </span>
              </div>

              <div className="space-y-3">
                {criterios.map(criterio => {
                  const hallazgosVinculados = caso.hallazgos.filter(h => h.criterios.includes(criterio.id));
                  return (
                    <article key={criterio.id} className="audit-file-surface p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                        <CriterioBadge codigo={criterio.codigo} marco={criterio.marco} className="mt-0.5 w-fit shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold leading-snug text-ink">{criterio.nombre}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{criterio.descripcion}</p>

                          {hallazgosVinculados.length > 0 && (
                            <div className="mt-4 border-t border-rule pt-3">
                              <div
                                className="mb-2 label-eyebrow"
                                style={{ fontFamily: 'var(--font-mono)' }}
                              >
                                Hallazgos que aplican este criterio
                              </div>
                              <div className="space-y-1">
                                {hallazgosVinculados.map(h => (
                                  <Link
                                    key={h.id}
                                    href={`/casos/${caso.id}/hallazgos/${h.id}`}
                                    className="group flex items-center gap-3 px-2 py-1.5 text-xs transition-colors hover:bg-paper-warm"
                                  >
                                    <span
                                      className="w-12 shrink-0 font-mono text-xs text-signal"
                                      style={{ fontFamily: 'var(--font-mono)' }}
                                    >
                                      {h.numero}
                                    </span>
                                    <StatusPill status={h.severidad} size="sm" className="shrink-0" />
                                    <span className="min-w-0 flex-1 truncate text-ink-muted transition-colors group-hover:text-ink">{h.titulo}</span>
                                    <span className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-signal">&rarr;</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div>
      <div
        className="font-display text-3xl font-bold"
        style={{ fontFamily: 'var(--font-display)', color: accent, letterSpacing: '0em' }}
      >
        {value}
      </div>
      <div className="mt-0.5 data-label" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
    </div>
  );
}
