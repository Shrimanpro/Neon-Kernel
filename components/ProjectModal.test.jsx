import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimatePresence } from 'motion/react';
import ProjectModal from '@/components/ProjectModal';
import { projects } from '@/src/data/projects';

const melody = projects.find((p) => p.slug === 'melody-os');
const compiler = projects.find((p) => p.slug === 'pseudocode-compiler');

function Harness({ project }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        reopen
      </button>
      <AnimatePresence>
        {open && <ProjectModal project={project} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

describe('ProjectModal', () => {
  it('is a labelled modal dialog with focus on the close button and body scroll locked', () => {
    render(<Harness project={melody} />);
    const dialog = screen.getByRole('dialog', { name: 'Melody OS' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(document.activeElement).toHaveAccessibleName('Close project details');
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getAllByRole('img').some((el) => el.tagName === 'svg')).toBe(true); // architecture diagram
  });

  it('closes on Escape and restores scrolling', async () => {
    const user = userEvent.setup();
    render(<Harness project={melody} />);
    await user.keyboard('{Escape}');
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe('');
  });

  it('closes on backdrop click but not on clicks inside the dialog', async () => {
    const user = userEvent.setup();
    render(<Harness project={melody} />);
    await user.click(screen.getByRole('heading', { name: 'Melody OS' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('dialog').parentElement);
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps Tab focus inside the dialog', async () => {
    const user = userEvent.setup();
    render(<Harness project={melody} />);
    const dialog = screen.getByRole('dialog');
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('shows a private-repo note instead of a GitHub link', () => {
    render(<Harness project={compiler} />);
    expect(screen.getByText(/source available on request/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument();
  });
});
