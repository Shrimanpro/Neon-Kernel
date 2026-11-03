import { useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * 6.22 — wraps the profile card so it can flip to a "stats" back side.
 * Does nothing (renders the card as-is) until `stats` has entries.
 */
export default function ProfileFlip({ stats, children }) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  if (!stats?.length) return children;

  return (
    <div className="flex w-full flex-col items-center gap-2 lg:items-start">
      <div className="relative w-full [perspective:1200px]">
        <div
          className="relative grid transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: flipped && !reduce ? 'rotateY(180deg)' : 'none' }}
        >
          <div
            className="[grid-area:1/1] [backface-visibility:hidden]"
            aria-hidden={flipped}
            style={reduce && flipped ? { visibility: 'hidden' } : undefined}
          >
            {children}
          </div>
          <div
            className="flex items-center justify-center [grid-area:1/1] [backface-visibility:hidden]"
            style={{
              transform: reduce ? 'none' : 'rotateY(180deg)',
              visibility: reduce && !flipped ? 'hidden' : undefined,
            }}
            aria-hidden={!flipped}
          >
            <dl className="w-full max-w-[380px] space-y-3 rounded-[30px] border-2 border-cyan-400/60 bg-black/90 p-6 font-mojangles shadow-[0_0_40px_#22d3ee55]">
              <p className="mb-2 text-center text-lg text-fuchsia-300">stats.cfg</p>
              {stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-white/10 pb-2 text-sm"
                >
                  <dt className="text-cyan-300">{label}</dt>
                  <dd className="text-right text-neutral-200">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        className="no-print rounded-full border border-cyan-400/50 px-3 py-1 font-mojangles text-xs text-cyan-200 hover:bg-cyan-400/10"
      >
        {flipped ? '↺ back to card' : '↻ flip for stats'}
      </button>
    </div>
  );
}
