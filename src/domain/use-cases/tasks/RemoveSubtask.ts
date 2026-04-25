import type { TaskRepository } from '@/domain/ports/TaskRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { Clock } from '@/domain/ports/Clock';

/** Removes one subtask while preserving the order of the rest. */
export class RemoveSubtask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly history: HistoryBus,
    private readonly clock: Clock,
  ) {}

  execute(taskId: string, subtaskId: string): void {
    const before = this.tasks.findById(taskId);
    if (!before) return;
    const removed = before.subtasks.find((s) => s.id === subtaskId);
    if (!removed) return;

    const after = {
      ...before,
      subtasks: before.subtasks.filter((s) => s.id !== subtaskId),
      updatedAt: this.clock.now(),
    };

    this.history.push({
      label: `Remove subtask "${removed.title}"`,
      execute: () => this.tasks.save(after),
      undo: () => this.tasks.save(before),
    });
  }
}
