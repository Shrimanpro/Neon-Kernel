import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const BASE = 'Bored?';
const EXTRA = ' Try out my game :)';

// Touch screens have no hover, so they get the full label up front.
const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches;

// Floating link to the Godot game. Shows "Bored?" and types out the rest on hover/focus.
export default function GameButton({ href = './web/index.html', className = '' }) {
  const [hoverable] = useState(canHover);
  const [active, setActive] = useState(false);
  const [shown, setShown] = useState(hoverable ? 0 : EXTRA.length);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!hoverable) return;
    const target = active ? EXTRA.length : 0;
    if (shown === target) return;
    const id = setTimeout(() => setShown((n) => n + (n < target ? 1 : -1)), active ? 45 : 20);
    return () => clearTimeout(id);
  }, [active, shown, hoverable]);

  const typing = active && shown < EXTRA.length;

  return (
    <motion.a
      href={href}
      aria-label="Bored? Try out my game"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
      transition={{ y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className={`neon-pulse no-print inline-block max-w-full rounded-xl border-2 border-fuchsia-500 bg-black/70 px-4 py-2 text-sm sm:text-base text-cyan-200 font-mojangles shadow-lg shadow-cyan-400/60 hover:text-fuchsia-300 hover:border-cyan-400 transition-colors sm:whitespace-nowrap ${className}`}
    >
      {BASE}
      {EXTRA.slice(0, shown)}
      {typing && <span className="animate-pulse">|</span>}
    </motion.a>
  );
}
