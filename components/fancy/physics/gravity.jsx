import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import Matter from 'matter-js';
import {
  FaJava,
  FaPython,
  FaRust,
  FaReact,
  FaNodeJs,
  FaHtml5,
  FaCss3Alt,
  FaDatabase,
  FaUnity,
  FaLinux,
  FaMicrochip,
} from 'react-icons/fa';
import {
  SiC,
  SiCplusplus,
  SiMariadb,
  SiUnrealengine,
  SiMysql,
  SiTailwindcss,
  SiGodotengine,
  SiGnubash,
  SiGit,
  SiQemu,
  SiWireshark,
  SiArchlinux,
  SiGnu,
  SiFastapi,
} from 'react-icons/si';
import { cn } from '@/lib/utils';

const debounce = (fn, wait) => {
  let t;
  const d = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
  d.cancel = () => clearTimeout(t);
  return d;
};

// Percent strings are relative to the container; numbers are pixel offsets of the element's top-left.
const resolvePosition = (pos, containerDim, elementDim) => {
  if (typeof pos === 'string' && pos.endsWith('%')) return (parseFloat(pos) / 100) * containerDim;
  return (pos || 0) + elementDim / 2;
};

const GravityContext = createContext(null);

export const MatterBody = ({
  children,
  className,
  matterBodyOptions,
  bodyType = 'rectangle',
  x = 0,
  y = 0,
  angle = 0,
}) => {
  const elementRef = useRef(null);
  const context = useContext(GravityContext);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !context) return;
    const id = context.registerElement(el, { matterBodyOptions, bodyType, x, y, angle });
    return () => context.unregisterElement(id);
  }, [context, matterBodyOptions, bodyType, x, y, angle]);

  return (
    <div
      ref={elementRef}
      className={cn('absolute left-0 top-0 select-none', className)}
      style={{ visibility: 'hidden' }}
    >
      {children}
    </div>
  );
};

/**
 * Physics container. Desktop (fine pointer): drag bodies with the mouse.
 * Touch: no dragging (so the page still scrolls); tapping a body flicks it upward.
 */
export const Gravity = ({ children, gravity = { x: 0, y: 1 }, className }) => {
  const container = useRef(null);
  const engine = useRef(null);
  const runner = useRef(null);
  const frameId = useRef(null);
  const bodies = useRef(new Map());
  const nextId = useRef(0);

  // Children's effects run before ours, so the engine is created on first use by whoever needs it.
  const getEngine = useCallback(() => {
    if (!engine.current) engine.current = Matter.Engine.create();
    return engine.current;
  }, []);

  const registerElement = useCallback(
    (element, props) => {
      const box = container.current;
      if (!box) return null;
      getEngine();
      const { Bodies, Composite } = Matter;
      const w = element.offsetWidth;
      const h = element.offsetHeight;
      const x = resolvePosition(props.x, box.clientWidth, w);
      const y = resolvePosition(props.y, box.clientHeight, h);
      const angle = (props.angle || 0) * (Math.PI / 180);
      const opts = { ...props.matterBodyOptions, angle, render: { visible: false } };
      // Pointy-top hexagon: Matter's polygon is flat-top, so rotate the body 30° and undo it visually.
      const body =
        props.bodyType === 'hexagon'
          ? Bodies.polygon(x, y, 6, h / 2, { ...opts, angle: angle + Math.PI / 6 })
          : Bodies.rectangle(x, y, w, h, opts);
      Composite.add(engine.current.world, body);
      const id = nextId.current++;
      bodies.current.set(id, { element, body, offset: props.bodyType === 'hexagon' ? -30 : 0 });
      element.style.visibility = 'visible';
      return id;
    },
    [getEngine],
  );

  const unregisterElement = useCallback((id) => {
    const item = bodies.current.get(id);
    if (item && engine.current) Matter.Composite.remove(engine.current.world, item.body);
    bodies.current.delete(id);
  }, []);

  useEffect(() => {
    const box = container.current;
    const { Engine, Runner, Mouse, MouseConstraint, Bodies, Composite, Query, Body } = Matter;
    const bodyMap = bodies.current;
    getEngine();
    engine.current.gravity.x = gravity.x;
    engine.current.gravity.y = gravity.y;

    let walls = [];
    const buildWalls = () => {
      Composite.remove(engine.current.world, walls);
      const w = box.clientWidth;
      const h = box.clientHeight;
      const t = 60;
      walls = [
        Bodies.rectangle(w / 2, h + t / 2, w + 2 * t, t, { isStatic: true, friction: 1 }),
        Bodies.rectangle(w + t / 2, h / 2, t, h * 3, { isStatic: true, friction: 1 }),
        Bodies.rectangle(-t / 2, h / 2, t, h * 3, { isStatic: true, friction: 1 }),
        Bodies.rectangle(w / 2, -t / 2, w + 2 * t, t, { isStatic: true }),
      ];
      Composite.add(engine.current.world, walls);
    };
    buildWalls();

    const finePointer = window.matchMedia?.('(pointer: fine)').matches;
    let mouseConstraint;
    let onPointerDown;
    if (finePointer) {
      const mouse = Mouse.create(box);
      // Matter's wheel/touch handlers call preventDefault and would block page scrolling.
      box.removeEventListener('wheel', mouse.mousewheel);
      box.removeEventListener('touchmove', mouse.mousemove);
      box.removeEventListener('touchstart', mouse.mousedown);
      box.removeEventListener('touchend', mouse.mouseup);
      mouseConstraint = MouseConstraint.create(engine.current, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      Composite.add(engine.current.world, mouseConstraint);
    } else {
      onPointerDown = (e) => {
        const r = box.getBoundingClientRect();
        const point = { x: e.clientX - r.left, y: e.clientY - r.top };
        const hit = Query.point(
          [...bodies.current.values()].map((b) => b.body),
          point,
        );
        hit.forEach((b) => Body.setVelocity(b, { x: (Math.random() - 0.5) * 8, y: -14 }));
      };
      box.addEventListener('pointerdown', onPointerDown);
    }

    runner.current = Runner.create();
    Runner.run(runner.current, engine.current);

    const tick = () => {
      bodies.current.forEach(({ element, body, offset }) => {
        const { x, y } = body.position;
        const rot = body.angle * (180 / Math.PI) + offset;
        element.style.transform = `translate(${x - element.offsetWidth / 2}px, ${y - element.offsetHeight / 2}px) rotate(${rot}deg)`;
      });
      frameId.current = requestAnimationFrame(tick);
    };
    tick();

    // Pause physics when the tab is hidden.
    const onVisibility = () => {
      runner.current.enabled = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onResize = debounce(() => {
      buildWalls();
      // Pull anything that ended up outside back into the box.
      const w = box.clientWidth;
      bodies.current.forEach(({ body }) => {
        if (body.position.x > w - 20 || body.position.x < 20) {
          Body.setPosition(body, { x: w / 2, y: 60 });
        }
      });
    }, 200);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      onResize.cancel();
      document.removeEventListener('visibilitychange', onVisibility);
      if (onPointerDown) box.removeEventListener('pointerdown', onPointerDown);
      if (mouseConstraint) Mouse.clearSourceEvents(mouseConstraint.mouse);
      cancelAnimationFrame(frameId.current);
      Runner.stop(runner.current);
      Composite.clear(engine.current.world, false);
      Engine.clear(engine.current);
      engine.current = null;
      bodyMap.clear();
    };
  }, [gravity.x, gravity.y, getEngine]);

  const ctx = useMemo(
    () => ({ registerElement, unregisterElement }),
    [registerElement, unregisterElement],
  );

  return (
    <GravityContext.Provider value={ctx}>
      <div
        ref={container}
        className={cn('relative h-full w-full overflow-hidden', className)}
        style={{ touchAction: 'pan-y' }}
      >
        {children}
      </div>
    </GravityContext.Provider>
  );
};

const GROUP_COLORS = {
  lang: '#22d3ee',
  sys: '#4ade80',
  tools: '#fbbf24',
  web: '#e879f9',
  game: '#fb923c',
};

// From the résumé. Items without `icon` are concepts and render as text hexagons.
const technologies = [
  { name: 'C', icon: <SiC />, group: 'lang' },
  { name: 'C++', icon: <SiCplusplus />, group: 'lang' },
  { name: 'Rust', icon: <FaRust />, group: 'lang' },
  { name: 'x86_64 Asm', icon: <FaMicrochip />, group: 'lang' },
  { name: 'Python', icon: <FaPython />, group: 'lang' },
  { name: 'Java', icon: <FaJava />, group: 'lang' },
  { name: 'SQL', icon: <FaDatabase />, group: 'lang' },
  { name: 'Bash', icon: <SiGnubash />, group: 'lang' },
  { name: 'OS Dev', sub: 'no_std', group: 'sys' },
  { name: 'Paging', sub: '4-level', group: 'sys' },
  { name: 'IDT/TSS', group: 'sys' },
  { name: 'DMA', group: 'sys' },
  { name: 'PCI', group: 'sys' },
  { name: 'POSIX', group: 'sys' },
  { name: 'systemd', group: 'sys' },
  { name: 'Linux', icon: <FaLinux />, group: 'sys' },
  { name: 'Arch Linux', icon: <SiArchlinux />, group: 'sys' },
  { name: 'Git', icon: <SiGit />, group: 'tools' },
  { name: 'QEMU', icon: <SiQemu />, group: 'tools' },
  { name: 'GDB', icon: <SiGnu />, group: 'tools' },
  { name: 'Valgrind', group: 'tools' },
  { name: 'Wireshark', icon: <SiWireshark />, group: 'tools' },
  { name: 'Make', group: 'tools' },
  { name: 'Cargo', group: 'tools' },
  { name: 'MySQL', icon: <SiMysql />, group: 'tools' },
  { name: 'MariaDB', icon: <SiMariadb />, group: 'tools' },
  { name: 'React', icon: <FaReact />, group: 'web' },
  { name: 'Node.js', icon: <FaNodeJs />, group: 'web' },
  { name: 'FastAPI', icon: <SiFastapi />, group: 'web' },
  { name: 'HTML5', icon: <FaHtml5 />, group: 'web' },
  { name: 'CSS3', icon: <FaCss3Alt />, group: 'web' },
  { name: 'Tailwind', icon: <SiTailwindcss />, group: 'web' },
  { name: 'Godot', icon: <SiGodotengine />, group: 'game' },
  { name: 'Unity', icon: <FaUnity />, group: 'game' },
  { name: 'Unreal', icon: <SiUnrealengine />, group: 'game' },
];

const LEGEND = [
  ['lang', 'Languages'],
  ['sys', 'Systems & Kernels'],
  ['tools', 'Tools & Data'],
  ['web', 'Web'],
  ['game', 'Game'],
];

const BODY_OPTIONS = { restitution: 0.2, friction: 0.7, density: 1.3 };
// Fixed (not per-render) start positions: a 7-column grid over the upper part of the box,
// alternate columns nudged down so neighbours don't start overlapping.
const COLS = 7;
const START = technologies.map((_, i) => ({
  x: `${7 + (i % COLS) * 14.3}%`,
  y: 8 + Math.floor(i / COLS) * 64 + (i % 2) * 22,
  angle: (i * 47) % 360,
}));

export default function TechStack() {
  return (
    <section aria-labelledby="tech-heading" className="w-full font-mojangles text-white">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="tech-heading" className="text-xl text-cyan-300">
          Tech stack
        </h2>
        <ul className="flex flex-wrap gap-3 text-xs" aria-label="Legend">
          {LEGEND.map(([k, label]) => (
            <li key={k} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: GROUP_COLORS[k] }}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
      {/* Screen readers and print get a plain list. */}
      <ul className="sr-only print-only">
        {technologies.map((t) => (
          <li key={t.name}>{t.name}</li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="no-print relative h-[460px] w-full overflow-hidden rounded-2xl border border-fuchsia-500/40 bg-black/70 shadow-lg shadow-cyan-400/30 lg:h-[600px]"
      >
        <Gravity className="h-full w-full">
          {technologies.map((tech, i) => (
            <MatterBody
              key={tech.name}
              x={START[i].x}
              y={START[i].y}
              angle={START[i].angle}
              bodyType="hexagon"
              matterBodyOptions={BODY_OPTIONS}
            >
              <div className="hex-border" style={{ '--hex': GROUP_COLORS[tech.group] }}>
                <div className="hex">
                  {tech.icon ? (
                    <>
                      <span className="hex-icon">{tech.icon}</span>
                      <span className="hex-name">{tech.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="hex-text">{tech.name}</span>
                      {tech.sub && <span className="hex-name">{tech.sub}</span>}
                    </>
                  )}
                </div>
              </div>
            </MatterBody>
          ))}
        </Gravity>
        <p className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-neutral-500">
          <span className="hidden [@media(pointer:fine)]:inline">drag the hexagons</span>
          <span className="[@media(pointer:fine)]:hidden">tap a hexagon</span>
        </p>
      </div>
      <style>{`
        .hex-border {
          width: 54px; height: 62.35px;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          background: var(--hex);
          filter: drop-shadow(0 0 4px var(--hex));
          cursor: grab;
        }
        .hex-border:active { cursor: grabbing; }
        @media (min-width: 640px) { .hex-border { width: 68px; height: 78.52px; } }
        @media (min-width: 1024px) { .hex-border { width: 80px; height: 92.38px; } }
        .hex {
          position: absolute; inset: 2px;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          background: #050505;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
          color: var(--hex);
          transition: background-color .2s;
        }
        .hex-border:hover .hex { background: #1a0520; color: #fff; }
        .hex-icon { font-size: 1.2rem; line-height: 1; display: flex; }
        @media (min-width: 640px) { .hex-icon { font-size: 1.5rem; } }
        @media (min-width: 1024px) { .hex-icon { font-size: 1.8rem; } }
        .hex-name { font-size: 8px; line-height: 1; color: #e5e5e5; white-space: nowrap; }
        @media (min-width: 640px) { .hex-name { font-size: 9px; } }
        .hex-text { font-size: 10px; line-height: 1.05; text-align: center; color: var(--hex); padding: 0 4px; }
        @media (min-width: 640px) { .hex-text { font-size: 12px; } }
        .hex-border:hover .hex-text { color: #fff; }
      `}</style>
    </section>
  );
}
