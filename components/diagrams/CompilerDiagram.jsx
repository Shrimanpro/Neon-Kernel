import { Diagram } from './DiagramKit.jsx';
import { stack, down, withGeometry } from './layout.js';

function build() {
  const front = stack(
    [
      { id: 'lexer', lines: ['lexer', 'hand-written'], color: 'cyan' },
      { id: 'tokens', lines: ['token stream'], color: 'cyan' },
      { id: 'parser', lines: ['recursive-descent parser'], color: 'cyan' },
      { id: 'ast', lines: ['abstract syntax tree', 'strongly typed'], color: 'cyan' },
    ],
    { x: 60, y: 108, w: 240 },
  );
  const src = withGeometry({
    id: 'src',
    lines: ['source text', 'pseudocode'],
    color: 'cyan',
    x: 60,
    y: 32,
    w: 240,
    h: 40,
  });
  const evalBox = withGeometry({
    id: 'eval',
    lines: ['evaluator'],
    color: 'fuchsia',
    x: 60,
    y: front[3].b + 10 + 14 + 24,
    w: 240,
    h: 28,
  });
  const chipY1 = evalBox.b + 10;
  const chipNodes = [
    withGeometry({
      id: 'c1',
      lines: ['variable scopes'],
      color: 'fuchsia',
      x: 54,
      y: chipY1,
      w: 122,
      h: 28,
    }),
    withGeometry({
      id: 'c2',
      lines: ['loops'],
      color: 'fuchsia',
      x: 184,
      y: chipY1,
      w: 122,
      h: 28,
    }),
    withGeometry({
      id: 'c3',
      lines: ['conditionals'],
      color: 'fuchsia',
      x: 54,
      y: chipY1 + 36,
      w: 122,
      h: 28,
    }),
    withGeometry({
      id: 'c4',
      lines: ['arithmetic'],
      color: 'fuchsia',
      x: 184,
      y: chipY1 + 36,
      w: 122,
      h: 28,
    }),
    withGeometry({
      id: 'c5',
      lines: ['nested control flow'],
      color: 'fuchsia',
      x: 54,
      y: chipY1 + 72,
      w: 252,
      h: 28,
    }),
  ];
  const out = withGeometry({
    id: 'out',
    lines: ['output'],
    color: 'orange',
    x: 60,
    y: chipY1 + 100 + 10 + 14,
    w: 240,
    h: 28,
  });

  const nodes = [src, ...front, evalBox, ...chipNodes, out];
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = [
    down(src, N.lexer, { color: 'cyan' }),
    down(N.lexer, N.tokens, { color: 'cyan' }),
    down(N.tokens, N.parser, { color: 'cyan' }),
    down(N.parser, N.ast, { color: 'cyan' }),
    down(N.ast, N.eval, { color: 'fuchsia' }),
    down(N.c5, out, { color: 'orange' }),
  ];
  const groups = [
    { label: 'FRONTEND', color: 'cyan', ids: front.map((n) => n.id), padX: 20 },
    { label: 'EVALUATION', color: 'fuchsia', ids: ['eval', 'c1', 'c2', 'c3', 'c4', 'c5'], padX: 6 },
  ];
  return { nodes, edges, groups, height: out.b + 24 };
}

const DESC =
  'Pseudocode compiler pipeline. Source text goes into a hand-written lexer that produces a token stream. A recursive-descent parser turns the tokens into a strongly-typed abstract syntax tree. ' +
  'The evaluator walks the tree, handling variable scopes, loops, conditionals, arithmetic and nested control flow, and produces the program output.';

export default function CompilerDiagram() {
  const { nodes, edges, groups, height } = build();
  return (
    <Diagram
      title="Pseudocode compiler pipeline"
      desc={DESC}
      width={360}
      height={height}
      nodes={nodes}
      edges={edges}
      groups={groups}
    />
  );
}
