import Link from 'next/link';
import type { ReactNode } from 'react';
import SiteHeader from '@/components/shell/SiteHeader';

export default function Home() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-paper">
      <SiteHeader />

      <main className="flex min-h-[calc(100dvh-88px)] flex-col">
        <section className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-12 sm:px-6 sm:py-14 lg:py-20">
          <div className="grid w-full min-w-0 grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.86fr)] lg:gap-16 xl:gap-20">
            <div className="min-w-0 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="mb-7 flex max-w-full items-center gap-3 sm:mb-10">
                <div className="h-px w-10 shrink-0 bg-ink sm:w-12" />
                <span
                  className="min-w-0 font-mono text-[11px] uppercase tracking-widest text-ink-muted sm:text-xs"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  True Audit · Sistema TAAC
                </span>
              </div>

              <h1
                className="mb-6 max-w-[11ch] font-display font-bold leading-[0.95] text-ink sm:max-w-[12ch] lg:max-w-[11ch]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.7rem, 12vw, 5rem)',
                  letterSpacing: '0em',
                }}
              >
                Auditoría de sistemas con trazabilidad total
              </h1>

              <p className="mb-8 max-w-xl text-base leading-relaxed text-ink-soft sm:mb-10 sm:text-lg">
                Conecta evidencias, hallazgos, criterios normativos y respuestas del banco en un
                tablero visual unificado. Sustenta cada hallazgo con su cadena completa de
                condición, causa, efecto y recomendación.
              </p>

              <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center sm:gap-4">
                <Link
                  href="/casos"
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft sm:px-6"
                >
                  Ver expedientes
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/marcos"
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-rule px-5 py-3 text-sm text-ink transition-colors hover:border-ink-muted sm:px-6"
                >
                  Marcos normativos
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                <span className="text-xs text-ink-muted">Marcos:</span>
                {['COBIT', 'COSO', 'RGSI'].map(m => (
                  <span
                    key={m}
                    className="border border-rule px-2 py-0.5 font-mono text-xs text-ink-muted"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="grid min-w-0 grid-cols-1 gap-3 animate-fade-up opacity-0 sm:grid-cols-2"
              style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
            >
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-rule bg-paper-warm">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-4 min-[430px]:grid-cols-3 lg:flex lg:items-center lg:gap-6">
              {stats.map(s => (
                <div key={s.label} className="min-w-0">
                  <span
                    className="font-display text-2xl font-bold text-ink"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                  >
                    {s.value}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-ink-muted">{s.label}</span>
                </div>
              ))}
            </div>
            <p
              className="max-w-xl text-xs leading-relaxed text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Auditoría asistida por computador · No genera hallazgos automáticamente
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <article
      className="min-w-0 border border-rule bg-[#0C1118]/50 p-4 animate-fade-up opacity-0 sm:p-5"
      style={{ animationDelay: `${200 + index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <div className="mb-3 text-ink">{feature.icon}</div>
      <h3
        className="mb-2 font-display text-lg font-semibold leading-tight text-ink sm:text-base"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
      >
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-muted sm:text-xs">{feature.desc}</p>
    </article>
  );
}

type Feature = {
  title: string;
  desc: string;
  icon: ReactNode;
};

const features: Feature[] = [
  {
    title: 'Tablero visual',
    desc: 'Conecta documentos, evidencias, hallazgos y criterios normativos en un grafo interactivo.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="5" y1="8" x2="5" y2="16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="19" x2="16" y2="19" stroke="currentColor" strokeWidth="1.5" />
        <line x1="19" y1="8" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Cadena de hallazgo',
    desc: 'Visualiza condición, causa, efecto, recomendación y respuesta del banco en columnas vinculadas.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3L20 12L12 21L4 12Z" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Línea de tiempo',
    desc: 'Recorre cronológicamente solicitudes, entrevistas, pruebas, observaciones y hallazgos.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="18" cy="12" r="2" fill="currentColor" />
        <line x1="6" y1="7" x2="6" y2="12" stroke="currentColor" strokeWidth="1.2" />
        <line x1="12" y1="7" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    title: 'Informe exportable',
    desc: 'Genera informe final, fichas de hallazgo y matriz COBIT para el entregable académico.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="2" width="16" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Marcos normativos',
    desc: 'Explora criterios COBIT, COSO y RGSI con hallazgos vinculados a cada criterio.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1" />
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: 'Gestor de evidencias',
    desc: 'Organiza documentos, actas, entrevistas, fichas de prueba y evidencia técnica filtrada por tipo.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="11" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="16" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const stats = [
  { value: '3', label: 'marcos normativos' },
  { value: '14+', label: 'tipos de evidencia' },
  { value: '100%', label: 'trazabilidad' },
];
