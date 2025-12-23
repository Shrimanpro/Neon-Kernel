import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaJava, FaPython, FaRust, FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaDatabase, FaUnity, FaLinux, FaCode } from 'react-icons/fa';
import { SiCplusplus, SiMariadb, SiUnrealengine, SiMysql, SiTailwindcss, SiGodotengine} from 'react-icons/si';

/** * UTILS **/
const cn = (...classes) => classes.filter(Boolean).join(" ");

const debounce = (func, wait) => {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
};

const calculatePosition = (pos, containerDim, elementDim) => {
  if (typeof pos === "string" && pos.endsWith("%")) {
    return (parseFloat(pos) / 100) * containerDim;
  }
  return (pos || 0) + elementDim / 2;
};


const GravityContext = createContext(null);

/**
 * MATTER BODY COMPONENT
 */
export const MatterBody = ({
  children,
  className,
  matterBodyOptions = {
    friction: 0.1,
    restitution: 0.6,
    density: 0.001,
    isStatic: false,
  },
  bodyType = "rectangle",
  isDraggable = true,
  x = 0,
  y = 0,
  angle = 0,
  ...props
}) => {
  const elementRef = useRef(null);
  const idRef = useRef(Math.random().toString(36).substring(7));
  const context = useContext(GravityContext);

  useEffect(() => {
    if (!elementRef.current || !context) return;
    context.registerElement(idRef.current, elementRef.current, {
      children,
      matterBodyOptions,
      bodyType,
      isDraggable,
      x,
      y,
      angle,
      ...props,
    });
    return () => context.unregisterElement(idRef.current);
  }, [context, matterBodyOptions, isDraggable, x, y, angle]);

  return (
    <div
      ref={elementRef}
      className={cn("absolute touch-none select-none pointer-events-none", className)}
      style={{ visibility: 'hidden' }} 
    >
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

/**
 * GRAVITY CONTAINER COMPONENT
 */
const Gravity = forwardRef((
  {
    children,
    debug = false,
    gravity = { x: 0, y: 1 },
    grabCursor = true,
    resetOnResize = true,
    addTopWall = true,
    autoStart = true,
    className,
    ...props
  },
  ref
) => {
  const canvas = useRef(null);
  const engine = useRef(null);
  const render = useRef(null);
  const runner = useRef(null);
  const bodiesMap = useRef(new Map());
  const frameId = useRef(null);
  const mouseConstraint = useRef(null);
  const mouseDown = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const Matter = window.Matter;
    if (!Matter) return;
    engine.current = Matter.Engine.create();
    setIsReady(true);
  }, []);

  const registerElement = useCallback((id, element, props) => {
    const Matter = window.Matter;
    if (!canvas.current || !engine.current || !Matter) return;

    const { Bodies, World } = Matter;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const canvasRect = canvas.current.getBoundingClientRect();

    const angle = (props.angle || 0) * (Math.PI / 180);
    const x = calculatePosition(props.x, canvasRect.width, width);
    const y = calculatePosition(props.y, canvasRect.height, height);

    // Explicitly set render style to transparent to avoid "random colors"
    const commonOptions = {
      ...props.matterBodyOptions,
      angle: angle,
      render: {
        visible: debug,
        fillStyle: debug ? '#ffffff33' : 'transparent',
        strokeStyle: debug ? '#ffffff' : 'transparent',
        lineWidth: debug ? 1 : 0
      }
    };

    let body;
    if (props.bodyType === "circle") {
      body = Bodies.circle(x, y, Math.max(width, height) / 2, commonOptions);
    } else if (props.bodyType === "hexagon") {
      // Create a 6-sided polygon. 
      // Pointy-top orientation requires a 30-degree rotation offset (Math.PI / 6)
      const radius = height / 2;
      body = Bodies.polygon(x, y, 6, radius, {
        ...commonOptions,
        angle: angle + Math.PI / 6
      });
    } else {
      body = Bodies.rectangle(x, y, width, height, commonOptions);
    }

    if (body) {
      World.add(engine.current.world, [body]);
      bodiesMap.current.set(id, { element, body, props });
      element.style.visibility = 'visible';
    }
  }, [debug]);

  const unregisterElement = useCallback((id) => {
    const Matter = window.Matter;
    const item = bodiesMap.current.get(id) || {};
    if (item.body && engine.current && Matter) {
      Matter.World.remove(engine.current.world, item.body);
      bodiesMap.current.delete(id);
    }
  }, []);

  const updateElements = useCallback(() => {
    bodiesMap.current.forEach(({ element, body }) => {
      const { x, y } = body.position;
      const rotation = body.angle * (180 / Math.PI);
      
      // If it's a hexagon, we subtract the 30-degree offset we added to the body
      // so the visual element stays upright (as defined by CSS clip-path)
      const visualRotation = bodiesMap.current.get(element.id)?.props.bodyType === "hexagon" 
        ? rotation - 30 
        : rotation;

      element.style.transform = `translate(${x - element.offsetWidth / 2}px, ${y - element.offsetHeight / 2}px) rotate(${visualRotation}deg)`;
    });
    frameId.current = requestAnimationFrame(updateElements);
  }, []);

  const initializeRenderer = useCallback(() => {
    const Matter = window.Matter;
    if (!canvas.current || !engine.current || !Matter) return;

    const { Render, Runner, Mouse, MouseConstraint, Bodies, World, Events, Query } = Matter;
    const height = canvas.current.offsetHeight;
    const width = canvas.current.offsetWidth;

    engine.current.gravity.x = gravity.x;
    engine.current.gravity.y = gravity.y;

    render.current = Render.create({
      element: canvas.current,
      engine: engine.current,
      options: { 
        width, 
        height, 
        wireframes: false, 
        background: "transparent" 
      },
    });

    const mouse = Mouse.create(canvas.current);
    mouseConstraint.current = MouseConstraint.create(engine.current, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: debug } },
    });

    const walls = [
      Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true, friction: 1 }),
      Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true, friction: 1 }),
      Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true, friction: 1 }),
    ];
    if (addTopWall) walls.push(Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true, friction: 1 }));

    const touchingMouse = () => Query.point(engine.current.world.bodies, mouseConstraint.current?.mouse.position || { x: 0, y: 0 }).length > 0;

    if (grabCursor) {
      Events.on(engine.current, "beforeUpdate", () => {
        if (canvas.current) canvas.current.style.cursor = touchingMouse() ? (mouseDown.current ? "grabbing" : "grab") : "default";
      });
      canvas.current.addEventListener("mousedown", () => (mouseDown.current = true));
      canvas.current.addEventListener("mouseup", () => (mouseDown.current = false));
    }

    World.add(engine.current.world, [mouseConstraint.current, ...walls]);
    runner.current = Runner.create();
    Render.run(render.current);
    updateElements();
    if (autoStart) Runner.run(runner.current, engine.current);
  }, [updateElements, debug, autoStart, gravity.x, gravity.y, addTopWall, grabCursor]);

  const clearRenderer = useCallback(() => {
    const Matter = window.Matter;
    if (!Matter) return;
    if (frameId.current) cancelAnimationFrame(frameId.current);
    if (render.current) { Matter.Render.stop(render.current); render.current.canvas.remove(); }
    if (runner.current) Matter.Runner.stop(runner.current);
    if (engine.current) { Matter.World.clear(engine.current.world, false); Matter.Engine.clear(engine.current); }
    bodiesMap.current.clear();
  }, []);

  const handleResize = useCallback(() => {
    if (!canvas.current || !resetOnResize) return;
    clearRenderer();
    initializeRenderer();
  }, [clearRenderer, initializeRenderer, resetOnResize]);

  useEffect(() => {
    if (isReady) {
      initializeRenderer();
      const debouncedResize = debounce(handleResize, 500);
      window.addEventListener("resize", debouncedResize);
      return () => { window.removeEventListener("resize", debouncedResize); debouncedResize.cancel(); clearRenderer(); };
    }
  }, [isReady, initializeRenderer, handleResize, clearRenderer]);

  useImperativeHandle(ref, () => ({
    start: () => { if (runner.current) runner.current.enabled = true; },
    stop: () => { if (runner.current) runner.current.enabled = false; },
    reset: handleResize,
  }));

  return (
    <GravityContext.Provider value={{ registerElement, unregisterElement }}>
      <div ref={canvas} className={cn("relative w-full h-full overflow-hidden", className)} {...props}>
        {children}
      </div>
    </GravityContext.Provider>
  );
});

/**
 * MAIN APP
 */
export default function App() {
  const [matterLoaded, setMatterLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
    script.onload = () => setMatterLoaded(true);
    document.head.appendChild(script);
  }, []);

const technologies = [
  { name: 'C++', icon: <SiCplusplus /> },
  { name: 'Java', icon: <FaJava /> },
  { name: 'Rust', icon: <FaRust /> },
  { name: 'Python', icon: <FaPython /> },
  { name: 'React', icon: <FaReact /> },
  { name: 'Node.js', icon: <FaNodeJs /> },
  { name: 'HTML5', icon: <FaHtml5 /> },
  { name: 'CSS3', icon: <FaCss3Alt /> },
  { name: 'SQL', icon: <FaDatabase /> },
  { name: 'GDScript', icon: <SiGodotengine /> },
  { name: 'Unity', icon: <FaUnity /> },
  { name: 'Linux', icon: <FaLinux /> },
  { name: 'MariaDB', icon: <SiMariadb /> },
  { name: 'Unreal Engine', icon: <SiUnrealengine /> },
  { name: 'MySQL', icon: <SiMysql /> },
  { name: 'Tailwind CSS', icon: <SiTailwindcss /> },
];

  if (!matterLoaded) return <div className="flex items-center justify-center min-h-screen text-white">Loading Physics...</div>;

  return (
    <div className="pixel-app min-h-screen bg-transparent w-full text-white flex flex-col items-center p-8 overflow-hidden">
      <div className="w-full max-w-5xl h-[700px] rounded-[3rem] bg-neutral-900/30 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <Gravity debug={false} gravity={{ x: 0, y: 1 }} className="w-full h-full">
          {technologies.map((tech, index) => (
            <MatterBody 
              key={index} 
              x={`${10 + (index % 5) * 20}%`} 
              y={50 + Math.floor(index / 5) * 120} 
              angle={Math.random() * 360}
              bodyType="hexagon"
              matterBodyOptions={{ restitution: 0.2, friction: 0.7, density: 0.3 }}
            >
              <div className="hexagon-border">
                <div className="hexagon">
                  <div className="hexagon-icon">{tech.icon}</div>
                  <div className="hexagon-name">{tech.name}</div>
                </div>
              </div>
            </MatterBody>
          ))}
        </Gravity>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap');

        .pixel-app, .pixel-app * {
          font-family: 'Pixelify Sans', sans-serif !important;
        }

        .hexagon-border {
          position: relative;
          width: 80px;
          height: 92.38px;
          margin: 0px;
          background-color: #c1bfc100;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.3s ease-in-out;
          animation: pulse-glow 1.5s infinite alternate;
        }

        .hexagon {
          position: absolute;
          border: #00ffff;
          top: 2px;
          left: 2px;
          width: calc(100%);
          height: calc(100%);
          background-color: transparent;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #00ffff;
          transition: all 0.3s ease-in-out;
        }

        .hexagon-border:hover .hexagon {
          background-color: rgba(254, 74, 254, 0.293);
          color: #ffffff;
        }

        .hexagon-icon {
          transition: opacity 0.01s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hexagon-name {
          position: absolute;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          font-size: 1.0rem;
          text-align: center;
          padding: 0 4px;
        }

        .hexagon-border:hover .hexagon-icon {
          opacity: 0.3;
        }

        .hexagon-border:hover .hexagon-name {
          opacity: 1;
        }

        @keyframes pulse-glow {
          from {
            filter: drop-shadow(0 0 2px #ff00ff);
          }
          to {
            filter: drop-shadow(0 0 8px #ff00ff);
          }
        }
      `}</style>
    </div>
  );
}
