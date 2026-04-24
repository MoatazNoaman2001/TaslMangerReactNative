import type { Project } from '@/domain/entities/Project';

export interface ProjectRepository {
  findById(id: string): Project | undefined;
  findAll(): Project[];
  save(project: Project): void;
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
}
