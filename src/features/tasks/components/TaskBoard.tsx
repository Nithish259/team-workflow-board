import { useCallback, useMemo, useState } from 'react';

import Button from '../../../components/ui/Button/Button';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Toast, type ToastMessage } from '../../../components/ui/Toast/Toast';

import { useTaskFilters } from '../../../hooks/useTaskFilters';
import { useTasks } from '../../../hooks/useTasks';

import { TaskFiltersBar } from './TaskFiltersBar';
import { TaskColumn } from './TaskColumn';
import { TaskForm } from './TaskForm';

import type { Task, TaskInput, TaskStatus } from '../../../types/task';

import { Plus } from 'lucide-react';

const columns: {
  id: TaskStatus;
  title: string;
}[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export function TaskBoard() {
  const {
    tasks,
    storageError,
    migrationNotice,
    dismissMigrationNotice,
    createTask,
    updateTask,
    changeTaskStatus,
  } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isFormDirty, setIsFormDirty] = useState(false);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const { filters, updateFilters } = useTaskFilters();

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  function showToast(message: string) {
    setToast({
      id: crypto.randomUUID(),
      message,
      variant: 'success',
    });
  }

  function openCreateModal() {
    setEditingTask(null);
    setIsFormDirty(false);
    setIsModalOpen(true);
  }

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormDirty(false);
    setIsModalOpen(true);
  }, []);

  function closeModal(force = false) {
    if (!force && isFormDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Discard them?',
      );

      if (!confirmed) return;
    }

    setIsModalOpen(false);
    setEditingTask(null);
    setIsFormDirty(false);
  }

  function handleSaveTask(data: TaskInput) {
    if (editingTask) {
      updateTask(editingTask.id, data);
      showToast('Task updated successfully!');
    } else {
      createTask(data);
      showToast('Task created successfully!');
    }

    closeModal(true);
  }

  const handleStatusChange = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      changeTaskStatus(taskId, newStatus);

      setToast({
        id: crypto.randomUUID(),
        message: 'Task status updated!',
        variant: 'success',
      });
    },
    [changeTaskStatus],
  );

  const filteredTasks = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    const priorityOrder = {
      low: 1,
      medium: 2,
      high: 3,
    };

    const matchingTasks = tasks.filter((task) => {
      const matchesStatus = filters.statuses.includes(task.status);

      const matchesPriority =
        filters.priority === 'all' || task.priority === filters.priority;

      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm);

      return matchesStatus && matchesPriority && matchesSearch;
    });

    
return matchingTasks.sort((a, b) => {
  const comparison =
    filters.sortBy === 'priority'
      ? priorityOrder[a.priority] - priorityOrder[b.priority]
      : new Date(a[filters.sortBy]).getTime() -
        new Date(b[filters.sortBy]).getTime();

  return filters.sortDirection === 'asc' ? comparison : -comparison;
});
  }, [tasks, filters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreateModal} className="px-1">
          <Plus /> Create Task
        </Button>
      </div>

      {storageError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <strong>Storage warning:</strong> {storageError}
        </div>
      )}

      <TaskFiltersBar filters={filters} onChange={updateFilters} />

      <p className="text-sm text-slate-500">
        Drag tasks using their handles to move them between columns, or use the
        status dropdown.
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === column.id,
          );

          const hasUnfilteredTasks = tasks.some(
            (task) => task.status === column.id,
          );

          return (
            <TaskColumn
              key={column.id}
              status={column.id}
              title={column.title}
              tasks={columnTasks}
              hasUnfilteredTasks={hasUnfilteredTasks}
              onEdit={openEditModal}
              onStatusChange={handleStatusChange}
            />
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => closeModal()}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        {isModalOpen && (
          <TaskForm
            key={editingTask?.id ?? 'new-task'}
            task={editingTask}
            onSubmit={handleSaveTask}
            onCancel={() => closeModal()}
            onDirtyChange={setIsFormDirty}
          />
        )}
      </Modal>

      <Toast
        toast={
          migrationNotice
            ? {
                id: 'migration-complete',
                message: 'Your saved tasks were upgraded to the latest format.',
                variant: 'info',
              }
            : toast
        }
        onClose={migrationNotice ? dismissMigrationNotice : closeToast}
      />
    </div>
  );
}
