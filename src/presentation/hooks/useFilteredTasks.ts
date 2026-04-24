import { useMemo } from 'react';
import type { Task } from '@/domain/entities/Task';
import { filterTasks, type TaskFilters } from '@/domain/queries/filterTasks';
import { useTasksByProject } from './useTasksByProject';

export function useFilteredTasks(
  projectId: string | undefined,
  query: string,
  filters: TaskFilters = {},
): Task[] {
  const tasks = useTasksByProject(projectId);
  return useMemo(
    () => filterTasks(tasks, query, filters),
    [tasks, query, filters.status, filters.priority],
  );
}
