import type { TaskRepository } from '@/domain/ports/TaskRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { Clock } from '@/domain/ports/Clock';
import type { TaskStatus } from '@/domain/value-objects/TaskStatus';
import { canTransitionTask } from '@/domain/entities/Task';

const LABEL_FOR_STATUS: Record<TaskStatus, string> = {
  todo: 'Reopen',
  in_progress: 'Start',
  done: 'Complete',
};

export class ChangeTaskStatus {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly history: HistoryBus,
    private readonly clock: Clock,
  ) {}

  execute(id: string, to: TaskStatus): boolean {
    const before = this.tasks.findById(id);
    if (!before) return false;
    if (!canTransitionTask(before.status, to)) return false;

    const now = this.clock.now();
    const after = {
      ...before,
      status: to,
      completedAt: to === 'done' ? now : null,
      updatedAt: now,
    };

    this.history.push({
      label: `${LABEL_FOR_STATUS[to]} "${before.title}"`,
      execute: () => this.tasks.save(after),
      undo: () => this.tasks.save(before),
    });
    return true;
  }
}
