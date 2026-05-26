interface SectionRuleProps {
  label?: string;
  number?: string | number;
  className?: string;
}

export default function SectionRule({ label, number, className = '' }: SectionRuleProps) {
  return (
    <div className={`flex items-center gap-4 my-6 ${className}`}>
      {number !== undefined && (
        <span
          className="font-mono text-xs text-signal shrink-0 w-8 text-right select-none"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {String(number).padStart(2, '0')}
        </span>
      )}
      <div className="h-px flex-1 bg-gradient-to-r from-rule via-signal/25 to-rule" />
      {label && (
        <>
          <span
            className="text-xs uppercase tracking-widest text-ink-muted font-mono shrink-0 px-1"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {label}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-rule via-signal/25 to-rule" />
        </>
      )}
    </div>
  );
}
