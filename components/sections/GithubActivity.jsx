import { FaGithub, FaStar } from 'react-icons/fa';
import activity from 'virtual:github-activity';
import { useGithubRepos, timeAgo } from '@/src/hooks/useGithubRepo';

const LEVEL_COLORS = ['#1a1024', '#4a1550', '#8a2a94', '#c04bd0', '#e879f9'];

function Heatmap({ data }) {
  const days = data.weeks.flat();
  const busiest = days.reduce((a, d) => (d.count > a.count ? d : a), days[0]);
  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={`${data.total} contributions in the last six months; busiest day ${busiest?.date} with ${busiest?.count}.`}
        className="grid grid-flow-col gap-[3px]"
        style={{ gridTemplateRows: 'repeat(7, auto)', gridAutoColumns: 'minmax(0, 1fr)' }}
      >
        {data.weeks.map((week, wi) =>
          // Pad the first (partial) week so weekdays line up.
          [...(wi === 0 ? Array.from({ length: 7 - week.length }, () => null) : []), ...week].map(
            (d, di) =>
              d ? (
                <span
                  key={d.date}
                  title={`${d.count} on ${d.date}`}
                  className="aspect-square rounded-[2px]"
                  style={{
                    background: LEVEL_COLORS[Math.max(0, d.level)],
                    boxShadow: d.level === 4 ? '0 0 4px #e879f9' : undefined,
                  }}
                />
              ) : (
                <span key={`pad-${di}`} />
              ),
          ),
        )}
      </div>
      <figcaption className="mt-2 text-xs text-neutral-400">
        {data.total} contributions in the last 6 months
      </figcaption>
    </figure>
  );
}

/** 8b.3 — contribution heatmap (baked in at build time) + recently pushed repos (live). */
export default function GithubActivity({ user, profileUrl }) {
  const repos = useGithubRepos(user, 5);
  if (!activity && repos && repos.length === 0) return null; // nothing to show (offline / rate-limited)

  return (
    <section
      aria-labelledby="gh-heading"
      className="no-print w-full rounded-2xl border border-fuchsia-500/40 bg-black/75 p-4 text-sm shadow-lg shadow-cyan-400/20"
    >
      <h2 id="gh-heading" className="mb-3 flex items-center gap-2 text-lg text-cyan-300">
        <FaGithub aria-hidden="true" /> GitHub activity
      </h2>

      {activity && <Heatmap data={activity} />}

      <ul
        className={`${activity ? 'mt-4' : ''} space-y-1.5`}
        aria-label="Recently pushed repositories"
      >
        {repos === null
          ? Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="h-9 animate-pulse rounded-md bg-white/5" />
            ))
          : repos.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-md border border-white/10 px-3 py-1.5 hover:border-fuchsia-400/70 focus-visible:border-fuchsia-400/70"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-cyan-100">{r.name}</span>
                    <span className="block text-xs text-neutral-500">
                      {[r.language, `pushed ${timeAgo(r.pushedAt)}`].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  {r.stars > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-amber-200">
                      <FaStar aria-hidden="true" /> {r.stars}
                    </span>
                  )}
                </a>
              </li>
            ))}
      </ul>
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs text-fuchsia-300 hover:text-white"
      >
        all repositories →
      </a>
    </section>
  );
}
