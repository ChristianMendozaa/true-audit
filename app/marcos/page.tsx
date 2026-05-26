import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';
import { criteriosCobit, criteriosCoso, criteriosRgsi } from '@/lib/frameworks';
import { casosList } from '@/lib/mock-data';

export const metadata = { title: 'Marcos normativos / True Audit' };

export default function MarcosPage() {
  const caso = casosList[0];

  const marcosData = [
    {
      id: 'cobit',
      nombre: 'COBIT 2019',
      sigla: 'COBIT',
      desc: 'Marco de gobierno y gestion de TI corporativa. Evalua procesos, control, riesgos, recursos y cumplimiento.',
      criterios: criteriosCobit.length,
      dominios: ['EDM', 'APO', 'BAI', 'DSS', 'MEA'],
      accent: '#6FA8D8',
      hallazgos: caso.hallazgos.filter(h => h.criterios.some(c => c.startsWith('COBIT'))).length,
    },
    {
      id: 'coso',
      nombre: 'COSO 2013',
      sigla: 'COSO',
      desc: 'Modelo para revisar control interno: ambiente de control, riesgos, actividades de control, comunicacion y supervision.',
      criterios: criteriosCoso.length,
      dominios: ['Ambiente de Control', 'Evaluacion de Riesgos', 'Actividades de Control', 'Informacion y Comunicacion', 'Supervision'],
      accent: '#9E80D8',
      hallazgos: caso.hallazgos.filter(h => h.criterios.some(c => c.startsWith('COSO'))).length,
    },
    {
      id: 'rgsi',
      nombre: 'RGSI',
      sigla: 'RGSI',
      desc: 'Reglamento financiero para sistemas de informacion: continuidad, proveedores, respaldos, comites y auditoria interna.',
      criterios: criteriosRgsi.length,
      dominios: ['Gobierno de TI', 'Planificacion TI', 'Continuidad Operativa', 'Gestion de Proveedores', 'Auditoria Interna'],
      accent: '#D8A437',
      hallazgos: caso.hallazgos.filter(h => h.criterios.some(c => c.startsWith('RGSI'))).length,
    },
  ];

  return (
    <div className="audit-shell flex min-h-dvh flex-col bg-paper">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <div className="mb-10">
          <div
            className="mb-2 font-mono text-[10px] uppercase tracking-widest text-signal"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Biblioteca normativa
          </div>
          <h1
            className="font-display text-5xl font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
          >
            Marcos de referencia
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Indice de criterios COBIT, COSO y RGSI usados para fundamentar hallazgos de auditoria de sistemas.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {marcosData.map((marco, i) => (
            <Link
              key={marco.id}
              href={`/marcos/${marco.id}`}
              className="audit-file-surface group overflow-hidden opacity-0 animate-fade-up transition-all hover:border-signal/55"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="p-6" style={{ borderTop: `4px solid ${marco.accent}` }}>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div
                    className="font-display text-4xl font-black leading-none"
                    style={{ fontFamily: 'var(--font-display)', color: marco.accent, letterSpacing: '0em' }}
                  >
                    {marco.sigla}
                  </div>
                  <div
                    className="border px-2 py-1 font-mono text-[9px] uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-mono)', color: marco.accent, borderColor: `${marco.accent}66` }}
                  >
                    {marco.nombre}
                  </div>
                </div>
                <p className="min-h-16 text-xs leading-relaxed text-ink-muted">{marco.desc}</p>

                <div className="my-5 grid grid-cols-2 gap-3">
                  <StatBox value={marco.criterios} label="Criterios" accent={marco.accent} />
                  <StatBox value={marco.hallazgos} label="Hallazgos" accent={marco.accent} />
                </div>

                <div className="space-y-1.5">
                  {marco.dominios.map(d => (
                    <div key={d} className="flex items-center gap-2 text-xs text-ink-soft">
                      <div className="h-1.5 w-1.5 shrink-0" style={{ background: marco.accent }} />
                      {d}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-rule pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                    Explorar criterios
                  </span>
                  <span className="text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-signal">-&gt;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="audit-file-surface mt-10 p-5">
          <div
            className="mb-2 font-mono text-[10px] uppercase tracking-widest text-signal"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Nota metodologica
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">
            El catalogo incluido es un subconjunto representativo para auditorias de continuidad operativa de TI en el sector financiero.
            Cada criterio funciona como referencia documental para explicar por que un hallazgo se mantiene.
          </p>
        </div>
      </main>
    </div>
  );
}

function StatBox({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div className="border border-rule bg-[#0B0F15]/70 p-3">
      <div
        className="font-display text-2xl font-bold"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em', color: accent }}
      >
        {value}
      </div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}
