import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithDnd } from '../../../test/renderWithDnd';
import { TaskBoard } from './TaskBoard';
import { STORAGE_KEY } from '../../../utils/taskStorage';

describe('TaskBoard', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.history.replaceState(null, '', '/');
  });

  it('creates a task and displays it in Backlog', async () => {
    const user = userEvent.setup();

    renderWithDnd(<TaskBoard />);

    await user.click(screen.getByRole('button', { name: /create task/i }));

    const dialog = screen.getByRole('dialog');

    await user.type(
      within(dialog).getByRole('textbox', {
        name: /task title/i,
      }),
      'Write Unit Tests',
    );

    await user.click(
      within(dialog).getByRole('button', {
        name: /create task/i,
      }),
    );

    const backlog = screen.getByRole('region', {
      name: /backlog tasks/i,
    });

    expect(within(backlog).getByText('Write Unit Tests')).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');

    expect(saved.schemaVersion).toBe(2);
    expect(
      saved.tasks.some(
        (task: { title: string }) => task.title === 'Write Unit Tests',
      ),
    ).toBe(true);
  });

  it('moves a task from Backlog to Done', async () => {
    const user = userEvent.setup();

    renderWithDnd(<TaskBoard />);

    const backlog = screen.getByRole('region', {
      name: /backlog tasks/i,
    });

    expect(within(backlog).getByText('Design Login Page')).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /change status of design login page/i,
      }),
      'done',
    );

    const done = screen.getByRole('region', {
      name: /done tasks/i,
    });

    expect(within(done).getByText('Design Login Page')).toBeInTheDocument();

    expect(
      within(backlog).queryByText('Design Login Page'),
    ).not.toBeInTheDocument();
  });

  it('filters tasks by title', async () => {
    const user = userEvent.setup();

    renderWithDnd(<TaskBoard />);

    await user.type(
      screen.getByRole('textbox', {
        name: /search tasks/i,
      }),
      'Authentication',
    );

    expect(screen.getByText('Implement Authentication')).toBeInTheDocument();

    expect(screen.queryByText('Design Login Page')).not.toBeInTheDocument();

    expect(window.location.search).toContain('search=Authentication');
  });

  it('rejects an empty task title', async () => {
    const user = userEvent.setup();

    renderWithDnd(<TaskBoard />);

    await user.click(screen.getByRole('button', { name: /create task/i }));

    const dialog = screen.getByRole('dialog');

    await user.click(
      within(dialog).getByRole('button', {
        name: /create task/i,
      }),
    );

    expect(
      within(dialog).getByText('Task title is required.'),
    ).toBeInTheDocument();

    expect(dialog).toBeInTheDocument();
  });
});
