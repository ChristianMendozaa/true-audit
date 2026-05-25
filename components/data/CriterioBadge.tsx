import type { Marco } from '@/lib/types';

interface CriterioBadgeProps {
  codigo: string;
  marco: Marco;
  nombre?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const marcoColors: Record<Marco, { bg: string; text: string; border: string }> = {
  COBIT: { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
  COSO:  { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  RGSI:  { bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-amber-200' },
};

export default function CriterioBadge({ codigo, marco, nombre, size = 'md', className = '' }: CriterioBadgeProps) {
  const colors = marcoColors[marco];
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1';

  return (
    <span
      title={nombre}
      className={`inline-flex items-center gap-1 rounded border font-mono ${sizeClasses} ${colors.bg} ${colors.text} ${colors.border} ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className="opacity-60 text-[9px]">{marco}</span>
      <span>{codigo}</span>
    </span>
  );
}
