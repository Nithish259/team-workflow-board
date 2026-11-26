import { memo, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import type { Identifier } from 'dnd-core';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Card } from '../../../components/ui/Card/Card';

import type { Task, TaskPriority, TaskStatus } from '../../../types/task';

import { DND_ITEM_TYPES, type TaskDragItem } from '../types/taskDnd';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

interface DragCollectedProps {
  isDragging: boolean;
  handlerId: Identifier | null;
}

const priorityVariants: Record<TaskPriority, 'success' | 'warning' | 'danger'> =
  {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  };

function formatRelativeTime(dateString: string): string {
  const elapsed = Math.max(0, Date.now() - new Date(dateString).getTime());

  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function TaskCard({ task, onEdit, onStatusChange }: TaskCardProps) {
  const [{ isDragging, handlerId }, drag, preview] = useDrag<
    TaskDragItem,
    void,
    DragCollectedProps
  >(
    () => ({
      type: DND_ITEM_TYPES.TASK,

      item: {
        id: task.id,
        status: task.status,
      },

      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        handlerId: monitor.getHandlerId(),
      }),
    }),
    [task.id, task.status],
  );

  const dragRef = useCallback(
    (node: HTMLSpanElement | null) => {
      drag(node);
    },
    [drag],
  );

  const previewRef = useCallback(
    (node: HTMLDivElement | null) => {
      preview(node);
    },
    [preview],
  );

  return (
    <div
      ref={previewRef}
      data-drag-handler-id={handlerId?.toString()}
      className={`transition-opacity duration-150 ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <span
              ref={dragRef}
              title="Drag to move task"
              aria-hidden="true"
              className="shrink-0 cursor-grab rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
            >
              <GripVertical size={18} />
            </span>

            <h3 className="wrap-break-word font-semibold text-slate-900">
              {task.title}
            </h3>
          </div>

          <Badge variant={priorityVariants[task.priority]}>
            {task.priority}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-slate-500">
          {task.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span>{task.assignee || 'Unassigned'}</span>

          <span>{formatRelativeTime(task.updatedAt)}</span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            Edit
          </button>

          <select
            aria-label={`Change status of ${task.title}`}
            value={task.status}
            onChange={(event) =>
              onStatusChange(task.id, event.target.value as TaskStatus)
            }
            className="max-w-36 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            <option value="backlog">Backlog</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </Card>
    </div>
  );
}

export const MemoizedTaskCard = memo(TaskCard);
