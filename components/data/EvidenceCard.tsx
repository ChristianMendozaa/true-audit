import type { Evidencia, TipoEvidencia } from '@/lib/types';

interface EvidenceCardProps {
  evidencia: Evidencia;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

const tipoConfig: Record<TipoEvidencia, { icon: typeof DocIcon; label: string; color: string; bg: string }> = {
  documento: { icon: DocIcon, label: 'Documento', color: '#6FA8D8', bg: 'rgba(111,168,216,0.11)' },
  politica: { icon: DocIcon, label: 'Politica', color: '#6FA8D8', bg: 'rgba(111,168,216,0.11)' },
  procedimiento: { icon: DocIcon, label: 'Procedimiento', color: '#6FA8D8', bg: 'rgba(111,168,216,0.11)' },
  inventario: { icon: TechIcon, label: 'Inventario', color: '#5CB7E8', bg: 'rgba(92,183,232,0.11)' },
  'evidencia-tecnica': { icon: TechIcon, label: 'Evidencia tecnica', color: '#5CB7E8', bg: 'rgba(92,183,232,0.11)' },
  'registro-sistema': { icon: TechIcon, label: 'Registro de sistema', color: '#5CB7E8', bg: 'rgba(92,183,232,0.11)' },
  captura: { icon: TechIcon, label: 'Captura', color: '#5CB7E8', bg: 'rgba(92,183,232,0.11)' },
  fotografia: { icon: TechIcon, label: 'Fotografia', color: '#5CB7E8', bg: 'rgba(92,183,232,0.11)' },
  entrevista: { icon: InterviewIcon, label: 'Entrevista', color: '#9E80D8', bg: 'rgba(158,128,216,0.11)' },
  prueba: { icon: TestIcon, label: 'Ficha de prueba', color: '#74C7A6', bg: 'rgba(116,199,166,0.11)' },
  'ficha-prueba': { icon: TestIcon, label: 'Ficha de prueba', color: '#74C7A6', bg: 'rgba(116,199,166,0.11)' },
  checklist: { icon: TestIcon, label: 'Checklist', color: '#74C7A6', bg: 'rgba(116,199,166,0.11)' },
  contrato: { icon: ContractIcon, label: 'Contrato', color: '#D8A437', bg: 'rgba(216,164,55,0.11)' },
  acta: { icon: ActaIcon, label: 'Acta', color: '#F06A49', bg: 'rgba(240,106,73,0.11)' },
  'respuesta-auditado': { icon: ActaIcon, label: 'Respuesta auditado', color: '#70C9AC', bg: 'rgba(112,201,172,0.11)' },
};

export default function EvidenceCard({ evidencia, onClick, selected = false, className = '' }: EvidenceCardProps) {
  const config = tipoConfig[evidencia.tipo];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        w-full border p-4 text-left transition-all
        ${selected
          ? 'border-signal bg-paper-warm text-ink shadow-[0_0_24px_rgba(216,164,55,0.12)]'
          : `border-rule-strong bg-surface hover:border-ink-muted hover:bg-paper-warm ${className}`
        }
      `}
      style={{ borderLeftColor: config.color, borderLeftWidth: '3px' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 shrink-0 border p-1.5"
          style={{ color: config.color, background: config.bg, borderColor: `${config.color}66` }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span
              className="label-eyebrow"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {evidencia.id}
            </span>
            {evidencia.formato && (
              <span
                className="shrink-0 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: config.color,
                  borderColor: `${config.color}66`,
                  background: config.bg,
                }}
              >
                {evidencia.formato}
              </span>
            )}
            {evidencia.archivoAdjunto && (
              <span
                className="shrink-0 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: '#74C7A6',
                  borderColor: 'rgba(116,199,166,0.45)',
                  background: 'rgba(116,199,166,0.1)',
                }}
              >
                Adjunto
              </span>
            )}
          </div>
          <div className="mt-1 text-sm font-medium leading-snug text-ink">
            {evidencia.titulo}
          </div>
          <div className="mt-1 line-clamp-2 text-xs leading-snug text-ink-muted">
            {evidencia.descripcion}
          </div>
          <div
            className="mt-3 border-t border-rule pt-2 font-mono text-xs text-ink-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {evidencia.fecha} / {evidencia.fuente}
          </div>
        </div>
      </div>
    </button>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 1l3 3h-3V1z" stroke="currentColor" strokeWidth="1.3" />
      <line x1="4" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="4" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TechIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7l-2 1 2 1M11 7l2 1-2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="5.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function InterviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M6 2v5L2 13h12L10 7V2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <line x1="5" y1="2" x2="11" y2="2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5 11q3-1 6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ActaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11" cy="11" r="2" fill="currentColor" opacity="0.4" />
      <path d="M10 11l.8.8L12.5 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
