import type { Task } from '../types/task';

export const initialTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Design Login Page',
    description: 'Create a responsive login page.',
    status: 'backlog',
    priority: 'high',
    assignee: 'Developer A',
    tags: ['Frontend', 'UI'],
    createdAt: '2026-11-20T09:00:00.000Z',
    updatedAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: 'task-002',
    title: 'Implement Authentication',
    description: 'Build login and registration logic.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Developer B',
    tags: ['Authentication', 'React'],
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-21T08:00:00.000Z',
  },
  {
    id: 'task-003',
    title: 'Project Setup',
    description: 'Configure React, TypeScript and Tailwind.',
    status: 'done',
    priority: 'low',
    assignee: 'Developer A',
    tags: ['Setup'],
    createdAt: '2026-11-19T09:00:00.000Z',
    updatedAt: '2026-11-20T11:00:00.000Z',
  },
];
