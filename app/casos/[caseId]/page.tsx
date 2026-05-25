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
  return { title: caso ? `Expediente ${caso.numero} · True Audit` : 'Expediente · True Audit' };
}

export default async function CaseDashboard({ params }: CaseDashboardProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  if (!caso) notFound();

  const criticos = caso.hallazgos.filter(h => h.severidad === 'critico');
  const medios   = caso.hallazgos.filter(h => h.severidad === 'medio');
  const bajos    = caso.hallazgos.filter(h => h.severidad === 'bajo');
  const sinRespuesta = caso.hallazgos.filter(h => h.estadoRespuesta === 'pendiente');
  const diasTranscurridos = Math.floor(
    (new Date().getTime() - new Date(caso.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
  );

  const criteriosUsados = Array.from(
    new Set(caso.hallazgos.flatMap(h => h.criterios))
  ).map(id => getCriterioById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getCriterioById>>[];

  const cobitCount = criteriosUsados.filter(c => c.marco === 'COBIT').length;
  const cosoCount  = criteriosUsados.filter(c => c.marco === 'COSO').length;
  const rgsiCount  = criteriosUsados.filter(c => c.marco === 'RGSI').length;

  return (
    <div className="p-8 max-w-5xl">
      {/* Expediente header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="font-mono text-[10px] text-ink-muted uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Expediente {caso.numero}
          </div>
          <StatusPill status={caso.estado} size="sm" />
        </div>
        <h1
          className="font-display font-bold text-ink mb-2"
          style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '-0.04em' }}
        >
          {caso.titulo}
        </h1>
        <div className="text-ink-soft text-sm">{caso.banco} · {caso.periodo}</div>
        <div className="flex items-center gap-4 mt-3">
          {caso.auditores.map(a => (
            <div key={a.id} className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="w-4 h-4 rounded-full border border-rule flex items-center justify-center font-mono text-[8px]" style={{ fontFamily: 'var(--font-mono)' }}>
                {a.nombre.charAt(0)}
              </span>
              {a.nombre} · {a.rol}
            </div>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        <KpiTile value={caso.evidencias.length} label="Evidencias recolectadas" sublabel="documentos, entrevistas, pruebas" animationDelay={0} />
        <KpiTile value={caso.hallazgos.length}  label="Hallazgos emitidos"      sublabel={`${sinRespuesta.length} sin respuesta`} accent={sinRespuesta.length > 0 ? 'amber' : 'default'} animationDelay={80} />
        <KpiTile value={criticos.length}         label="Hallazgos críticos"      sublabel="requieren atención inmediata" accent={criticos.length > 0 ? 'vermilion' : 'olive'} animationDelay={160} />
        <KpiTile value={diasTranscurridos}       label="Días en curso"           sublabel={`desde ${caso.fechaInicio}`} animationDelay={240} />
      </div>

      <SectionRule label="Distribución de hallazgos" number={1} />

      {/* Hallazgos por severidad */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Críticos', items: criticos, color: '#C8412C', bg: 'bg-vermilion-soft' },
          { label: 'Medios',   items: medios,   color: '#B88A1C', bg: 'bg-amber-soft' },
          { label: 'Bajos',    items: bajos,    color: '#5B7034', bg: 'bg-olive-soft' },
        ].map(group => (
          <div key={group.label} className={`border border-rule p-5 ${group.bg}`}>
            <div
              className="font-display font-bold text-4xl mb-2"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.05em', color: group.color }}
            >
              {group.items.length}
            </div>
            <div className="text-sm font-medium text-ink mb-3">{group.label}</div>
            <div className="space-y-1">
              {group.items.map(h => (
                <Link
                  key={h.id}
                  href={`/casos/${caso.id}/hallazgos/${h.id}`}
                  className="flex items-center gap-2 text-xs text-ink-soft hover:text-ink transition-colors"
                >
                  <span className="font-mono" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: group.color }}>{h.numero}</span>
                  <span className="truncate">{h.titulo.slice(0, 45)}…</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionRule label="Marcos normativos aplicados" number={2} />

      {/* Frameworks breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { marco: 'COBIT' as const, count: cobitCount, desc: 'Control de TI corporativo' },
          { marco: 'COSO'  as const, count: cosoCount,  desc: 'Control interno' },
          { marco: 'RGSI'  as const, count: rgsiCount,  desc: 'Reglamento bancario' },
        ].map(item => (
          <Link
            key={item.marco}
            href={`/marcos/${item.marco.toLowerCase()}`}
            className="border border-rule p-5 hover:border-ink-muted transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <CriterioBadge codigo={item.marco} marco={item.marco} className="text-sm" />
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-rule group-hover:text-ink-muted transition-colors">
                <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div
              className="font-display text-3xl font-bold text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
            >
              {item.count}
            </div>
            <div className="text-xs text-ink-muted mt-1">{item.desc}</div>
            <div className="text-xs text-ink-soft mt-0.5">{item.count} criterio{item.count !== 1 ? 's' : ''} vinculado{item.count !== 1 ? 's' : ''}</div>
          </Link>
        ))}
      </div>

      <SectionRule label="Hallazgos sin respuesta" number={3} />

      {/* Pending responses */}
      {sinRespuesta.length === 0 ? (
        <div className="p-6 border border-olive-soft bg-olive-soft text-olive text-sm">
          Todos los hallazgos tienen respuesta del banco auditado.
        </div>
      ) : (
        <div className="space-y-2 mb-10">
          {sinRespuesta.map(h => (
            <Link
              key={h.id}
              href={`/casos/${caso.id}/hallazgos/${h.id}`}
              className="flex items-center gap-4 border border-rule p-4 hover:border-ink-muted hover:bg-paper-warm transition-all group"
            >
              <span
                className="font-mono text-xs text-ink-muted w-16 shrink-0"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {h.numero}
              </span>
              <StatusPill status={h.severidad} size="sm" className="shrink-0" />
              <span className="text-sm text-ink flex-1 truncate">{h.titulo}</span>
              <StatusPill status="pendiente" size="sm" className="shrink-0" />
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-rule group-hover:text-ink-muted transition-colors shrink-0">
                <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Link>
          ))}
        </div>
      )}

      <SectionRule label="Accesos rápidos" number={4} />

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Evidence Board', desc: 'Tablero visual de investigación', href: `/casos/${caso.id}/tablero`, dark: true },
          { label: 'Línea de tiempo', desc: 'Cronología del caso', href: `/casos/${caso.id}/timeline` },
          { label: 'Informe final', desc: 'Preview del informe imprimible', href: `/casos/${caso.id}/informe` },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`border p-5 flex flex-col gap-2 transition-all group ${link.dark ? 'border-ink bg-ink text-paper hover:bg-ink-soft' : 'border-rule hover:border-ink hover:bg-paper-warm'}`}
          >
            <span className={`text-sm font-medium ${link.dark ? 'text-paper' : 'text-ink'}`}>{link.label}</span>
            <span className={`text-xs ${link.dark ? 'text-bone-muted' : 'text-ink-muted'}`}>{link.desc}</span>
            <span className={`text-xs mt-auto ${link.dark ? 'text-bone-muted' : 'text-ink-muted'} group-hover:translate-x-1 transition-transform`}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
