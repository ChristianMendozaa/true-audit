interface KpiTileProps {
  value: string | number;
  label: string;
  sublabel?: string;
  accent?: 'default' | 'vermilion' | 'amber' | 'olive';
  className?: string;
  animationDelay?: number;
}

const accentMap = {
  default: { value: 'text-ink', border: 'border-rule' },
  vermilion: { value: 'text-vermilion', border: 'border-vermilion/55' },
  amber: { value: 'text-amber-signal', border: 'border-amber-signal/55' },
  olive: { value: 'text-olive', border: 'border-olive/55' },
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
      className={`border ${colors.border} bg-surface p-4 opacity-0 animate-fade-up ${className}`}
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      <div
        className={`font-display mb-1 font-bold leading-none ${colors.value}`}
        style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '0em' }}
      >
        {value}
      </div>
      <div className="text-sm leading-snug text-ink">{label}</div>
      {sublabel && (
        <div
          className="mt-2 border-t border-rule pt-2 data-label"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
