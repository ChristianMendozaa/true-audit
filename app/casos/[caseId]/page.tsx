import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCasoById } from '@/lib/mock-data';
import { getCriterioById } from '@/lib/frameworks';
import KpiTile from '@/components/data/KpiTile';
import StatusPill from '@/components/data/StatusPill';
import CriterioBadge from '@/components/data/CriterioBadge';
import SectionRule from '@/components/shell/SectionRule';

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
  const medios = caso.hallazgos.filter(h => h.severidad === 'medio');
  const bajos = caso.hallazgos.filter(h => h.severidad === 'bajo');
  const sinRespuesta = caso.hallazgos.filter(h => h.estadoRespuesta === 'pendiente');
  const diasTranscurridos = Math.floor(
    (new Date().getTime() - new Date(caso.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
  );

  const criteriosUsados = Array.from(
    new Set(caso.hallazgos.flatMap(h => h.criterios))
  ).map(id => getCriterioById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getCriterioById>>[];

  const cobitCount = criteriosUsados.filter(c => c.marco === 'COBIT').length;
  const cosoCount = criteriosUsados.filter(c => c.marco === 'COSO').length;
  const rgsiCount = criteriosUsados.filter(c => c.marco === 'RGSI').length;

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <section className="audit-file-surface relative overflow-hidden p-7">
        <div className="absolute right-8 top-6 hidden rotate-3 border border-vermilion/45 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-vermilion md:block">
          {sinRespuesta.length > 0 ? 'requiere seguimiento' : 'con respuesta'}
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="border border-signal/45 bg-signal/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-signal"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Expediente {caso.numero}
              </span>
              <StatusPill status={caso.estado} size="sm" />
            </div>
            <h1
              className="font-display max-w-3xl text-4xl font-bold leading-tight text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              {caso.titulo}
            </h1>
            <div className="mt-3 text-sm text-ink-soft">
              {caso.banco} / {caso.periodo}
            </div>
          </div>

          <div className="hidden min-w-56 border-l border-rule pl-5 lg:block">
            <DossierRow label="Inicio" value={caso.fechaInicio} />
            <DossierRow label="Estado" value={caso.estado} />
            <DossierRow label="Dias" value={`${diasTranscurridos} en curso`} />
          </div>
        </div>

        <div className="mt-7 grid gap-4 border-t border-rule pt-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div
              className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Objetivo de auditoria
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">{caso.objetivo}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {caso.auditores.map(a => (
              <div key={a.id} className="border border-rule bg-[#0B0F15]/70 p-3">
                <div
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-signal"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {a.id}
                </div>
                <div className="mt-1 text-sm font-semibold text-ink">{a.nombre}</div>
                <div className="text-xs text-ink-muted">{a.rol}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiTile value={caso.evidencias.length} label="Evidencias recolectadas" sublabel="documentos, entrevistas y pruebas" animationDelay={0} />
        <KpiTile value={caso.hallazgos.length} label="Hallazgos emitidos" sublabel={`${sinRespuesta.length} sin respuesta`} accent={sinRespuesta.length > 0 ? 'amber' : 'default'} animationDelay={80} />
        <KpiTile value={criticos.length} label="Hallazgos de riesgo alto" sublabel="requieren atencion inmediata" accent={criticos.length > 0 ? 'vermilion' : 'olive'} animationDelay={160} />
        <KpiTile value={diasTranscurridos} label="Dias en curso" sublabel={`desde ${caso.fechaInicio}`} animationDelay={240} />
      </div>

      <SectionRule label="Distribucion de hallazgos" number={1} />

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Riesgo alto', items: criticos, color: '#F06A49', stamp: 'RIESGO ALTO' },
          { label: 'Riesgo medio', items: medios, color: '#D8A437', stamp: 'RIESGO MEDIO' },
          { label: 'Riesgo bajo', items: bajos, color: '#78A85A', stamp: 'RIESGO BAJO' },
        ].map(group => (
          <div key={group.label} className="audit-file-surface p-5" style={{ borderTop: `3px solid ${group.color}` }}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div
                  className="font-display text-4xl font-bold"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em', color: group.color }}
                >
                  {group.items.length}
                </div>
                <div className="text-sm font-medium text-ink">{group.label}</div>
              </div>
              <div
                className="border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em]"
                style={{ borderColor: `${group.color}66`, color: group.color, fontFamily: 'var(--font-mono)' }}
              >
                {group.stamp}
              </div>
            </div>
            <div className="space-y-2">
              {group.items.map(h => (
                <Link
                  key={h.id}
                  href={`/casos/${caso.id}/hallazgos/${h.id}`}
                  className="block border-l border-rule pl-3 text-xs text-ink-muted transition-colors hover:border-signal hover:text-ink"
                >
                  <span className="font-mono text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{h.numero}</span>
                  <span className="ml-2">{h.titulo}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionRule label="Marcos normativos aplicados" number={2} />

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { marco: 'COBIT' as const, count: cobitCount, desc: 'Gobierno y gestion de TI' },
          { marco: 'COSO' as const, count: cosoCount, desc: 'Control interno' },
          { marco: 'RGSI' as const, count: rgsiCount, desc: 'Regulacion financiera' },
        ].map(item => (
          <Link
            key={item.marco}
            href={`/marcos/${item.marco.toLowerCase()}`}
            className="audit-file-surface group p-5 transition-all hover:border-signal/50"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <CriterioBadge codigo={item.marco} marco={item.marco} className="text-sm" />
              <span className="text-ink-muted transition-transform group-hover:translate-x-1">-&gt;</span>
            </div>
            <div
              className="font-display text-3xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              {item.count}
            </div>
            <div className="mt-1 text-xs text-ink-muted">{item.desc}</div>
          </Link>
        ))}
      </div>

      <SectionRule label="Pendientes de respuesta" number={3} />

      {sinRespuesta.length === 0 ? (
        <div className="border border-olive/45 bg-olive/10 p-5 text-sm text-olive">
          Todos los hallazgos tienen respuesta del banco auditado.
        </div>
      ) : (
        <div className="space-y-2">
          {sinRespuesta.map(h => (
            <Link
              key={h.id}
              href={`/casos/${caso.id}/hallazgos/${h.id}`}
              className="group flex items-center gap-4 border border-rule bg-[#101721] p-4 transition-all hover:border-vermilion/55 hover:bg-paper-warm"
            >
              <span className="w-16 shrink-0 font-mono text-xs text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                {h.numero}
              </span>
              <StatusPill status={h.severidad} size="sm" className="shrink-0" />
              <span className="flex-1 truncate text-sm text-ink">{h.titulo}</span>
              <StatusPill status="pendiente" size="sm" className="shrink-0" />
              <span className="text-ink-muted transition-transform group-hover:translate-x-1">-&gt;</span>
            </Link>
          ))}
        </div>
      )}

      <SectionRule label="Accesos rapidos" number={4} />

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Case board', desc: 'Mapa visual de trazabilidad', href: `/casos/${caso.id}/tablero`, accent: '#F06A49' },
          { label: 'Cronologia', desc: 'Secuencia del trabajo de campo', href: `/casos/${caso.id}/timeline`, accent: '#D8A437' },
          { label: 'Informe final', desc: 'Documento formal para auditoria', href: `/casos/${caso.id}/informe`, accent: '#6FA8D8' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="group border border-rule bg-[#101721] p-5 transition-all hover:border-signal/50 hover:bg-paper-warm"
          >
            <div className="mb-2 h-1 w-12" style={{ background: link.accent }} />
            <div className="text-sm font-semibold text-ink">{link.label}</div>
            <div className="mt-1 text-xs text-ink-muted">{link.desc}</div>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-signal transition-transform group-hover:translate-x-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Abrir -&gt;
            </div>
          </Link>
        ))}
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
