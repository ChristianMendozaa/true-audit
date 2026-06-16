import type { Hallazgo, Caso } from '@/lib/types';
import CriterioBadge from '@/components/data/CriterioBadge';
import StatusPill from '@/components/data/StatusPill';
import { getCriterioById } from '@/lib/frameworks';

interface FindingChainProps {
  hallazgo: Hallazgo;
  caso: Caso;
}

const columns = [
  { key: 'condicion',    label: 'Condición',      icon: 'C', accent: '#4A7BA7', desc: 'Lo observado' },
  { key: 'causa',        label: 'Causa',           icon: 'A', accent: '#6A5492', desc: 'Por qué ocurre' },
  { key: 'efecto',       label: 'Efecto / Riesgo', icon: 'E', accent: '#C8412C', desc: 'Impacto potencial' },
  { key: 'recomendacion',label: 'Recomendación',   icon: 'R', accent: '#5B7034', desc: 'Acción correctiva' },
  { key: 'respuestaBanco',label: 'Respuesta banco', icon: 'B', accent: '#B88A1C', desc: 'Posición del auditado' },
] as const;

export default function FindingChain({ hallazgo, caso }: FindingChainProps) {
  const criterios = hallazgo.criterios
    .map(id => getCriterioById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getCriterioById>>[];

  const evidencias = hallazgo.evidencias
    .map(id => caso.evidencias.find(e => e.id === id))
    .filter(Boolean) as NonNullable<(typeof caso.evidencias)[number]>[];

  return (
    <div className="space-y-6">
      {/* Traceability bar */}
      <div className="flex items-center gap-4 p-4 border border-rule bg-paper-warm rounded">
        <div className="flex items-center gap-2">
          <span className="label-eyebrow" style={{ fontFamily: 'var(--font-mono)' }}>
            Trazabilidad
          </span>
        </div>
        <div className="h-4 w-px bg-rule" />
        <TraceChip label={`${evidencias.length} evidencias`} color="blue" />
        <TraceArrow />
        <TraceChip label={`${criterios.length} criterios`} color="amber" />
        <TraceArrow />
        <TraceChip label={`1 hallazgo`} color="red" />
        <TraceArrow />
        <TraceChip
          label={hallazgo.estadoRespuesta === 'pendiente' ? 'Sin respuesta' : 'Respuesta recibida'}
          color={hallazgo.estadoRespuesta === 'pendiente' ? 'gray' : 'green'}
        />
        <div className="ml-auto">
          <StatusPill status={hallazgo.estadoRespuesta} size="sm" />
        </div>
      </div>

      {/* Criteria & Evidence row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-rule p-4">
          <div
            className="label-eyebrow mb-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Criterios normativos aplicables
          </div>
          <div className="space-y-2">
            {criterios.map(c => (
              <div key={c.id} className="flex items-start gap-2">
                <CriterioBadge codigo={c.codigo} marco={c.marco} className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-ink">{c.nombre}</div>
                  <div className="text-xs text-ink-muted mt-0.5 leading-snug">{c.descripcion.slice(0, 100)}…</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-rule p-4">
          <div
            className="label-eyebrow mb-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Evidencias que sustentan el hallazgo
          </div>
          <div className="space-y-1.5">
            {evidencias.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 text-xs">
                <span
                  className="label-eyebrow shrink-0 text-signal"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {ev.id}
                </span>
                <span className="text-ink-soft">{ev.titulo}</span>
                <span className="ml-auto label-eyebrow shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                  {ev.tipo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Five-column chain */}
      <div className="grid grid-cols-5 gap-0 border border-rule overflow-hidden">
        {columns.map((col, i) => {
          const text = col.key === 'respuestaBanco'
            ? (hallazgo.respuestaBanco ?? null)
            : hallazgo[col.key as keyof Hallazgo] as string;

          return (
            <div
              key={col.key}
              className={`relative p-4 ${i < 4 ? 'border-r border-rule' : ''}`}
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-mono text-[11px] font-bold shrink-0"
                  style={{ background: col.accent, fontFamily: 'var(--font-mono)' }}
                >
                  {col.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink">{col.label}</div>
                  <div
                    className="label-eyebrow"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {col.desc}
                  </div>
                </div>
              </div>

              {/* Divider with accent */}
              <div className="h-px mb-3" style={{ background: col.accent + '30' }} />

              {/* Content */}
              {text ? (
                <p className="text-xs text-ink leading-relaxed">{text}</p>
              ) : (
                <div className="text-xs text-ink-muted italic">
                  {col.key === 'respuestaBanco'
                    ? 'El banco auditado no ha proporcionado respuesta a este hallazgo al cierre del trabajo de campo.'
                    : 'Sin información'
                  }
                </div>
              )}

              {/* Arrow connector */}
              {i < 4 && (
                <div
                  className="absolute top-1/2 -right-3 z-10 -translate-y-1/2"
                  style={{ color: col.accent }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 10h10M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TraceChip({ label, color }: { label: string; color: 'blue' | 'amber' | 'red' | 'green' | 'gray' }) {
  // Paleta oscura — todos ≥ 4.5:1 sobre --color-paper
  const colors = {
    blue:  'bg-marco-cobit/10 text-marco-cobit border-marco-cobit/40',
    amber: 'bg-amber-signal/10 text-amber-signal border-amber-signal/40',
    red:   'bg-vermilion/10 text-vermilion border-vermilion/40',
    green: 'bg-olive/10 text-olive border-olive/40',
    gray:  'bg-rule-light text-ink-muted border-rule',
  };

  return (
    <span
      className={`label-eyebrow px-2 py-0.5 border font-mono ${colors[color]}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {label}
    </span>
  );
}

function TraceArrow() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-rule">
      <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
