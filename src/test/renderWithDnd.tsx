import type { ReactElement } from 'react';

import { cleanup, render } from '@testing-library/react';

import { afterEach } from 'vitest';

import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';

import { TestBackend, type TestBackendImpl } from 'react-dnd-test-backend';

import { createAppStore } from '../store/store';

import { setupTaskPersistence } from '../store/taskPersistence';

const activeSubscriptions = new Set<() => void>();

afterEach(() => {
  for (const stop of activeSubscriptions) {
    stop();
  }

  activeSubscriptions.clear();

  cleanup();
});

export function renderWithDnd(ui: ReactElement) {
  let backend: TestBackendImpl | undefined;

  const store = createAppStore();

  const unsubscribe = setupTaskPersistence(store);

  activeSubscriptions.add(unsubscribe);

  function stopPersistence() {
    unsubscribe();

    activeSubscriptions.delete(unsubscribe);
  }

  let result: ReturnType<typeof render>;

  try {
    result = render(
      <Provider store={store}>
        <DndProvider
          backend={TestBackend}
          context={{}}
          options={{
            onCreate: (instance: TestBackendImpl) => {
              backend = instance;
            },
          }}
        >
          {ui}
        </DndProvider>
      </Provider>,
    );
  } catch (error) {
    stopPersistence();
    throw error;
  }

  if (!backend) {
    stopPersistence();

    result.unmount();

    throw new Error('React DnD test backend was not initialized.');
  }

  return {
    ...result,
    backend,
    store,
    stopPersistence,

    unmount: () => {
      stopPersistence();

      result.unmount();
    },
  };
}
