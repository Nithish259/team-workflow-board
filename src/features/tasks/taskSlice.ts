import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Task, TaskInput, TaskStatus } from '../../types/task';

export interface TasksState {
  tasks: Task[];
  storageError: string | null;
  migrationNotice: boolean;
  canPersist: boolean;
}

interface UpdateTaskPayload {
  id: string;
  data: TaskInput;
  updatedAt: string;
}

interface ChangeTaskStatusPayload {
  id: string;
  status: TaskStatus;
  updatedAt: string;
}

const initialState: TasksState = {
  tasks: [],
  storageError: null,
  migrationNotice: false,
  canPersist: true,
};

const tasksSlice = createSlice({
  name: 'tasks',

  initialState,

  reducers: {
    taskCreated: {
      reducer(state, action: PayloadAction<Task>) {
        state.tasks.unshift(action.payload);
      },

      prepare(data: TaskInput) {
        const now = new Date().toISOString();

        const task: Task = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };

        return {
          payload: task,
        };
      },
    },

    taskUpdated: {
      reducer(state, action: PayloadAction<UpdateTaskPayload>) {
        const { id, data, updatedAt } = action.payload;

        const task = state.tasks.find((task) => task.id === id);

        if (!task) return;

        Object.assign(task, data, { updatedAt });
      },

      prepare(id: string, data: TaskInput) {
        return {
          payload: {
            id,
            data,
            updatedAt: new Date().toISOString(),
          },
        };
      },
    },

    taskStatusChanged: {
      reducer(state, action: PayloadAction<ChangeTaskStatusPayload>) {
        const { id, status, updatedAt } = action.payload;

        const task = state.tasks.find((task) => task.id === id);

        if (!task || task.status === status) return;

        task.status = status;
        task.updatedAt = updatedAt;
      },

      prepare(id: string, status: TaskStatus) {
        return {
          payload: {
            id,
            status,
            updatedAt: new Date().toISOString(),
          },
        };
      },
    },

    migrationNoticeDismissed(state) {
      state.migrationNotice = false;
    },

    storageErrorChanged(state, action: PayloadAction<string | null>) {
      state.storageError = action.payload;
    },
  },
});

export const {
  taskCreated,
  taskUpdated,
  taskStatusChanged,
  migrationNoticeDismissed,
  storageErrorChanged,
} = tasksSlice.actions;

export default tasksSlice.reducer;
