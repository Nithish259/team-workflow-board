import { describe, expect, it } from 'vitest';

import type { RootState } from '../../store/store';
import type { Task } from '../../types/task';

import {
  selectTasks,
  selectStorageError,
  selectMigrationNotice,
  selectCanPersist,
} from './taskSelectors';

const task: Task = {
  id: 'task-1',
  title: 'Write unit tests',
  description: 'Test Redux functionality',
  status: 'backlog',
  priority: 'high',
  assignee: 'Developer',
  tags: ['Testing'],
  createdAt: '2026-01-01T09:00:00.000Z',
  updatedAt: '2026-01-01T09:00:00.000Z',
};

function makeState(): RootState {
  return {
    tasks: {
      tasks: [task],
      storageError: 'Storage unavailable',
      migrationNotice: true,
      canPersist: false,
    },
  };
}

describe('taskSelectors', () => {
  it('selects the task array', () => {
    const state = makeState();

    expect(selectTasks(state)).toBe(state.tasks.tasks);
  });

  it('selects the storage error', () => {
    const state = makeState();

    expect(selectStorageError(state)).toBe('Storage unavailable');
  });

  it('selects the migration notice', () => {
    const state = makeState();

    expect(selectMigrationNotice(state)).toBe(true);
  });

  it('selects the persistence permission', () => {
    const state = makeState();

    expect(selectCanPersist(state)).toBe(false);
  });

  it('preserves the selected task reference when unrelated state changes', () => {
    const previous = makeState();

    const next: RootState = {
      ...previous,
      tasks: {
        ...previous.tasks,
        storageError: null,
        migrationNotice: false,
      },
    };

    expect(selectTasks(next)).toBe(selectTasks(previous));
  });
});
