import type { Task } from '@/domain/entities/Task';

export interface SubtaskProgress {
  completed: number;
  total: number;
  ratio: number;
}

export function subtaskProgress(task: Task | undefined): SubtaskProgress {
  const subtasks = task?.subtasks ?? [];
  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.completed).length;
  return { completed, total, ratio: total === 0 ? 0 : completed / total };
}
