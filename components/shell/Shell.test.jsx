// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Shell from './Shell.jsx';
import { profile, aboutMe, motto, skills } from '../../src/data/profile.js';
import { projects } from '../../src/data/projects.js';

describe('Shell', () => {
  beforeEach(() => sessionStorage.setItem('nk-intro-seen', '1'));
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  const setup = () => {
    const onOpenProject = vi.fn();
    render(
      <Shell
        projects={projects}
        profile={profile}
        aboutMe={aboutMe}
        motto={motto}
        skills={skills}
        onOpenProject={onOpenProject}
      />,
    );
    return {
      onOpenProject,
      input: screen.getByLabelText('Terminal command input'),
      user: userEvent.setup(),
    };
  };

  it('prints help output', async () => {
    const { input, user } = setup();
    await user.type(input, 'help{Enter}');
    expect(screen.getByText('show this list')).toBeTruthy();
  });

  it('opens a project via cat', async () => {
    const { input, user, onOpenProject } = setup();
    await user.type(input, 'cat projects/melody-os.md{Enter}');
    expect(onOpenProject).toHaveBeenCalledWith('melody-os');
  });
});
