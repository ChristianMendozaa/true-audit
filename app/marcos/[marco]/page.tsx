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

const marcoMap: Record<string, { id: Marco; label: string; color: string; accent: string }> = {
  cobit: { id: 'COBIT', label: 'COBIT 2019', color: '#1E3A5F', accent: '#4A7BA7' },
  coso:  { id: 'COSO',  label: 'COSO 2013',  color: '#261E3D', accent: '#6A5492' },
  rgsi:  { id: 'RGSI',  label: 'RGSI',        color: '#1A2210', accent: '#5B7034' },
};

export async function generateMetadata({ params }: MarcoPageProps) {
  const { marco } = await params;
  const m = marcoMap[marco.toLowerCase()];
  return { title: m ? `${m.label} · Marcos · True Audit` : 'Marco · True Audit' };
}

export default async function MarcoPage({ params }: MarcoPageProps) {
  const { marco } = await params;
  const marcoKey = marco.toLowerCase();
  const marcoInfo = marcoMap[marcoKey];
  if (!marcoInfo) notFound();

  const criterios = getCriteriosByMarco(marcoInfo.id);
  const caso = casosList[0];

  const dominios = Array.from(new Set(criterios.map(c => c.dominio).filter(Boolean))) as string[];

  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <SiteHeader />

      <main className="max-w-7xl mx-auto w-full px-6 py-12">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-xs text-ink-muted mb-8"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <Link href="/marcos" className="hover:text-ink transition-colors">← Marcos</Link>
          <span>/</span>
          <span>{marcoInfo.id}</span>
        </div>

        {/* Header */}
        <div
          className="p-8 mb-10 rounded-sm"
          style={{ background: marcoInfo.color }}
        >
          <div
            className="font-display font-black leading-none mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: marcoInfo.accent, letterSpacing: '-0.06em' }}
          >
            {marcoInfo.id}
          </div>
          <div
            className="font-mono text-sm mb-2"
            style={{ fontFamily: 'var(--font-mono)', color: marcoInfo.accent + 'CC' }}
          >
            {marcoInfo.label}
          </div>
          <div className="flex items-center gap-6 mt-4">
            <Stat value={criterios.length} label="Criterios en catálogo" accent={marcoInfo.accent} />
            <Stat value={dominios.length} label="Dominios" accent={marcoInfo.accent} />
            <Stat
              value={caso.hallazgos.filter(h => h.criterios.some(c => getCriterioById(c, marcoInfo.id))).length}
              label="Hallazgos vinculados"
              accent={marcoInfo.accent}
            />
          </div>
        </div>

        {/* Criteria by domain */}
        {dominios.map((dominio, di) => {
          const dominiosCriterios = criterios.filter(c => c.dominio === dominio);
          return (
            <div key={dominio} className="mb-8">
              <SectionRule label={dominio} number={di + 1} />

              <div className="space-y-4 mt-4">
                {dominiosCriterios.map((criterio, ci) => {
                  const hallazgosVinculados = caso.hallazgos.filter(h => h.criterios.includes(criterio.id));

                  return (
                    <div
                      key={criterio.id}
                      className="border border-rule p-5 hover:border-ink-muted transition-all animate-fade-up opacity-0"
                      style={{ animationDelay: `${(di * 5 + ci) * 60}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="flex items-start gap-4">
                        <CriterioBadge codigo={criterio.codigo} marco={criterio.marco} className="shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-ink mb-1 leading-snug">{criterio.nombre}</h3>
                          <p className="text-xs text-ink-muted leading-relaxed">{criterio.descripcion}</p>

                          {hallazgosVinculados.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-rule-light">
                              <div
                                className="text-[10px] text-ink-muted uppercase tracking-widest mb-2"
                                style={{ fontFamily: 'var(--font-mono)' }}
                              >
                                Hallazgos del expediente {caso.numero} que aplican este criterio
                              </div>
                              <div className="space-y-1.5">
                                {hallazgosVinculados.map(h => (
                                  <Link
                                    key={h.id}
                                    href={`/casos/${caso.id}/hallazgos/${h.id}`}
                                    className="flex items-center gap-3 text-xs group hover:bg-paper-warm -mx-2 px-2 py-1 rounded transition-colors"
                                  >
                                    <span
                                      className="font-mono shrink-0 w-14"
                                      style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#9B9388' }}
                                    >
                                      {h.numero}
                                    </span>
                                    <StatusPill status={h.severidad} size="sm" className="shrink-0" />
                                    <span className="text-ink-soft group-hover:text-ink transition-colors truncate">{h.titulo}</span>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-rule group-hover:text-ink-muted transition-colors ml-auto shrink-0">
                                      <path d="M3 6h6M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
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
        className="font-display font-bold text-3xl"
        style={{ fontFamily: 'var(--font-display)', color: accent, letterSpacing: '-0.04em' }}
      >
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: accent + '88', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

function getCriterioById(id: string, marco: Marco) {
  return id.startsWith(marco) ? id : undefined;
}
