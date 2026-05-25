interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  dimmed?: boolean;
  selected?: boolean;
}

export default function ConnectionLine({
  x1, y1, x2, y2,
  label,
  dimmed = false,
  selected = false,
}: ConnectionLineProps) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const cp1x = x1 + dx * 0.4;
  const cp2x = x2 - dx * 0.4;
  const path = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;

  const strokeColor = selected ? '#E4B33A' : '#3A4455';
  const opacity = dimmed ? 0.08 : selected ? 1 : 0.55;

  return (
    <g opacity={opacity} style={{ transition: 'opacity 0.25s ease' }}>
      {/* Shadow / glow for selected */}
      {selected && (
        <path
          d={path}
          fill="none"
          stroke="#E4B33A"
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.2}
        />
      )}

      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={selected ? 1.5 : 1}
        strokeLinecap="round"
        strokeDasharray={selected ? undefined : '4 3'}
      />

      {/* Arrow head */}
      <ArrowHead x={x2} y={y2} dx={dx} color={strokeColor} />

      {/* Label */}
      {label && !dimmed && (
        <g>
          <rect
            x={mx - label.length * 3.2}
            y={my - 8}
            width={label.length * 6.4}
            height={14}
            rx={3}
            fill="#171B23"
            opacity={0.85}
          />
          <text
            x={mx}
            y={my}
            fill={selected ? '#E4B33A' : '#6A7890'}
            fontSize={8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono), ui-monospace"
            style={{ letterSpacing: '0.04em' }}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

function ArrowHead({ x, y, dx, color }: { x: number; y: number; dx: number; color: string }) {
  const dir = dx >= 0 ? 1 : -1;
  return (
    <polygon
      points={`${x},${y} ${x - dir * 8},${y - 4} ${x - dir * 8},${y + 4}`}
      fill={color}
      opacity={0.7}
    />
  );
}
