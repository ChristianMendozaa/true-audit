import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCasoById } from '@/lib/mock-data';
import { getCriterioById } from '@/lib/frameworks';
import StatusPill from '@/components/data/StatusPill';

interface CaseDashboardProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: CaseDashboardProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Expediente ${caso.numero} / True Audit` : 'Expediente / True Audit' };
}

export default async function CaseDashboard({ params }: CaseDashboardProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  if (!caso) notFound();

  const criticos = caso.hallazgos.filter(h => h.severidad === 'critico');
  const sinRespuesta = caso.hallazgos.filter(h => h.estadoRespuesta === 'pendiente');
  const diasTranscurridos = Math.floor(
    (new Date().getTime() - new Date(caso.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
  );

  const criteriosUsados = Array.from(
    new Set(caso.hallazgos.flatMap(h => h.criterios))
  ).map(id => getCriterioById(id)).filter(Boolean);

  const coberturaTotal = criteriosUsados.length;

  // Evidencias huérfanas
  const evidenciasVinculadas = new Set(caso.hallazgos.flatMap(h => h.evidencias));
  const evidenciasHuerfanas = caso.evidencias.filter(e => !e.descartada && !evidenciasVinculadas.has(e.id));

  // Últimos eventos de la timeline
  const ultimosEventos = [...caso.timeline]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 5);

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      {/* ═══ Portada del expediente ═══ */}
      <section className="audit-file-surface p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="border border-signal/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-signal"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Expediente {caso.numero}
              </span>
              <StatusPill status={caso.estado} size="sm" />
            </div>
            <h1
              className="font-display max-w-3xl text-3xl font-bold leading-tight text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              {caso.titulo}
            </h1>
            <div className="mt-3 text-sm text-ink-soft">
              {caso.banco} / {caso.periodo}
            </div>
          </div>

          <div className="hidden min-w-48 border-l border-rule pl-5 lg:block">
            <DossierRow label="Inicio" value={caso.fechaInicio} />
            <DossierRow label="Días en curso" value={`${diasTranscurridos}`} />
            <DossierRow label="Estado" value={caso.estado} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-rule pt-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div
              className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Objetivo de auditoría
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">{caso.objetivo}</p>
          </div>
          <div>
            <div
              className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Grupo auditor
            </div>
            <div className="space-y-1.5">
              {caso.auditores.map(a => (
                <div key={a.id} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-[9px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{a.id}</span>
                  <span className="text-ink">{a.nombre}</span>
                  <span className="text-xs text-ink-muted">· {a.rol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Estado ejecutivo ═══ */}
      <div className="mt-6 grid gap-3 md:grid-cols-5">
        <StatBlock value={caso.hallazgos.length} label="Hallazgos emitidos" />
        <StatBlock value={criticos.length} label="Riesgo alto" accent={criticos.length > 0 ? 'vermilion' : undefined} />
        <StatBlock value={caso.evidencias.filter(e => !e.descartada).length} label="Evidencias" />
        <StatBlock value={coberturaTotal} label="Criterios aplicados" />
        <StatBlock value={sinRespuesta.length} label="Sin respuesta" accent={sinRespuesta.length > 0 ? 'amber' : undefined} />
      </div>

      {/* ═══ Dos columnas: pendientes + actividad ═══ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Alertas prioritarias */}
        <div className="space-y-4">
          {/* Hallazgos críticos pendientes */}
          <section className="audit-file-surface p-5">
            <div
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Hallazgos críticos pendientes ({sinRespuesta.filter(h => h.severidad === 'critico').length})
            </div>
            {sinRespuesta.filter(h => h.severidad === 'critico').length === 0 ? (
              <div className="border border-olive/30 bg-olive/5 p-3 text-xs text-olive">
                No hay hallazgos críticos pendientes de respuesta.
              </div>
            ) : (
              <div className="space-y-1">
                {sinRespuesta.filter(h => h.severidad === 'critico').map(h => (
                  <Link
                    key={h.id}
                    href={`/casos/${caso.id}/hallazgos/${h.id}`}
                    className="flex items-center gap-3 border-l-2 border-vermilion/60 pl-3 py-1.5 text-sm transition-colors hover:text-ink"
                  >
                    <span className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{h.numero}</span>
                    <span className="flex-1 truncate text-ink-muted">{h.titulo}</span>
                    <StatusPill status="pendiente" size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Otras alertas */}
          {evidenciasHuerfanas.length > 0 && (
            <section className="audit-file-surface p-5">
              <div
                className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-signal"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Evidencias sin hallazgo asociado ({evidenciasHuerfanas.length})
              </div>
              <div className="space-y-1">
                {evidenciasHuerfanas.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center gap-3 border-l border-rule pl-3 py-1 text-xs text-ink-muted">
                    <span className="font-mono text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>{e.id}</span>
                    <span className="flex-1 truncate">{e.titulo}</span>
                  </div>
                ))}
                {evidenciasHuerfanas.length > 5 && (
                  <div className="pl-3 text-xs text-ink-muted">
                    y {evidenciasHuerfanas.length - 5} más
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Pendientes de respuesta (no críticos) */}
          {sinRespuesta.filter(h => h.severidad !== 'critico').length > 0 && (
            <section className="audit-file-surface p-5">
              <div
                className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Otros hallazgos sin respuesta ({sinRespuesta.filter(h => h.severidad !== 'critico').length})
              </div>
              <div className="space-y-1">
                {sinRespuesta.filter(h => h.severidad !== 'critico').map(h => (
                  <Link
                    key={h.id}
                    href={`/casos/${caso.id}/hallazgos/${h.id}`}
                    className="flex items-center gap-3 border-l border-rule pl-3 py-1.5 text-sm transition-colors hover:border-signal hover:text-ink"
                  >
                    <span className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{h.numero}</span>
                    <span className="flex-1 truncate text-ink-muted">{h.titulo}</span>
                    <StatusPill status={h.severidad} size="sm" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Columna derecha: actividad + accesos rápidos */}
        <div className="space-y-4">
          {/* Última actividad */}
          <section className="audit-file-surface p-5">
            <div
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Última actividad
            </div>
            {ultimosEventos.length === 0 ? (
              <div className="border border-dashed border-rule p-3 text-xs text-ink-muted">
                No hay eventos registrados en la línea de tiempo.
              </div>
            ) : (
              <div className="space-y-2">
                {ultimosEventos.map(evt => (
                  <div key={evt.id} className="flex gap-3 border-l border-rule pl-3 py-1">
                    <span className="shrink-0 font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                      {evt.fecha.slice(0, 10)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-ink">{evt.titulo}</div>
                      {evt.descripcion && (
                        <div className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{evt.descripcion}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Accesos rápidos */}
          <section className="audit-file-surface p-5">
            <div
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Accesos rápidos
            </div>
            <div className="grid gap-2">
              {[
                { label: 'Tablero de trazabilidad', href: `/casos/${caso.id}/tablero` },
                { label: 'Revisar hallazgos críticos', href: `/casos/${caso.id}/hallazgos` },
                { label: 'Ver evidencias', href: `/casos/${caso.id}/evidencias` },
                { label: 'Aseguramiento del expediente', href: `/casos/${caso.id}/aseguramiento` },
                { label: 'Abrir informe final', href: `/casos/${caso.id}/informe` },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between border border-rule px-3 py-2 text-sm text-ink-muted transition-colors hover:border-signal/50 hover:text-ink"
                >
                  <span>{link.label}</span>
                  <span className="font-mono text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DossierRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <div
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
      <div className="mt-0.5 text-sm text-ink">{value}</div>
    </div>
  );
}

function StatBlock({ value, label, accent }: { value: number; label: string; accent?: 'vermilion' | 'amber' }) {
  const valueColor = accent === 'vermilion' ? 'text-vermilion' : accent === 'amber' ? 'text-amber-signal' : 'text-ink';
  const borderColor = accent === 'vermilion' ? 'border-vermilion/40' : accent === 'amber' ? 'border-amber-signal/40' : 'border-rule';

  return (
    <div className={`border ${borderColor} bg-[#101721] p-4`}>
      <div
        className={`font-display text-2xl font-bold ${valueColor}`}
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-ink-muted">{label}</div>
    </div>
  );
}
