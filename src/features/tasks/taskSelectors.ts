import type { RootState } from '../../store/store';

export const selectTasks = (state: RootState) => state.tasks.tasks;

export const selectStorageError = (state: RootState) =>
  state.tasks.storageError;

export const selectMigrationNotice = (state: RootState) =>
  state.tasks.migrationNotice;

export const selectCanPersist = (state: RootState) => state.tasks.canPersist;
