import type { Task } from '@/domain/entities/Task';
import type { TaskRepository } from '@/domain/ports/TaskRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';

/**
 * Replaces a project's task order in one batch via `saveMany`, keeping the
 * write atomic so the kanban can never be observed mid-reorder.
 */
export class ReorderTasksInProject {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly history: HistoryBus,
  ) {}

  execute(projectId: string, nextProjectTasks: Task[], label = 'Reorder tasks'): void {
    const before = this.tasks.findByProject(projectId);

    this.history.push({
      label,
      execute: () => this.tasks.saveMany(nextProjectTasks),
      undo: () => this.tasks.saveMany(before),
    });
  }
}
