'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuditMark from './AuditMark';
import { useCaseData } from '@/components/data/CaseDataProvider';

interface CaseSidebarProps {
  caseId: string;
  caseName: string;
  caseNumber: string;
}

const navItems = [
  { label: 'Resumen', suffix: '', icon: 'ResumenIcon', code: '00' },
  { label: 'Tablero', suffix: '/tablero', icon: 'TableroIcon', code: '01' },
  { label: 'Hallazgos', suffix: '/hallazgos', icon: 'HallazgosIcon', code: '02' },
  { label: 'Evidencias', suffix: '/evidencias', icon: 'EvidenciasIcon', code: '03' },
  { label: 'Linea de tiempo', suffix: '/timeline', icon: 'TimelineIcon', code: '04' },
  { label: 'Kanban', suffix: '/kanban', icon: 'KanbanIcon', code: '06' },
  { label: 'Informe', suffix: '/informe', icon: 'InformeIcon', code: '05' },
];

export default function CaseSidebar({ caseId, caseName, caseNumber }: CaseSidebarProps) {
  const pathname = usePathname();
  const { resetDemo, isHydrated } = useCaseData();
  const base = `/casos/${caseId}`;

  return (
    <aside className="flex min-h-full w-60 shrink-0 flex-col border-r border-rule bg-[#0A0E14]">
      <div className="border-b border-rule p-4">
        <div className="mb-4 flex items-center gap-3">
          <AuditMark compact />
          <div>
            <div
              className="text-[9px] uppercase tracking-[0.18em] text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Indice de expediente
            </div>
            <div
              className="font-display text-lg font-semibold leading-tight text-ink"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
            >
              {caseNumber}
            </div>
          </div>
        </div>
        <div className="border-l border-signal/45 pl-3 text-xs leading-snug text-ink-soft">
          {caseName}
        </div>
      </div>

      <nav className="flex-1 p-2">
        {navItems.map(item => {
          const href = `${base}${item.suffix}`;
          const isActive = item.suffix === ''
            ? pathname === base
            : pathname.startsWith(href);

          return (
            <Link
              key={item.suffix}
              href={href}
              className={`
                mb-1 flex items-center gap-2.5 border px-3 py-2.5 text-sm transition-all
                ${isActive
                  ? 'audit-file-tab border-signal/45 bg-paper-warm text-ink shadow-[0_0_22px_rgba(216,164,55,0.08)]'
                  : 'border-transparent text-ink-muted hover:border-rule hover:bg-paper-warm/70 hover:text-ink-soft'
                }
              `}
            >
              <span
                className={`font-mono text-[9px] ${isActive ? 'text-signal' : 'text-ink-muted'}`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {item.code}
              </span>
              <SidebarIcon name={item.icon} active={isActive} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-rule p-4">
        <button
          type="button"
          onClick={resetDemo}
          disabled={!isHydrated}
          className="mb-3 w-full border border-signal/35 bg-signal/10 px-3 py-2 text-left text-[10px] uppercase tracking-[0.12em] text-signal transition-colors hover:border-signal disabled:opacity-50"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Restaurar demo original
        </button>
        <Link
          href="/casos"
          className="flex items-center gap-2 text-xs text-ink-muted transition-colors hover:text-ink"
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

function SidebarIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'currentColor' : 'currentColor';
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
  };

  return <span className={active ? 'text-signal' : 'text-ink-muted'}>{icons[name]}</span>;
}
