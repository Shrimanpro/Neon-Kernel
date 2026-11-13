export const SENTENCES = [
  'The kernel schedules every process but trusts none of them.',
  'A syscall is a polite request to cross the privilege boundary.',
  'Compilers turn intent into instructions one pass at a time.',
  'A page fault is just the hardware asking the kernel for help.',
  'Never free memory you do not own, and never read what you have freed.',
  'Interrupts arrive when you least expect them, so keep handlers short.',
  'The linker resolves symbols so the loader can resolve the rest.',
  'Every driver is a conversation with hardware that cannot lie.',
];

export function scoreTyping(target, typed, ms) {
  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correct++;
  const minutes = Math.max(ms, 1) / 60000;
  return {
    wpm: Math.round(target.length / 5 / minutes),
    accuracy: Math.round((correct / target.length) * 100),
  };
}
