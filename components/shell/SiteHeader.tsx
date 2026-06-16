'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuditMark from './AuditMark';
import UserModeControl from '@/components/auth/UserModeControl';

interface SiteHeaderProps {
  compact?: boolean;
}

export default function SiteHeader({ compact = false }: SiteHeaderProps) {
  return (
    <header className={`border-b border-rule bg-[#0C1118]/95 shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur ${compact ? 'py-3' : 'py-4 sm:py-5'}`}>
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <AuditMark compact={compact} className="transition-all group-hover:border-bone/70 group-hover:text-bone" />

          <div className="min-w-0">
            <div
              className="truncate font-display font-medium leading-none tracking-normal text-ink"
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
                className="mt-0.5 label-eyebrow"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                TAAC / AUDITORIA INVESTIGATIVA
              </div>
            )}
          </div>
        </Link>

        <nav className="flex min-w-0 flex-wrap items-center justify-end gap-1">
          <NavLink href="/casos">Expedientes</NavLink>
          <NavLink href="/marcos">Marcos</NavLink>
          <UserModeControl />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`border px-3 py-1.5 text-sm transition-colors hover:bg-paper-warm hover:text-ink
        ${isActive
          ? 'border-rule-strong bg-paper-warm text-ink'
          : 'border-transparent text-ink-soft hover:border-rule'
        }`}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {children}
    </Link>
  );
}
