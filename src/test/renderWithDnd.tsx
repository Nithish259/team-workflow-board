import type { ReactElement } from 'react';

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { DndProvider } from 'react-dnd';

import { TestBackend, type TestBackendImpl } from 'react-dnd-test-backend';

import { createAppStore } from '../store/store';
import { setupTaskPersistence } from '../store/taskPersistence';

export function renderWithDnd(ui: ReactElement) {
  let backend: TestBackendImpl | undefined;

  const store = createAppStore();

  const stopPersistence = setupTaskPersistence(store);

  const result = render(
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

  if (!backend) {
    result.unmount();
    stopPersistence();

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
