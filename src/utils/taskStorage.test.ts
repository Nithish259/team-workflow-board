import { beforeEach, describe, expect, it } from 'vitest';

import { loadTasks, saveTasks, STORAGE_KEY } from './taskStorage';

import type { Task } from '../types/task';

const fallbackTasks: Task[] = [];

describe('taskStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('migrates version 1 tasks to version 2', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tasks: [
          {
            id: 'legacy-001',
            title: 'Old Task',
            status: 'backlog',
          },
        ],
      }),
    );

    const result = loadTasks(fallbackTasks);

    expect(result.migrated).toBe(true);
    expect(result.error).toBeNull();

    expect(result.tasks[0]).toMatchObject({
      id: 'legacy-001',
      title: 'Old Task',
      status: 'backlog',
      priority: 'medium',
      tags: [],
    });

    expect(result.tasks[0].createdAt).toBeTruthy();
    expect(result.tasks[0].updatedAt).toBeTruthy();
  });

  it('handles corrupted JSON without crashing', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid-json');

    const result = loadTasks(fallbackTasks);

    expect(result.tasks).toEqual([]);
    expect(result.error).not.toBeNull();
    expect(result.migrated).toBe(false);
  });

  it('preserves an empty saved task list', () => {
    saveTasks([]);

    const result = loadTasks(fallbackTasks);

    expect(result.tasks).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('rejects unsupported schema versions', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 99,
        tasks: [],
      }),
    );

    const result = loadTasks(fallbackTasks);

    expect(result.error).not.toBeNull();
  });
});
