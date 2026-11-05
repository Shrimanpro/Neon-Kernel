import { useEffect, useState } from 'react';

const TTL = 60 * 60 * 1000; // 1 hour — the unauthenticated GitHub API allows 60 requests/hour per IP.
const KEY = (repo) => `nk-gh:${repo}`;

const readCache = (repo) => {
  try {
    const raw = localStorage.getItem(KEY(repo));
    if (!raw) return null;
    const { t, data } = JSON.parse(raw);
    return Date.now() - t < TTL ? data : null;
  } catch {
    return null;
  }
};

const writeCache = (repo, data) => {
  try {
    localStorage.setItem(KEY(repo), JSON.stringify({ t: Date.now(), data }));
  } catch {
    /* storage unavailable — fine */
  }
};

// One in-flight request per repo, shared by every component asking for it.
const inflight = new Map();

function fetchRepo(repo) {
  if (!inflight.has(repo)) {
    const p = fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((j) => {
        const data = { stars: j.stargazers_count, pushedAt: j.pushed_at };
        writeCache(repo, data);
        return data;
      })
      .finally(() => inflight.delete(repo));
    inflight.set(repo, p);
  }
  return inflight.get(repo);
}

export function repoFromUrl(url) {
  const m = url?.match(/github\.com\/([^/]+\/[^/#?]+)/i);
  return m ? m[1].replace(/\.git$/, '') : null;
}

/** Live stars + last push for a GitHub repo URL. Returns null until loaded, or if it fails. */
export function useGithubRepo(url) {
  const repo = repoFromUrl(url);
  const [data, setData] = useState(() => (repo ? readCache(repo) : null));

  useEffect(() => {
    if (!repo || data) return;
    let alive = true;
    fetchRepo(repo)
      .then((d) => alive && setData(d))
      .catch(() => {}); // hide quietly on rate limit / offline
    return () => {
      alive = false;
    };
  }, [repo, data]);

  return data;
}

export function timeAgo(iso) {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const USER_KEY = (user) => `nk-gh-user:${user}`;

/** A user's public, non-fork repos, most recently pushed first (public API, cached 1 hour). */
export function useGithubRepos(user, limit = 5) {
  const [repos, setRepos] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY(user));
      if (!raw) return null;
      const { t, data } = JSON.parse(raw);
      return Date.now() - t < TTL ? data : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (repos) return;
    let alive = true;
    fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=30`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((list) => {
        const data = list
          .filter((r) => !r.fork && !r.archived)
          .map((r) => ({
            name: r.name,
            url: r.html_url,
            stars: r.stargazers_count,
            language: r.language,
            pushedAt: r.pushed_at,
          }));
        try {
          localStorage.setItem(USER_KEY(user), JSON.stringify({ t: Date.now(), data }));
        } catch {
          /* storage unavailable */
        }
        if (alive) setRepos(data);
      })
      .catch(() => alive && setRepos([]));
    return () => {
      alive = false;
    };
  }, [user, repos]);

  return repos ? repos.slice(0, limit) : null;
}
