import { Badge } from '../../../components/ui/Badge/Badge';
import { Card } from '../../../components/ui/Card/Card';
import type { Task, TaskPriority, TaskStatus } from '../../../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
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

export function TaskCard({ task, onEdit, onStatusChange }: TaskCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{task.title}</h3>

        <Badge variant={priorityVariants[task.priority]}>{task.priority}</Badge>
      </div>

      <p className="line-clamp-2 text-sm text-slate-500">{task.description}</p>

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
  );
}
