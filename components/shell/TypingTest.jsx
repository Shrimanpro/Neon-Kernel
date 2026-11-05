import { useEffect, useRef, useState } from 'react';
import { SENTENCES, scoreTyping } from './typingData.js';

export default function TypingTest({ onExit }) {
  const [target] = useState(() => SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
  const [typed, setTyped] = useState('');
  const start = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const onChange = (e) => {
    const v = e.target.value.slice(0, target.length);
    if (!start.current && v) start.current = performance.now();
    setTyped(v);
    if (v.length >= target.length)
      onExit(scoreTyping(target, v, performance.now() - start.current));
  };

  return (
    <div className="my-2" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      <div className="mb-1 text-xs text-fuchsia-400">
        TYPING TEST - type the sentence, Esc to quit
      </div>
      <p className="leading-relaxed" aria-label={target}>
        {[...target].map((ch, i) => {
          let cls = 'text-neutral-500';
          if (i < typed.length) cls = typed[i] === ch ? 'text-green-400' : 'text-red-400 underline';
          else if (i === typed.length) cls = 'bg-cyan-400 text-black';
          return (
            <span key={i} className={cls}>
              {ch}
            </span>
          );
        })}
      </p>
      <input
        ref={inputRef}
        value={typed}
        onChange={onChange}
        aria-label="Type the sentence shown above"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onExit(null);
          }
        }}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className="sr-only"
      />
    </div>
  );
}
