export const TASK_PRIORITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
} as const;

export const TASK_PRIORITIES = [
  TASK_PRIORITY.low,
  TASK_PRIORITY.medium,
  TASK_PRIORITY.high,
] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];