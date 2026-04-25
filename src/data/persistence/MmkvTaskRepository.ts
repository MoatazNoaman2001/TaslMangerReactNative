import { create } from 'zustand';
import type { Task } from '@/domain/entities/Task';
import type { TaskRepository } from '@/domain/ports/TaskRepository';
import { readStorage, writeStorage, STORAGE_KEYS } from './mmkv';
import { StoredTasksSchema } from './schemas';

interface TaskCache {
  tasks: Task[];
}

const taskStore = create<TaskCache>(() => {
  const stored = readStorage(STORAGE_KEYS.tasks, StoredTasksSchema);
  return { tasks: stored?.tasks ?? [] };
});

function persist(tasks: Task[]): void {
  writeStorage(STORAGE_KEYS.tasks, { version: 1, tasks });
}

/**
 * MMKV-backed task store. Each mutating method updates the Zustand cache
 * (so React components re-render) and then persists the new array to MMKV.
 * `useTaskCache` is exported so screens can subscribe with a selector.
 */
export class MmkvTaskRepository implements TaskRepository {
  findById(id: string): Task | undefined {
    return taskStore.getState().tasks.find((t) => t.id === id);
  }

  findByProject(projectId: string): Task[] {
    return taskStore
      .getState()
      .tasks.filter((t) => t.projectId === projectId)
      .sort((a, b) => a.position - b.position);
  }

  findAll(): Task[] {
    return taskStore.getState().tasks;
  }

  save(task: Task): void {
    const current = taskStore.getState().tasks;
    const idx = current.findIndex((t) => t.id === task.id);
    const next =
      idx >= 0
        ? current.map((t) => (t.id === task.id ? task : t))
        : [...current, task];
    taskStore.setState({ tasks: next });
    persist(next);
  }

  saveMany(tasks: Task[]): void {
    const current = taskStore.getState().tasks;
    const incomingById = new Map(tasks.map((t) => [t.id, t]));
    const existingIds = new Set(current.map((t) => t.id));
    const next: Task[] = current.map((t) => incomingById.get(t.id) ?? t);
    for (const task of tasks) {
      if (!existingIds.has(task.id)) next.push(task);
    }
    taskStore.setState({ tasks: next });
    persist(next);
  }

  remove(id: string): void {
    const next = taskStore.getState().tasks.filter((t) => t.id !== id);
    taskStore.setState({ tasks: next });
    persist(next);
  }

  subscribe(listener: () => void): () => void {
    return taskStore.subscribe(listener);
  }
}

export const useTaskCache = taskStore;
