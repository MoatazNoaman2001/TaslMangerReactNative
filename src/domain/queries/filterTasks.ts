import type { Task } from '@/domain/entities/Task';
import type { TaskStatus } from '@/domain/value-objects/TaskStatus';
import type { TaskPriority } from '@/domain/value-objects/TaskPriority';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export function filterTasks(tasks: Task[], query: string, filters: TaskFilters = {}): Task[] {
  const q = query.trim().toLowerCase();
  return tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}
