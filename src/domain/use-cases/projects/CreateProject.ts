import type { Project } from '@/domain/entities/Project';
import type { ProjectRepository } from '@/domain/ports/ProjectRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { IdGenerator } from '@/domain/ports/IdGenerator';
import type { Clock } from '@/domain/ports/Clock';

export const PROJECT_COLORS = [
  '#FF6B35', '#C5F277', '#5EE7DF', '#FF3D77',
  '#8B5CF6', '#F5C518', '#3B82F6', '#10B981',
];

/**
 * Creates a project. If no colour is supplied, the next swatch in
 * `PROJECT_COLORS` is picked by index so adjacent new projects get distinct
 * accents instead of all being orange.
 */
export class CreateProject {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly history: HistoryBus,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  execute(name: string, color?: string): Project {
    const existing = this.projects.findAll().length;
    const resolvedColor =
      color ?? PROJECT_COLORS[existing % PROJECT_COLORS.length]!;
    const ts = this.clock.now();

    const project: Project = {
      id: this.ids.next(),
      name: name.trim(),
      color: resolvedColor,
      createdAt: ts,
      updatedAt: ts,
    };

    this.history.push({
      label: `Create project "${project.name}"`,
      execute: () => this.projects.save(project),
      undo: () => this.projects.remove(project.id),
    });
    return project;
  }
}
