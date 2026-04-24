import type { Task } from '@/domain/entities/Task';
import type { TaskStatus } from '@/domain/value-objects/TaskStatus';

export function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const columns: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
  for (const task of tasks) columns[task.status].push(task);
  return columns;
}
