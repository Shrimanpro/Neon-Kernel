import { useCallback, useEffect, useRef, useState } from 'react';

const COLS = 20;
const ROWS = 12;
const CELL = 20;
const TICK_MS = 120;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEYS = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
};

const fresh = () => ({
  snake: [
    [5, 6],
    [4, 6],
    [3, 6],
  ],
  dir: 'right',
  next: 'right',
  food: [12, 6],
  score: 0,
  over: false,
});

function placeFood(snake) {
  for (;;) {
    const f = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
    if (!snake.some(([x, y]) => x === f[0] && y === f[1])) return f;
  }
}

function draw(ctx, g) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
  ctx.strokeStyle = 'rgba(217,70,239,0.12)';
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, ROWS * CELL);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(COLS * CELL, y * CELL);
    ctx.stroke();
  }
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(g.food[0] * CELL + 3, g.food[1] * CELL + 3, CELL - 6, CELL - 6);
  g.snake.forEach(([x, y], i) => {
    ctx.fillStyle = i === 0 ? '#e879f9' : '#d946ef';
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  });
}

export default function Snake({ onExit }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const game = useRef(fresh());
  const paused = useRef(false);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);

  const turn = useCallback((name) => {
    const g = game.current;
    const [dx, dy] = DIRS[name];
    const [cx, cy] = DIRS[g.dir];
    if (dx + cx !== 0 || dy + cy !== 0) g.next = name; // no 180-degree reversals
  }, []);

  const restart = useCallback(() => {
    game.current = fresh();
    setScore(0);
    setOver(false);
  }, []);

  useEffect(() => {
    wrapRef.current?.focus({ preventScroll: true });
    const ctx = canvasRef.current.getContext('2d');
    const tick = () => {
      const g = game.current;
      if (g.over || paused.current) {
        draw(ctx, g);
        return;
      }
      g.dir = g.next;
      const [dx, dy] = DIRS[g.dir];
      const head = [g.snake[0][0] + dx, g.snake[0][1] + dy];
      const hitWall = head[0] < 0 || head[1] < 0 || head[0] >= COLS || head[1] >= ROWS;
      const hitSelf = g.snake.some(([x, y]) => x === head[0] && y === head[1]);
      if (hitWall || hitSelf) {
        g.over = true;
        setOver(true);
        draw(ctx, g);
        return;
      }
      g.snake.unshift(head);
      if (head[0] === g.food[0] && head[1] === g.food[1]) {
        g.score += 1;
        setScore(g.score);
        g.food = placeFood(g.snake);
      } else g.snake.pop();
      draw(ctx, g);
    };
    const id = setInterval(tick, TICK_MS);
    const onVis = () => {
      paused.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);
    draw(ctx, game.current);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
      e.preventDefault();
      onExit(game.current.score);
    } else if (KEYS[e.key]) {
      e.preventDefault(); // stop the page scrolling while the game has focus
      turn(KEYS[e.key]);
    } else if ((e.key === 'r' || e.key === 'R' || e.key === 'Enter') && game.current.over)
      restart();
  };

  const pad = 'h-10 w-10 rounded border border-cyan-400/60 text-cyan-300 active:bg-cyan-400/20';
  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Snake game. Arrow keys or WASD to move, Q to quit."
      className="my-2 w-fit max-w-full outline-none focus-visible:ring-1 focus-visible:ring-fuchsia-400"
    >
      <div className="mb-1 flex justify-between text-xs text-neutral-300">
        <span className="text-fuchsia-400">SNAKE score: {score}</span>
        <span>{over ? 'game over - R restart, Q quit' : 'arrows/WASD - Q quit'}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        className="block max-w-full border border-fuchsia-500/60"
        style={{ imageRendering: 'pixelated' }}
      />
      <div
        className="mt-2 hidden grid-cols-3 gap-1 [@media(pointer:coarse)]:grid"
        style={{ width: 'fit-content' }}
      >
        <span />
        <button type="button" className={pad} aria-label="Up" onClick={() => turn('up')}>
          ^
        </button>
        <span />
        <button type="button" className={pad} aria-label="Left" onClick={() => turn('left')}>
          &lt;
        </button>
        <button
          type="button"
          className={pad}
          aria-label="Quit"
          onClick={() => onExit(game.current.score)}
        >
          Q
        </button>
        <button type="button" className={pad} aria-label="Right" onClick={() => turn('right')}>
          &gt;
        </button>
        <span />
        <button type="button" className={pad} aria-label="Down" onClick={() => turn('down')}>
          v
        </button>
        {over && (
          <button type="button" className={`${pad} w-auto px-2`} onClick={restart}>
            R
          </button>
        )}
      </div>
    </div>
  );
}
