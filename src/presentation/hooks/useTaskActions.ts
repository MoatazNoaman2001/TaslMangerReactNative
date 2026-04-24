import { useCases } from '@/composition-root';
import type { Task } from '@/domain/entities/Task';
import type { TaskStatus } from '@/domain/value-objects/TaskStatus';
import type { CreateTaskInput } from '@/domain/use-cases/tasks/CreateTask';
import type { UpdateTaskPatch } from '@/domain/use-cases/tasks/UpdateTaskDetails';

export const taskActions = {
  create: (input: CreateTaskInput) => useCases.createTask.execute(input),
  remove: (id: string) => useCases.deleteTask.execute(id),
  updateDetails: (id: string, patch: UpdateTaskPatch) =>
    useCases.updateTaskDetails.execute(id, patch),
  changeStatus: (id: string, to: TaskStatus) =>
    useCases.changeTaskStatus.execute(id, to),
  reorder: (projectId: string, next: Task[], label?: string) =>
    useCases.reorderTasksInProject.execute(projectId, next, label),
  addSubtask: (taskId: string, title: string) =>
    useCases.addSubtask.execute(taskId, title),
  toggleSubtask: (taskId: string, subtaskId: string) =>
    useCases.toggleSubtask.execute(taskId, subtaskId),
  removeSubtask: (taskId: string, subtaskId: string) =>
    useCases.removeSubtask.execute(taskId, subtaskId),
};

export function useTaskActions() {
  return taskActions;
}
