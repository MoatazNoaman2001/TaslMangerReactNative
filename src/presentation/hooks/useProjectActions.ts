import { useCases } from '@/composition-root';
import type { UpdateProjectPatch } from '@/domain/use-cases/projects/UpdateProject';

export const projectActions = {
  create: (name: string, color?: string) =>
    useCases.createProject.execute(name, color),
  remove: (id: string) => useCases.deleteProject.execute(id),
  rename: (id: string, name: string) => useCases.renameProject.execute(id, name),
  update: (id: string, patch: UpdateProjectPatch) =>
    useCases.updateProject.execute(id, patch),
};

export function useProjectActions() {
  return projectActions;
}
