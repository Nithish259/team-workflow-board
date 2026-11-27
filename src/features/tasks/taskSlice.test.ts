import { describe, expect, it } from 'vitest';

import type { Task, TaskInput } from '../../types/task';

import tasksReducer, {
  taskCreated,
  taskUpdated,
  taskStatusChanged,
  migrationNoticeDismissed,
  storageErrorChanged,
  type TasksState,
} from './taskSlice';

const timestamp = '2026-01-01T09:00:00.000Z';

const taskInput: TaskInput = {
  title: 'Implement authentication',
  description: 'Create secure login functionality',
  status: 'backlog',
  priority: 'high',
  assignee: 'Developer',
  tags: ['Backend', 'Security'],
};

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    ...taskInput,
    tags: [...taskInput.tags],
    id: 'task-1',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function makeState(overrides: Partial<TasksState> = {}): TasksState {
  return {
    tasks: [],
    storageError: null,
    migrationNotice: false,
    canPersist: true,
    ...overrides,
  };
}

describe('tasksSlice', () => {
  it('returns the default initial state', () => {
    const state = tasksReducer(undefined, {
      type: 'unknown',
    });

    expect(state).toEqual(makeState());
  });

  it('creates a task with an ID and timestamps', () => {
    const action = taskCreated(taskInput);

    const state = tasksReducer(makeState(), action);

    expect(state.tasks).toHaveLength(1);

    const task = state.tasks[0];

    expect(task).toMatchObject(taskInput);

    expect(task.id).toEqual(expect.any(String));
    expect(task.id.length).toBeGreaterThan(0);

    expect(task.createdAt).toBe(task.updatedAt);

    expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);
  });

  it('inserts new tasks before existing tasks', () => {
    const existing = makeTask();

    const previous = makeState({
      tasks: [existing],
    });

    const action = taskCreated(taskInput);

    const next = tasksReducer(previous, action);

    expect(next.tasks).toHaveLength(2);

    expect(next.tasks[0].id).toBe(action.payload.id);

    expect(next.tasks[1]).toBe(existing);
  });

  it('updates an existing task', () => {
    const previous = makeState({
      tasks: [makeTask()],
    });

    const updatedInput: TaskInput = {
      ...taskInput,
      title: 'Implement JWT authentication',
      priority: 'medium',
    };

    const action = taskUpdated('task-1', updatedInput);

    const next = tasksReducer(previous, action);

    expect(next.tasks[0]).toMatchObject({
      ...updatedInput,
      id: 'task-1',
      createdAt: timestamp,
      updatedAt: action.payload.updatedAt,
    });
  });

  it('ignores updates for nonexistent tasks', () => {
    const previous = makeState({
      tasks: [makeTask()],
    });

    const next = tasksReducer(previous, taskUpdated('missing-id', taskInput));

    expect(next).toBe(previous);
  });

  it('changes task status and updated timestamp', () => {
    const previous = makeState({
      tasks: [makeTask()],
    });

    const action = taskStatusChanged('task-1', 'in-progress');

    const next = tasksReducer(previous, action);

    expect(next.tasks[0].status).toBe('in-progress');

    expect(next.tasks[0].updatedAt).toBe(action.payload.updatedAt);

    expect(next.tasks[0].createdAt).toBe(timestamp);
  });

  it('ignores same-status changes', () => {
    const previous = makeState({
      tasks: [makeTask()],
    });

    const next = tasksReducer(previous, taskStatusChanged('task-1', 'backlog'));

    expect(next).toBe(previous);
    expect(next.tasks).toBe(previous.tasks);
  });

  it('ignores status changes for nonexistent tasks', () => {
    const previous = makeState({
      tasks: [makeTask()],
    });

    const next = tasksReducer(
      previous,
      taskStatusChanged('missing-id', 'done'),
    );

    expect(next).toBe(previous);
  });

  it('does not mutate the previous task state', () => {
    const previous = makeState({
      tasks: [makeTask()],
    });

    const next = tasksReducer(previous, taskStatusChanged('task-1', 'done'));

    expect(previous.tasks[0].status).toBe('backlog');

    expect(previous.tasks[0].updatedAt).toBe(timestamp);

    expect(next.tasks[0].status).toBe('done');

    expect(next).not.toBe(previous);
    expect(next.tasks[0]).not.toBe(previous.tasks[0]);
  });

  it('preserves references of unchanged tasks', () => {
    const previous = makeState({
      tasks: [
        makeTask(),
        makeTask({
          id: 'task-2',
          title: 'Write documentation',
        }),
      ],
    });

    const next = tasksReducer(previous, taskStatusChanged('task-1', 'done'));

    expect(next.tasks[0]).not.toBe(previous.tasks[0]);

    expect(next.tasks[1]).toBe(previous.tasks[1]);
  });

  it('dismisses the migration notice', () => {
    const previous = makeState({
      migrationNotice: true,
    });

    const next = tasksReducer(previous, migrationNoticeDismissed());

    expect(next.migrationNotice).toBe(false);
    expect(next.tasks).toBe(previous.tasks);
  });

  it('sets and clears storage errors', () => {
    const previous = makeState();

    const failed = tasksReducer(
      previous,
      storageErrorChanged('Storage unavailable'),
    );

    expect(failed.storageError).toBe('Storage unavailable');

    const recovered = tasksReducer(failed, storageErrorChanged(null));

    expect(recovered.storageError).toBeNull();
    expect(recovered.tasks).toBe(previous.tasks);
  });
});
