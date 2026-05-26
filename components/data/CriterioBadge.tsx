import type { Marco } from '@/lib/types';

interface CriterioBadgeProps {
  codigo: string;
  marco: Marco;
  nombre?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const marcoColors: Record<Marco, { classes: string; dot: string }> = {
  COBIT: { classes: 'border-node-doc/45 bg-node-doc/10 text-node-doc', dot: 'bg-node-doc' },
  COSO: { classes: 'border-node-interview/45 bg-node-interview/10 text-node-interview', dot: 'bg-node-interview' },
  RGSI: { classes: 'border-signal/50 bg-signal/10 text-signal', dot: 'bg-signal' },
};

export default function CriterioBadge({ codigo, marco, nombre, size = 'md', className = '' }: CriterioBadgeProps) {
  const colors = marcoColors[marco];
  const sizeClasses = size === 'sm'
    ? 'text-[9px] px-1.5 py-0.5'
    : 'text-[10px] px-2 py-1';

  return (
    <span
      title={nombre}
      className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-[0.08em] ${sizeClasses} ${colors.classes} ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      <span className="opacity-70">{marco}</span>
      <span>{codigo}</span>
    </span>
  );
}
