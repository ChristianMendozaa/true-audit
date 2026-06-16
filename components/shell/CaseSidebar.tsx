'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCaseData } from '@/components/data/CaseDataProvider';
import { useAuth } from '@/components/auth/AuthProvider';

interface CaseSidebarProps {
  caseId: string;
  caseName: string;
  caseNumber: string;
}

const navItems: Array<{
  label: string;
  suffix: string;
  icon: string;
  code: string;
}> = [
  { label: 'Resumen', suffix: '', icon: 'ResumenIcon', code: '00' },
  { label: 'Tablero', suffix: '/tablero', icon: 'TableroIcon', code: '01' },
  { label: 'Hallazgos', suffix: '/hallazgos', icon: 'HallazgosIcon', code: '02' },
  { label: 'Evidencias', suffix: '/evidencias', icon: 'EvidenciasIcon', code: '03' },
  { label: 'Línea de tiempo', suffix: '/timeline', icon: 'TimelineIcon', code: '04' },
  { label: 'Aseguramiento', suffix: '/aseguramiento', icon: 'AseguramientoIcon', code: '05' },
  { label: 'Marcos normativos', suffix: '/marcos', icon: 'MarcosIcon', code: '06' },
  { label: 'Informe', suffix: '/informe', icon: 'InformeIcon', code: '07' },
];

const adminItems: Array<{
  label: string;
  suffix: string;
  icon: string;
  code: string;
}> = [
  { label: 'Usuarios y roles', suffix: '/usuarios', icon: 'UsersIcon', code: '—' },
  { label: 'Movimientos', suffix: '/movimientos', icon: 'MovementsIcon', code: '—' },
];

export default function CaseSidebar({ caseId, caseName, caseNumber }: CaseSidebarProps) {
  const pathname = usePathname();
  const { resetDemo, isHydrated } = useCaseData();
  const { canManageMembers } = useAuth();
  const base = `/casos/${caseId}`;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-rule bg-[#0A0E14] md:h-full md:min-h-0 md:w-60 md:border-b-0 md:border-r">
      <div className="border-b border-rule p-3 md:p-4">
        <div className="flex items-center gap-3 md:mb-4">
          <div className="min-w-0">
            <div
              className="label-eyebrow"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Índice de expediente
            </div>
            <div
              className="truncate font-display text-lg font-semibold leading-tight text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              {caseNumber}
            </div>
          </div>
        </div>
        <div className="mt-3 truncate border-l border-signal/45 pl-3 text-xs leading-snug text-ink-soft md:mt-0">
          {caseName}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-2 md:block md:flex-1 md:overflow-x-visible md:overflow-y-auto">
        {navItems.map(item => {
          const href = `${base}${item.suffix}`;
          const isActive = item.suffix === ''
            ? pathname === base
            : pathname.startsWith(href);

          return (
            <SidebarLink
              key={item.suffix}
              href={href}
              isActive={isActive}
              code={item.code}
              icon={item.icon}
              label={item.label}
            />
          );
        })}

        {canManageMembers && (
          <>
            <div className="my-2 hidden border-t border-rule/60 md:block" />
            <div
              className="hidden px-3 py-1.5 label-eyebrow md:block"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Administración
            </div>
            {adminItems.map(item => {
              const href = `${base}${item.suffix}`;
              const isActive = pathname.startsWith(href);
              return (
                <SidebarLink
                  key={item.suffix}
                  href={href}
                  isActive={isActive}
                  code={item.code}
                  icon={item.icon}
                  label={item.label}
                />
              );
            })}
          </>
        )}
      </nav>

      <div className="flex items-center gap-3 border-t border-rule p-3 md:block md:p-4">
        <button
          type="button"
          onClick={resetDemo}
          disabled={!isHydrated}
          className="min-h-9 flex-1 border border-signal/35 bg-signal/10 px-3 py-2 text-left label-eyebrow text-signal transition-colors hover:border-signal disabled:opacity-50 md:mb-3 md:w-full"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Restaurar demo original
        </button>
        <Link
          href="/casos"
          className="flex shrink-0 items-center gap-2 text-xs text-ink-muted transition-colors hover:text-ink"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Todos los expedientes
        </Link>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  isActive,
  code,
  icon,
  label,
}: {
  href: string;
  isActive: boolean;
  code: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`
        flex shrink-0 items-center gap-2.5 border px-3 py-2.5 text-sm transition-all md:mb-0.5
        ${isActive
          ? 'audit-file-tab border-rule-strong bg-paper-warm text-ink'
          : 'border-transparent text-ink-soft hover:border-rule hover:bg-paper-warm/70 hover:text-ink'
        }
      `}
    >
      <span
        className={`font-mono text-[11px] tracking-[0.06em] tabular-nums ${isActive ? 'text-signal' : 'text-ink-muted'}`}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {code}
      </span>
      <SidebarIcon name={icon} active={isActive} />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}

function SidebarIcon({ name, active }: { name: string; active: boolean }) {
  const color = 'currentColor';
  const icons: Record<string, React.ReactNode> = {
    ResumenIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="12" height="12" rx="1" stroke={color} strokeWidth="1.2" />
        <line x1="4" y1="5" x2="10" y2="5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="4" y1="7.5" x2="10" y2="7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="4" y1="10" x2="7" y2="10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    TableroIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="4" cy="4" r="2" stroke={color} strokeWidth="1.2" />
        <circle cx="10" cy="4" r="2" stroke={color} strokeWidth="1.2" />
        <circle cx="4" cy="10" r="2" stroke={color} strokeWidth="1.2" />
        <circle cx="10" cy="10" r="2" stroke={color} strokeWidth="1.2" />
        <line x1="6" y1="4" x2="8" y2="4" stroke={color} strokeWidth="1.2" />
        <line x1="4" y1="6" x2="4" y2="8" stroke={color} strokeWidth="1.2" />
        <line x1="6" y1="10" x2="8" y2="10" stroke={color} strokeWidth="1.2" />
      </svg>
    ),
    HallazgosIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L13 7L7 13L1 7Z" stroke={color} strokeWidth="1.2" />
        <path d="M7 4.2v3.6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7" cy="10" r="0.7" fill={color} />
      </svg>
    ),
    EvidenciasIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="1" width="8" height="11" rx="1" stroke={color} strokeWidth="1.2" />
        <path d="M10 1h1a1 1 0 0 1 1 1v11l-2-1.5" stroke={color} strokeWidth="1.2" />
        <line x1="4" y1="5" x2="8" y2="5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="4" y1="7.5" x2="8" y2="7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    TimelineIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <line x1="2" y1="7" x2="12" y2="7" stroke={color} strokeWidth="1.2" />
        <circle cx="4" cy="7" r="1.5" fill={color} />
        <circle cx="7" cy="7" r="1.5" fill={color} />
        <circle cx="11" cy="7" r="1.5" fill={color} />
        <line x1="4" y1="4" x2="4" y2="7" stroke={color} strokeWidth="1" />
        <line x1="7" y1="4" x2="7" y2="7" stroke={color} strokeWidth="1" />
      </svg>
    ),
    AseguramientoIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L12 3.5V7c0 2.5-2 4.5-5 6-3-1.5-5-3.5-5-6V3.5L7 1z" stroke={color} strokeWidth="1.2" />
        <path d="M5 7l1.5 1.5L9.5 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    MarcosIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.2" />
        <line x1="7" y1="1.5" x2="7" y2="12.5" stroke={color} strokeWidth="0.8" />
        <line x1="1.5" y1="7" x2="12.5" y2="7" stroke={color} strokeWidth="0.8" />
      </svg>
    ),
    InformeIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="1" width="10" height="12" rx="1" stroke={color} strokeWidth="1.2" />
        <line x1="4" y1="4" x2="10" y2="4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="4" y1="6.5" x2="10" y2="6.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="4" y1="9" x2="7" y2="9" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    KanbanIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="2" width="3" height="10" rx="0.8" stroke={color} strokeWidth="1.2" />
        <rect x="5.5" y="2" width="3" height="10" rx="0.8" stroke={color} strokeWidth="1.2" />
        <rect x="9.5" y="2" width="3" height="10" rx="0.8" stroke={color} strokeWidth="1.2" />
        <line x1="2.4" y1="4.5" x2="3.6" y2="4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6.4" y1="7" x2="7.6" y2="7" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="10.4" y1="5.6" x2="11.6" y2="5.6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    UsersIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="5" cy="4.2" r="2.1" stroke={color} strokeWidth="1.2" />
        <path d="M1.7 12c.5-2.2 1.7-3.3 3.3-3.3s2.8 1.1 3.3 3.3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M10.5 4.7v3.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8.6 6.6h3.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    MovementsIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 3h7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M2 7h10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M2 11h6.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="11.2" cy="3" r="1.1" stroke={color} strokeWidth="1.2" />
        <circle cx="9.9" cy="11" r="1.1" stroke={color} strokeWidth="1.2" />
      </svg>
    ),
  };

  return <span className={active ? 'text-signal' : 'text-ink-muted'}>{icons[name]}</span>;
}
