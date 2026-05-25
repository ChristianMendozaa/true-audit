import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';
import StatusPill from '@/components/data/StatusPill';
import { casosList } from '@/lib/mock-data';

export const metadata = { title: 'Expedientes · True Audit' };

export default function CasosPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {/* Page header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div
              className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Expedientes de auditoría
            </div>
            <h1
              className="font-display font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '-0.04em' }}
            >
              Casos activos
            </h1>
          </div>
          <div
            className="font-mono text-xs text-ink-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {casosList.length} expediente{casosList.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="h-px bg-rule mb-10" />

        {/* Cases grid */}
        <div className="grid grid-cols-1 gap-4">
          {casosList.map((caso, i) => {
            const criticos = caso.hallazgos.filter(h => h.severidad === 'critico').length;
            const sinRespuesta = caso.hallazgos.filter(h => h.estadoRespuesta === 'pendiente').length;
            const diasTranscurridos = Math.floor(
              (new Date().getTime() - new Date(caso.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="block border border-rule hover:border-ink bg-paper hover:bg-paper-warm transition-all group animate-fade-up opacity-0"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="p-6 flex items-start gap-8">
                  {/* Left: number */}
                  <div className="shrink-0">
                    <div
                      className="font-mono text-[10px] text-ink-muted uppercase tracking-widest mb-1"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Expediente
                    </div>
                    <div
                      className="font-display font-bold text-ink group-hover:text-vermilion transition-colors"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '-0.04em' }}
                    >
                      {caso.numero}
                    </div>
                  </div>

                  <div className="h-12 w-px bg-rule self-center shrink-0" />

                  {/* Center: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-1">
                      <h2
                        className="font-display text-xl font-bold text-ink group-hover:text-ink-soft transition-colors leading-tight"
                        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                      >
                        {caso.titulo}
                      </h2>
                      <StatusPill status={caso.estado} size="sm" className="mt-0.5 shrink-0" />
                    </div>
                    <div className="text-sm text-ink-soft mb-3">{caso.banco} · {caso.periodo}</div>
                    <div className="flex items-center gap-4">
                      {caso.auditores.map(a => (
                        <span key={a.id} className="text-xs text-ink-muted">{a.nombre}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right: KPIs */}
                  <div className="shrink-0 grid grid-cols-3 gap-4 text-right">
                    <KpiMini value={caso.evidencias.length} label="Evidencias" />
                    <KpiMini value={caso.hallazgos.length} label="Hallazgos" />
                    <KpiMini value={criticos} label="Críticos" accent={criticos > 0} />
                    <KpiMini value={diasTranscurridos} label="Días" />
                    <KpiMini value={sinRespuesta} label="Sin resp." accent={sinRespuesta > 0} />
                    <div className="flex items-center justify-end">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-rule group-hover:text-ink-muted transition-colors">
                        <path d="M7 10h8M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Progress bar: responses */}
                <div className="border-t border-rule-light">
                  <div className="flex items-center gap-3 px-6 py-2.5">
                    <span
                      className="font-mono text-[10px] text-ink-muted shrink-0"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Respuestas recibidas
                    </span>
                    <div className="flex-1 h-1 bg-rule-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-olive rounded-full transition-all"
                        style={{
                          width: `${(caso.hallazgos.filter(h => h.estadoRespuesta !== 'pendiente').length / caso.hallazgos.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-[10px] text-ink-muted shrink-0"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {caso.hallazgos.filter(h => h.estadoRespuesta !== 'pendiente').length}/{caso.hallazgos.length}
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
        className={`font-display font-bold text-xl leading-none ${accent ? 'text-vermilion' : 'text-ink'}`}
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
      >
        {value}
      </div>
      <div
        className="text-ink-muted mt-0.5"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.04em', textTransform: 'uppercase' }}
      >
        {label}
      </div>
    </div>
  );
}
