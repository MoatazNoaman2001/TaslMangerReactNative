import { create } from 'zustand';
import type { Project } from '@/domain/entities/Project';
import type { ProjectRepository } from '@/domain/ports/ProjectRepository';
import { readStorage, writeStorage, STORAGE_KEYS } from './mmkv';
import { StoredProjectsSchema } from './schemas';

interface ProjectCache {
  projects: Project[];
}

const projectStore = create<ProjectCache>(() => {
  const stored = readStorage(STORAGE_KEYS.projects, StoredProjectsSchema);
  return { projects: stored?.projects ?? [] };
});

function persist(projects: Project[]): void {
  writeStorage(STORAGE_KEYS.projects, { version: 1, projects });
}

export class MmkvProjectRepository implements ProjectRepository {
  findById(id: string): Project | undefined {
    return projectStore.getState().projects.find((p) => p.id === id);
  }

  findAll(): Project[] {
    return projectStore.getState().projects;
  }

  save(project: Project): void {
    const current = projectStore.getState().projects;
    const idx = current.findIndex((p) => p.id === project.id);
    const next =
      idx >= 0
        ? current.map((p) => (p.id === project.id ? project : p))
        : [...current, project];
    projectStore.setState({ projects: next });
    persist(next);
  }

  remove(id: string): void {
    const next = projectStore.getState().projects.filter((p) => p.id !== id);
    projectStore.setState({ projects: next });
    persist(next);
  }

  subscribe(listener: () => void): () => void {
    return projectStore.subscribe(listener);
  }
}

export const useProjectCache = projectStore;
