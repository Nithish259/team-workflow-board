import { configureStore } from '@reduxjs/toolkit';

import { initialTasks } from '../data/initialTasks';

import tasksReducer, { type TasksState } from '../features/tasks/taskSlice';

import { loadTasks } from '../utils/taskStorage';

function getInitialTasksState(): TasksState {
  const result = loadTasks(initialTasks);

  return {
    tasks: result.tasks,
    storageError: result.error,
    migrationNotice: result.migrated,
    canPersist: result.error === null,
  };
}

export function createAppStore(preloadedTasksState?: TasksState) {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },

    preloadedState: {
      tasks: preloadedTasksState ?? getInitialTasksState(),
    },
  });
}

export type AppStore = ReturnType<typeof createAppStore>;

export type RootState = ReturnType<AppStore['getState']>;

export type AppDispatch = AppStore['dispatch'];
