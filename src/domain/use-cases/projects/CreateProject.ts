import type { Project } from '@/domain/entities/Project';
import type { ProjectRepository } from '@/domain/ports/ProjectRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { IdGenerator } from '@/domain/ports/IdGenerator';
import type { Clock } from '@/domain/ports/Clock';

const PROJECT_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444',
  '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6',
];

export class CreateProject {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly history: HistoryBus,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  execute(name: string): Project {
    const existing = this.projects.findAll().length;
    const color = PROJECT_COLORS[existing % PROJECT_COLORS.length]!;
    const ts = this.clock.now();

    const project: Project = {
      id: this.ids.next(),
      name: name.trim(),
      color,
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
