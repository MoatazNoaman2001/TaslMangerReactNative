import { useMemo } from 'react';
import { useTaskCache } from '@/data/persistence/MmkvTaskRepository';
import type { Task } from '@/domain/entities/Task';

export function useTasksByProject(projectId: string | undefined): Task[] {
  const tasks = useTaskCache((s) => s.tasks);
  return useMemo(() => {
    if (!projectId) return [];
    return tasks
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => a.position - b.position);
  }, [tasks, projectId]);
}
