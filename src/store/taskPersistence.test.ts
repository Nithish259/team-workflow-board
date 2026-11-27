import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initialTasks } from '../data/initialTasks';

import type { Task, TaskInput } from '../types/task';

import {
  taskCreated,
  taskStatusChanged,
  migrationNoticeDismissed,
  type TasksState,
} from '../features/tasks/taskSlice';

import { loadTasks, STORAGE_KEY, SCHEMA_VERSION } from '../utils/taskStorage';

import { createAppStore } from './store';
import { setupTaskPersistence } from './taskPersistence';

const taskInput: TaskInput = {
  title: 'Test Redux persistence',
  description: 'Verify local storage synchronization',
  status: 'backlog',
  priority: 'high',
  assignee: 'Developer',
  tags: ['Redux', 'Testing'],
};

function makeTask(): Task {
  return {
    ...taskInput,
    tags: [...taskInput.tags],
    id: 'task-1',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
  };
}

function makeState(overrides: Partial<TasksState> = {}): TasksState {
  return {
    tasks: [makeTask()],
    storageError: null,
    migrationNotice: false,
    canPersist: true,
    ...overrides,
  };
}

describe('Redux store and task persistence', () => {
  const subscriptions: Array<() => void> = [];

  function startPersistence(store: ReturnType<typeof createAppStore>) {
    const unsubscribe = setupTaskPersistence(store);

    subscriptions.push(unsubscribe);

    return unsubscribe;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    for (const unsubscribe of subscriptions) {
      unsubscribe();
    }

    subscriptions.length = 0;

    vi.restoreAllMocks();

    localStorage.clear();
  });

  it('loads default tasks when storage is missing', () => {
    const store = createAppStore();

    expect(store.getState().tasks.tasks).toEqual(initialTasks);

    expect(store.getState().tasks.storageError).toBeNull();

    expect(store.getState().tasks.canPersist).toBe(true);
  });

  it('accepts explicitly preloaded state', () => {
    const preloaded = makeState({
      tasks: [],
    });

    const store = createAppStore(preloaded);

    expect(store.getState().tasks).toEqual(preloaded);
  });

  it('creates independent store instances', () => {
    const first = createAppStore(makeState());
    const second = createAppStore(makeState());

    first.dispatch(taskStatusChanged('task-1', 'done'));

    expect(first.getState().tasks.tasks[0].status).toBe('done');

    expect(second.getState().tasks.tasks[0].status).toBe('backlog');
  });

  it('persists initial tasks when initialized', () => {
    const store = createAppStore(makeState());

    startPersistence(store);

    const raw = localStorage.getItem(STORAGE_KEY);

    expect(raw).not.toBeNull();

    expect(JSON.parse(raw!)).toEqual({
      schemaVersion: SCHEMA_VERSION,
      tasks: store.getState().tasks.tasks,
    });
  });

  it('persists newly created tasks', () => {
    const store = createAppStore(makeState());

    startPersistence(store);

    const action = taskCreated(taskInput);

    store.dispatch(action);

    const restored = loadTasks([]);

    expect(restored.tasks).toHaveLength(2);

    expect(restored.tasks[0]).toEqual(action.payload);

    expect(restored.error).toBeNull();
  });

  it('persists task status changes', () => {
    const store = createAppStore(makeState());

    startPersistence(store);

    const action = taskStatusChanged('task-1', 'done');

    store.dispatch(action);

    const restored = loadTasks([]);

    expect(restored.tasks[0].status).toBe('done');

    expect(restored.tasks[0].updatedAt).toBe(action.payload.updatedAt);
  });

  it('avoids writes for same-status changes', () => {
    const store = createAppStore(makeState());

    startPersistence(store);

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    store.dispatch(taskStatusChanged('task-1', 'backlog'));

    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('avoids writes when dismissing migration notices', () => {
    const store = createAppStore(
      makeState({
        migrationNotice: true,
      }),
    );

    startPersistence(store);

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    store.dispatch(migrationNoticeDismissed());

    expect(store.getState().tasks.migrationNotice).toBe(false);

    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('does not overwrite corrupted storage', () => {
    const corrupted = '{invalid-json';

    localStorage.setItem(STORAGE_KEY, corrupted);

    const store = createAppStore();

    startPersistence(store);

    expect(store.getState().tasks.canPersist).toBe(false);

    expect(store.getState().tasks.storageError).not.toBeNull();

    store.dispatch(taskCreated(taskInput));

    expect(localStorage.getItem(STORAGE_KEY)).toBe(corrupted);
  });

  it('does not overwrite unsupported schema versions', () => {
    const unsupported = JSON.stringify({
      schemaVersion: 99,
      tasks: [],
    });

    localStorage.setItem(STORAGE_KEY, unsupported);

    const store = createAppStore();

    startPersistence(store);

    expect(store.getState().tasks.canPersist).toBe(false);

    store.dispatch(taskCreated(taskInput));

    expect(localStorage.getItem(STORAGE_KEY)).toBe(unsupported);
  });

  it('migrates version 1 data and persists version 2', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tasks: [
          {
            id: 'legacy-task',
            title: 'Legacy task',
            status: 'backlog',
            createdAt: '2026-01-01T09:00:00.000Z',
          },
        ],
      }),
    );

    const store = createAppStore();

    expect(store.getState().tasks.migrationNotice).toBe(true);

    startPersistence(store);

    const raw = localStorage.getItem(STORAGE_KEY);

    expect(raw).not.toBeNull();

    const stored = JSON.parse(raw!);

    expect(stored.schemaVersion).toBe(SCHEMA_VERSION);

    expect(stored.tasks[0]).toMatchObject({
      id: 'legacy-task',
      title: 'Legacy task',
      description: '',
      priority: 'medium',
      assignee: '',
      tags: [],
      status: 'backlog',
    });
  });

  it('reports storage failures and clears the error after recovery', () => {
    const store = createAppStore(makeState());

    startPersistence(store);

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

    store.dispatch(taskCreated(taskInput));

    expect(store.getState().tasks.storageError).toBe(
      'Unable to save tasks to browser storage.',
    );

    expect(store.getState().tasks.tasks).toHaveLength(2);

    expect(setItemSpy).toHaveBeenCalledTimes(1);

    store.dispatch(taskStatusChanged('task-1', 'done'));

    expect(store.getState().tasks.storageError).toBeNull();

    expect(setItemSpy).toHaveBeenCalledTimes(2);

    const restored = loadTasks([]);

    expect(restored.tasks).toEqual(store.getState().tasks.tasks);
  });

  it('stops persisting after unsubscribing', () => {
    const store = createAppStore(makeState());

    const unsubscribe = startPersistence(store);

    const previousStorage = localStorage.getItem(STORAGE_KEY);

    unsubscribe();

    store.dispatch(taskCreated(taskInput));

    expect(store.getState().tasks.tasks).toHaveLength(2);

    expect(localStorage.getItem(STORAGE_KEY)).toBe(previousStorage);
  });
});
