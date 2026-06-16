import type { Marco } from '@/lib/types';

interface CriterioBadgeProps {
  codigo: string;
  marco: Marco;
  nombre?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const marcoColors: Record<Marco, { classes: string; dot: string }> = {
  // Colores accesibles (≥4.5:1) definidos en --color-marco-* en globals.css
  COBIT: { classes: 'border-marco-cobit/45 bg-marco-cobit/10 text-marco-cobit', dot: 'bg-marco-cobit' },
  COSO:  { classes: 'border-marco-coso/45  bg-marco-coso/10  text-marco-coso',  dot: 'bg-marco-coso' },
  RGSI:  { classes: 'border-marco-rgsi/50  bg-marco-rgsi/10  text-marco-rgsi',  dot: 'bg-marco-rgsi' },
};

export default function CriterioBadge({ codigo, marco, nombre, size = 'md', className = '' }: CriterioBadgeProps) {
  const colors = marcoColors[marco];
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-[11px] px-2 py-1';

  return (
    <span
      title={nombre}
      className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-[0.08em] ${sizeClasses} ${colors.classes} ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      <span>{marco}</span>
      <span>{codigo}</span>
    </span>
  );
}
