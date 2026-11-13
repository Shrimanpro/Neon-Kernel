import { useId } from 'react';
import { COLORS, LINE_H } from './layout.js';

const TEXT = '#e5e5e5';
const FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

function groupRect(g, nodeMap) {
  const ns = g.ids.map((id) => nodeMap[id]);
  const padX = g.padX ?? 10;
  const x = Math.min(...ns.map((n) => n.l)) - padX;
  const r = Math.max(...ns.map((n) => n.r)) + padX;
  const y = Math.min(...ns.map((n) => n.t)) - 24;
  const b = Math.max(...ns.map((n) => n.b)) + 10;
  return { x, y, w: r - x, h: b - y };
}

/**
 * Generic neon diagram.
 * nodes: [{ id, lines, color, x, y, w, h, cx, cy, ... }]
 * groups: [{ label, color, ids }]
 * edges: [{ pts: [[x,y],...], color, both?, dashed? }]
 * labels: [{ text, x, y, rot?, color?, anchor? }]
 */
export function Diagram({
  title,
  desc,
  width,
  height,
  nodes,
  groups = [],
  edges = [],
  labels = [],
  maxWidth = 680,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const used = Object.keys(COLORS);

  return (
    <svg
      role="img"
      aria-labelledby={`${uid}-t ${uid}-d`}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ display: 'block', height: 'auto', maxWidth, margin: '0 auto', fontFamily: FONT }}
    >
      <title id={`${uid}-t`}>{title}</title>
      <desc id={`${uid}-d`}>{desc}</desc>
      <defs>
        {used.map((name) => (
          <marker
            key={name}
            id={`${uid}-a-${name}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10z" fill={COLORS[name]} />
          </marker>
        ))}
      </defs>

      {groups.map((g) => {
        const { x, y, w, h } = g.rect ?? groupRect(g, nodeMap);
        const c = COLORS[g.color];
        return (
          <g key={g.label}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="10"
              fill="none"
              stroke={c}
              strokeOpacity="0.55"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <text x={x + 10} y={y + 15} fill={c} fontSize="10" letterSpacing="1.2">
              {g.label}
            </text>
          </g>
        );
      })}

      {edges.map((e, i) => {
        const c = e.color ?? 'cyan';
        const d = e.pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x} ${y}`).join(' ');
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={COLORS[c]}
            strokeWidth="1.5"
            strokeDasharray={e.dashed ? '4 3' : undefined}
            markerEnd={e.noHead ? undefined : `url(#${uid}-a-${c})`}
            markerStart={e.both ? `url(#${uid}-a-${c})` : undefined}
          />
        );
      })}

      {nodes.map((n) => {
        const c = COLORS[n.color];
        const first = n.cy - ((n.lines.length - 1) * LINE_H) / 2;
        return (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="8" fill="#050505" />
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx="8"
              fill={c}
              fillOpacity="0.1"
              stroke={c}
              strokeWidth="1.5"
            />
            {n.lines.map((line, i) => (
              <text
                key={i}
                x={n.cx}
                y={first + i * LINE_H}
                textAnchor="middle"
                dominantBaseline="central"
                fill={i === 0 ? TEXT : '#a3a3a3'}
                fontSize="11"
                fontWeight={i === 0 ? 600 : 400}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor ?? 'middle'}
          dominantBaseline="central"
          fill={l.color ? COLORS[l.color] : '#a3a3a3'}
          fontSize="10"
          transform={l.rot ? `rotate(${l.rot} ${l.x} ${l.y})` : undefined}
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}
