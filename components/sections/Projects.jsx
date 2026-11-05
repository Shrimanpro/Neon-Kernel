import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { FaSearch } from 'react-icons/fa';
import ChromaGrid from '@/components/ChromaGrid';
import { CATEGORIES, formatRange } from '@/src/data/projects';

const matches = (p, q) =>
  !q ||
  [p.title, p.role, p.summary, ...p.tech, ...p.categories].some((s) => s.toLowerCase().includes(q));

function Timeline({ items, onOpen }) {
  // Newest first, by start month.
  const sorted = [...items].sort((a, b) => b.dates.start.localeCompare(a.dates.start));
  let lastYear = null;
  return (
    <ol className="relative mx-auto max-w-3xl border-l-2 border-fuchsia-500/50 pl-6">
      {sorted.map((p) => {
        const year = p.dates.start.slice(0, 4);
        const showYear = year !== lastYear;
        lastYear = year;
        return (
          <li key={p.slug} className="relative mb-6 print-avoid-break">
            {showYear && <p className="-ml-6 mb-2 pl-6 text-2xl text-fuchsia-300">{year}</p>}
            <span
              aria-hidden="true"
              className="absolute -left-[33px] mt-2 h-4 w-4 rounded-full border-2 border-black"
              style={{
                background: p.borderColor,
                boxShadow: `0 0 10px ${p.borderColor}`,
                top: showYear ? '2.75rem' : 0,
              }}
            />
            <button
              type="button"
              onClick={() => onOpen(p.slug)}
              aria-haspopup="dialog"
              className="w-full rounded-xl border border-white/10 bg-black/70 p-4 text-left transition-colors hover:border-[var(--c)] focus-visible:border-[var(--c)]"
              style={{ '--c': p.borderColor }}
            >
              <p className="text-xs text-neutral-400">{formatRange(p.dates)}</p>
              <h3 className="text-lg text-white">
                {p.title} <span className="text-sm text-neutral-400">· {p.role}</span>
              </h3>
              <p className="mt-1 text-sm text-neutral-300">{p.summary}</p>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function Projects({ projects, onOpen }) {
  const [active, setActive] = useState(new Set());
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) => (active.size === 0 || p.categories.some((c) => active.has(c))) && matches(p, q),
    );
  }, [projects, active, query]);

  const toggle = (c) =>
    setActive((s) => {
      const n = new Set(s);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });

  const chip = (on) =>
    `rounded-full border px-3 py-1 text-sm transition-colors ${
      on
        ? 'border-fuchsia-400 bg-fuchsia-500/20 text-white'
        : 'border-white/20 text-neutral-300 hover:border-white/50'
    }`;

  return (
    <section id="projects" aria-labelledby="projects-heading" className="font-mojangles">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="projects-heading" className="text-3xl text-cyan-300">
          Projects
        </h2>
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            <button
              type="button"
              className={chip(active.size === 0)}
              aria-pressed={active.size === 0}
              onClick={() => setActive(new Set())}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={chip(active.has(c))}
                aria-pressed={active.has(c)}
                onClick={() => toggle(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="relative flex items-center">
            <span className="sr-only">Search projects</span>
            <FaSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 text-xs text-neutral-500"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="grep projects…"
              className="w-full rounded-full border border-white/20 bg-black/70 py-1 pl-8 pr-3 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:outline-none sm:w-48"
            />
          </label>
          <div
            role="group"
            aria-label="View"
            className="flex overflow-hidden rounded-full border border-white/20 text-sm"
          >
            {['grid', 'timeline'].map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`px-3 py-1 capitalize ${view === v ? 'bg-cyan-500/25 text-white' : 'text-neutral-300'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'project' : 'projects'} shown
      </p>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-neutral-400">
          grep: no matches.{' '}
          <button
            type="button"
            className="text-cyan-300 underline"
            onClick={() => {
              setQuery('');
              setActive(new Set());
            }}
          >
            Clear filters
          </button>
        </p>
      ) : (
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {view === 'grid' ? (
            <ChromaGrid items={visible} onOpen={onOpen} />
          ) : (
            <Timeline items={visible} onOpen={onOpen} />
          )}
        </motion.div>
      )}
    </section>
  );
}
