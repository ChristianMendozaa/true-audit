import type { FiguraNodo, Severidad, TipoNodo } from '@/lib/types';

interface NodeShapeProps {
  tipo: TipoNodo;
  titulo: string;
  subtitulo?: string;
  code?: string;
  selected: boolean;
  related?: boolean;
  width?: number;
  height?: number;
  severidad?: Severidad;
  shape?: FiguraNodo;
}

const tipoConfig: Record<TipoNodo, {
  label: string;
  mark: string;
  fill: string;
  paper: string;
  stroke: string;
  textColor: string;
  accent: string;
  ribbon: string;
}> = {
  documento: {
    label: 'Documento',
    mark: 'DOC',
    fill: '#111A29',
    paper: '#1B2A40',
    stroke: '#5C88B4',
    textColor: '#C7DDF0',
    accent: '#6FA8D8',
    ribbon: 'ARCHIVO',
  },
  evidencia: {
    label: 'Evidencia',
    mark: 'EVD',
    fill: '#101B2A',
    paper: '#15273D',
    stroke: '#4E95C7',
    textColor: '#BFE4F7',
    accent: '#5CB7E8',
    ribbon: 'REVISADA',
  },
  entrevista: {
    label: 'Entrevista',
    mark: 'ENT',
    fill: '#1A1530',
    paper: '#241D3E',
    stroke: '#8B6FC4',
    textColor: '#D8C8F5',
    accent: '#9E80D8',
    ribbon: 'ACTA',
  },
  prueba: {
    label: 'Prueba',
    mark: 'TST',
    fill: '#10231F',
    paper: '#18342E',
    stroke: '#67A98F',
    textColor: '#C0E9DC',
    accent: '#74C7A6',
    ribbon: 'PAPEL',
  },
  hallazgo: {
    label: 'Hallazgo',
    mark: 'HAL',
    fill: '#2A1512',
    paper: '#3B1915',
    stroke: '#F06A49',
    textColor: '#FFD2C5',
    accent: '#F06A49',
    ribbon: 'RIESGO',
  },
  criterio: {
    label: 'Criterio',
    mark: 'NOR',
    fill: '#231A0E',
    paper: '#332512',
    stroke: '#C89A3A',
    textColor: '#F0D9A8',
    accent: '#D8AD4C',
    ribbon: 'NORMA',
  },
  respuesta: {
    label: 'Respuesta',
    mark: 'RSP',
    fill: '#10231E',
    paper: '#18352E',
    stroke: '#61A98F',
    textColor: '#C5EFE1',
    accent: '#70C9AC',
    ribbon: 'DESCARGO',
  },
  observacion: {
    label: 'Observacion',
    mark: 'OBS',
    fill: '#241C10',
    paper: '#342816',
    stroke: '#D8A437',
    textColor: '#F1D9A4',
    accent: '#D8A437',
    ribbon: 'OBSERV.',
  },
};

const severityAccent: Record<Severidad, string> = {
  critico: '#F06A49',
  medio: '#D8A437',
  bajo: '#78A85A',
};

const severityLabel: Record<Severidad, string> = {
  critico: 'CRITICO',
  medio: 'MEDIO',
  bajo: 'BAJO',
};

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}

function getShortCode(code: string | undefined, titulo: string, tipo: TipoNodo): string {
  if (code) return code.replace('COBIT-', '').replace('COSO-', '').replace('RGSI-', 'RGSI ');
  if (tipo === 'hallazgo') {
    const match = titulo.match(/H-\d+/);
    if (match) return match[0];
  }
  return tipoConfig[tipo].mark;
}

export default function NodeShape({
  tipo,
  titulo,
  subtitulo,
  code,
  selected,
  related = false,
  width = 172,
  height = 86,
  severidad,
  shape,
}: NodeShapeProps) {
  const cfg = tipoConfig[tipo];
  const accentColor = tipo === 'hallazgo' && severidad ? severityAccent[severidad] : cfg.accent;
  const isFinding = tipo === 'hallazgo';
  const isResponse = tipo === 'respuesta';
  const isCriteria = tipo === 'criterio';
  const visualShape = shape ?? (isFinding ? 'rombo' : tipo === 'documento' ? 'documento' : isResponse ? 'nota' : isCriteria ? 'badge' : tipo === 'prueba' ? 'cilindro' : 'rectangulo');
  const rx = visualShape === 'nota' || isResponse ? 14 : visualShape === 'badge' ? 8 : 5;
  const strokeWidth = selected ? 2.6 : isFinding ? 2 : 1.25;
  const strokeColor = selected ? '#F1C85B' : accentColor;
  const fillColor = selected ? '#202833' : cfg.fill;
  const displayCode = getShortCode(code, titulo, tipo);
  const statusText = isFinding && severidad ? severityLabel[severidad] : subtitulo;

  return (
    <g
      style={{
        filter: selected
          ? `drop-shadow(0 0 12px ${accentColor}70) drop-shadow(0 10px 18px rgba(0,0,0,0.34))`
          : related
            ? `drop-shadow(0 0 7px ${accentColor}45)`
            : 'drop-shadow(0 7px 12px rgba(0,0,0,0.28))',
      }}
    >
      {visualShape === 'rombo' && (
        <path
          d={`M ${width / 2} -12 L ${width + 16} ${height / 2} L ${width / 2} ${height + 12} L -16 ${height / 2} Z`}
          fill={accentColor}
          opacity={selected ? 0.18 : 0.09}
          stroke={accentColor}
          strokeWidth={selected ? 1.2 : 0.8}
        />
      )}

      {visualShape === 'cilindro' && (
        <g opacity={selected ? 0.32 : 0.18}>
          <ellipse cx={width / 2} cy={3} rx={width / 2 - 8} ry={12} fill={accentColor} />
          <ellipse cx={width / 2} cy={height - 3} rx={width / 2 - 8} ry={12} fill="none" stroke={accentColor} strokeWidth={1.1} />
        </g>
      )}

      {(selected || isFinding) && (
        <rect
          x={selected ? -7 : -4}
          y={selected ? -7 : -4}
          width={width + (selected ? 14 : 8)}
          height={height + (selected ? 14 : 8)}
          rx={rx + 6}
          fill={accentColor}
          opacity={selected ? 0.2 : 0.08}
        />
      )}

      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={rx}
        fill={fillColor}
        stroke="#05070B"
        strokeWidth={1}
      />

      <rect
        x={1.5}
        y={1.5}
        width={width - 3}
        height={height - 3}
        rx={rx - 1}
        fill={cfg.paper}
        opacity={0.7}
      />

      <rect
        x={1.5}
        y={1.5}
        width={width - 3}
        height={height - 3}
        rx={rx - 1}
        fill="none"
        stroke={strokeColor}
        strokeWidth={visualShape === 'badge' ? strokeWidth + 0.5 : strokeWidth}
      />

      {visualShape === 'badge' && (
        <rect
          x={6}
          y={6}
          width={width - 12}
          height={height - 12}
          rx={6}
          fill="none"
          stroke={strokeColor}
          strokeWidth={0.7}
          strokeDasharray="5 4"
          opacity={0.7}
        />
      )}

      <path
        d={`M ${width - 20} 1.5 L ${width - 1.5} 1.5 L ${width - 1.5} 20 Z`}
        fill="#0E1116"
        opacity={isFinding ? 0.42 : 0.32}
      />
      <path
        d={`M ${width - 20} 1.5 L ${width - 1.5} 20`}
        stroke={strokeColor}
        strokeWidth={0.8}
        opacity={0.55}
      />

      <rect
        x={0}
        y={0}
        width={6}
        height={height}
        rx={rx}
        fill={accentColor}
        opacity={isFinding ? 0.95 : 0.82}
      />

      <circle
        cx={15}
        cy={12}
        r={4}
        fill="#0A0D12"
        stroke={selected ? '#F1C85B' : accentColor}
        strokeWidth={1.2}
      />
      <circle cx={15} cy={12} r={1.6} fill={selected ? '#F1C85B' : accentColor} />

      {tipo === 'documento' && (
        <path
          d="M 139 12 C 143 7 151 7 155 12 L 155 24 C 155 28 149 28 149 24 L 149 14"
          fill="none"
          stroke={accentColor}
          strokeLinecap="round"
          strokeWidth={1.2}
          opacity={0.75}
        />
      )}

      {isFinding && (
        <g transform={`translate(${width - 32} 30)`}>
          <path
            d="M 10 0 L 20 18 L 0 18 Z"
            fill={accentColor}
            opacity={0.95}
          />
          <rect x={9.1} y={5.4} width={1.8} height={6.8} fill="#140807" />
          <rect x={9.1} y={13.8} width={1.8} height={1.9} fill="#140807" />
        </g>
      )}

      {isCriteria && (
        <g transform={`translate(${width - 31} 34)`} opacity={0.86}>
          <rect x={0} y={0} width={20} height={16} rx={2} fill="none" stroke={accentColor} strokeWidth={1.1} />
          <line x1={5} y1={4.8} x2={15} y2={4.8} stroke={accentColor} strokeWidth={0.9} />
          <line x1={5} y1={8} x2={15} y2={8} stroke={accentColor} strokeWidth={0.9} />
          <line x1={5} y1={11.2} x2={12} y2={11.2} stroke={accentColor} strokeWidth={0.9} />
        </g>
      )}

      {isResponse && (
        <g transform={`translate(${width - 33} 34)`} opacity={0.86}>
          <path
            d="M 1 2 H 22 V 14 H 10 L 5 19 V 14 H 1 Z"
            fill="none"
            stroke={accentColor}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <line x1={6} y1={7} x2={17} y2={7} stroke={accentColor} strokeWidth={0.9} />
          <line x1={6} y1={10} x2={14} y2={10} stroke={accentColor} strokeWidth={0.9} />
        </g>
      )}

      <text
        x={25}
        y={15}
        fill={selected ? '#F4D47A' : accentColor}
        fontSize={8.5}
        fontWeight={700}
        fontFamily="var(--font-mono), ui-monospace"
        dominantBaseline="middle"
        style={{ letterSpacing: '0.08em' }}
      >
        {cfg.label.toUpperCase()}
      </text>

      <rect
        x={width - 76}
        y={9}
        width={48}
        height={13}
        rx={2}
        fill="#0A0D12"
        stroke={accentColor}
        strokeWidth={0.65}
        opacity={0.92}
      />
      <text
        x={width - 52}
        y={16}
        fill={selected ? '#F4D47A' : '#D7D0C0'}
        fontSize={7.5}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-mono), ui-monospace"
        style={{ letterSpacing: '0.04em' }}
      >
        {truncate(displayCode, 11)}
      </text>

      <text
        x={14}
        y={44}
        fill={selected ? '#F8F0DC' : cfg.textColor}
        fontSize={isFinding ? 12 : 11.2}
        fontWeight={700}
        fontFamily="var(--font-mono), ui-monospace"
        dominantBaseline="middle"
      >
        {truncate(titulo.replace(/^H-\d+:\s*/, ''), isFinding ? 22 : 24)}
      </text>

      <line
        x1={14}
        y1={58}
        x2={width - 16}
        y2={58}
        stroke="#D7D0C0"
        strokeWidth={0.5}
        opacity={0.14}
      />

      <text
        x={14}
        y={72}
        fill={statusText ? accentColor : '#8C95A6'}
        fontSize={8.5}
        fontWeight={statusText && isFinding ? 800 : 600}
        fontFamily="var(--font-mono), ui-monospace"
        dominantBaseline="middle"
        style={{ letterSpacing: '0.08em' }}
      >
        {truncate(statusText ?? cfg.ribbon, 21)}
      </text>

      <text
        x={width - 12}
        y={72}
        fill={accentColor}
        fontSize={7}
        fontWeight={800}
        textAnchor="end"
        dominantBaseline="middle"
        fontFamily="var(--font-mono), ui-monospace"
        opacity={0.76}
        style={{ letterSpacing: '0.08em' }}
      >
        {cfg.ribbon}
      </text>
    </g>
  );
}
