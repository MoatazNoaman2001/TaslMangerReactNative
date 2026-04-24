import { SystemClock } from '@/data/system/SystemClock';
import { UuidV7Generator } from '@/data/system/UuidV7Generator';
import { MmkvTaskRepository } from '@/data/persistence/MmkvTaskRepository';
import { MmkvProjectRepository } from '@/data/persistence/MmkvProjectRepository';
import { MmkvSettingsRepository } from '@/data/persistence/MmkvSettingsRepository';
import { InMemoryHistoryBus } from '@/data/history/InMemoryHistoryBus';

import { CreateTask } from '@/domain/use-cases/tasks/CreateTask';
import { DeleteTask } from '@/domain/use-cases/tasks/DeleteTask';
import { UpdateTaskDetails } from '@/domain/use-cases/tasks/UpdateTaskDetails';
import { ChangeTaskStatus } from '@/domain/use-cases/tasks/ChangeTaskStatus';
import { ReorderTasksInProject } from '@/domain/use-cases/tasks/ReorderTasksInProject';
import { AddSubtask } from '@/domain/use-cases/tasks/AddSubtask';
import { ToggleSubtask } from '@/domain/use-cases/tasks/ToggleSubtask';
import { RemoveSubtask } from '@/domain/use-cases/tasks/RemoveSubtask';

import { CreateProject } from '@/domain/use-cases/projects/CreateProject';
import { DeleteProject } from '@/domain/use-cases/projects/DeleteProject';
import { RenameProject } from '@/domain/use-cases/projects/RenameProject';

import { Undo } from '@/domain/use-cases/history/Undo';
import { Redo } from '@/domain/use-cases/history/Redo';

import { SetThemePreference } from '@/domain/use-cases/settings/SetThemePreference';

const clock = new SystemClock();
const ids = new UuidV7Generator();
const tasks = new MmkvTaskRepository();
const projects = new MmkvProjectRepository();
const settings = new MmkvSettingsRepository();
const history = new InMemoryHistoryBus();

export const repos = { tasks, projects, settings, history };

export const useCases = {
  createTask: new CreateTask(tasks, history, ids, clock),
  deleteTask: new DeleteTask(tasks, history),
  updateTaskDetails: new UpdateTaskDetails(tasks, history, clock),
  changeTaskStatus: new ChangeTaskStatus(tasks, history, clock),
  reorderTasksInProject: new ReorderTasksInProject(tasks, history),
  addSubtask: new AddSubtask(tasks, history, ids, clock),
  toggleSubtask: new ToggleSubtask(tasks, history, clock),
  removeSubtask: new RemoveSubtask(tasks, history, clock),

  createProject: new CreateProject(projects, history, ids, clock),
  deleteProject: new DeleteProject(projects, history),
  renameProject: new RenameProject(projects, history, clock),

  undo: new Undo(history),
  redo: new Redo(history),

  setThemePreference: new SetThemePreference(settings),
};
