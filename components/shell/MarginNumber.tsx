interface MarginNumberProps {
  value: string | number;
  className?: string;
}

export default function MarginNumber({ value, className = '' }: MarginNumberProps) {
  return (
    <span
      className={`inline-block font-mono text-[10px] text-ink-muted tabular-nums select-none leading-none ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
      aria-hidden="true"
    >
      {String(value).padStart(3, '0')}
    </span>
  );
}
