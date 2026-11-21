import type { Task, TaskPriority, TaskStatus } from '../types/task';

export const STORAGE_KEY = 'everquint-workflow-tasks';
export const SCHEMA_VERSION = 2;

interface StoredTasksV2 {
  schemaVersion: 2;
  tasks: Task[];
}

interface StoredTaskV1 {
  id: string;
  title: string;
  description?: string;
  status: string;
  assignee?: string;
  createdAt?: string;
}

interface StoredTasksV1 {
  schemaVersion: 1;
  tasks: StoredTaskV1[];
}

export interface LoadTasksResult {
  tasks: Task[];
  migrated: boolean;
  error: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === 'backlog' || value === 'in-progress' || value === 'done';
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === 'low' || value === 'medium' || value === 'high';
}

function isValidDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    !Number.isNaN(Date.parse(value))
  );
}

function isValidTask(value: unknown): value is Task {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isTaskStatus(value.status) &&
    isTaskPriority(value.priority) &&
    typeof value.assignee === 'string' &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string') &&
    isValidDate(value.createdAt) &&
    isValidDate(value.updatedAt)
  );
}

function migrateV1ToV2(legacyTasks: StoredTaskV1[]): Task[] {
  const now = new Date().toISOString();

  return legacyTasks.map((task) => {
    const createdAt = isValidDate(task.createdAt) ? task.createdAt : now;

    return {
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      status: isTaskStatus(task.status) ? task.status : 'backlog',
      priority: 'medium',
      assignee: task.assignee ?? '',
      tags: [],
      createdAt,
      updatedAt: createdAt,
    };
  });
}

export function loadTasks(fallbackTasks: Task[]): LoadTasksResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return {
        tasks: fallbackTasks,
        migrated: false,
        error: null,
      };
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      throw new Error('Invalid storage format');
    }

    if (
      parsed.schemaVersion === SCHEMA_VERSION &&
      Array.isArray(parsed.tasks)
    ) {
      if (!parsed.tasks.every(isValidTask)) {
        throw new Error('Invalid task data');
      }

      return {
        tasks: parsed.tasks,
        migrated: false,
        error: null,
      };
    }

    if (parsed.schemaVersion === 1 && Array.isArray(parsed.tasks)) {
      const legacyTasks = parsed.tasks;

      const validLegacyTasks = legacyTasks.every(
        (task): task is StoredTaskV1 =>
          isRecord(task) &&
          typeof task.id === 'string' &&
          typeof task.title === 'string' &&
          typeof task.status === 'string' &&
          (task.description === undefined ||
            typeof task.description === 'string') &&
          (task.assignee === undefined || typeof task.assignee === 'string') &&
          (task.createdAt === undefined || isValidDate(task.createdAt)),
      );

      if (!validLegacyTasks) {
        throw new Error('Invalid legacy task data');
      }

      return {
        tasks: migrateV1ToV2(legacyTasks),
        migrated: true,
        error: null,
      };
    }

    throw new Error('Unsupported storage version');
  } catch {
    return {
      tasks: fallbackTasks,
      migrated: false,
      error: 'Unable to read saved tasks. Showing default tasks.',
    };
  }
}

export function saveTasks(tasks: Task[]): string | null {
  try {
    const payload: StoredTasksV2 = {
      schemaVersion: 2,
      tasks,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    return null;
  } catch {
    return 'Unable to save tasks to browser storage.';
  }
}
