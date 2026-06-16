import type { EstadoCaso, EstadoRespuesta, Severidad } from '@/lib/types';

type StatusType = Severidad | EstadoRespuesta | EstadoCaso | 'active' | 'conforme';

interface StatusPillProps {
  status: StatusType;
  size?: 'sm' | 'md';
  className?: string;
}

const config: Record<StatusType, { label: string; classes: string; dot: string }> = {
  critico: { label: 'Riesgo alto', classes: 'border-vermilion/55 bg-vermilion/15 text-vermilion', dot: 'bg-vermilion' },
  medio: { label: 'Riesgo medio', classes: 'border-amber-signal/55 bg-amber-signal/15 text-amber-signal', dot: 'bg-amber-signal' },
  bajo: { label: 'Riesgo bajo', classes: 'border-olive/55 bg-olive/15 text-olive', dot: 'bg-olive' },
  pendiente: { label: 'Sin respuesta', classes: 'border-vermilion/45 bg-vermilion/10 text-vermilion', dot: 'bg-vermilion' },
  recibida: { label: 'Respuesta recibida', classes: 'border-marco-cobit/45 bg-marco-cobit/10 text-marco-cobit', dot: 'bg-marco-cobit' },
  aceptada: { label: 'Aceptada', classes: 'border-olive/55 bg-olive/15 text-olive', dot: 'bg-olive' },
  parcial: { label: 'Respuesta parcial', classes: 'border-amber-signal/55 bg-amber-signal/15 text-amber-signal', dot: 'bg-amber-signal' },
  rechazada: { label: 'No acepta', classes: 'border-vermilion/55 bg-vermilion/15 text-vermilion', dot: 'bg-vermilion' },
  'en-curso': { label: 'En curso', classes: 'border-amber-signal/55 bg-amber-signal/15 text-amber-signal', dot: 'bg-amber-signal' },
  cerrado: { label: 'Cerrado', classes: 'border-rule bg-rule-light text-ink-muted', dot: 'bg-ink-muted' },
  'pendiente-respuesta': { label: 'Pdte. respuesta', classes: 'border-vermilion/55 bg-vermilion/15 text-vermilion', dot: 'bg-vermilion' },
  active: { label: 'Activo', classes: 'border-olive/55 bg-olive/15 text-olive', dot: 'bg-olive' },
  conforme: { label: 'Conforme', classes: 'border-olive/55 bg-olive/15 text-olive', dot: 'bg-olive' },
};

export default function StatusPill({ status, size = 'md', className = '' }: StatusPillProps) {
  const c = config[status] ?? config.pendiente;
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-[11px] px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center border font-mono uppercase tracking-[0.1em] ${sizeClasses} ${c.classes} ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
