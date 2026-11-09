import { useCallback, useEffect, useRef, useState } from 'react';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];
const MAX_LINES = 40;
const PID = '[pid 1337]';

const CSS = `
html.nk-outline *:not(.nk-devmode-root):not(.nk-devmode-root *) { outline: 1px solid rgba(34,211,238,.35) !important; }
.nk-devmode-root, .nk-devmode-root * { pointer-events: none; }
.nk-devmode-root button { pointer-events: auto; }
.nk-toast { transition: opacity .25s ease; }
@media (prefers-reduced-motion: reduce) { .nk-toast { transition: none; } }
`;

function isTyping(target) {
  if (!target || !target.tagName) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function describe(el) {
  if (!el || !el.tagName) return 'window';
  const cls =
    typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean)[0] : '';
  return `<${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}>`;
}

function hexAddr(n) {
  const h = Math.max(0, Math.round(n)).toString(16).toUpperCase().padStart(8, '0');
  return `0x${h.slice(0, 4)}_${h.slice(4)}`;
}

function fmtMB(b) {
  return `${(b / 1048576).toFixed(1)}M`;
}

function fmtUptime(ms) {
  const s = Math.floor(ms / 1000);
  const pad = (v) => String(v).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function Meter({ value, color = 'bg-green-400' }) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  return (
    <span className="inline-block h-1.5 w-14 bg-white/10 align-middle">
      <span className={`block h-full ${color}`} style={{ width: `${pct}%` }} />
    </span>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-cyan-400">{label}</span>
      <span className="flex items-center gap-2 text-green-400">{children}</span>
    </div>
  );
}

function TopWidget() {
  const [fps, setFps] = useState(0);
  const [slow, setSlow] = useState(() => ({ nodes: 0, heap: null, uptime: 0 }));
  const [fast, setFast] = useState(() => ({ scroll: 0, w: 0, h: 0 }));

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    let smooth = 0;
    const tick = (now) => {
      frames++;
      if (now - last >= 500) {
        const inst = (frames * 1000) / (now - last);
        smooth = smooth ? smooth * 0.6 + inst * 0.4 : inst;
        setFps(smooth);
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const read = () => {
      const m = performance.memory;
      setSlow({
        nodes: document.getElementsByTagName('*').length,
        heap: m ? { used: m.usedJSHeapSize, limit: m.jsHeapSizeLimit } : null,
        uptime: performance.now(),
      });
    };
    read();
    const id = setInterval(read, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const read = () =>
      setFast({ scroll: window.scrollY, w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    return () => {
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
    };
  }, []);

  const { heap, nodes, uptime } = slow;
  return (
    <div
      data-testid="devmode-top"
      aria-label="developer mode: system monitor"
      className="nk-devmode-root fixed z-[60] bottom-2 left-2 right-2 sm:bottom-auto sm:left-auto sm:right-3 sm:top-3 sm:w-64 border border-fuchsia-500/60 bg-black/85 p-2 font-mono text-[11px] leading-tight shadow-[0_0_12px_rgba(217,70,239,.35)]"
    >
      <div className="mb-1 text-fuchsia-500">top - nk-kernel (dev mode)</div>
      <Row label="FPS">
        <Meter value={fps / 60} />
        <span className="w-8 text-right text-fuchsia-400">{fps ? fps.toFixed(0) : '--'}</span>
      </Row>
      <Row label="HEAP">
        {heap ? (
          <>
            <Meter value={heap.used / heap.limit} color="bg-fuchsia-500" />
            <span>
              {fmtMB(heap.used)}/{fmtMB(heap.limit)}
            </span>
          </>
        ) : (
          <span className="text-fuchsia-400">n/a</span>
        )}
      </Row>
      <Row label="DOM">
        <span className="text-fuchsia-400">{nodes}</span> nodes
      </Row>
      <Row label="ADDR">
        <span className="text-fuchsia-400">{hexAddr(fast.scroll)}</span>
      </Row>
      <Row label="VIEW">
        <span>
          {fast.w}x{fast.h}
        </span>
      </Row>
      <Row label="UP">
        <span>{fmtUptime(uptime)}</span>
      </Row>
    </div>
  );
}

function StraceOverlay({ onClose }) {
  const [lines, setLines] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const t0 = performance.now();
    let fd = 3;
    const log = (text) => {
      const t = ((performance.now() - t0) / 1000).toFixed(6).padStart(10, ' ');
      setLines((prev) =>
        [
          ...prev,
          { id: `${t}-${prev.length}-${Math.random()}`, text: `${PID} ${t} ${text}` },
        ].slice(-MAX_LINES),
      );
    };

    const onClick = (e) =>
      log(
        `click(${describe(e.target)}, x=${Math.round(e.clientX)}, y=${Math.round(e.clientY)}) = 0`,
      );
    let lastScroll = 0;
    const onScroll = () => {
      const now = performance.now();
      if (now - lastScroll < 250) return;
      lastScroll = now;
      log(
        `lseek(window, ${hexAddr(window.scrollY).replace('_', '')}, SEEK_SET) = ${Math.round(window.scrollY)}`,
      );
    };
    const onResize = () =>
      log(`ioctl(stdout, TIOCSWINSZ, {cols=${window.innerWidth}, rows=${window.innerHeight}}) = 0`);
    const onVis = () =>
      log(document.hidden ? 'kill(self, SIGSTOP) = 0' : 'kill(self, SIGCONT) = 0');
    const onKey = () => log('read(0, "", 1) = 1');

    window.addEventListener('click', onClick, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('keydown', onKey, true);

    const origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      window.fetch = function (input, init) {
        let host = 'unknown';
        try {
          const raw =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
          host = new URL(raw, window.location.href).host;
        } catch {
          /* keep unknown */
        }
        log(`connect(${host}) = 0`);
        return origFetch.call(this, input, init).then(
          (res) => {
            const len = res.headers && res.headers.get('content-length');
            log(`recv(${res.status}${len ? `, ${len}` : ''}) = ${len || 0}`);
            return res;
          },
          (err) => {
            log('recv(-1) = -1 ECONNREFUSED');
            throw err;
          },
        );
      };
    }

    let observer;
    if (typeof PerformanceObserver === 'function') {
      try {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            let path = entry.name;
            try {
              const u = new URL(entry.name);
              path = u.origin === window.location.origin ? u.pathname : u.host + u.pathname;
            } catch {
              /* raw name */
            }
            log(`openat(AT_FDCWD, "${path}", O_RDONLY) = ${fd++}`);
          }
        });
        observer.observe({ type: 'resource', buffered: false });
      } catch {
        observer = undefined;
      }
    }

    return () => {
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('keydown', onKey, true);
      if (observer) observer.disconnect();
      if (typeof origFetch === 'function') window.fetch = origFetch;
    };
  }, []);

  useEffect(() => {
    if (!collapsed && endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight;
  }, [lines, collapsed]);

  return (
    <div
      data-testid="devmode-strace"
      className="nk-devmode-root fixed z-[60] bottom-24 left-2 sm:bottom-3 w-[min(34rem,calc(100vw-1rem))] border border-cyan-400/50 bg-black/85 font-mono text-[10px] leading-snug shadow-[0_0_12px_rgba(34,211,238,.3)]"
    >
      <div className="flex items-center justify-between border-b border-cyan-400/30 px-2 py-1 text-cyan-400">
        <span>strace -f -p 1337</span>
        <span className="flex gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            className="px-1.5 text-fuchsia-400 hover:text-fuchsia-300"
          >
            {collapsed ? '[+]' : '[-]'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="close developer mode"
            className="px-1.5 text-fuchsia-400 hover:text-fuchsia-300"
          >
            [x]
          </button>
        </span>
      </div>
      {!collapsed && (
        <div ref={endRef} className="max-h-40 overflow-hidden px-2 py-1 text-green-400 sm:max-h-64">
          {lines.map((l) => (
            <div key={l.id} className="truncate whitespace-nowrap">
              {l.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DevMode() {
  const [on, setOn] = useState(false);
  const [toast, setToast] = useState('');
  const onRef = useRef(false);
  const toastTimer = useRef(0);

  const set = useCallback((next) => {
    if (onRef.current === next) return;
    onRef.current = next;
    setOn(next);
    setToast(`developer mode ${next ? 'enabled' : 'disabled'}`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  useEffect(() => {
    let idx = 0;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (onRef.current) set(false);
        return;
      }
      if (isTyping(e.target)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[idx]) {
        idx++;
        if (idx === KONAMI.length) {
          idx = 0;
          set(!onRef.current);
        }
      } else {
        idx = key === KONAMI[0] ? 1 : 0;
      }
    };
    const onEvent = () => set(!onRef.current);
    window.addEventListener('keydown', onKey);
    window.addEventListener('nk:devmode', onEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('nk:devmode', onEvent);
      clearTimeout(toastTimer.current);
    };
  }, [set]);

  useEffect(() => {
    if (!on) return undefined;
    document.documentElement.classList.add('nk-outline');
    return () => document.documentElement.classList.remove('nk-outline');
  }, [on]);

  return (
    <>
      {on && (
        <>
          <style>{CSS}</style>
          <TopWidget />
          <StraceOverlay onClose={() => set(false)} />
        </>
      )}
      {toast && (
        <div
          aria-live="polite"
          role="status"
          className="nk-toast nk-devmode-root fixed z-[60] left-1/2 top-4 -translate-x-1/2 border border-green-400/60 bg-black px-3 py-1.5 font-mono text-xs text-green-400"
        >
          {toast}
        </div>
      )}
    </>
  );
}
