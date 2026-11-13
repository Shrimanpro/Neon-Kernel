import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GithubActivity from './GithubActivity';

const repo = (name, extra = {}) => ({
  name,
  html_url: `https://github.com/Shrimanpro/${name}`,
  stargazers_count: 0,
  language: 'Rust',
  pushed_at: new Date().toISOString(),
  fork: false,
  archived: false,
  ...extra,
});

beforeEach(() => localStorage.clear());

describe('GithubActivity', () => {
  it('lists recently pushed repos, skipping forks, and shows stars only when > 0', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              repo('melody-os', { stargazers_count: 3 }),
              repo('someone-elses', { fork: true }),
              repo('shrimp-editor'),
            ]),
        }),
      ),
    );
    render(<GithubActivity user="Shrimanpro" profileUrl="https://github.com/Shrimanpro" />);
    expect(await screen.findByText('melody-os')).toBeInTheDocument();
    expect(screen.getByText('shrimp-editor')).toBeInTheDocument();
    expect(screen.queryByText('someone-elses')).not.toBeInTheDocument();
    expect(screen.getAllByText('3')).toHaveLength(1);
  });

  it('hides itself when GitHub is unreachable and no heatmap was baked in', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    const { container } = render(<GithubActivity user="Shrimanpro" profileUrl="#" />);
    await vi.waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
