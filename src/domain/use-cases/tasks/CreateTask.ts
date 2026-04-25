import type { Task } from '@/domain/entities/Task';
import type { TaskPriority } from '@/domain/value-objects/TaskPriority';
import type { TaskRepository } from '@/domain/ports/TaskRepository';
import type { HistoryBus } from '@/domain/ports/HistoryBus';
import type { IdGenerator } from '@/domain/ports/IdGenerator';
import type { Clock } from '@/domain/ports/Clock';

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: number | null;
}

/**
 * Creates a task in the To-Do column. New tasks are appended at the end of
 * the column (`position = current todo count`) so they appear at the bottom
 * of the kanban list. Wrapped in a Command so the create can be undone.
 */
export class CreateTask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly history: HistoryBus,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  execute(input: CreateTaskInput): Task {
    const ts = this.clock.now();
    const todoCount = this.tasks
      .findByProject(input.projectId)
      .filter((t) => t.status === 'todo').length;

    const task: Task = {
      id: this.ids.next(),
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      status: 'todo',
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate ?? null,
      subtasks: [],
      position: todoCount,
      createdAt: ts,
      updatedAt: ts,
      completedAt: null,
    };

    this.history.push({
      label: `Create task "${task.title}"`,
      execute: () => this.tasks.save(task),
      undo: () => this.tasks.remove(task.id),
    });
    return task;
  }
}
