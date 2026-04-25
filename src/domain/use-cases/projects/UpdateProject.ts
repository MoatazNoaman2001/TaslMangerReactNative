import type { ProjectRepository } from '@/domain/ports/ProjectRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { Clock } from '@/domain/ports/Clock';

export interface UpdateProjectPatch {
  name?: string;
  color?: string;
}

/**
 * Combined edit (name + colour). Returns early when the patch produces no
 * effective change so that no-op edits never enter the undo stack.
 */
export class UpdateProject {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly history: HistoryBus,
    private readonly clock: Clock,
  ) {}

  execute(id: string, patch: UpdateProjectPatch): void {
    const before = this.projects.findById(id);
    if (!before) return;

    const next = {
      ...before,
      ...(patch.name != null ? { name: patch.name.trim() } : {}),
      ...(patch.color != null ? { color: patch.color } : {}),
      updatedAt: this.clock.now(),
    };

    if (next.name === before.name && next.color === before.color) return;

    this.history.push({
      label: `Edit project "${before.name}"`,
      execute: () => this.projects.save(next),
      undo: () => this.projects.save(before),
    });
  }
}
