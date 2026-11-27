import { useCallback } from 'react';

import type { Task, TaskInput, TaskStatus } from '../types/task';

import {
  taskCreated,
  taskUpdated,
  taskStatusChanged,
  migrationNoticeDismissed,
} from '../features/tasks/taskSlice';

import {
  selectTasks,
  selectStorageError,
  selectMigrationNotice,
} from '../features/tasks/taskSelectors';
import { useAppDispatch, useAppSelector } from '../store/hook';

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
  const dispatch = useAppDispatch();

  const tasks = useAppSelector(selectTasks);

  const storageError = useAppSelector(selectStorageError);

  const migrationNotice = useAppSelector(selectMigrationNotice);

  const dismissMigrationNotice = useCallback(() => {
    dispatch(migrationNoticeDismissed());
  }, [dispatch]);

  const createTask = useCallback(
    (data: TaskInput) => {
      dispatch(taskCreated(data));
    },
    [dispatch],
  );

  const updateTask = useCallback(
    (id: string, data: TaskInput) => {
      dispatch(taskUpdated(id, data));
    },
    [dispatch],
  );

  const changeTaskStatus = useCallback(
    (id: string, status: TaskStatus) => {
      dispatch(taskStatusChanged(id, status));
    },
    [dispatch],
  );

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
