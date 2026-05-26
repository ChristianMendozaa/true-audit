import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';
import StatusPill from '@/components/data/StatusPill';
import { casosList } from '@/lib/mock-data';

export const metadata = { title: 'Expedientes / True Audit' };

export default function CasosPage() {
  return (
    <div className="audit-shell flex min-h-dvh flex-col bg-paper">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div
              className="mb-2 font-mono text-xs uppercase tracking-widest text-signal"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Archivo maestro
            </div>
            <h1
              className="font-display text-5xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              Expedientes de auditoria
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Casos de auditoria de sistemas organizados como expedientes: evidencias, hallazgos, criterios y respuestas conectadas.
            </p>
          </div>
          <div
            className="border border-rule bg-paper-warm px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {casosList.length} expediente{casosList.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="space-y-4">
          {casosList.map((caso, i) => {
            const criticos = caso.hallazgos.filter(h => h.severidad === 'critico').length;
            const sinRespuesta = caso.hallazgos.filter(h => h.estadoRespuesta === 'pendiente').length;
            const diasTranscurridos = Math.floor(
              (new Date().getTime() - new Date(caso.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
            );
            const respondidos = caso.hallazgos.filter(h => h.estadoRespuesta !== 'pendiente').length;

            return (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="audit-file-surface group block overflow-hidden opacity-0 animate-fade-up transition-all hover:border-signal/55"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start gap-8 p-6">
                  <div className="w-40 shrink-0">
                    <div
                      className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Expediente
                    </div>
                    <div
                      className="font-display text-4xl font-bold text-signal transition-colors group-hover:text-ink"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                    >
                      {caso.numero}
                    </div>
                  </div>

                  <div className="h-16 w-px shrink-0 bg-rule" />

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start gap-3">
                      <h2
                        className="font-display text-xl font-bold leading-tight text-ink transition-colors group-hover:text-signal"
                        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
                      >
                        {caso.titulo}
                      </h2>
                      <StatusPill status={caso.estado} size="sm" className="mt-0.5 shrink-0" />
                    </div>
                    <div className="mb-3 text-sm text-ink-soft">{caso.banco} / {caso.periodo}</div>
                    <div className="flex flex-wrap items-center gap-3">
                      {caso.auditores.map(a => (
                        <span key={a.id} className="border border-rule bg-[#0B0F15]/70 px-2 py-1 text-xs text-ink-muted">
                          {a.nombre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-3 gap-4 text-right">
                    <KpiMini value={caso.evidencias.length} label="Evidencias" />
                    <KpiMini value={caso.hallazgos.length} label="Hallazgos" />
                    <KpiMini value={criticos} label="Riesgo alto" accent={criticos > 0} />
                    <KpiMini value={diasTranscurridos} label="Dias" />
                    <KpiMini value={sinRespuesta} label="Sin resp." accent={sinRespuesta > 0} />
                    <div className="flex items-center justify-end text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-signal">
                      -&gt;
                    </div>
                  </div>
                </div>

                <div className="border-t border-rule bg-[#0B0F15]/45">
                  <div className="flex items-center gap-3 px-6 py-3">
                    <span
                      className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Respuestas recibidas
                    </span>
                    <div className="h-1 flex-1 overflow-hidden bg-rule-light">
                      <div
                        className="h-full bg-olive transition-all"
                        style={{ width: `${(respondidos / caso.hallazgos.length) * 100}%` }}
                      />
                    </div>
                    <span
                      className="shrink-0 font-mono text-[10px] text-ink-muted"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {respondidos}/{caso.hallazgos.length}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function KpiMini({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div>
      <div
        className={`font-display text-xl font-bold leading-none ${accent ? 'text-vermilion' : 'text-ink'}`}
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-ink-muted"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.04em', textTransform: 'uppercase' }}
      >
        {label}
      </div>
    </div>
  );
}
