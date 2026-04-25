export const TASK_STATUS = {
  todo: 'todo',
  inProgress: 'in_progress',
  done: 'done',
} as const;

export const TASK_STATUSES = [
  TASK_STATUS.todo,
  TASK_STATUS.inProgress,
  TASK_STATUS.done,
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];