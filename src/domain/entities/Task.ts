import type { TaskStatus } from '@/domain/value-objects/TaskStatus';
import type { TaskPriority } from '@/domain/value-objects/TaskPriority';
import type { Subtask } from './Subtask';

export interface Task {
  readonly id: string;
  readonly projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: number | null;
  subtasks: Subtask[];
  position: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

const VALID_TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  todo: ['in_progress', 'done'],
  in_progress: ['todo', 'done'],
  done: ['todo', 'in_progress'],
} as const;

export function canTransitionTask(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return false;
  return VALID_TRANSITIONS[from].includes(to);
}
