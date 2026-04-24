import type { Task } from '@/domain/entities/Task';

export interface TaskRepository {
  findById(id: string): Task | undefined;
  findByProject(projectId: string): Task[];
  findAll(): Task[];
  save(task: Task): void;
  saveMany(tasks: Task[]): void;
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
}
