import type { TaskRepository } from '@/domain/ports/TaskRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { Clock } from '@/domain/ports/Clock';

/** Flips a subtask's completion. The whole parent task is rewritten because
 *  subtasks live inline on the task entity. */
export class ToggleSubtask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly history: HistoryBus,
    private readonly clock: Clock,
  ) {}

  execute(taskId: string, subtaskId: string): void {
    const before = this.tasks.findById(taskId);
    if (!before) return;

    const after = {
      ...before,
      subtasks: before.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s,
      ),
      updatedAt: this.clock.now(),
    };

    this.history.push({
      label: 'Toggle subtask',
      execute: () => this.tasks.save(after),
      undo: () => this.tasks.save(before),
    });
  }
}
