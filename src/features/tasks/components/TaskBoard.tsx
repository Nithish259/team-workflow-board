import { useCallback, useState } from 'react';

import Button from '../../../components/ui/Button/Button';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Toast, type ToastMessage } from '../../../components/ui/Toast/Toast';
import { useMemo } from 'react';
import { useTaskFilters } from '../../../hooks/useTaskFilters';
import { TaskFiltersBar } from './TaskFiltersBar';
// import { initialTasks } from '../../../data/initialTasks';
import type { Task, TaskInput, TaskStatus } from '../../../types/task';

import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { useTasks } from '../../../hooks/useTasks';
import { Plus } from 'lucide-react';

const columns: { id: TaskStatus; title: string }[] = [
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

  function openEditModal(task: Task) {
    setEditingTask(task);
    setIsFormDirty(false);
    setIsModalOpen(true);
  }

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

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task || task.status === newStatus) return;

    changeTaskStatus(taskId, newStatus);
    showToast('Task status updated!');
  }

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
      let comparison = 0;

      if (filters.sortBy === 'priority') {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        comparison =
          new Date(a[filters.sortBy]).getTime() -
          new Date(b[filters.sortBy]).getTime();
      }

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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === column.id,
          );

          return (
            <section
              key={column.id}
              aria-label={`${column.title} tasks`}
              className="min-h-80 rounded-xl bg-slate-100 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">{column.title}</h2>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                    {tasks.some((task) => task.status === column.id)
                      ? 'No tasks match your filters'
                      : 'No tasks in this column'}
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditModal}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </section>
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
