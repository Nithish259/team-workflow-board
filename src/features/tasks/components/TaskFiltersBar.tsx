import { TextInput } from '../../../components/ui/TextInput/TextInput';
import { Select } from '../../../components/ui/Select/Select';

import type { TaskFilters } from '../../../types/filters';
import type { TaskStatus } from '../../../types/task';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onChange: (updates: Partial<TaskFilters>) => void;
}

const statusOptions: {
  value: TaskStatus;
  label: string;
}[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskFiltersBar({ filters, onChange }: TaskFiltersBarProps) {
  function toggleStatus(status: TaskStatus) {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter((item) => item !== status)
      : [...filters.statuses, status];

    onChange({ statuses });
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextInput
          label="Search Tasks"
          placeholder="Search title or description..."
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />

        <Select
          label="Priority"
          value={filters.priority}
          onChange={(event) =>
            onChange({
              priority: event.target.value as TaskFilters['priority'],
            })
          }
          options={[
            { label: 'All Priorities', value: 'all' },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ]}
        />

        <Select
          label="Sort By"
          value={filters.sortBy}
          onChange={(event) =>
            onChange({
              sortBy: event.target.value as TaskFilters['sortBy'],
            })
          }
          options={[
            { label: 'Created Date', value: 'createdAt' },
            { label: 'Updated Date', value: 'updatedAt' },
            { label: 'Priority', value: 'priority' },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Status:</span>

        {statusOptions.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={filters.statuses.includes(option.value)}
              onChange={() => toggleStatus(option.value)}
              className="h-4 w-4 accent-blue-600"
            />

            {option.label}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          label="Sort Direction"
          value={filters.sortDirection}
          onChange={(event) =>
            onChange({
              sortDirection: event.target.value as TaskFilters['sortDirection'],
            })
          }
          options={[
            { label: 'Descending', value: 'desc' },
            { label: 'Ascending', value: 'asc' },
          ]}
        />

        <button
          type="button"
          onClick={() =>
            onChange({
              search: '',
              statuses: ['backlog', 'in-progress', 'done'],
              priority: 'all',
              sortBy: 'updatedAt',
              sortDirection: 'desc',
            })
          }
          className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
