import type { ReactElement } from 'react';

import { render } from '@testing-library/react';

import { DndProvider } from 'react-dnd';

import { TestBackend, type TestBackendImpl } from 'react-dnd-test-backend';

export function renderWithDnd(ui: ReactElement) {
  let backend: TestBackendImpl | undefined;

  const result = render(
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
    </DndProvider>,
  );

  if (!backend) {
    throw new Error('React DnD test backend was not initialized.');
  }

  return {
    ...result,
    backend,
  };
}
