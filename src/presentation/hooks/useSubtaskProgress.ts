import { useMemo } from 'react';
import { subtaskProgress, type SubtaskProgress } from '@/domain/queries/subtaskProgress';
import { useTask } from './useTask';

export function useSubtaskProgress(taskId: string | undefined): SubtaskProgress {
  const task = useTask(taskId);
  return useMemo(() => subtaskProgress(task), [task?.subtasks]);
}
