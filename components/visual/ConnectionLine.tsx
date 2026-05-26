import type { PointerEvent } from 'react';

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  estilo?: 'curva' | 'recta' | 'ortogonal';
  flecha?: boolean;
  dimmed?: boolean;
  selected?: boolean;
  hovered?: boolean;
  onPointerDown?: (event: PointerEvent<SVGGElement>) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

const relationStyles: Record<string, {
  color: string;
  label: string;
  dash?: string;
  width: number;
}> = {
  sustenta: { color: '#62A9D8', label: 'respalda', width: 1.55 },
  respalda: { color: '#62A9D8', label: 'respalda', width: 1.55 },
  confirma: { color: '#A18AD8', label: 'confirma', dash: '7 4', width: 1.45 },
  prueba: { color: '#74C7A6', label: 'prueba', dash: '3 3', width: 1.55 },
  origina: { color: '#74C7A6', label: 'origina', dash: '3 3', width: 1.55 },
  evalua: { color: '#D8AD4C', label: 'evalúa', dash: '9 4', width: 1.35 },
  'relacionado con': { color: '#D8AD4C', label: 'criterio', dash: '9 4', width: 1.35 },
  incumple: { color: '#F06A49', label: 'incumple', width: 1.95 },
  responde: { color: '#70C9AC', label: 'responde', dash: '2 4', width: 1.45 },
  contradice: { color: '#F06A49', label: 'contradice', dash: '8 3 2 3', width: 1.9 },
  mitiga: { color: '#78A85A', label: 'mitiga', width: 1.55 },
  seguimiento: { color: '#D8A437', label: 'seguimiento', dash: '5 5', width: 1.55 },
};

function normalizeLabel(label?: string): string {
  return (label ?? 'relacion')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getRelationStyle(label?: string) {
  const normalized = normalizeLabel(label);
  if (normalized.includes('seguimiento')) return relationStyles.seguimiento;
  return relationStyles[normalized] ?? { color: '#6F7C91', label: label ?? 'relacion', dash: '5 5', width: 1.2 };
}

function cubicPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  const a = 1 - t;
  const aa = a * a;
  const tt = t * t;

  return {
    x: aa * a * p0.x + 3 * aa * t * p1.x + 3 * a * tt * p2.x + tt * t * p3.x,
    y: aa * a * p0.y + 3 * aa * t * p1.y + 3 * a * tt * p2.y + tt * t * p3.y,
  };
}

function curvedGeometry(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy);
  const bend = Math.min(Math.max(distance * 0.36, 72), 260);
  const signX = dx >= 0 ? 1 : -1;
  const signY = dy >= 0 ? 1 : -1;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const c1 = horizontal
    ? { x: x1 + bend * signX, y: y1 + dy * 0.08 }
    : { x: x1 + dx * 0.08, y: y1 + bend * signY };
  const c2 = horizontal
    ? { x: x2 - bend * signX, y: y2 - dy * 0.08 }
    : { x: x2 - dx * 0.08, y: y2 - bend * signY };
  const mid = cubicPoint(0.5, { x: x1, y: y1 }, c1, c2, { x: x2, y: y2 });

  return {
    path: `M ${x1} ${y1} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${x2} ${y2}`,
    labelX: mid.x,
    labelY: mid.y,
    angle: Math.atan2(y2 - c2.y, x2 - c2.x) * 180 / Math.PI,
  };
}

export default function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  label,
  estilo = 'curva',
  flecha = true,
  dimmed = false,
  selected = false,
  hovered = false,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}: ConnectionLineProps) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const elbowPath = `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
  const curve = curvedGeometry(x1, y1, x2, y2);
  const path = estilo === 'curva' ? curve.path : estilo === 'recta' ? `M ${x1} ${y1} L ${x2} ${y2}` : elbowPath;
  const labelX = estilo === 'curva' ? curve.labelX : mx;
  const labelY = estilo === 'curva' ? curve.labelY : my;
  const relation = getRelationStyle(label);
  const active = selected || hovered;
  const strokeColor = active ? relation.color : relation.color;
  const opacity = dimmed ? 0.07 : selected ? 1 : hovered ? 0.95 : 0.54;
  const strokeWidth = selected ? relation.width + 1 : hovered ? relation.width + 0.55 : relation.width;
  const labelText = relation.label.toUpperCase();
  const labelWidth = Math.max(42, labelText.length * 5.7 + 14);
  const angle = estilo === 'curva' ? curve.angle : estilo === 'recta' ? Math.atan2(dy, dx) * 180 / Math.PI : x2 >= mx ? 0 : 180;

  return (
    <g
      opacity={opacity}
      style={{ transition: 'opacity 0.2s ease' }}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        strokeLinecap="round"
        pointerEvents="stroke"
      />

      {active && !dimmed && (
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={selected ? 0.18 : 0.1}
        />
      )}

      <path
        d={path}
        fill="none"
        stroke="#05070B"
        strokeWidth={strokeWidth + 1.4}
        strokeLinecap="round"
        strokeDasharray={relation.dash}
        opacity={active ? 0.45 : 0.3}
      />

      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={relation.dash}
      />

      {flecha && (
        <g transform={`translate(${x2} ${y2}) rotate(${angle})`}>
          <path
            d="M 0 0 L -9 -4.8 L -6.5 0 L -9 4.8 Z"
            fill={strokeColor}
            opacity={dimmed ? 0.25 : active ? 0.95 : 0.72}
          />
        </g>
      )}

      {!dimmed && (
        <g opacity={active ? 1 : 0.78}>
          <rect
            x={labelX - labelWidth / 2}
            y={labelY - 10}
            width={labelWidth}
            height={18}
            rx={3}
            fill="#10151D"
            stroke={strokeColor}
            strokeWidth={active ? 0.9 : 0.45}
            opacity={active ? 0.96 : 0.82}
          />
          <text
            x={labelX}
            y={labelY}
            fill={active ? '#F8F0DC' : '#AAB5C8'}
            fontSize={7.5}
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono), ui-monospace"
            style={{ letterSpacing: '0.08em' }}
          >
            {labelText}
          </text>
        </g>
      )}
    </g>
  );
}
