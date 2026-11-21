import { useCallback, useState } from 'react';

import Button from './components/ui/Button/Button';
import { Badge } from './components/ui/Badge/Badge';
import { Card } from './components/ui/Card/Card';
import { Modal } from './components/ui/Modal/Modal';
import {
  Toast,
  type ToastMessage,
  type ToastVariant,
} from './components/ui/Toast/Toast';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  function showToast(message: string, variant: ToastVariant) {
    setToast({
      id: crypto.randomUUID(),
      message,
      variant,
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Everquint Design System
        </h1>

        <p className="text-slate-500">
          Reusable components for our Team Workflow Board.
        </p>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Task Card Preview</h2>

          <h3 className="font-medium">Build Dashboard UI</h3>

          <p className="mt-2 text-sm text-slate-500">
            Implement the team workflow board interface.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="danger">High</Badge>
            <Badge variant="info">In Progress</Badge>
            <Badge variant="neutral">Frontend</Badge>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

          <Button
            variant="secondary"
            onClick={() => showToast('Task saved successfully!', 'success')}
          >
            Success Toast
          </Button>

          <Button
            variant="destructive"
            onClick={() => showToast('Unable to save task.', 'error')}
          >
            Error Toast
          </Button>

          <Button
            variant="secondary"
            onClick={() => showToast('Your data has been migrated.', 'info')}
          >
            Info Toast
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Task"
      >
        <p className="mb-5 text-sm text-slate-600">
          Our task creation form will appear here.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={() => {
              setIsModalOpen(false);
              showToast('Task saved successfully!', 'success');
            }}
          >
            Save Task
          </Button>
        </div>
      </Modal>

      <Toast toast={toast} onClose={closeToast} />
    </main>
  );
}

export default App;
