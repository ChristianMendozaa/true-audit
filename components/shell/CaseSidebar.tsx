'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CaseSidebarProps {
  caseId: string;
  caseName: string;
  caseNumber: string;
}

const navItems = [
  { label: 'Resumen',      suffix: '',              icon: 'ResumenIcon' },
  { label: 'Tablero',      suffix: '/tablero',      icon: 'TableroIcon' },
  { label: 'Hallazgos',    suffix: '/hallazgos',    icon: 'HallazgosIcon' },
  { label: 'Evidencias',   suffix: '/evidencias',   icon: 'EvidenciasIcon' },
  { label: 'Línea de tiempo', suffix: '/timeline',  icon: 'TimelineIcon' },
  { label: 'Informe',      suffix: '/informe',      icon: 'InformeIcon' },
];

export default function CaseSidebar({ caseId, caseName, caseNumber }: CaseSidebarProps) {
  const pathname = usePathname();
  const base = `/casos/${caseId}`;

  return (
    <aside className="w-56 shrink-0 border-r border-rule bg-paper min-h-full flex flex-col">
      {/* Case header */}
      <div className="p-4 border-b border-rule">
        <div
          className="text-[10px] text-ink-muted uppercase tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Expediente
        </div>
        <div
          className="font-display text-lg font-semibold text-ink leading-tight"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          {caseNumber}
        </div>
        <div className="text-xs text-ink-soft mt-0.5 leading-snug">{caseName}</div>
      </div>

      {/* Nav */}
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
                flex items-center gap-2.5 px-3 py-2 rounded text-sm mb-0.5 transition-colors
                ${isActive
                  ? 'bg-ink text-paper font-medium'
                  : 'text-ink-soft hover:text-ink hover:bg-paper-warm'
                }
              `}
            >
              <SidebarIcon name={item.icon} active={isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-rule">
        <Link
          href="/casos"
          className="flex items-center gap-2 text-xs text-ink-muted hover:text-ink transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
        <rect x="1" y="1" width="12" height="12" rx="1" stroke={color} strokeWidth="1.2"/>
        <line x1="4" y1="5" x2="10" y2="5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="4" y1="7.5" x2="10" y2="7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="4" y1="10" x2="7" y2="10" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    TableroIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="4" cy="4" r="2" stroke={color} strokeWidth="1.2"/>
        <circle cx="10" cy="4" r="2" stroke={color} strokeWidth="1.2"/>
        <circle cx="4" cy="10" r="2" stroke={color} strokeWidth="1.2"/>
        <circle cx="10" cy="10" r="2" stroke={color} strokeWidth="1.2"/>
        <line x1="6" y1="4" x2="8" y2="4" stroke={color} strokeWidth="1.2"/>
        <line x1="4" y1="6" x2="4" y2="8" stroke={color} strokeWidth="1.2"/>
        <line x1="6" y1="10" x2="8" y2="10" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    HallazgosIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L13 7L7 13L1 7Z" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    EvidenciasIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="1" width="8" height="11" rx="1" stroke={color} strokeWidth="1.2"/>
        <path d="M10 1h1a1 1 0 0 1 1 1v11l-2-1.5" stroke={color} strokeWidth="1.2"/>
        <line x1="4" y1="5" x2="8" y2="5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="4" y1="7.5" x2="8" y2="7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    TimelineIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <line x1="2" y1="7" x2="12" y2="7" stroke={color} strokeWidth="1.2"/>
        <circle cx="4" cy="7" r="1.5" fill={color}/>
        <circle cx="7" cy="7" r="1.5" fill={color}/>
        <circle cx="11" cy="7" r="1.5" fill={color}/>
        <line x1="4" y1="4" x2="4" y2="7" stroke={color} strokeWidth="1"/>
        <line x1="7" y1="4" x2="7" y2="7" stroke={color} strokeWidth="1"/>
      </svg>
    ),
    InformeIcon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="1" width="10" height="12" rx="1" stroke={color} strokeWidth="1.2"/>
        <line x1="4" y1="4" x2="10" y2="4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="4" y1="6.5" x2="10" y2="6.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="4" y1="9" x2="7" y2="9" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  };

  return <span className="opacity-70">{icons[name]}</span>;
}
