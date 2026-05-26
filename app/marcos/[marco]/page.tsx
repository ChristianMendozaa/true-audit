import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';
import CriterioBadge from '@/components/data/CriterioBadge';
import StatusPill from '@/components/data/StatusPill';
import SectionRule from '@/components/shell/SectionRule';
import { getCriteriosByMarco } from '@/lib/frameworks';
import { casosList } from '@/lib/mock-data';
import type { Marco } from '@/lib/types';

interface MarcoPageProps {
  params: Promise<{ marco: string }>;
}

const marcoMap: Record<string, { id: Marco; label: string; accent: string }> = {
  cobit: { id: 'COBIT', label: 'COBIT 2019', accent: '#6FA8D8' },
  coso: { id: 'COSO', label: 'COSO 2013', accent: '#9E80D8' },
  rgsi: { id: 'RGSI', label: 'RGSI', accent: '#D8A437' },
};

export async function generateMetadata({ params }: MarcoPageProps) {
  const { marco } = await params;
  const m = marcoMap[marco.toLowerCase()];
  return { title: m ? `${m.label} / Marcos / True Audit` : 'Marco / True Audit' };
}

export default async function MarcoPage({ params }: MarcoPageProps) {
  const { marco } = await params;
  const marcoKey = marco.toLowerCase();
  const marcoInfo = marcoMap[marcoKey];
  if (!marcoInfo) notFound();

  const criterios = getCriteriosByMarco(marcoInfo.id);
  const caso = casosList[0];
  const dominios = Array.from(new Set(criterios.map(c => c.dominio).filter(Boolean))) as string[];
  const linkedCount = caso.hallazgos.filter(h => h.criterios.some(c => getCriterioById(c, marcoInfo.id))).length;

  return (
    <div className="audit-shell flex min-h-dvh flex-col bg-paper">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div
          className="mb-8 flex items-center gap-2 text-xs text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <Link href="/marcos" className="transition-colors hover:text-ink">&lt;- Marcos</Link>
          <span>/</span>
          <span>{marcoInfo.id}</span>
        </div>

        <div className="audit-file-surface mb-10 p-5 sm:p-8" style={{ borderTop: `4px solid ${marcoInfo.accent}` }}>
          <div
            className="font-display mb-4 text-5xl font-black leading-none sm:text-7xl"
            style={{ fontFamily: 'var(--font-display)', color: marcoInfo.accent, letterSpacing: '0em' }}
          >
            {marcoInfo.id}
          </div>
          <div
            className="mb-5 font-mono text-sm uppercase tracking-[0.14em]"
            style={{ fontFamily: 'var(--font-mono)', color: marcoInfo.accent }}
          >
            {marcoInfo.label} / Indice normativo
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Stat value={criterios.length} label="Criterios en catalogo" accent={marcoInfo.accent} />
            <Stat value={dominios.length} label="Dominios" accent={marcoInfo.accent} />
            <Stat value={linkedCount} label="Hallazgos vinculados" accent={marcoInfo.accent} />
          </div>
        </div>

        {dominios.map((dominio, di) => {
          const dominiosCriterios = criterios.filter(c => c.dominio === dominio);
          return (
            <div key={dominio} className="mb-8">
              <SectionRule label={dominio} number={di + 1} />

              <div className="mt-4 space-y-4">
                {dominiosCriterios.map((criterio, ci) => {
                  const hallazgosVinculados = caso.hallazgos.filter(h => h.criterios.includes(criterio.id));

                  return (
                    <div
                      key={criterio.id}
                      className="audit-file-surface p-5 opacity-0 animate-fade-up transition-all hover:border-signal/45"
                      style={{ animationDelay: `${(di * 5 + ci) * 60}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                        <CriterioBadge codigo={criterio.codigo} marco={criterio.marco} className="mt-0.5 w-fit shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="mb-1 text-sm font-semibold leading-snug text-ink">{criterio.nombre}</h3>
                          <p className="text-xs leading-relaxed text-ink-muted">{criterio.descripcion}</p>

                          {hallazgosVinculados.length > 0 && (
                            <div className="mt-4 border-t border-rule pt-3">
                              <div
                                className="mb-2 text-[10px] uppercase tracking-widest text-ink-muted"
                                style={{ fontFamily: 'var(--font-mono)' }}
                              >
                                Hallazgos del expediente {caso.numero} que aplican este criterio
                              </div>
                              <div className="space-y-1.5">
                                {hallazgosVinculados.map(h => (
                                  <Link
                                    key={h.id}
                                    href={`/casos/${caso.id}/hallazgos/${h.id}`}
                                    className="group flex min-w-0 flex-wrap items-center gap-2 px-2 py-1 text-xs transition-colors hover:bg-paper-warm sm:flex-nowrap sm:gap-3"
                                  >
                                    <span
                                      className="w-14 shrink-0 font-mono text-signal"
                                      style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}
                                    >
                                      {h.numero}
                                    </span>
                                    <StatusPill status={h.severidad} size="sm" className="shrink-0" />
                                    <span className="min-w-0 flex-1 text-ink-muted transition-colors group-hover:text-ink sm:truncate">{h.titulo}</span>
                                    <span className="ml-auto shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-signal">-&gt;</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#8E998D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

function getCriterioById(id: string, marco: Marco) {
  return id.startsWith(marco) ? id : undefined;
}
