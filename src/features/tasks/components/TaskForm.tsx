import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import Button from '../../../components/ui/Button/Button';
import { TextInput } from '../../../components/ui/TextInput/TextInput';
import { TextArea } from '../../../components/ui/TextArea/TextArea';
import { Select } from '../../../components/ui/Select/Select';

import type { Task, TaskInput } from '../../../types/task';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskInput) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

function getInitialValues(task?: Task | null): TaskInput {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'backlog',
    priority: task?.priority ?? 'medium',
    assignee: task?.assignee ?? '',
    tags: task?.tags ?? [],
  };
}

export function TaskForm({
  task,
  onSubmit,
  onCancel,
  onDirtyChange,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskInput>(() =>
    getInitialValues(task),
  );

  const [tagsInput, setTagsInput] = useState(() => task?.tags.join(', ') ?? '');

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const initialValues = getInitialValues(task);

  const isDirty =
    JSON.stringify(formData) !== JSON.stringify(initialValues) ||
    tagsInput !== (task?.tags.join(', ') ?? '');

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function updateField<K extends keyof TaskInput>(
    field: K,
    value: TaskInput[K],
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be 100 characters or fewer.';
    }

    if (formData.description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or fewer.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const tags = [
      ...new Set(
        tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ];

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignee: formData.assignee.trim(),
      tags,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <TextInput
        label="Task Title"
        required
        maxLength={101}
        value={formData.title}
        error={errors.title}
        placeholder="Enter task title"
        onChange={(event) => {
          updateField('title', event.target.value);
          setErrors((previous) => ({
            ...previous,
            title: undefined,
          }));
        }}
      />

      <TextArea
        label="Description"
        rows={4}
        value={formData.description}
        error={errors.description}
        placeholder="Describe the task..."
        onChange={(event) => {
          updateField('description', event.target.value);
          setErrors((previous) => ({
            ...previous,
            description: undefined,
          }));
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Status"
          value={formData.status}
          onChange={(event) =>
            updateField('status', event.target.value as TaskInput['status'])
          }
          options={[
            { label: 'Backlog', value: 'backlog' },
            { label: 'In Progress', value: 'in-progress' },
            { label: 'Done', value: 'done' },
          ]}
        />

        <Select
          label="Priority"
          value={formData.priority}
          onChange={(event) =>
            updateField('priority', event.target.value as TaskInput['priority'])
          }
          options={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ]}
        />
      </div>

      <TextInput
        label="Assignee"
        value={formData.assignee}
        placeholder="Enter assignee name"
        onChange={(event) => updateField('assignee', event.target.value)}
      />

      <TextInput
        label="Tags"
        value={tagsInput}
        placeholder="Frontend, Bug, Urgent"
        helperText="Separate multiple tags with commas."
        onChange={(event) => setTagsInput(event.target.value)}
      />

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{task ? 'Save Changes' : 'Create Task'}</Button>
      </div>
    </form>
  );
}
