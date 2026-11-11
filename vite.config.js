import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const GAME_DIR = path.resolve(ROOT, 'game/web');

// Serves the Godot web export at /web/ in dev and copies it to dist/web on build.
function godotGame() {
  return {
    name: 'godot-game',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/web' || req.url === '/web/') req.url = '/game/web/index.html';
        else if (req.url.startsWith('/web/')) req.url = '/game' + req.url;
        next();
      });
    },
    closeBundle() {
      fs.cpSync(GAME_DIR, path.resolve(ROOT, 'dist/web'), {
        recursive: true,
        filter: (src) => !src.endsWith('.import'),
      });
    },
  };
}

const GITHUB_USER = 'Shrimanpro';
const VIRTUAL_ID = 'virtual:github-activity';

/**
 * Bakes the GitHub contribution heatmap into the build as `virtual:github-activity`.
 * The token is read from GITHUB_TOKEN in .env.local (gitignored) and is only used here, at build
 * time; only the day counts end up in the bundle. Without a token the module exports null and the
 * site hides the heatmap.
 */
function githubActivity(token, enabled) {
  let cached;
  const query = `query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`;
  async function load(warn) {
    if (!token || !enabled) return null;
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 26 * 7);
    try {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { login: GITHUB_USER, from: from.toISOString(), to: to.toISOString() },
        }),
      });
      const json = await res.json();
      const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
      if (!res.ok || !cal)
        throw new Error(json?.message || json?.errors?.[0]?.message || res.status);
      return {
        user: GITHUB_USER,
        total: cal.totalContributions,
        fetchedAt: to.toISOString(),
        weeks: cal.weeks.map((w) =>
          w.contributionDays.map((d) => ({
            date: d.date,
            count: d.contributionCount,
            level: [
              'NONE',
              'FIRST_QUARTILE',
              'SECOND_QUARTILE',
              'THIRD_QUARTILE',
              'FOURTH_QUARTILE',
            ].indexOf(d.contributionLevel),
          })),
        ),
      };
    } catch (e) {
      warn(`GitHub heatmap skipped: ${e.message}`);
      return null;
    }
  }
  return {
    name: 'github-activity',
    resolveId: (id) => (id === VIRTUAL_ID ? '\0' + VIRTUAL_ID : null),
    async load(id) {
      if (id !== '\0' + VIRTUAL_ID) return null;
      cached ??= await load((m) => this.warn(m));
      return `export default ${JSON.stringify(cached)};`;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix: also read non-VITE_ variables. GITHUB_TOKEN is never exposed to client code.
  const env = loadEnv(mode, ROOT, '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      godotGame(),
      githubActivity(env.GITHUB_TOKEN, mode !== 'test'),
    ],
    base: './',
    resolve: {
      alias: {
        '@': ROOT,
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.test.{js,jsx}', 'components/**/*.test.{js,jsx}'],
      css: false,
    },
  };
});
