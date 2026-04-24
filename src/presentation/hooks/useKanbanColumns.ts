import { useMemo } from 'react';
import type { Task } from '@/domain/entities/Task';
import type { TaskStatus } from '@/domain/value-objects/TaskStatus';
import { groupByStatus } from '@/domain/queries/groupByStatus';
import { useTasksByProject } from './useTasksByProject';

export function useKanbanColumns(projectId: string | undefined): Record<TaskStatus, Task[]> {
  const tasks = useTasksByProject(projectId);
  return useMemo(() => groupByStatus(tasks), [tasks]);
}
