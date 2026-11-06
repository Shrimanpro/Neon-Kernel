import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { FaTimes, FaGithub, FaLock, FaStar } from 'react-icons/fa';
import { formatRange } from '@/src/data/projects';
import { useGithubRepo, timeAgo } from '@/src/hooks/useGithubRepo';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function RepoStats({ github }) {
  const repo = useGithubRepo(github);
  if (!repo) return null;
  return (
    <span className="inline-flex items-center gap-3 text-sm text-neutral-300">
      {repo.stars > 0 && (
        <span className="inline-flex items-center gap-1 text-amber-200">
          <FaStar aria-hidden="true" /> {repo.stars} {repo.stars === 1 ? 'star' : 'stars'}
        </span>
      )}
      {repo.pushedAt && <span>last push {timeAgo(repo.pushedAt)}</span>}
    </span>
  );
}

/** Must be rendered inside <AnimatePresence> so the exit animation plays. */
export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);
  const accent = project.borderColor;

  // Esc closes, Tab is trapped in the dialog, body scroll is locked, focus returns on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('[data-autofocus]')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        const nodes = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <motion.div
      className="no-print fixed inset-0 z-50 overflow-y-auto bg-cyan-950/70 px-3 py-6 backdrop-blur-sm sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="relative mx-auto my-4 w-full max-w-4xl overflow-hidden rounded-xl border-2 bg-black font-mojangles shadow-2xl"
        style={{ borderColor: accent, boxShadow: `0 0 40px ${accent}55` }}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-2xl hover:bg-black"
          style={{ color: accent }}
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="bg-black px-3 pt-3">
          <motion.img
            layoutId={`project-img-${project.slug}`}
            src={project.image}
            alt={`${project.title} preview`}
            width={project.imageSize?.[0]}
            height={project.imageSize?.[1]}
            className="mx-auto max-h-[40vh] w-auto max-w-full rounded-lg object-contain"
          />
        </div>

        <div className="space-y-5 p-5 text-left sm:p-7">
          <header className="space-y-2">
            <h2 id="project-modal-title" className="text-2xl sm:text-3xl" style={{ color: accent }}>
              {project.title}
            </h2>
            <p className="text-neutral-300">
              {project.role} · {formatRange(project.dates)}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1 text-sm text-white hover:border-white/60"
                >
                  <FaGithub aria-hidden="true" /> {project.githubLabel ?? 'Source on GitHub'}
                </a>
              ) : project.private ? (
                <span className="inline-flex items-center gap-2 text-sm text-neutral-400">
                  <FaLock aria-hidden="true" /> Private repo — source available on request
                </span>
              ) : null}
              {project.github && <RepoStats github={project.github} />}
            </div>
          </header>

          <p className="text-lg text-white">{project.summary}</p>

          <ul className="flex flex-wrap gap-2" aria-label="Tech used">
            {project.tech.map((t) => (
              <li
                key={t}
                className="rounded-full border px-3 py-0.5 text-xs text-neutral-200"
                style={{ borderColor: `${accent}88` }}
              >
                {t}
              </li>
            ))}
          </ul>

          <section>
            <h3 className="mb-2 text-lg text-cyan-300">Highlights</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-neutral-200 marker:text-fuchsia-400">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-lg text-cyan-300">The story</h3>
            <p className="leading-relaxed text-neutral-300">{project.story}</p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
