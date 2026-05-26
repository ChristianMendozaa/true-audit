import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-20 flex items-center">
          <div className="grid grid-cols-2 gap-20 items-center w-full">
            {/* Left: headline */}
            <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              {/* Sello */}
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px w-12 bg-ink" />
                <span
                  className="font-mono text-xs text-ink-muted uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  True Audit · Sistema TAAC
                </span>
              </div>

              <h1
                className="font-display font-bold text-ink mb-6 leading-[0.95]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(3rem, 6vw, 5rem)',
                  letterSpacing: '0em',
                }}
              >
                Auditoría de sistemas con trazabilidad total
              </h1>

              <p className="text-ink-soft text-lg leading-relaxed mb-10 max-w-lg">
                Conecta evidencias, hallazgos, criterios normativos y respuestas del banco en un
                tablero visual unificado. Sustenta cada hallazgo con su cadena completa de
                condición→causa→efecto→recomendación.
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href="/casos"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-paper text-sm font-medium hover:bg-ink-soft transition-colors"
                >
                  Ver expedientes
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/marcos"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-rule text-ink text-sm hover:border-ink-muted transition-colors"
                >
                  Marcos normativos
                </Link>
              </div>

              {/* Framework badges */}
              <div className="flex items-center gap-3 mt-10">
                <span className="text-xs text-ink-muted">Marcos:</span>
                {['COBIT', 'COSO', 'RGSI'].map(m => (
                  <span
                    key={m}
                    className="px-2 py-0.5 border border-rule text-ink-muted font-mono text-xs"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: feature cards */}
            <div
              className="grid grid-cols-2 gap-3 animate-fade-up opacity-0"
              style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
            >
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="border border-rule p-5 animate-fade-up opacity-0"
                  style={{ animationDelay: `${200 + i * 60}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="mb-3">{f.icon}</div>
                  <h3
                    className="font-display text-base font-semibold text-ink mb-1"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-rule bg-paper-warm">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {stats.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className="font-display font-bold text-2xl text-ink"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                  >
                    {s.value}
                  </span>
                  <span className="text-xs text-ink-muted">{s.label}</span>
                </div>
              ))}
            </div>
            <p
              className="text-xs text-ink-muted font-mono"
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

const features = [
  {
    title: 'Tablero visual',
    desc: 'Conecta documentos, evidencias, hallazgos y criterios normativos en un grafo interactivo arrastrando nodos.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink">
        <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="19" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="5" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="19" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="8" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="5" y1="8" x2="5" y2="16" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="8" y1="19" x2="16" y2="19" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="19" y1="8" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Cadena de hallazgo',
    desc: 'Visualiza condición → causa → efecto → recomendación → respuesta del banco en cinco columnas vinculadas.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink">
        <path d="M12 3L20 12L12 21L4 12Z" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Línea de tiempo',
    desc: 'Recorre cronológicamente cada hito del trabajo de campo: solicitudes, entrevistas, pruebas y hallazgos.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink">
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="6" cy="12" r="2" fill="currentColor"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <circle cx="18" cy="12" r="2" fill="currentColor"/>
        <line x1="6" y1="7" x2="6" y2="12" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="12" y1="7" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    title: 'Informe exportable',
    desc: 'Preview del informe final en formato editorial imprimible con portada, hallazgos, criterios y firmas.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink">
        <rect x="4" y="2" width="16" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Marcos normativos',
    desc: 'Explora el catálogo de criterios COBIT, COSO y RGSI con los hallazgos vinculados a cada criterio.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    title: 'Gestor de evidencias',
    desc: 'Organiza documentos, actas, entrevistas, fichas de prueba y evidencias técnicas filtradas por tipo.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink">
        <rect x="3" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="13" y="3" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="13" y="11" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3" y="16" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

const stats = [
  { value: '3',    label: 'marcos normativos' },
  { value: '14+',  label: 'tipos de evidencia' },
  { value: '100%', label: 'trazabilidad' },
];
