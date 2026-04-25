import type { TaskRepository } from '@/domain/ports/TaskRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { Clock } from '@/domain/ports/Clock';
import type { TaskPriority } from '@/domain/value-objects/TaskPriority';

export interface UpdateTaskPatch {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: number | null;
}

/**
 * Patches editable fields on a task (title, description, priority, due date).
 * Captures the full before/after snapshot for undo so partial-field edits
 * can still be cleanly reversed.
 */
export class UpdateTaskDetails {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly history: HistoryBus,
    private readonly clock: Clock,
  ) {}

  execute(id: string, patch: UpdateTaskPatch): void {
    const before = this.tasks.findById(id);
    if (!before) return;

    const after = { ...before, ...patch, updatedAt: this.clock.now() };

    this.history.push({
      label: `Edit task "${before.title}"`,
      execute: () => this.tasks.save(after),
      undo: () => this.tasks.save(before),
    });
  }
}
