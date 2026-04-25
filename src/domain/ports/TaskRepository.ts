import type { Task } from '@/domain/entities/Task';

/**
 * Persistence boundary for tasks. The MMKV-backed implementation lives in
 * `data/persistence`; tests can supply an in-memory fake. `saveMany` exists
 * so reorder operations write a whole column atomically.
 */
export interface TaskRepository {
  findById(id: string): Task | undefined;
  findByProject(projectId: string): Task[];
  findAll(): Task[];
  save(task: Task): void;
  saveMany(tasks: Task[]): void;
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
}
