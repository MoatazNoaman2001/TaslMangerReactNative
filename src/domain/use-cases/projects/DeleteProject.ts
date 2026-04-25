import type { ProjectRepository } from '@/domain/ports/ProjectRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';

/**
 * Removes a project. Tasks belonging to the project are not cascaded here —
 * they're filtered out at query time, which keeps undo simple (the project
 * row alone is enough to restore on undo).
 */
export class DeleteProject {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly history: HistoryBus,
  ) {}

  execute(id: string): void {
    const before = this.projects.findById(id);
    if (!before) return;

    this.history.push({
      label: `Delete project "${before.name}"`,
      execute: () => this.projects.remove(id),
      undo: () => this.projects.save(before),
    });
  }
}
