import { Diagram } from './DiagramKit.jsx';
import { stack, down, withGeometry } from './layout.js';

function build() {
  const input = stack(
    [
      { id: 'key', lines: ['keypress'], color: 'cyan' },
      { id: 'read', lines: ['read()', 'one byte at a time'], color: 'cyan' },
    ],
    { x: 40, y: 32, w: 270 },
  );
  const raw = withGeometry({
    id: 'raw',
    lines: ['raw mode (termios)', 'canonical mode + echo off'],
    color: 'cyan',
    x: 40,
    y: input[1].b + 14 + 0,
    w: 270,
    h: 40,
  });
  const proc = withGeometry({
    id: 'proc',
    lines: ['process key'],
    color: 'red',
    x: 40,
    y: raw.b + 34,
    w: 270,
    h: 28,
  });
  const stateY = proc.b + 14 + 24;
  const state = [
    { id: 'rows', lines: ['rows', '(erow)'], x: 52, w: 76 },
    { id: 'cursor', lines: ['cursor'], x: 137, w: 76 },
    { id: 'win', lines: ['window', 'size'], x: 222, w: 76 },
  ].map((s) => withGeometry({ ...s, color: 'fuchsia', y: stateY, h: 40 }));
  const stateBottom = stateY + 40;
  const buf = withGeometry({
    id: 'buf',
    lines: ['append buffer', 'VT100/ANSI escapes,', 'rows, syntax highlighting'],
    color: 'red',
    x: 40,
    y: stateBottom + 10 + 14 + 24,
    w: 270,
    h: 54,
  });
  const write = withGeometry({
    id: 'write',
    lines: ['write()', 'single syscall'],
    color: 'red',
    x: 40,
    y: buf.b + 14,
    w: 270,
    h: 40,
  });
  const term = withGeometry({
    id: 'term',
    lines: ['terminal'],
    color: 'cyan',
    x: 40,
    y: write.b + 14,
    w: 270,
    h: 28,
  });

  const nodes = [...input, raw, proc, ...state, buf, write, term];
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const loopX = 372;
  const edges = [
    down(N.key, N.read, { color: 'cyan' }),
    // raw mode is a setting on the terminal that read() relies on
    {
      pts: [
        [N.read.cx, N.read.b],
        [N.read.cx, N.raw.t],
      ],
      color: 'cyan',
      dashed: true,
      noHead: true,
    },
    {
      pts: [
        [N.raw.cx, N.raw.b],
        [N.raw.cx, N.proc.t],
      ],
      color: 'cyan',
    },
    {
      pts: [
        [N.cursor.cx, N.proc.b],
        [N.cursor.cx, N.cursor.t],
      ],
      color: 'fuchsia',
    },
    {
      pts: [
        [N.cursor.cx, N.cursor.b],
        [N.cursor.cx, N.buf.t],
      ],
      color: 'fuchsia',
      noHead: false,
    },
    down(N.buf, N.write, { color: 'red' }),
    down(N.write, N.term, { color: 'red' }),
    // back to waiting for input
    {
      pts: [
        [N.term.r, N.term.cy],
        [loopX, N.term.cy],
        [loopX, N.key.cy],
        [N.key.r, N.key.cy],
      ],
      color: 'red',
    },
  ];

  const stateTop = stateY - 24;
  const groups = [
    {
      label: 'EDITOR STATE',
      color: 'fuchsia',
      rect: { x: 40 - 10 + 2, y: stateTop, w: 270 - 4 + 16, h: 24 + 40 + 10 },
    },
    {
      label: 'REFRESH',
      color: 'red',
      rect: { x: 30, y: buf.t - 24, w: 290, h: write.b + 10 - (buf.t - 24) },
    },
  ];
  const labels = [
    {
      text: 'back to waiting for input',
      x: loopX - 12,
      y: (N.key.cy + N.term.cy) / 2,
      rot: -90,
      color: 'red',
    },
  ];

  return { nodes, edges, groups, labels, height: term.b + 24 };
}

const DESC =
  'Shrimp Editor render loop. A keypress is read by read() one byte at a time, with the terminal in raw mode via termios (canonical mode and echo off). ' +
  'The key is processed and updates the editor state: rows (erow), cursor, and window size. ' +
  'Refresh then builds the whole frame in an append buffer from VT100/ANSI escape sequences, rows and syntax highlighting, and sends it with a single write() syscall to the terminal. ' +
  'The loop then returns to waiting for the next keypress.';

export default function ShrimpEditorDiagram() {
  const { nodes, edges, groups, labels, height } = build();
  return (
    <Diagram
      title="Shrimp Editor render loop"
      desc={DESC}
      width={420}
      height={height}
      nodes={nodes}
      edges={edges}
      groups={groups}
      labels={labels}
    />
  );
}
