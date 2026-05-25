import type { Caso } from '@/lib/types';
import StatusPill from '@/components/data/StatusPill';
import CriterioBadge from '@/components/data/CriterioBadge';
import { getCriterioById } from '@/lib/frameworks';

interface ReportSheetProps {
  caso: Caso;
}

export default function ReportSheet({ caso }: ReportSheetProps) {
  const criticos = caso.hallazgos.filter(h => h.severidad === 'critico');
  const medios   = caso.hallazgos.filter(h => h.severidad === 'medio');
  const bajos    = caso.hallazgos.filter(h => h.severidad === 'bajo');

  return (
    <div className="print-document font-sans" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ─── PORTADA ─── */}
      <div className="min-h-[297mm] flex flex-col border border-rule p-12 mb-8 relative overflow-hidden">
        {/* Marca de agua */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="font-display font-black text-center leading-none select-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18rem',
              color: '#D9D2C2',
              opacity: 0.12,
              letterSpacing: '-0.05em',
              transform: 'rotate(-15deg)',
            }}
          >
            TA
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-ink pb-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 border-2 border-ink flex items-center justify-center">
                <span
                  className="font-display font-black text-xl"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
                >
                  TA
                </span>
              </div>
              <div>
                <div
                  className="font-display text-2xl font-bold text-ink"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
                >
                  True Audit
                </div>
                <div
                  className="text-ink-muted text-xs uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Sistema de Auditoría de Sistemas
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className="font-mono text-xs text-ink-muted uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Expediente
              </div>
              <div
                className="font-display text-3xl font-bold text-vermilion"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
              >
                {caso.numero}
              </div>
            </div>
          </div>

          {/* Title block */}
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Informe de Auditoría · Tecnología de la Información
            </div>
            <h1
              className="font-display font-bold text-ink mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', letterSpacing: '-0.04em' }}
            >
              {caso.titulo}
            </h1>
            <div className="space-y-1.5 mb-10">
              <InfoRow label="Entidad auditada" value={caso.banco} />
              <InfoRow label="Período auditado" value={caso.periodo} />
              <InfoRow label="Inicio del trabajo" value={caso.fechaInicio} />
              <InfoRow label="Estado" value={caso.estado} />
            </div>

            {/* Team */}
            <div className="border-t border-rule pt-6">
              <div
                className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Equipo auditor
              </div>
              <div className="grid grid-cols-3 gap-4">
                {caso.auditores.map(a => (
                  <div key={a.id}>
                    <div className="text-sm font-semibold text-ink">{a.nombre}</div>
                    <div className="text-xs text-ink-muted">{a.rol}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KPI summary strip */}
          <div className="border-t-2 border-ink pt-6 mt-8">
            <div className="grid grid-cols-4 gap-0">
              {[
                { n: caso.evidencias.length,  l: 'Evidencias', a: 'text-ink' },
                { n: caso.hallazgos.length,   l: 'Hallazgos',  a: 'text-ink' },
                { n: criticos.length,         l: 'Críticos',   a: 'text-vermilion' },
                { n: caso.hallazgos.filter(h=>h.estadoRespuesta==='pendiente').length, l: 'Sin respuesta', a: 'text-amber-signal' },
              ].map((item, i) => (
                <div key={i} className={`pr-6 ${i > 0 ? 'pl-6 border-l border-rule' : ''}`}>
                  <div
                    className={`font-display font-bold ${item.a}`}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '-0.05em' }}
                  >
                    {item.n}
                  </div>
                  <div className="text-xs text-ink-muted">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN 1: OBJETIVO Y ALCANCE ─── */}
      <div className="border border-rule p-10 mb-8 print-break-before">
        <SectionHeader num="01" title="Objetivo y Alcance" />
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Objetivo</h3>
            <p className="text-sm text-ink leading-relaxed">{caso.objetivo}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Alcance</h3>
            <p className="text-sm text-ink leading-relaxed">{caso.alcance}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-rule">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Metodología</h3>
          <p className="text-sm text-ink leading-relaxed">{caso.metodologia}</p>
        </div>
      </div>

      {/* ─── SECCIÓN 2: RESUMEN EJECUTIVO ─── */}
      <div className="border border-rule p-10 mb-8">
        <SectionHeader num="02" title="Resumen Ejecutivo de Hallazgos" />
        <div className="mt-6 space-y-3">
          {caso.hallazgos.map((h, i) => (
            <div key={h.id} className="flex items-center gap-4 border-b border-rule-light pb-3">
              <span
                className="font-mono text-xs text-ink-muted w-8 shrink-0"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className="font-mono text-xs text-ink-muted w-16 shrink-0"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {h.numero}
              </span>
              <span className="text-sm text-ink flex-1">{h.titulo}</span>
              <StatusPill status={h.severidad} size="sm" />
              <StatusPill status={h.estadoRespuesta} size="sm" />
            </div>
          ))}
        </div>

        {/* Distribution */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Críticos', items: criticos, accent: 'bg-vermilion-soft border-vermilion text-vermilion' },
            { label: 'Medios',   items: medios,   accent: 'bg-amber-soft border-amber-signal text-amber-signal' },
            { label: 'Bajos',    items: bajos,    accent: 'bg-olive-soft border-olive text-olive' },
          ].map(group => (
            <div key={group.label} className={`border ${group.accent.split(' ')[1]} p-4`}>
              <div
                className={`font-display font-bold text-4xl ${group.accent.split(' ')[2]}`}
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
              >
                {group.items.length}
              </div>
              <div className="text-xs font-medium text-ink mt-1">{group.label}</div>
              {group.items.map(h => (
                <div key={h.id} className="text-xs text-ink-muted mt-1 truncate">{h.numero} · {h.titulo.slice(0, 40)}…</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECCIÓN 3: HALLAZGOS DETALLADOS ─── */}
      <div className="border border-rule p-10 mb-8 print-break-before">
        <SectionHeader num="03" title="Hallazgos Detallados" />
        <div className="mt-6 space-y-10">
          {caso.hallazgos.map(h => {
            const criterios = h.criterios.map(id => getCriterioById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getCriterioById>>[];
            return (
              <div key={h.id} className="border-l-4 pl-6" style={{ borderColor: h.severidad === 'critico' ? '#C8412C' : h.severidad === 'medio' ? '#B88A1C' : '#5B7034' }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div
                      className="font-mono text-xs text-ink-muted mb-1"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {h.numero}
                    </div>
                    <h3
                      className="font-display text-xl font-bold text-ink"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                    >
                      {h.titulo}
                    </h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <StatusPill status={h.severidad} size="sm" />
                    <StatusPill status={h.estadoRespuesta} size="sm" />
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap mb-4">
                  {criterios.map(c => (
                    <CriterioBadge key={c.id} codigo={c.codigo} marco={c.marco} size="sm" />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <FindingBlock label="Condición" text={h.condicion} />
                  <FindingBlock label="Causa" text={h.causa} />
                  <FindingBlock label="Efecto / Riesgo" text={h.efecto} />
                  <FindingBlock label="Recomendación" text={h.recomendacion} />
                </div>

                {h.respuestaBanco && (
                  <div className="mt-4 p-3 bg-olive-soft border border-olive">
                    <div
                      className="font-mono text-[10px] text-olive uppercase tracking-wider mb-1"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Respuesta del banco auditado
                    </div>
                    <p className="text-sm text-ink leading-relaxed">{h.respuestaBanco}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECCIÓN 4: CONCLUSIONES ─── */}
      <div className="border border-rule p-10 print-break-before">
        <SectionHeader num="04" title="Conclusiones" />
        <div className="mt-6 text-sm text-ink leading-relaxed space-y-4">
          <p>
            Con base en el trabajo de auditoría realizado, el equipo concluye que <strong>{caso.banco}</strong> presenta
            <strong> {criticos.length} hallazgos de severidad crítica</strong> en materia de continuidad operativa de TI,
            que requieren atención inmediata por parte de la alta gerencia.
          </p>
          <p>
            Los hallazgos críticos identificados (H-001, H-002, H-003) son sistémicos y están interrelacionados: la ausencia
            de pruebas del BCP, la falta de verificación de integridad de respaldos y la inexistencia de cláusulas
            de continuidad en contratos con proveedores cloud configuran una exposición regulatoria y operacional alta
            ante el RGSI y el marco COBIT.
          </p>
          <p>
            Se recomienda al banco implementar un plan de acción correctiva con un Comité de seguimiento mensual,
            priorizar los hallazgos críticos antes de fin de Q3 2026, y reportar el avance formalmente al equipo auditor
            en un plazo no superior a 30 días hábiles desde la emisión de este informe.
          </p>
          <p>
            Los hallazgos medios y bajos, si bien menos urgentes, representan brechas de control que de no subsanarse
            pueden derivar en hallazgos críticos en la siguiente auditoría.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t-2 border-ink">
          {caso.auditores.map(a => (
            <div key={a.id} className="text-center">
              <div className="h-12 border-b border-ink mb-2" />
              <div className="text-sm font-semibold text-ink">{a.nombre}</div>
              <div className="text-xs text-ink-muted">{a.rol}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="font-display text-5xl font-black text-rule leading-none select-none"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.05em' }}
      >
        {num}
      </span>
      <div className="h-px flex-1 bg-rule" />
      <h2
        className="font-display text-xl font-bold text-ink"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span
        className="font-mono text-ink-muted min-w-36 shrink-0"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', paddingTop: '2px' }}
      >
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function FindingBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div
        className="font-mono text-[10px] text-ink-muted uppercase tracking-wider mb-1"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
      <p className="text-ink leading-relaxed">{text}</p>
    </div>
  );
}
