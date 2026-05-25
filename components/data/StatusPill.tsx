import type { Severidad, EstadoRespuesta, EstadoCaso } from '@/lib/types';

type StatusType = Severidad | EstadoRespuesta | EstadoCaso | 'active' | 'conforme';

interface StatusPillProps {
  status: StatusType;
  size?: 'sm' | 'md';
  className?: string;
}

const config: Record<StatusType, { label: string; bg: string; text: string; dot: string }> = {
  critico:             { label: 'Crítico',           bg: 'bg-vermilion-soft',  text: 'text-vermilion',      dot: 'bg-vermilion' },
  medio:               { label: 'Medio',             bg: 'bg-amber-soft',      text: 'text-amber-signal',   dot: 'bg-amber-signal' },
  bajo:                { label: 'Bajo',              bg: 'bg-olive-soft',      text: 'text-olive',          dot: 'bg-olive' },
  pendiente:           { label: 'Pendiente',         bg: 'bg-rule-light',      text: 'text-ink-muted',      dot: 'bg-ink-muted' },
  recibida:            { label: 'Recibida',          bg: 'bg-amber-soft',      text: 'text-amber-signal',   dot: 'bg-amber-signal' },
  aceptada:            { label: 'Aceptada',          bg: 'bg-olive-soft',      text: 'text-olive',          dot: 'bg-olive' },
  parcial:             { label: 'Parcial',           bg: 'bg-amber-soft',      text: 'text-amber-signal',   dot: 'bg-amber-signal' },
  'en-curso':          { label: 'En curso',          bg: 'bg-amber-soft',      text: 'text-amber-signal',   dot: 'bg-amber-signal' },
  cerrado:             { label: 'Cerrado',           bg: 'bg-rule-light',      text: 'text-ink-muted',      dot: 'bg-ink-muted' },
  'pendiente-respuesta': { label: 'Pdte. respuesta', bg: 'bg-vermilion-soft',  text: 'text-vermilion',      dot: 'bg-vermilion' },
  active:              { label: 'Activo',            bg: 'bg-olive-soft',      text: 'text-olive',          dot: 'bg-olive' },
  conforme:            { label: 'Conforme',          bg: 'bg-olive-soft',      text: 'text-olive',          dot: 'bg-olive' },
};

export default function StatusPill({ status, size = 'md', className = '' }: StatusPillProps) {
  const c = config[status] ?? config['pendiente'];
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider ${sizeClasses} ${c.bg} ${c.text} ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}
