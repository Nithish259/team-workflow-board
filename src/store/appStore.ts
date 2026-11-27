import { createAppStore } from './store';
import { setupTaskPersistence } from './taskPersistence';

export const store = createAppStore();

const stopPersistence = setupTaskPersistence(store);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopPersistence();
  });
}
