import type { ProjectRepository } from '@/domain/ports/ProjectRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { Clock } from '@/domain/ports/Clock';

/**
 * Name-only edit. Kept separate from {@link UpdateProject} because the menu
 * sometimes wants a single-purpose action (rename) without offering the
 * colour picker.
 */
export class RenameProject {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly history: HistoryBus,
    private readonly clock: Clock,
  ) {}

  execute(id: string, name: string): void {
    const before = this.projects.findById(id);
    const nextName = name.trim();
    if (!before || before.name === nextName) return;

    const after = { ...before, name: nextName, updatedAt: this.clock.now() };

    this.history.push({
      label: `Rename "${before.name}" to "${nextName}"`,
      execute: () => this.projects.save(after),
      undo: () => this.projects.save(before),
    });
  }
}
