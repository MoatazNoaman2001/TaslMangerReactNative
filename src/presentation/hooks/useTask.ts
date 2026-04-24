import { useTaskCache } from '@/data/persistence/MmkvTaskRepository';
import type { Task } from '@/domain/entities/Task';

export function useTask(id: string | undefined): Task | undefined {
  return useTaskCache((s) =>
    id ? s.tasks.find((t) => t.id === id) : undefined,
  );
}
