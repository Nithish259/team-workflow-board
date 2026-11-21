import { useCallback, useEffect, useState } from 'react';

import { initialTasks } from '../data/initialTasks';
import type { Task, TaskInput, TaskStatus } from '../types/task';
import {
  loadTasks,
  saveTasks,
  type LoadTasksResult,
} from '../utils/taskStorage';

interface UseTasksResult {
  tasks: Task[];
  storageError: string | null;
  migrationNotice: boolean;
  dismissMigrationNotice: () => void;
  createTask: (data: TaskInput) => void;
  updateTask: (id: string, data: TaskInput) => void;
  changeTaskStatus: (id: string, status: TaskStatus) => void;
}

export function useTasks(): UseTasksResult {
  const [initialLoad] = useState<LoadTasksResult>(() =>
    loadTasks(initialTasks),
  );

  const [tasks, setTasks] = useState<Task[]>(initialLoad.tasks);

  const [storageError, setStorageError] = useState<string | null>(
    initialLoad.error,
  );

  const [migrationNotice, setMigrationNotice] = useState(initialLoad.migrated);

  // Prevent corrupted/unsupported stored data from being overwritten.
  const [canPersist] = useState(initialLoad.error === null);

  useEffect(() => {
    if (!canPersist) return;

    const error = saveTasks(tasks);

    if (error) {
      setStorageError(error);
    } else {
      setStorageError(null);
    }
  }, [tasks, canPersist]);

  const dismissMigrationNotice = useCallback(() => {
    setMigrationNotice(false);
  }, []);

  const createTask = useCallback((data: TaskInput) => {
    const now = new Date().toISOString();

    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    setTasks((previous) => [newTask, ...previous]);
  }, []);

  const updateTask = useCallback((id: string, data: TaskInput) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? {
              ...task,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  }, []);

  const changeTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id && task.status !== status
          ? {
              ...task,
              status,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  }, []);

  return {
    tasks,
    storageError,
    migrationNotice,
    dismissMigrationNotice,
    createTask,
    updateTask,
    changeTaskStatus,
  };
}
