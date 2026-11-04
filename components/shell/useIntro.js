import { useEffect, useState } from 'react';

const KEY = 'nk-intro-seen';
export const INTRO_STEPS = [
  { cmd: 'ls', out: [{ text: 'about.txt  motto.txt  projects/  resume.pdf', cls: 'green' }] },
  { cmd: 'cat motto.txt', out: [{ kind: 'motto' }] },
  {
    cmd: 'cat about.txt',
    out: [{ kind: 'about' }, { text: "Type 'help' to see what else I can do.", cls: 'dim' }],
  },
];

function safeGet() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
function safeSet() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage unavailable */
  }
}
function prefersReduced() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const TYPE_MS = 40;
const pause = () => 400 + Math.random() * 500;

/**
 * Drives the scripted intro. Returns { step, typed, done }:
 * steps before `step` are fully shown, `typed` is the command being typed.
 */
export function useIntro(started) {
  const [instant] = useState(() => safeGet() || prefersReduced());
  const [state, setState] = useState(() =>
    instant ? { step: INTRO_STEPS.length, typed: '' } : { step: 0, typed: '' },
  );

  useEffect(() => {
    if (instant || !started) return undefined;
    let timer;
    let cancelled = false;
    const later = (fn, ms) => {
      timer = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };
    const runStep = (step) => {
      if (step >= INTRO_STEPS.length) {
        safeSet();
        return;
      }
      const cmd = INTRO_STEPS[step].cmd;
      const typeChar = (n) => {
        setState({ step, typed: cmd.slice(0, n) });
        if (n < cmd.length) later(() => typeChar(n + 1), TYPE_MS);
        else
          later(() => {
            setState({ step: step + 1, typed: '' });
            later(() => runStep(step + 1), pause());
          }, pause() / 2);
      };
      typeChar(0);
    };
    later(() => runStep(0), pause());
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [instant, started]);

  return { ...state, done: state.step >= INTRO_STEPS.length };
}
