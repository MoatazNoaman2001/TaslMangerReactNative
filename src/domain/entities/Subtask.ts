/**
 * Lightweight checklist item owned by a Task. Subtasks are stored inline on
 * the parent task (not in their own table) — there is never a need to query
 * them independently, and inlining keeps writes atomic.
 */
export interface Subtask {
  readonly id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export function createSubtask(id: string, title: string, now: number): Subtask {
  return { id, title: title.trim(), completed: false, createdAt: now };
}
