export interface Subtask {
  readonly id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export function createSubtask(id: string, title: string, now: number): Subtask {
  return { id, title: title.trim(), completed: false, createdAt: now };
}
