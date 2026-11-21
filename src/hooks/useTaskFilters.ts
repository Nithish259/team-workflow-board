import { useEffect, useState } from 'react';

import type { TaskFilters, SortField, SortDirection } from '../types/filters';

import { DEFAULT_FILTERS } from '../types/filters';

import type { TaskPriority, TaskStatus } from '../types/task';

const validStatuses: TaskStatus[] = ['backlog', 'in-progress', 'done'];

const validPriorities: TaskPriority[] = ['low', 'medium', 'high'];

const validSortFields: SortField[] = ['createdAt', 'updatedAt', 'priority'];

function readFiltersFromUrl(): TaskFilters {
  const params = new URLSearchParams(window.location.search);

  const search = params.get('search') ?? '';

  const statusParam = params.get('status');

  const statuses =
    statusParam === null
      ? DEFAULT_FILTERS.statuses
      : statusParam
          .split(',')
          .filter((value): value is TaskStatus =>
            validStatuses.includes(value as TaskStatus),
          );

  const priorityParam = params.get('priority');

  const priority: TaskFilters['priority'] = validPriorities.includes(
    priorityParam as TaskPriority,
  )
    ? (priorityParam as TaskPriority)
    : 'all';

  const sortParam = params.get('sortBy');

  const sortBy: SortField = validSortFields.includes(sortParam as SortField)
    ? (sortParam as SortField)
    : DEFAULT_FILTERS.sortBy;

  const directionParam = params.get('direction');

  const sortDirection: SortDirection =
    directionParam === 'asc' || directionParam === 'desc'
      ? directionParam
      : DEFAULT_FILTERS.sortDirection;

  return {
    search,
    statuses,
    priority,
    sortBy,
    sortDirection,
  };
}

function writeFiltersToUrl(filters: TaskFilters) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }

  const allStatusesSelected =
    filters.statuses.length === DEFAULT_FILTERS.statuses.length &&
    DEFAULT_FILTERS.statuses.every((status) =>
      filters.statuses.includes(status),
    );

  if (!allStatusesSelected) {
    params.set('status', filters.statuses.join(','));
  }

  if (filters.priority !== 'all') {
    params.set('priority', filters.priority);
  }

  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    params.set('sortBy', filters.sortBy);
  }

  if (filters.sortDirection !== DEFAULT_FILTERS.sortDirection) {
    params.set('direction', filters.sortDirection);
  }

  const query = params.toString();

  const newUrl =
    window.location.pathname +
    (query ? `?${query}` : '') +
    window.location.hash;

  window.history.replaceState(null, '', newUrl);
}

export function useTaskFilters() {
  const [filters, setFilters] = useState<TaskFilters>(readFiltersFromUrl);

  useEffect(() => {
    const handlePopState = () => {
      setFilters(readFiltersFromUrl());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function updateFilters(updates: Partial<TaskFilters>) {
    const next = { ...filters, ...updates };

    writeFiltersToUrl(next);
    setFilters(next);
  }

  return { filters, updateFilters };
}
