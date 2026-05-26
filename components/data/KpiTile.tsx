interface KpiTileProps {
  value: string | number;
  label: string;
  sublabel?: string;
  accent?: 'default' | 'vermilion' | 'amber' | 'olive';
  className?: string;
  animationDelay?: number;
}

const accentMap = {
  default: { value: 'text-ink', border: 'border-rule', glow: 'rgba(216,164,55,0.05)', tag: 'EXP' },
  vermilion: { value: 'text-vermilion', border: 'border-vermilion/55', glow: 'rgba(240,106,73,0.14)', tag: 'RIESGO' },
  amber: { value: 'text-amber-signal', border: 'border-amber-signal/55', glow: 'rgba(216,164,55,0.14)', tag: 'ALERTA' },
  olive: { value: 'text-olive', border: 'border-olive/55', glow: 'rgba(120,168,90,0.12)', tag: 'OK' },
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
      className={`audit-file-surface relative overflow-hidden border ${colors.border} p-5 opacity-0 animate-fade-up ${className}`}
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.035), 0 16px 34px rgba(0,0,0,0.22), 0 0 28px ${colors.glow}`,
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div
          className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Ficha de caso
        </div>
        <div
          className={`border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] ${colors.value} ${colors.border}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {colors.tag}
        </div>
      </div>
      <div
        className={`font-display mb-2 font-bold leading-none ${colors.value}`}
        style={{ fontFamily: 'var(--font-display)', fontSize: '2.85rem', letterSpacing: '0em' }}
      >
        {value}
      </div>
      <div className="text-sm font-medium leading-snug text-ink">{label}</div>
      {sublabel && (
        <div
          className="mt-2 border-t border-rule pt-2 text-[10px] uppercase tracking-[0.05em] text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
