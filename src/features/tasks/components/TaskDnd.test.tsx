import { beforeEach, describe, expect, it } from 'vitest';

import { act, screen, within } from '@testing-library/react';

import type { TestBackendImpl } from 'react-dnd-test-backend';

import { TaskBoard } from './TaskBoard';

import { renderWithDnd } from '../../../test/renderWithDnd';

import { loadTasks, saveTasks } from '../../../utils/taskStorage';

import type { Task, TaskStatus } from '../../../types/task';

const testTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement authentication',
    description: 'Build secure login APIs',
    status: 'backlog',
    priority: 'high',
    assignee: 'Developer',
    tags: ['backend'],
    createdAt: '2026-11-20T09:00:00.000Z',
    updatedAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Build dashboard',
    description: 'Implement dashboard UI',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Developer',
    tags: ['frontend'],
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'task-3',
    title: 'Configure project',
    description: 'Configure development tools',
    status: 'done',
    priority: 'low',
    assignee: 'Developer',
    tags: ['setup'],
    createdAt: '2026-11-20T11:00:00.000Z',
    updatedAt: '2026-11-20T11:00:00.000Z',
  },
];

function getColumn(title: string) {
  return screen.getByRole('region', {
    name: `${title} tasks`,
  });
}

function getDragSource(title: string) {
  const heading = screen.getByRole('heading', {
    name: title,
    level: 3,
  });

  const element = heading.closest<HTMLElement>('[data-drag-handler-id]');

  if (!element) {
    throw new Error(`Drag source not found for ${title}`);
  }

  return element;
}

function getSourceId(title: string): string {
  const id = getDragSource(title).getAttribute('data-drag-handler-id');

  if (!id) {
    throw new Error(`Missing drag handler ID for ${title}`);
  }

  return id;
}

function getTargetId(title: string): string {
  const id = getColumn(title).getAttribute('data-drop-handler-id');

  if (!id) {
    throw new Error(`Missing drop handler ID for ${title}`);
  }

  return id;
}

function moveTask(
  backend: TestBackendImpl,
  taskTitle: string,
  destination: string,
) {
  const sourceId = getSourceId(taskTitle);
  const targetId = getTargetId(destination);

  act(() => {
    backend.simulateBeginDrag([sourceId], {});
    backend.simulateHover([targetId], {});
    backend.simulateDrop();
    backend.simulateEndDrag();
  });
}

function expectTaskInColumn(taskTitle: string, columnTitle: string) {
  expect(
    within(getColumn(columnTitle)).getByRole('heading', {
      name: taskTitle,
      level: 3,
    }),
  ).toBeInTheDocument();
}

describe('TaskBoard drag and drop', () => {
  beforeEach(() => {
    localStorage.clear();

    expect(saveTasks(testTasks)).toBeNull();
  });

  it.each([
    ['Implement authentication', 'Backlog', 'In Progress', 'in-progress'],
    ['Build dashboard', 'In Progress', 'Done', 'done'],
    ['Configure project', 'Done', 'Backlog', 'backlog'],
    ['Implement authentication', 'Backlog', 'Done', 'done'],
  ] as const)(
    'moves "%s" from %s to %s',
    (taskTitle, source, destination, expectedStatus) => {
      const { backend } = renderWithDnd(<TaskBoard />);

      moveTask(backend, taskTitle, destination);

      expectTaskInColumn(taskTitle, destination);

      expect(
        within(getColumn(source)).queryByRole('heading', {
          name: taskTitle,
          level: 3,
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.getByRole('combobox', {
          name: `Change status of ${taskTitle}`,
        }),
      ).toHaveValue(expectedStatus);
    },
  );

  it('rejects drops into the same column', () => {
    const { backend } = renderWithDnd(<TaskBoard />);

    moveTask(backend, 'Implement authentication', 'Backlog');

    expectTaskInColumn('Implement authentication', 'Backlog');

    expect(screen.queryByText('Task status updated!')).not.toBeInTheDocument();

    const savedTask = loadTasks([]).tasks.find((task) => task.id === 'task-1');

    expect(savedTask).toEqual(testTasks[0]);
  });

  it('preserves status when dragging is cancelled', () => {
    const { backend } = renderWithDnd(<TaskBoard />);

    const sourceId = getSourceId('Implement authentication');

    act(() => {
      backend.simulateBeginDrag([sourceId], {});
    });

    act(() => {
      backend.simulateEndDrag();
    });

    expectTaskInColumn('Implement authentication', 'Backlog');

    expect(screen.queryByText('Task status updated!')).not.toBeInTheDocument();
  });

  it('reduces card opacity while dragging', () => {
    const { backend } = renderWithDnd(<TaskBoard />);

    const source = getDragSource('Implement authentication');

    const sourceId = getSourceId('Implement authentication');

    expect(source).toHaveClass('opacity-100');

    act(() => {
      backend.simulateBeginDrag([sourceId], {});
    });

    expect(source).toHaveClass('opacity-40');

    act(() => {
      backend.simulateEndDrag();
    });

    expect(source).toHaveClass('opacity-100');
  });

  it('highlights a valid destination while hovering', () => {
    const { backend } = renderWithDnd(<TaskBoard />);

    const sourceId = getSourceId('Implement authentication');

    const targetId = getTargetId('Done');

    act(() => {
      backend.simulateBeginDrag([sourceId], {});
      backend.simulateHover([targetId], {});
    });

    expect(getColumn('Done')).toHaveClass('border-blue-500', 'bg-blue-50');

    expect(
      within(getColumn('Done')).getByText('Drop here to move to Done'),
    ).toBeInTheDocument();

    act(() => {
      backend.simulateEndDrag();
    });

    expect(getColumn('Done')).not.toHaveClass('border-blue-500');
  });

  it('does not highlight an invalid destination', () => {
    const { backend } = renderWithDnd(<TaskBoard />);

    const sourceId = getSourceId('Implement authentication');

    const targetId = getTargetId('Backlog');

    act(() => {
      backend.simulateBeginDrag([sourceId], {});
      backend.simulateHover([targetId], {});
    });

    expect(getColumn('Backlog')).not.toHaveClass('border-blue-500');

    expect(
      within(getColumn('Backlog')).queryByText('Drop here to move to Backlog'),
    ).not.toBeInTheDocument();

    act(() => {
      backend.simulateEndDrag();
    });
  });

  it('shows a success toast after a valid drop', () => {
    const { backend } = renderWithDnd(<TaskBoard />);

    moveTask(backend, 'Implement authentication', 'Done');

    expect(screen.getByText('Task status updated!')).toBeInTheDocument();
  });

  it('updates source and destination column counts', () => {
    const { backend } = renderWithDnd(<TaskBoard />);

    expect(
      within(getColumn('Backlog')).getByText('1', {
        exact: true,
      }),
    ).toBeInTheDocument();

    expect(
      within(getColumn('Done')).getByText('1', {
        exact: true,
      }),
    ).toBeInTheDocument();

    moveTask(backend, 'Implement authentication', 'Done');

    expect(
      within(getColumn('Backlog')).getByText('0', {
        exact: true,
      }),
    ).toBeInTheDocument();

    expect(
      within(getColumn('Done')).getByText('2', {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('persists the updated status across remounts', () => {
    const { backend, unmount } = renderWithDnd(<TaskBoard />);

    moveTask(backend, 'Implement authentication', 'Done');

    const savedTask = loadTasks([]).tasks.find((task) => task.id === 'task-1');

    const expectedStatus: TaskStatus = 'done';

    expect(savedTask?.status).toBe(expectedStatus);

    expect(savedTask?.updatedAt).not.toBe(testTasks[0].updatedAt);

    unmount();

    renderWithDnd(<TaskBoard />);

    expectTaskInColumn('Implement authentication', 'Done');
  });
});
