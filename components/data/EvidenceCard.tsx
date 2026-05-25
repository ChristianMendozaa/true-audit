import type { Evidencia } from '@/lib/types';

interface EvidenceCardProps {
  evidencia: Evidencia;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

const tipoConfig = {
  'documento':       { icon: DocIcon,       label: 'Documento',        color: 'text-blue-700',    bg: 'bg-blue-50',   border: 'border-blue-200' },
  'evidencia-tecnica': { icon: TechIcon,    label: 'Evidencia técnica', color: 'text-violet-700',  bg: 'bg-violet-50', border: 'border-violet-200' },
  'entrevista':      { icon: InterviewIcon, label: 'Entrevista',       color: 'text-purple-700',  bg: 'bg-purple-50', border: 'border-purple-200' },
  'prueba':          { icon: TestIcon,      label: 'Ficha de prueba',  color: 'text-teal-700',    bg: 'bg-teal-50',   border: 'border-teal-200' },
  'contrato':        { icon: ContractIcon,  label: 'Contrato',         color: 'text-orange-700',  bg: 'bg-orange-50', border: 'border-orange-200' },
  'acta':            { icon: ActaIcon,      label: 'Acta',             color: 'text-rose-700',    bg: 'bg-rose-50',   border: 'border-rose-200' },
};

export default function EvidenceCard({ evidencia, onClick, selected = false, className = '' }: EvidenceCardProps) {
  const config = tipoConfig[evidencia.tipo];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left border p-4 transition-all
        ${selected
          ? 'border-ink bg-ink text-paper'
          : `border-rule hover:border-ink-muted bg-paper hover:bg-paper-warm ${className}`
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 p-1.5 rounded ${selected ? 'bg-white/10' : config.bg}`}>
          <Icon className={`w-4 h-4 ${selected ? 'text-paper' : config.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span
              className="font-mono text-[10px] uppercase tracking-wider opacity-60"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {evidencia.id}
            </span>
            {evidencia.formato && (
              <span
                className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0
                  ${selected ? 'bg-white/15 text-paper' : `${config.bg} ${config.color}`}
                `}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {evidencia.formato}
              </span>
            )}
          </div>
          <div className={`font-medium text-sm mt-0.5 leading-snug ${selected ? 'text-paper' : 'text-ink'}`}>
            {evidencia.titulo}
          </div>
          <div
            className={`text-xs mt-1 leading-snug line-clamp-2 ${selected ? 'text-bone' : 'text-ink-muted'}`}
          >
            {evidencia.descripcion}
          </div>
          <div
            className={`font-mono text-[10px] mt-2 ${selected ? 'text-bone' : 'text-ink-muted'}`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {evidencia.fecha} · {evidencia.fuente}
          </div>
        </div>
      </div>
    </button>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M11 1l3 3h-3V1z" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="4" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="4" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function TechIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 7l-2 1 2 1M11 7l2 1-2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="8" y1="5.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}
function InterviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function TestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M6 2v5L2 13h12L10 7V2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="5" y1="2" x2="11" y2="2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function ContractIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M5 11q3-1 6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function ActaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="11" cy="11" r="2" fill="currentColor" opacity="0.4"/>
      <path d="M10 11l.8.8L12.5 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}
