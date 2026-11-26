import { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import type { Identifier } from 'dnd-core';
import type { Task, TaskStatus } from '../../../types/task';

import { DND_ITEM_TYPES, type TaskDragItem } from '../types/taskDnd';

import { MemoizedTaskCard } from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  hasUnfilteredTasks: boolean;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

interface DropCollectedProps {
  isOver: boolean;
  canDrop: boolean;
  handlerId: Identifier | null;
}

export function TaskColumn({
  status,
  title,
  tasks,
  hasUnfilteredTasks,
  onEdit,
  onStatusChange,
}: TaskColumnProps) {
  const [{ isOver, canDrop, handlerId }, drop] = useDrop<
    TaskDragItem,
    void,
    DropCollectedProps
  >(
    () => ({
      accept: DND_ITEM_TYPES.TASK,

      canDrop: (item) => item.status !== status,

      drop: (item) => {
        onStatusChange(item.id, status);
      },

      collect: (monitor) => ({
        isOver: monitor.isOver({
          shallow: true,
        }),
        canDrop: monitor.canDrop(),
        handlerId: monitor.getHandlerId(),
      }),
    }),
    [status, onStatusChange],
  );

  const dropRef = useCallback(
    (node: HTMLElement | null) => {
      drop(node);
    },
    [drop],
  );

  const isActive = isOver && canDrop;

  const columnStyles = isActive
    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
    : canDrop
      ? 'border-blue-300 bg-slate-100'
      : 'border-transparent bg-slate-100';

  return (
    <section
      ref={dropRef}
      data-drop-handler-id={handlerId?.toString()}
      aria-label={`${title} tasks`}
      className={`min-h-80 rounded-xl border-2 p-4 transition-colors duration-150 ${columnStyles}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">{title}</h2>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
          {tasks.length}
        </span>
      </div>

      {isActive && (
        <p className="mb-3 rounded-lg border border-dashed border-blue-400 bg-blue-100 p-2 text-center text-xs font-medium text-blue-700">
          Drop here to move to {title}
        </p>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
            {hasUnfilteredTasks
              ? 'No tasks match your filters'
              : 'No tasks in this column'}
          </p>
        ) : (
          tasks.map((task) => (
            <MemoizedTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </section>
  );
}
