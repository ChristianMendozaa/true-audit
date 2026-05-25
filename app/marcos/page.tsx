import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';
import { criteriosCobit, criteriosCoso, criteriosRgsi } from '@/lib/frameworks';
import { casosList } from '@/lib/mock-data';

export const metadata = { title: 'Marcos normativos · True Audit' };

export default function MarcosPage() {
  const caso = casosList[0];

  const marcosData = [
    {
      id: 'cobit',
      nombre: 'COBIT 2019',
      sigla: 'COBIT',
      desc: 'Marco de gobierno y gestión de TI corporativa. Evalúa procesos de tecnología, gobierno de TI, control interno, riesgos, recursos y cumplimiento.',
      criterios: criteriosCobit.length,
      dominios: ['EDM', 'APO', 'BAI', 'DSS', 'MEA'],
      color: '#1E3A5F',
      accent: '#4A7BA7',
      hallazgos: caso.hallazgos.filter(h => h.criterios.some(c => c.startsWith('COBIT'))).length,
    },
    {
      id: 'coso',
      nombre: 'COSO 2013',
      sigla: 'COSO',
      desc: 'Modelo integral para revisar el control interno de la organización. Considera ambiente de control, evaluación de riesgos, actividades de control, información, comunicación y supervisión.',
      criterios: criteriosCoso.length,
      dominios: ['Ambiente de Control', 'Evaluación de Riesgos', 'Actividades de Control', 'Información y Comunicación', 'Supervisión'],
      color: '#261E3D',
      accent: '#6A5492',
      hallazgos: caso.hallazgos.filter(h => h.criterios.some(c => c.startsWith('COSO'))).length,
    },
    {
      id: 'rgsi',
      nombre: 'RGSI',
      sigla: 'RGSI',
      desc: 'Reglamento de Gestión de Sistemas de Información aplicable al sector financiero. Exige controles sobre planificación TI, operaciones, proveedores, auditoría interna, respaldos, comités, contratos y seguimiento.',
      criterios: criteriosRgsi.length,
      dominios: ['Gobierno de TI', 'Planificación TI', 'Continuidad Operativa', 'Gestión de Proveedores', 'Auditoría Interna'],
      color: '#1A2210',
      accent: '#5B7034',
      hallazgos: caso.hallazgos.filter(h => h.criterios.some(c => c.startsWith('RGSI'))).length,
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div
            className="font-mono text-[10px] text-ink-muted uppercase tracking-widest mb-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Catálogo de marcos normativos
          </div>
          <h1
            className="font-display font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '-0.04em' }}
          >
            Marcos de referencia
          </h1>
          <p className="text-ink-muted text-sm mt-2 max-w-2xl">
            Los marcos normativos definen los criterios contra los cuales se evalúan los controles de TI del banco auditado.
            Cada hallazgo debe estar vinculado a uno o más criterios de estos marcos.
          </p>
        </div>

        <div className="h-px bg-rule mb-10" />

        {/* Frameworks grid */}
        <div className="grid grid-cols-3 gap-6">
          {marcosData.map((marco, i) => (
            <Link
              key={marco.id}
              href={`/marcos/${marco.id}`}
              className="border border-rule overflow-hidden hover:border-ink-muted transition-all group animate-fade-up opacity-0"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Dark header with color */}
              <div
                className="p-6 flex flex-col gap-3"
                style={{ background: marco.color }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="font-display font-black text-4xl leading-none"
                    style={{ fontFamily: 'var(--font-display)', color: marco.accent, letterSpacing: '-0.05em' }}
                  >
                    {marco.sigla}
                  </div>
                  <div
                    className="font-mono text-[9px] uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-mono)', color: marco.accent + 'AA' }}
                  >
                    {marco.nombre}
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: marco.accent + 'CC' }}>
                  {marco.desc}
                </p>
              </div>

              {/* Light content */}
              <div className="p-5 bg-paper">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div
                      className="font-display font-bold text-2xl text-ink"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
                    >
                      {marco.criterios}
                    </div>
                    <div className="text-xs text-ink-muted">criterios en catálogo</div>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-display font-bold text-2xl"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em', color: marco.accent }}
                    >
                      {marco.hallazgos}
                    </div>
                    <div className="text-xs text-ink-muted">hallazgos vinculados</div>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  {marco.dominios.map(d => (
                    <div key={d} className="flex items-center gap-2 text-xs text-ink-soft">
                      <div className="w-1 h-1 rounded-full shrink-0" style={{ background: marco.accent }} />
                      {d}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-rule">
                  <span
                    className="text-xs text-ink-muted font-mono"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Explorar criterios
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className="text-rule group-hover:text-ink-muted transition-colors"
                  >
                    <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 p-5 border border-rule-light bg-paper-warm">
          <div
            className="font-mono text-[10px] text-ink-muted uppercase tracking-widest mb-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Nota metodológica
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">
            El catálogo de criterios incluido en esta herramienta es un subconjunto representativo de cada marco, seleccionado
            en función de su relevancia para auditorías de continuidad operativa de TI en el sector financiero. Para una
            aplicación completa de cada marco, se recomienda consultar la versión oficial publicada por la organización emisora.
          </p>
        </div>
      </main>
    </div>
  );
}
