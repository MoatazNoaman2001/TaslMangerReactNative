import { useProjectCache } from '@/data/persistence/MmkvProjectRepository';
import type { Project } from '@/domain/entities/Project';

export function useProject(id: string | undefined): Project | undefined {
  return useProjectCache((s) =>
    id ? s.projects.find((p) => p.id === id) : undefined,
  );
}
