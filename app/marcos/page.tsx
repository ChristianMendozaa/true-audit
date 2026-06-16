import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';
import {
  marcosMeta,
  getCriteriosByMarco,
  getDominiosByMarco,
} from '@/lib/frameworks';
import { casosList } from '@/lib/mock-data';

export const metadata = { title: 'Marcos normativos / True Audit' };

export default function MarcosPage() {
  const caso = casosList[0];

  const marcosData = marcosMeta.map(meta => {
    const criterios = getCriteriosByMarco(meta.id);
    const dominios = getDominiosByMarco(meta.id);
    const hallazgos = caso.hallazgos.filter(h =>
      h.criterios.some(c => c.startsWith(meta.id)),
    ).length;
    return { meta, criterios, dominios, hallazgos };
  });

  return (
    <div className="audit-shell flex min-h-dvh flex-col bg-paper">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <header className="mb-10 max-w-2xl">
          <div
            className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-signal"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Biblioteca normativa
          </div>
          <h1
            className="font-display text-4xl font-bold text-ink sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
          >
            Marcos de referencia
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Criterios COBIT 4.1, COSO 2013 y RGSI que sustentan los hallazgos del expediente. Cada dominio listado proviene del catálogo real del alcance, no de la estructura completa del estándar.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          {marcosData.map(({ meta, criterios, dominios, hallazgos }) => (
            <Link
              key={meta.slug}
              href={`/marcos/${meta.slug}`}
              className="audit-file-surface group flex flex-col transition-colors hover:border-signal/55"
              style={{ borderTop: `3px solid ${meta.accent}` }}
            >
              <div className="flex items-baseline justify-between gap-3 px-5 pt-5">
                <span
                  className="font-display text-3xl font-bold leading-none"
                  style={{ fontFamily: 'var(--font-display)', color: meta.accent, letterSpacing: '0em' }}
                >
                  {meta.sigla}
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {meta.version}
                </span>
              </div>

              <p className="px-5 pt-3 text-xs leading-relaxed text-ink-muted">
                {meta.descripcion}
              </p>

              <div className="mt-4 flex divide-x divide-rule border-y border-rule">
                <Stat value={criterios.length} label="Criterios" />
                <Stat value={dominios.length} label={meta.id === 'RGSI' ? 'Secciones' : 'Dominios'} />
                <Stat value={hallazgos} label="Hallazgos" />
              </div>

              <ul className="flex-1 space-y-2.5 px-5 py-4">
                {dominios.map(d => {
                  const codigos = d.criterios
                    .filter(c => c.codigo !== d.dominio)
                    .map(c => c.codigo);
                  const detalle = codigos.length
                    ? codigos.join(' · ')
                    : d.criterios.map(c => c.nombre).join(' · ');
                  return (
                    <li key={d.dominio} className="flex gap-2.5">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0"
                        style={{ background: meta.accent }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs text-ink-soft">{d.dominio}</div>
                        <div className="truncate text-[11px] text-ink-muted">{detalle}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between border-t border-rule px-5 py-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Explorar criterios
                </span>
                <span className="text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-signal">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink-muted">
          El catálogo es un subconjunto representativo para auditorías de control interno de TI en el sector financiero. Cada criterio funciona como referencia documental para explicar por qué un hallazgo se mantiene.
        </p>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 px-5 py-3 text-center">
      <div
        className="font-display text-xl font-bold text-ink"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
      >
        {value}
      </div>
      <div
        className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
    </div>
  );
}
