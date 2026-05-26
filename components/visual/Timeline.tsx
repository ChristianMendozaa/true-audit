import type { EventoTimeline, TipoEvento } from '@/lib/types';

interface TimelineProps {
  eventos: EventoTimeline[];
}

type TimelineDate = {
  day: string;
  month: string;
  year: string;
  time: string;
  full: string;
};

const tipoConfig: Record<TipoEvento, { label: string; color: string; bg: string; shape: 'circle' | 'diamond' | 'square' | 'hexagon' }> = {
  'solicitud-info': { label: 'Solicitud', color: '#4A7BA7', bg: '#132234', shape: 'square' },
  'recepcion-evidencia': { label: 'Evidencia', color: '#8B6BC5', bg: '#211A34', shape: 'circle' },
  'registro-evidencia': { label: 'Registro', color: '#5CB7E8', bg: '#102536', shape: 'circle' },
  entrevista: { label: 'Entrevista', color: '#6E94B8', bg: '#152538', shape: 'hexagon' },
  'prueba-aplicada': { label: 'Prueba', color: '#65A983', bg: '#142821', shape: 'diamond' },
  'observacion-identificada': { label: 'Observación', color: '#D8A437', bg: '#2A2112', shape: 'diamond' },
  'hallazgo-emitido': { label: 'Hallazgo', color: '#E86649', bg: '#2D1714', shape: 'diamond' },
  'respuesta-banco': { label: 'Respuesta', color: '#52B77B', bg: '#12281A', shape: 'square' },
  'revision-auditor': { label: 'Revisión', color: '#E4B33A', bg: '#2A2215', shape: 'hexagon' },
  cierre: { label: 'Cierre', color: '#D7C18A', bg: '#252318', shape: 'hexagon' },
};

function parseTimelineDate(value: string, index: number): TimelineDate {
  const [datePart, explicitTime] = value.split('T');
  const [year = '2026', month = '01', day = '01'] = datePart.split('-');
  const monthIndex = Math.max(0, Number(month) - 1);
  const date = new Date(Number(year), monthIndex, Number(day), 12);
  const derivedMinutes = 8 * 60 + 30 + index * 35;
  const time =
    explicitTime?.slice(0, 5) ??
    `${String(Math.floor((derivedMinutes % (24 * 60)) / 60)).padStart(2, '0')}:${String(derivedMinutes % 60).padStart(2, '0')}`;

  return {
    day: String(Number(day)).padStart(2, '0'),
    month: date.toLocaleString('es', { month: 'short' }).replace('.', '').toUpperCase(),
    year,
    time,
    full: `${String(Number(day)).padStart(2, '0')}/${String(Number(month)).padStart(2, '0')}/${year}`,
  };
}

function NodeMark({ tipo, color }: { tipo: TipoEvento; color: string }) {
  const size = 18;
  const shape = tipoConfig[tipo].shape;

  if (shape === 'diamond') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
        <polygon points="9,1.5 16.5,9 9,16.5 1.5,9" fill={color} opacity={0.92} />
      </svg>
    );
  }

  if (shape === 'hexagon') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
        <polygon points="9,1.5 15.5,5.25 15.5,12.75 9,16.5 2.5,12.75 2.5,5.25" fill={color} opacity={0.92} />
      </svg>
    );
  }

  if (shape === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
        <rect x="3" y="3" width="12" height="12" rx="1.5" fill={color} opacity={0.92} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" fill={color} opacity={0.92} />
    </svg>
  );
}

export default function Timeline({ eventos }: TimelineProps) {
  const dates = eventos.map((evento, index) => parseTimelineDate(evento.fecha, index));
  const first = dates[0]?.full ?? 'sin eventos';
  const last = dates.at(-1)?.full ?? 'sin eventos';

  return (
    <section className="relative w-full overflow-hidden border border-rule bg-[#070B10]/80">
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-[#0C121A]/85 px-5 py-3"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(216,164,55,0.08), transparent 36%), linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: 'auto, 18px 18px',
        }}
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
            Bitácora temporal del expediente
          </div>
          <div className="mt-1 text-sm text-ink-soft">
            {eventos.length} eventos / {first} - {last}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(tipoConfig).slice(0, 5).map(([tipo, cfg]) => (
            <span
              key={tipo}
              className="border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.11em]"
              style={{
                borderColor: `${cfg.color}55`,
                background: `${cfg.color}12`,
                color: cfg.color,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {cfg.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-x-auto overflow-y-visible pb-6">
        <div
          className="relative min-w-max px-8 py-8"
          style={{
            backgroundImage:
              'linear-gradient(rgba(109,130,155,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(109,130,155,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          <div
            className="absolute left-8 right-8"
            style={{
              top: '258px',
              height: '2px',
              background: 'linear-gradient(to right, rgba(74,123,167,0), rgba(96,118,143,0.65), rgba(216,164,55,0.45), rgba(96,118,143,0.65), rgba(74,123,167,0))',
              boxShadow: '0 0 18px rgba(90,120,150,0.16)',
            }}
          />

          <div className="grid auto-cols-[292px] grid-flow-col gap-0">
            {eventos.map((evento, index) => {
              const cfg = tipoConfig[evento.tipo];
              const date = dates[index];
              const isAbove = index % 2 === 0;

              return (
                <article
                  key={evento.id}
                  className="relative grid grid-rows-[166px_38px_68px_38px_188px] justify-items-center"
                  style={{ animationDelay: `${index * 65}ms` }}
                >
                  {isAbove && (
                    <TimelineCard evento={evento} color={cfg.color} bg={cfg.bg} label={cfg.label} className="row-start-1 self-end" />
                  )}

                  <TimelineStem color={cfg.color} className="row-start-2" direction={isAbove ? 'down' : 'up'} />

                  <div className="relative row-start-3 flex flex-col items-center justify-center gap-1">
                    <DateBadge date={date} color={cfg.color} />
                    <div
                      className="relative flex h-8 w-8 items-center justify-center rounded-full border bg-[#071018]"
                      style={{ borderColor: `${cfg.color}60`, boxShadow: `0 0 18px ${cfg.color}22` }}
                    >
                      <NodeMark tipo={evento.tipo} color={cfg.color} />
                    </div>
                  </div>

                  <TimelineStem color={cfg.color} className="row-start-4" direction={isAbove ? 'up' : 'down'} />

                  {!isAbove && (
                    <TimelineCard evento={evento} color={cfg.color} bg={cfg.bg} label={cfg.label} className="row-start-5 self-start" />
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineCard({
  evento,
  color,
  bg,
  label,
  className,
}: {
  evento: EventoTimeline;
  color: string;
  bg: string;
  label: string;
  className?: string;
}) {
  const links = [
    ...(evento.evidenciasVinculadas ?? []),
    ...(evento.hallazgosVinculados ?? []),
    ...(evento.respuestasVinculadas ?? []),
  ];

  return (
    <div
      className={`w-[252px] rounded-sm border p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)] ${className ?? ''}`}
      style={{
        background: `linear-gradient(140deg, ${bg}F2, rgba(9,14,21,0.94))`,
        borderColor: `${color}55`,
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)', color }}>
          {label}
        </div>
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}66` }} />
      </div>
      <h3 className="text-sm font-semibold leading-snug text-ink">
        {evento.titulo}
      </h3>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
        {evento.descripcion || 'Sin descripción registrada.'}
      </p>
      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {links.map(link => (
            <span
              key={link}
              className="border px-1.5 py-0.5 font-mono text-[9px] uppercase"
              style={{
                borderColor: `${color}45`,
                background: 'rgba(7,11,16,0.62)',
                color,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {link}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineStem({ color, className, direction }: { color: string; className?: string; direction: 'up' | 'down' }) {
  return (
    <div
      className={`h-full w-px ${className ?? ''}`}
      style={{
        background: `linear-gradient(to ${direction === 'down' ? 'bottom' : 'top'}, ${color}22, ${color}CC)`,
      }}
    />
  );
}

function DateBadge({ date, color }: { date: TimelineDate; color: string }) {
  return (
    <div
      className="flex min-w-[70px] flex-col items-center rounded-sm border px-2 py-1.5 leading-none"
      style={{
        background: `${color}18`,
        borderColor: `${color}45`,
        boxShadow: `0 0 20px ${color}14`,
      }}
    >
      <span className="font-display text-lg font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)', color, lineHeight: 1 }}>
        {date.day}
      </span>
      <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-mono)', color: `${color}D8` }}>
        {date.month} {date.year}
      </span>
      <span className="mt-1 border-t px-1 pt-1 font-mono text-[9px] tabular-nums" style={{ borderColor: `${color}40`, color: '#E8E1D0', fontFamily: 'var(--font-mono)' }}>
        {date.time}
      </span>
    </div>
  );
}
