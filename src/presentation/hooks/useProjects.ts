import { useProjectCache } from '@/data/persistence/MmkvProjectRepository';
import type { Project } from '@/domain/entities/Project';

export function useProjects(): Project[] {
  return useProjectCache((s) => s.projects);
}
