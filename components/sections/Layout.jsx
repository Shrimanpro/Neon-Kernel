import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import TextType from '@/components/TextType';

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[70] rounded bg-black px-4 py-2 text-cyan-300 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to content
    </a>
  );
}

export function Header({ profile }) {
  return (
    <header className="relative rounded-b-3xl bg-cyan-700/20 px-4 py-4 text-center font-mojangles sm:py-5">
      <h1 className="text-base text-neutral-300 sm:text-lg">
        {profile.name} <span className="text-neutral-500">—</span>{' '}
        <span className="text-fuchsia-300">{profile.title}</span>
      </h1>
      <p
        aria-hidden="true"
        className="mt-1 min-h-[1.3em] text-2xl leading-tight text-white sm:text-4xl"
      >
        <TextType
          text={profile.taglines}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor
          cursorCharacter="|"
        />
      </p>
    </header>
  );
}

const NAV = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['education', 'Education'],
];

/** 6.17 — sticky mini-nav with the section currently in view highlighted. */
export function StickyNav() {
  const [current, setCurrent] = useState('about');

  useEffect(() => {
    const els = NAV.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setCurrent(hit.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="no-print sticky top-2 z-40 mx-auto mt-3 w-fit rounded-full border border-fuchsia-500/40 bg-black/80 px-2 py-1 font-mojangles backdrop-blur"
    >
      <ul className="flex gap-1 text-sm">
        {NAV.map(([id, label]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={current === id ? 'true' : undefined}
              className={`block rounded-full px-3 py-1 transition-colors ${
                current === id
                  ? 'bg-fuchsia-500/30 text-white'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** 6.17 — fade/slide a block in the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/** 6.13 — "Now" block. Hidden until profile.now has content. */
export function Now({ now }) {
  const rows = [
    ['Building', now.building],
    ['Reading', now.reading],
    ['Listening to', now.listening],
  ].filter(([, v]) => v);
  if (!rows.length) return null;
  return (
    <section
      aria-labelledby="now-heading"
      className="w-full rounded-2xl border border-fuchsia-500/40 bg-black/75 p-5 font-mojangles"
    >
      <h2 id="now-heading" className="mb-3 flex items-center gap-2 text-xl text-cyan-300">
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-green-400"
        />{' '}
        Now
      </h2>
      <dl className="space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-neutral-500">{k}</dt>
            <dd className="text-neutral-200">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Footer({ profile }) {
  return (
    <footer className="mt-16 border-t border-fuchsia-500/30 bg-black/80 px-4 py-8 font-mojangles text-sm text-neutral-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-neutral-200">
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p>Built with React, Tailwind CSS, Matter.js, ogl and Godot.</p>
          <p className="text-xs">Avatar art by {profile.avatarCredit}.</p>
        </div>
        <ul className="flex gap-4">
          <li>
            <a
              className="text-cyan-300 hover:text-white"
              href={profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              className="text-cyan-300 hover:text-white"
              href={profile.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              className="text-cyan-300 hover:text-white"
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
            >
              Résumé
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
