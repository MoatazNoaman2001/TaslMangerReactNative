import type { TaskRepository } from '@/domain/ports/TaskRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';

export class DeleteTask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly history: HistoryBus,
  ) {}

  execute(id: string): void {
    const task = this.tasks.findById(id);
    if (!task) return;

    this.history.push({
      label: `Delete task "${task.title}"`,
      execute: () => this.tasks.remove(id),
      undo: () => this.tasks.save(task),
    });
  }
}
