import type { TaskStatus } from '@/domain/value-objects/TaskStatus';
import type { TaskPriority } from '@/domain/value-objects/TaskPriority';
import type { Subtask } from './Subtask';

/**
 * A single unit of work that lives inside a project.
 * `position` orders tasks within a column (`status`); `dueDate` and timestamps
 * are stored as Unix-ms so they survive JSON/MMKV round-trips losslessly.
 */
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

/**
 * Allowed status transitions. Currently every state can move to any other
 * state — kept as a table so a future workflow rule (e.g. "done is terminal
 * unless undone") can be enforced in one place.
 */
const VALID_TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  todo: ['in_progress', 'done'],
  in_progress: ['todo', 'done'],
  done: ['todo', 'in_progress'],
} as const;

export function canTransitionTask(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return false;
  return VALID_TRANSITIONS[from].includes(to);
}
