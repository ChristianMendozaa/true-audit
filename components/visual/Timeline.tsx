import type { EventoTimeline, TipoEvento } from '@/lib/types';

interface TimelineProps {
  eventos: EventoTimeline[];
}

const tipoConfig: Record<TipoEvento, { label: string; color: string; bg: string; shape: 'circle' | 'diamond' | 'square' | 'hexagon' }> = {
  'solicitud-info':     { label: 'Solicitud',   color: '#4A7BA7', bg: '#1E2F4A', shape: 'square' },
  'recepcion-evidencia':{ label: 'Evidencia',   color: '#6A5492', bg: '#261E3D', shape: 'circle' },
  'entrevista':         { label: 'Entrevista',  color: '#5B7FA0', bg: '#1A2A3D', shape: 'hexagon' },
  'prueba-aplicada':    { label: 'Prueba',      color: '#4A7B6A', bg: '#182A26', shape: 'diamond' },
  'hallazgo-emitido':   { label: 'Hallazgo',   color: '#E0593F', bg: '#2E1818', shape: 'diamond' },
  'respuesta-banco':    { label: 'Respuesta',  color: '#3A8B5A', bg: '#122418', shape: 'square' },
  'cierre':             { label: 'Cierre',     color: '#E4B33A', bg: '#2A2215', shape: 'hexagon' },
};

function formatDate(str: string): { day: string; month: string } {
  const d = new Date(str + 'T12:00:00');
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('es', { month: 'short' }).toUpperCase(),
  };
}

function NodeMark({ tipo, color }: { tipo: TipoEvento; color: string }) {
  const size = 16;
  const shape = tipoConfig[tipo].shape;
  if (shape === 'diamond') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16">
        <polygon points="8,1 15,8 8,15 1,8" fill={color} opacity={0.85}/>
      </svg>
    );
  }
  if (shape === 'hexagon') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16">
        <polygon points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5" fill={color} opacity={0.85}/>
      </svg>
    );
  }
  if (shape === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16">
        <rect x="2" y="2" width="12" height="12" rx="1" fill={color} opacity={0.85}/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill={color} opacity={0.85}/>
    </svg>
  );
}

export default function Timeline({ eventos }: TimelineProps) {
  return (
    <div className="relative w-full overflow-x-auto pb-4">
      {/* Timeline rail */}
      <div className="relative min-w-max">
        {/* Axis line */}
        <div
          className="absolute left-0 right-0"
          style={{ top: '72px', height: '2px', background: 'linear-gradient(to right, #2A3140, #3A4455, #2A3140)' }}
        />

        {/* Events */}
        <div className="flex gap-0 items-start px-6">
          {eventos.map((evento, i) => {
            const cfg = tipoConfig[evento.tipo];
            const date = formatDate(evento.fecha);
            const isAbove = i % 2 === 0;

            return (
              <div
                key={evento.id}
                className="relative flex flex-col items-center"
                style={{
                  width: '220px',
                  paddingTop: isAbove ? 0 : '100px',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* Card (above) */}
                {isAbove && (
                  <div
                    className="mb-2 w-48 border rounded animate-fade-up opacity-0"
                    style={{
                      background: cfg.bg,
                      borderColor: cfg.color + '40',
                      animationDelay: `${i * 80}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <div
                      className="px-3 pt-2 pb-1.5"
                    >
                      <div
                        className="text-[10px] uppercase tracking-widest mb-1"
                        style={{ fontFamily: 'var(--font-mono)', color: cfg.color }}
                      >
                        {cfg.label}
                      </div>
                      <div
                        className="text-xs font-medium leading-snug"
                        style={{ color: '#E8E1D0' }}
                      >
                        {evento.titulo}
                      </div>
                    </div>
                    <div
                      className="px-3 pb-2 text-[10px] leading-snug line-clamp-3"
                      style={{ color: '#6A7890' }}
                    >
                      {evento.descripcion}
                    </div>
                    {evento.evidenciasVinculadas && evento.evidenciasVinculadas.length > 0 && (
                      <div className="px-3 pb-2 flex flex-wrap gap-1">
                        {evento.evidenciasVinculadas.map(eid => (
                          <span
                            key={eid}
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{ fontFamily: 'var(--font-mono)', background: '#1E2430', color: '#6A9AC0' }}
                          >
                            {eid}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Connector stem */}
                <div
                  style={{
                    width: '1px',
                    height: '24px',
                    background: `linear-gradient(to ${isAbove ? 'bottom' : 'top'}, ${cfg.color}80, ${cfg.color})`,
                    marginBottom: isAbove ? 0 : 0,
                    marginTop: isAbove ? 0 : 0,
                  }}
                />

                {/* Date badge + mark — on the axis */}
                <div className="flex flex-col items-center gap-1" style={{ marginTop: isAbove ? '4px' : '-4px' }}>
                  {isAbove && (
                    <DateBadge day={date.day} month={date.month} color={cfg.color} />
                  )}
                  <NodeMark tipo={evento.tipo} color={cfg.color} />
                  {!isAbove && (
                    <DateBadge day={date.day} month={date.month} color={cfg.color} />
                  )}
                </div>

                {/* Connector stem (below axis for below cards) */}
                {!isAbove && (
                  <div
                    style={{
                      width: '1px',
                      height: '24px',
                      background: `linear-gradient(to bottom, ${cfg.color}, ${cfg.color}80)`,
                    }}
                  />
                )}

                {/* Card (below) */}
                {!isAbove && (
                  <div
                    className="mt-2 w-48 border rounded animate-fade-up opacity-0"
                    style={{
                      background: cfg.bg,
                      borderColor: cfg.color + '40',
                      animationDelay: `${i * 80}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <div className="px-3 pt-2 pb-1.5">
                      <div
                        className="text-[10px] uppercase tracking-widest mb-1"
                        style={{ fontFamily: 'var(--font-mono)', color: cfg.color }}
                      >
                        {cfg.label}
                      </div>
                      <div className="text-xs font-medium leading-snug" style={{ color: '#E8E1D0' }}>
                        {evento.titulo}
                      </div>
                    </div>
                    <div className="px-3 pb-2 text-[10px] leading-snug line-clamp-3" style={{ color: '#6A7890' }}>
                      {evento.descripcion}
                    </div>
                    {evento.hallazgosVinculados && evento.hallazgosVinculados.length > 0 && (
                      <div className="px-3 pb-2 flex flex-wrap gap-1">
                        {evento.hallazgosVinculados.map(hid => (
                          <span
                            key={hid}
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{ fontFamily: 'var(--font-mono)', background: '#2E1818', color: '#E0593F' }}
                          >
                            {hid}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DateBadge({ day, month, color }: { day: string; month: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center leading-none"
      style={{
        background: color + '18',
        border: `1px solid ${color}40`,
        borderRadius: '3px',
        padding: '3px 6px',
        minWidth: '36px',
      }}
    >
      <span
        className="font-display font-bold"
        style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color, lineHeight: 1 }}
      >
        {day}
      </span>
      <span
        style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: color + 'CC', letterSpacing: '0.08em' }}
      >
        {month}
      </span>
    </div>
  );
}
