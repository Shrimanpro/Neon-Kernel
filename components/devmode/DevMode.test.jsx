// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import DevMode from './DevMode';

const SEQ = [
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
const press = (key) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });

describe('DevMode', () => {
  afterEach(cleanup);

  it('shows on Konami code and hides on Escape', () => {
    const origFetch = window.fetch;
    render(<DevMode />);
    expect(screen.queryByTestId('devmode-top')).toBeNull();
    SEQ.forEach(press);
    expect(screen.getByTestId('devmode-top')).toBeTruthy();
    expect(document.documentElement.classList.contains('nk-outline')).toBe(true);
    press('Escape');
    expect(screen.queryByTestId('devmode-top')).toBeNull();
    expect(document.documentElement.classList.contains('nk-outline')).toBe(false);
    expect(window.fetch).toBe(origFetch);
  });

  it('toggles via nk:devmode event', () => {
    render(<DevMode />);
    act(() => {
      window.dispatchEvent(new CustomEvent('nk:devmode'));
    });
    expect(screen.getByTestId('devmode-top')).toBeTruthy();
  });
});
