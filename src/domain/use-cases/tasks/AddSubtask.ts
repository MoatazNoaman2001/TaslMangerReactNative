import type { TaskRepository } from '@/domain/ports/TaskRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { IdGenerator } from '@/domain/ports/IdGenerator';
import type { Clock } from '@/domain/ports/Clock';
import { createSubtask } from '@/domain/entities/Subtask';

/** Appends a subtask to a task. New subtasks always start uncompleted. */
export class AddSubtask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly history: HistoryBus,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  execute(taskId: string, title: string): void {
    const before = this.tasks.findById(taskId);
    if (!before) return;

    const now = this.clock.now();
    const subtask = createSubtask(this.ids.next(), title, now);
    const after = {
      ...before,
      subtasks: [...before.subtasks, subtask],
      updatedAt: now,
    };

    this.history.push({
      label: `Add subtask "${subtask.title}"`,
      execute: () => this.tasks.save(after),
      undo: () => this.tasks.save(before),
    });
  }
}
