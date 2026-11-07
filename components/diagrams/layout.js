export const LINE_H = 13;
export const COLORS = {
  cyan: '#22d3ee',
  fuchsia: '#e879f9',
  orange: '#f97316',
  red: '#ef4444',
};

/**
 * Lay out a vertical stack of boxes.
 * items: { id, lines: string[], color, gap?, h? }  (gap = space before the box)
 * Returns nodes with geometry (x, y, w, h, cx, cy, l, r, t, b) filled in.
 */
export function stack(items, { x, y, w, gap = 14 }) {
  let cursor = y;
  return items.map((item, i) => {
    const h = item.h ?? (item.lines.length === 1 ? 28 : 14 + item.lines.length * LINE_H);
    const top = i === 0 ? cursor : cursor + (item.gap ?? gap);
    cursor = top + h;
    return withGeometry({ ...item, x, y: top, w, h });
  });
}

export function withGeometry(n) {
  return { ...n, cx: n.x + n.w / 2, cy: n.y + n.h / 2, l: n.x, r: n.x + n.w, t: n.y, b: n.y + n.h };
}

/** Straight vertical connector from the bottom of one node to the top of another. */
export function down(a, b, extra = {}) {
  return {
    pts: [
      [a.cx, a.b],
      [a.cx, b.t],
    ],
    ...extra,
  };
}
