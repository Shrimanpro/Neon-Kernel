// Pure command engine for the fake shell. No DOM access: side effects are
// returned as `effect` objects and carried out by Shell.jsx.
import { formatRange } from '../../src/data/projects.js';

export const COMMANDS = [
  'help',
  'ls',
  'cd',
  'pwd',
  'cat',
  'whoami',
  'neofetch',
  'open',
  'game',
  'devmode',
  'history',
  'echo',
  'date',
  'clear',
  'exit',
  'sudo',
  'snake',
  'typing',
];
export const OPEN_TARGETS = ['resume', 'github', 'linkedin'];
const ROOT_FILES = ['about.txt', 'motto.txt', 'resume.pdf'];

export const promptFor = (cwd) => `shriman@neon-kernel:${cwd ? `~/${cwd}` : '~'}$`;

// ---- tiny virtual filesystem: '' = ~, 'projects', 'projects/<slug>.md' ----
export function resolvePath(cwd, arg = '') {
  const parts = [];
  let base = cwd ? [cwd] : [];
  let rest = arg;
  if (rest === '~' || rest.startsWith('~/')) {
    base = [];
    rest = rest.slice(1);
  } else if (rest.startsWith('/')) base = [];
  parts.push(...base);
  for (const seg of rest.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

export function listDir(path, projects) {
  if (path === '') return [...ROOT_FILES.slice(0, 2), 'projects/', ROOT_FILES[2]];
  if (path === 'projects') return projects.map((p) => `${p.slug}.md`);
  return null;
}

export function statPath(path, projects) {
  if (path === '' || path === 'projects') return 'dir';
  if (ROOT_FILES.includes(path)) return 'file';
  const m = /^projects\/(.+)\.md$/.exec(path);
  if (m && projects.some((p) => p.slug === m[1])) return 'file';
  return null;
}

// ---- tab completion ----
export function complete(input, cwd, projects) {
  const m = /^(\S*)(\s+)?([\s\S]*)$/.exec(input.replace(/^\s+/, ''));
  const [, cmd, space, arg] = m;
  let candidates;
  let head;
  if (!space) {
    candidates = COMMANDS;
    head = '';
  } else if (['cat', 'ls', 'cd'].includes(cmd) && !arg.includes(' ')) {
    const slash = arg.lastIndexOf('/');
    const dirPart = arg.slice(0, slash + 1);
    const entries = listDir(resolvePath(cwd, dirPart), projects) || [];
    candidates = entries.filter((e) => cmd !== 'cd' || e.endsWith('/'));
    head = `${cmd} ${dirPart}`;
    return finish(candidates, arg.slice(slash + 1), head);
  } else if (cmd === 'open') {
    candidates = OPEN_TARGETS;
    head = 'open ';
  } else {
    return { value: input, options: [] };
  }
  return finish(candidates, space ? arg : cmd, head);
}

function finish(candidates, prefix, head) {
  const options = candidates.filter((c) => c.startsWith(prefix));
  if (options.length === 1) {
    const o = options[0];
    return { value: `${head}${o}${o.endsWith('/') ? '' : ' '}`, options };
  }
  if (options.length > 1) {
    let common = options[0];
    for (const o of options) while (!o.startsWith(common)) common = common.slice(0, -1);
    return { value: `${head}${common}`, options };
  }
  return { value: `${head}${prefix}`, options };
}

// ---- command execution ----
const t = (text, cls) => ({ text, cls });

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m ? `${m} min${m > 1 ? 's' : ''}, ${s % 60} secs` : `${s} secs`;
}

const LOGO = ['  _  _ _  __', ' | \\| | |/ /', " | .` | ' < ", ' |_|\\_|_|\\_\\'];

function neofetch({ profile, skills, projects, uptimeMs }) {
  const fields = [
    ['', 'shriman@neon-kernel'],
    ['', '-------------------'],
    ['Title', profile.title],
    ['Site', profile.siteUrl],
    ['Languages', (skills.Languages || []).join(', ')],
    ['Tools', (skills.Tools || []).join(', ')],
    ['Projects', String(projects.length)],
    ['Uptime', formatUptime(uptimeMs)],
  ];
  return fields.map(([k, v], i) => ({
    parts: [
      { text: (LOGO[i] || '').padEnd(15), cls: 'pink' },
      ...(k ? [{ text: `${k}: `, cls: 'cyan' }] : []),
      { text: v, cls: k ? undefined : 'cyan' },
    ],
  }));
}

const HELP = [
  ['help', 'show this list'],
  ['ls [path]', 'list files'],
  ['cd <dir>', 'change directory (~, projects, ..)'],
  ['pwd', 'print working directory'],
  ['cat <file>', 'read a file; projects/<slug>.md opens the project'],
  ['whoami', 'who is this?'],
  ['neofetch', 'system info'],
  ['open <resume|github|linkedin>', 'open in a new tab'],
  ['game', 'launch the game'],
  ['snake', 'play snake'],
  ['typing', 'typing speed test'],
  ['devmode', 'toggle developer mode'],
  ['history', 'command history'],
  ['echo, date, clear, exit', 'the usual'],
];

/**
 * @returns {{out: object[], cwd?: string, effect?: object}}
 */
export function execute(raw, ctx) {
  const { cwd, projects, profile, skills, history } = ctx;
  const line = raw.trim();
  if (!line) return { out: [] };
  const tokens = line.split(/\s+/);
  const [cmd, ...args] = tokens;
  const arg = args[0];

  switch (cmd) {
    case 'help':
      return {
        out: HELP.map(([c, d]) => ({ parts: [{ text: c.padEnd(32), cls: 'cyan' }, { text: d }] })),
      };
    case 'ls': {
      const path = resolvePath(cwd, arg || '');
      const kind = statPath(path, projects);
      if (!kind)
        return { out: [t(`ls: cannot access '${arg}': No such file or directory`, 'err')] };
      if (kind === 'file') return { out: [t(arg)] };
      return { out: [t(listDir(path, projects).join('  '), 'green')] };
    }
    case 'cd': {
      const path = resolvePath(cwd, arg || '~');
      const kind = statPath(path, projects);
      if (!kind) return { out: [t(`cd: no such file or directory: ${arg}`, 'err')] };
      if (kind === 'file') return { out: [t(`cd: not a directory: ${arg}`, 'err')] };
      return { out: [], cwd: path };
    }
    case 'pwd':
      return { out: [t(cwd ? `/home/shriman/${cwd}` : '/home/shriman')] };
    case 'cat': {
      if (!arg) return { out: [t('cat: missing file operand', 'err')] };
      const path = resolvePath(cwd, arg);
      const kind = statPath(path, projects);
      if (!kind) return { out: [t(`cat: ${arg}: No such file or directory`, 'err')] };
      if (kind === 'dir') return { out: [t(`cat: ${arg}: Is a directory`, 'err')] };
      if (path === 'about.txt') return { out: [{ kind: 'about' }] };
      if (path === 'motto.txt') return { out: [{ kind: 'motto' }] };
      if (path === 'resume.pdf')
        return { out: [t("cat: resume.pdf: binary file — try 'open resume'", 'err')] };
      const slug = path.slice('projects/'.length, -3);
      const p = projects.find((x) => x.slug === slug);
      return {
        out: [
          t(p.title, 'pink'),
          t(`${p.role ? `${p.role} · ` : ''}${formatRange(p.dates)}`, 'cyan'),
          t(p.summary),
          ...p.highlights.map((h) => t(`  * ${h}`, 'dim')),
        ],
        effect: { type: 'project', slug },
      };
    }
    case 'whoami':
      return { out: [t(`${profile.name} — ${profile.title}`, 'pink'), t(profile.pitch)] };
    case 'neofetch':
      return { out: neofetch({ profile, skills, projects, uptimeMs: ctx.uptimeMs }) };
    case 'open': {
      const url = {
        resume: profile.resume,
        github: profile.links?.github,
        linkedin: profile.links?.linkedin,
      }[arg];
      if (!url) return { out: [t('usage: open <resume|github|linkedin>', 'err')] };
      return { out: [t(`opening ${arg}...`, 'dim')], effect: { type: 'open', url } };
    }
    case 'game':
      return {
        out: [t('Launching game...', 'dim')],
        effect: { type: 'navigate', url: profile.game },
      };
    case 'devmode':
      return { out: [t('Toggling developer mode...', 'dim')], effect: { type: 'devmode' } };
    case 'history':
      return { out: history.map((h, i) => t(`${String(i + 1).padStart(4)}  ${h}`, 'dim')) };
    case 'echo':
      return { out: [t(line.slice(4).trim())] };
    case 'date':
      return { out: [t(new Date().toString())] };
    case 'clear':
      return { out: [], effect: { type: 'clear' } };
    case 'exit':
      return {
        out: [
          t('logout'),
          t("There is no escape from the Neon Kernel. Try 'help' instead.", 'dim'),
        ],
      };
    case 'sudo':
      if (args.join(' ') === 'hire shriman') {
        return {
          out: [
            t('[sudo] permission granted 🎉', 'green'),
            t(`Great choice. Reach out via GitHub or LinkedIn (try 'open linkedin').`),
          ],
        };
      }
      return {
        out: [
          t(
            `${args.length ? `sudo: ${args[0]}: ` : ''}nice try. You are not in the sudoers file. This incident will be reported.`,
            'err',
          ),
        ],
      };
    case 'rm':
      if (
        args.some((a) => /^-[a-z]*[rf]/i.test(a)) &&
        args.some((a) => ['/', '/*', '~', '~/*'].includes(a))
      ) {
        return {
          out: [
            t(
              'rm: it is a portfolio, not a scratch disk. Permission denied (and thankfully so).',
              'err',
            ),
          ],
        };
      }
      return { out: [t('rm: read-only file system', 'err')] };
    case 'snake':
    case 'typing':
      return { out: [], effect: { type: 'game', name: cmd } };
    default:
      return { out: [t(`command not found: ${cmd} — try 'help'`, 'err')] };
  }
}
