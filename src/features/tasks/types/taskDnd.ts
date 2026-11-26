import type { TaskStatus } from '../../../types/task';

export const DND_ITEM_TYPES = {
  TASK: 'TASK',
} as const;

export interface TaskDragItem {
  id: string;
  status: TaskStatus;
}
