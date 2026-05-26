import Link from 'next/link';
import AuditMark from './AuditMark';
import UserModeControl from '@/components/auth/UserModeControl';

interface SiteHeaderProps {
  compact?: boolean;
}

export default function SiteHeader({ compact = false }: SiteHeaderProps) {
  return (
    <header className={`border-b border-rule bg-[#0C1118]/95 shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur ${compact ? 'py-3' : 'py-5'}`}>
      <div className="flex w-full items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-3">
          <AuditMark compact={compact} className="transition-all group-hover:border-bone/70 group-hover:text-bone" />

          <div>
            <div
              className="font-display font-medium leading-none tracking-normal text-ink"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: compact ? '15px' : '18px',
                letterSpacing: '0em',
              }}
            >
              True Audit
            </div>
            {!compact && (
              <div
                className="mt-0.5 text-ink-muted uppercase"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em' }}
              >
                TAAC / AUDITORIA INVESTIGATIVA
              </div>
            )}
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/casos">Expedientes</NavLink>
          <NavLink href="/marcos">Marcos</NavLink>
          <UserModeControl />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="border border-transparent px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-rule hover:bg-paper-warm hover:text-ink"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {children}
    </Link>
  );
}
