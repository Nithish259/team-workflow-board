import type { TaskPriority, TaskStatus } from './task';

export type SortField = 'createdAt' | 'updatedAt' | 'priority';

export type SortDirection = 'asc' | 'desc';

export interface TaskFilters {
  search: string;
  statuses: TaskStatus[];
  priority: TaskPriority | 'all';
  sortBy: SortField;
  sortDirection: SortDirection;
}

export const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  statuses: ['backlog', 'in-progress', 'done'],
  priority: 'all',
  sortBy: 'updatedAt',
  sortDirection: 'desc',
};
