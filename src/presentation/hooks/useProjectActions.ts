import { useCases } from '@/composition-root';

export const projectActions = {
  create: (name: string) => useCases.createProject.execute(name),
  remove: (id: string) => useCases.deleteProject.execute(id),
  rename: (id: string, name: string) => useCases.renameProject.execute(id, name),
};

export function useProjectActions() {
  return projectActions;
}
