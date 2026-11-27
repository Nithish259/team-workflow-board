import { storageErrorChanged } from '../features/tasks/taskSlice';
import { saveTasks } from '../utils/taskStorage';

import type { AppStore } from './store';

export function setupTaskPersistence(store: AppStore) {
  let previousTasks = store.getState().tasks.tasks;

  function persistTasks() {
    const { tasks, canPersist, storageError } = store.getState().tasks;

    if (!canPersist) return;

    const error = saveTasks(tasks);

    if (error !== storageError) {
      store.dispatch(storageErrorChanged(error));
    }
  }

  const unsubscribe = store.subscribe(() => {
    const currentTasks = store.getState().tasks.tasks;

    if (currentTasks === previousTasks) return;

    previousTasks = currentTasks;

    persistTasks();
  });

  // Persist initial tasks and migrated storage data.
  persistTasks();

  return unsubscribe;
}
