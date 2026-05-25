import Link from 'next/link';

interface SiteHeaderProps {
  compact?: boolean;
}

export default function SiteHeader({ compact = false }: SiteHeaderProps) {
  return (
    <header className={`border-b border-rule bg-paper ${compact ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Monograma / sello */}
          <div
            className={`
              relative border-2 border-ink flex items-center justify-center shrink-0
              transition-all group-hover:bg-ink group-hover:text-paper
              ${compact ? 'w-8 h-8' : 'w-10 h-10'}
            `}
          >
            <span
              className="font-display font-bold leading-none select-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: compact ? '11px' : '14px',
                letterSpacing: '-0.02em',
              }}
            >
              TA
            </span>
          </div>

          <div>
            <div
              className="font-display font-medium tracking-tight text-ink leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: compact ? '15px' : '18px',
                letterSpacing: '-0.03em',
              }}
            >
              True Audit
            </div>
            {!compact && (
              <div
                className="text-ink-muted mt-0.5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em' }}
              >
                SISTEMA DE AUDITORÍA DE SISTEMAS
              </div>
            )}
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/casos">Expedientes</NavLink>
          <NavLink href="/marcos">Marcos</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm text-ink-soft hover:text-ink hover:bg-paper-warm rounded transition-colors"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {children}
    </Link>
  );
}
