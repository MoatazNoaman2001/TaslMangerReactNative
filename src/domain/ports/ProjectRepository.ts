import type { Project } from '@/domain/entities/Project';

/**
 * Persistence boundary for projects. Implemented by `MmkvProjectRepository`.
 */
export interface ProjectRepository {
  findById(id: string): Project | undefined;
  findAll(): Project[];
  save(project: Project): void;
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
}
