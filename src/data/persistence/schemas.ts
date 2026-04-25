import { z } from 'zod';

export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'done']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const SubtaskSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  title: z.string().min(1).max(200),
  completed: z.boolean(),
  createdAt: z.number().int().positive(),
});

export const TaskSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  projectId: z.uuid({ version: 'v7' }),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dueDate: z.number().int().positive().nullable(),
  subtasks: z.array(SubtaskSchema),
  position: z.number(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  completedAt: z.number().int().positive().nullable(),
});

export const ProjectSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export const StoredProjectsSchema = z.object({
  version: z.literal(1),
  projects: z.array(ProjectSchema),
});

export const StoredTasksSchema = z.object({
  version: z.literal(1),
  tasks: z.array(TaskSchema),
});

export const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});
