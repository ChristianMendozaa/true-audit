interface KpiTileProps {
  value: string | number;
  label: string;
  sublabel?: string;
  accent?: 'default' | 'vermilion' | 'amber' | 'olive';
  className?: string;
  animationDelay?: number;
}

const accentMap = {
  default:  { value: 'text-ink',       border: 'border-rule',        bg: 'bg-paper' },
  vermilion:{ value: 'text-vermilion',  border: 'border-vermilion',   bg: 'bg-vermilion-soft' },
  amber:    { value: 'text-amber-signal', border: 'border-amber-signal', bg: 'bg-amber-soft' },
  olive:    { value: 'text-olive',      border: 'border-olive',       bg: 'bg-olive-soft' },
};

export default function KpiTile({
  value,
  label,
  sublabel,
  accent = 'default',
  className = '',
  animationDelay = 0,
}: KpiTileProps) {
  const colors = accentMap[accent];

  return (
    <div
      className={`border ${colors.border} ${colors.bg} p-5 animate-fade-up opacity-0 ${className}`}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      <div
        className={`font-display font-bold leading-none mb-2 ${colors.value}`}
        style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', letterSpacing: '-0.04em' }}
      >
        {value}
      </div>
      <div
        className="text-ink text-sm font-medium leading-snug"
      >
        {label}
      </div>
      {sublabel && (
        <div
          className="text-ink-muted mt-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.05em' }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
