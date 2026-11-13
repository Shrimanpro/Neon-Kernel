import { useCallback, useEffect, useRef, useState } from 'react';
import { complete, execute, promptFor } from './commands.js';
import { INTRO_STEPS, useIntro } from './useIntro.js';
import Snake from './Snake.jsx';
import TypingTest from './TypingTest.jsx';

const COLORS = {
  err: 'text-red-400',
  dim: 'text-neutral-400',
  cyan: 'text-cyan-400',
  pink: 'text-fuchsia-400',
  green: 'text-green-400',
};
const CHIPS = ['help', 'ls projects', 'neofetch', 'snake'];

function Prompt({ cwd, children }) {
  return (
    <div className="break-words">
      <span className="text-fuchsia-400">{promptFor(cwd)}</span>{' '}
      <span className="text-cyan-300">{children}</span>
    </div>
  );
}

function Shell({ projects, profile, aboutMe, motto, skills, onOpenProject }) {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const nextId = useRef(0);
  const [inView, setInView] = useState(false);
  const [lines, setLines] = useState([]);
  const [cleared, setCleared] = useState(false);
  const [cwd, setCwd] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histPos, setHistPos] = useState(null);
  const [mottoEn, setMottoEn] = useState(false);
  const [mode, setMode] = useState(null);
  const wasGame = useRef(false);

  // Start the intro when the terminal scrolls into view.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  const intro = useIntro(inView);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, intro.step, intro.typed, mode, mottoEn]);

  useEffect(() => {
    if (mode === null && wasGame.current) inputRef.current?.focus({ preventScroll: true });
    wasGame.current = mode !== null;
  }, [mode]);

  const push = useCallback((items) => {
    setLines((prev) => [...prev, ...items.map((l) => ({ ...l, id: nextId.current++ }))]);
  }, []);

  const submit = (raw) => {
    const text = raw.trim();
    const nextHistory = text ? [...history, text] : history;
    push([{ kind: 'cmd', cwd, text: raw }]);
    setInput('');
    setHistPos(null);
    if (!text) return;
    setHistory(nextHistory);
    const res = execute(text, {
      cwd,
      projects,
      profile,
      skills,
      history: nextHistory,
      uptimeMs: performance.now(),
    });
    push(res.out);
    if (res.cwd !== undefined) setCwd(res.cwd);
    const fx = res.effect;
    if (!fx) return;
    if (fx.type === 'clear') {
      setLines([]);
      setCleared(true);
    } else if (fx.type === 'project') onOpenProject?.(fx.slug);
    else if (fx.type === 'open') window.open(fx.url, '_blank', 'noopener,noreferrer');
    else if (fx.type === 'navigate') window.location.assign(fx.url);
    else if (fx.type === 'devmode') window.dispatchEvent(new CustomEvent('nk:devmode'));
    else if (fx.type === 'game') setMode(fx.name);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(input);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const r = complete(input, cwd, projects);
      if (r.options.length > 1)
        push([
          { kind: 'cmd', cwd, text: input },
          { text: r.options.join('  '), cls: 'green' },
        ]);
      setInput(r.value);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!history.length) return;
      const up = e.key === 'ArrowUp';
      const pos = histPos === null ? (up ? history.length - 1 : null) : histPos + (up ? -1 : 1);
      if (pos === null || pos >= history.length) {
        setHistPos(null);
        setInput('');
      } else {
        const p = Math.max(0, pos);
        setHistPos(p);
        setInput(history[p]);
      }
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setLines([]);
      setCleared(true);
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      push([{ kind: 'cmd', cwd, text: `${input}^C` }]);
      setInput('');
    }
  };

  const exitGame = (result) => {
    if (mode === 'snake') push([{ text: `snake: game ended. score: ${result}`, cls: 'pink' }]);
    else if (result)
      push([{ text: `typing: ${result.wpm} WPM, ${result.accuracy}% accuracy`, cls: 'pink' }]);
    else push([{ text: 'typing: aborted', cls: 'dim' }]);
    setMode(null);
  };

  const motto_ = (
    <div className="my-1 flex flex-wrap items-start gap-2">
      <span lang={mottoEn ? 'en' : 'ta'} className="text-lg text-fuchsia-400">
        {mottoEn ? motto.en : motto.ta}
      </span>
      <button
        type="button"
        onClick={() => setMottoEn((v) => !v)}
        aria-label={mottoEn ? 'Show motto in Tamil' : 'Show motto in English'}
        className="rounded border border-cyan-400/60 px-1.5 py-0.5 text-xs text-cyan-300 hover:bg-cyan-400/10"
      >
        {mottoEn ? 'தமிழ்' : 'EN'}
      </button>
    </div>
  );

  const renderOut = (l, key) => {
    if (l.kind === 'motto') return <div key={key}>{motto_}</div>;
    if (l.kind === 'about')
      return (
        <p key={key} className="my-1 text-neutral-300">
          {aboutMe}
        </p>
      );
    if (l.parts) {
      return (
        <div key={key} className="whitespace-pre-wrap break-words">
          {l.parts.map((p, i) => (
            <span key={i} className={COLORS[p.cls] || 'text-neutral-300'}>
              {p.text}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div
        key={key}
        className={`whitespace-pre-wrap break-words ${COLORS[l.cls] || 'text-neutral-300'}`}
      >
        {l.text}
      </div>
    );
  };

  const showInput = intro.done && mode === null;
  const introRows = [];
  if (!cleared) {
    INTRO_STEPS.forEach((s, i) => {
      if (i < intro.step) {
        introRows.push(
          <Prompt key={`c${i}`} cwd="">
            {s.cmd}
          </Prompt>,
        );
        s.out.forEach((o, j) => introRows.push(renderOut(o, `o${i}-${j}`)));
      } else if (i === intro.step) {
        introRows.push(
          <Prompt key={`c${i}`} cwd="">
            {intro.typed}
            <span className="animate-pulse">▍</span>
          </Prompt>,
        );
      }
    });
  }

  return (
    <div
      ref={rootRef}
      className="w-full rounded-2xl border border-neutral-700 bg-black font-mojangles shadow-lg shadow-cyan-400"
    >
      <div className="flex items-center gap-2 border-b border-neutral-700 p-3" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
      </div>
      <div className="sr-only">
        <p lang="ta">{motto.ta}</p>
        <p>{motto.en}</p>
        <p>{aboutMe}</p>
      </div>
      <div
        ref={scrollRef}
        role="log"
        aria-label="Terminal output"
        onClick={() => {
          if (showInput && !window.getSelection()?.toString())
            inputRef.current?.focus({ preventScroll: true });
        }}
        className="h-[340px] overflow-y-auto p-4 text-sm lg:h-[420px]"
      >
        <div aria-hidden="true">{introRows}</div>
        {lines.map((l) =>
          l.kind === 'cmd' ? (
            <Prompt key={l.id} cwd={l.cwd}>
              {l.text}
            </Prompt>
          ) : (
            renderOut(l, l.id)
          ),
        )}
        {mode === 'snake' && <Snake onExit={exitGame} />}
        {mode === 'typing' && <TypingTest onExit={exitGame} />}
        {showInput && (
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-fuchsia-400">{promptFor(cwd)}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal command input"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="send"
              className="min-w-0 flex-1 bg-transparent font-[inherit] text-cyan-300 caret-fuchsia-400 outline-none"
            />
          </div>
        )}
      </div>
      {showInput && (
        <div className="flex flex-wrap gap-2 border-t border-neutral-800 p-2 sm:hidden">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => submit(c)}
              className="rounded-full border border-fuchsia-500/60 px-3 py-1 text-xs text-fuchsia-300 active:bg-fuchsia-500/20"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Shell;
