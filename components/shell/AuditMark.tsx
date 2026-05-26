interface AuditMarkProps {
  compact?: boolean;
  className?: string;
}

export default function AuditMark({ compact = false, className = '' }: AuditMarkProps) {
  const size = compact ? 34 : 42;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center border border-signal/55 bg-signal/10 text-signal ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={compact ? 22 : 27} height={compact ? 22 : 27} viewBox="0 0 28 28" fill="none">
        <path
          d="M7 3.5h10.5l3.5 3.5v13.5H7V3.5Z"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinejoin="round"
        />
        <path d="M17.5 3.5V7H21" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
        <path d="M10 10h6.5M10 13h5M10 16h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        <circle cx="17.5" cy="17.5" r="4.1" stroke="currentColor" strokeWidth="1.55" />
        <path d="M20.4 20.4l4.1 4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 22.8h8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.58" />
        {!compact && (
          <text
            x="4.3"
            y="26"
            fill="currentColor"
            fontSize="5"
            fontWeight="800"
            fontFamily="var(--font-mono), ui-monospace"
            letterSpacing="0.06em"
          >
            TA
          </text>
        )}
      </svg>
    </span>
  );
}
