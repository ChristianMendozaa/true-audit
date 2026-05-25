import type { TipoNodo, Severidad } from '@/lib/types';

interface NodeShapeProps {
  tipo: TipoNodo;
  titulo: string;
  subtitulo?: string;
  selected: boolean;
  width?: number;
  height?: number;
  severidad?: Severidad;
}

const tipoConfig = {
  documento:  { fill: '#1E2F4A', stroke: '#4A7BA7', textColor: '#A8C4E0', accent: '#4A7BA7' },
  evidencia:  { fill: '#152040', stroke: '#2A5C8A', textColor: '#8ABBE0', accent: '#2A5C8A' },
  entrevista: { fill: '#261E3D', stroke: '#6A5492', textColor: '#C4ADE8', accent: '#6A5492' },
  prueba:     { fill: '#182A26', stroke: '#4A7B6A', textColor: '#A0CEC0', accent: '#4A7B6A' },
  hallazgo:   { fill: '#2E1818', stroke: '#E0593F', textColor: '#F0B0A0', accent: '#E0593F' },
  criterio:   { fill: '#2A2215', stroke: '#8A6E45', textColor: '#D4BCA0', accent: '#8A6E45' },
  respuesta:  { fill: '#192A1F', stroke: '#3A6B4A', textColor: '#A0C8B0', accent: '#3A6B4A' },
};

const severityAccent: Record<Severidad, string> = {
  critico: '#E0593F',
  medio:   '#C8951A',
  bajo:    '#5B8C3A',
};

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export default function NodeShape({
  tipo,
  titulo,
  subtitulo,
  selected,
  width = 140,
  height = 72,
  severidad,
}: NodeShapeProps) {
  const cfg = tipoConfig[tipo];
  const accentColor = (tipo === 'hallazgo' && severidad) ? severityAccent[severidad] : cfg.accent;
  const rx = tipo === 'respuesta' ? 36 : tipo === 'criterio' ? 6 : 2;

  const strokeWidth = selected ? 2.5 : 1.5;
  const strokeColor = selected ? '#E4B33A' : accentColor;
  const fillColor = selected ? '#1E2830' : cfg.fill;
  const glowOpacity = selected ? 0.35 : 0;

  return (
    <g style={{ filter: selected ? `drop-shadow(0 0 8px ${accentColor}60)` : 'none' }}>
      {/* Glow */}
      {selected && (
        <rect
          x={-4} y={-4}
          width={width + 8} height={height + 8}
          rx={rx + 4}
          fill={accentColor}
          opacity={glowOpacity}
        />
      )}

      {/* Body */}
      <rect
        x={0} y={0}
        width={width} height={height}
        rx={rx}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Accent top bar */}
      <rect
        x={0} y={0}
        width={width} height={3}
        rx={rx}
        fill={accentColor}
        opacity={0.9}
      />

      {/* Type indicator (shape) for special types */}
      {tipo === 'hallazgo' && (
        <polygon
          points={`${width - 16},6 ${width - 10},12 ${width - 16},18 ${width - 22},12`}
          fill={accentColor}
          opacity={0.8}
        />
      )}
      {tipo === 'criterio' && (
        <circle cx={width - 12} cy={height / 2} r={5} fill={accentColor} opacity={0.6} />
      )}

      {/* Title text */}
      <text
        x={10}
        y={tipo === 'hallazgo' ? 30 : subtitulo ? 28 : height / 2 + 4}
        fill={selected ? '#E8E1D0' : cfg.textColor}
        fontSize={11}
        fontWeight="600"
        fontFamily="var(--font-mono), ui-monospace"
        dominantBaseline="middle"
        style={{ letterSpacing: '-0.01em' }}
      >
        {truncate(titulo, tipo === 'hallazgo' ? 18 : 17)}
      </text>

      {/* Subtitle */}
      {subtitulo && (
        <text
          x={10}
          y={height - 14}
          fill={accentColor}
          fontSize={9}
          fontFamily="var(--font-mono), ui-monospace"
          dominantBaseline="middle"
          opacity={0.9}
          style={{ letterSpacing: '0.04em' }}
        >
          {subtitulo}
        </text>
      )}
    </g>
  );
}
