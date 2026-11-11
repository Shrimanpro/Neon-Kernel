import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// WebGL, physics and the canvas sprite don't run in jsdom; stub them.
vi.mock('@/components/background/ShaderGrid', () => ({ default: () => null }));
vi.mock('@/components/fancy/physics/gravity', () => ({ default: () => <div>tech stack</div> }));

import App from './App';

beforeEach(() => {
  sessionStorage.setItem('nk-intro-seen', '1');
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('offline'))),
  );
});

describe('App', () => {
  it('renders the heading, sections and project cards', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Shriman Oppilamani');
    expect(await screen.findByRole('heading', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Melody OS/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Education & Experience' })).toBeInTheDocument();
  });

  // Closing is covered in components/ProjectModal.test.jsx: inside the full app, jsdom can't measure
  // layout, so the shared-element (layoutId) handoff back to the card never finishes there.
  it('opens a project modal from a card', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Shrimp Editor/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Shrimp Editor' })).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: 'Highlights' })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('filters projects by category', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: 'Projects' });
    await user.click(screen.getByRole('button', { name: 'Games' }));
    expect(screen.getByRole('button', { name: /SunHacks 2023/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Melody OS —/ })).not.toBeInTheDocument();
  });
});
