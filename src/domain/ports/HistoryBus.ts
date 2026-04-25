import type { Command } from './Command';

/**
 * Two-stack undo/redo bus. `push` runs the command and clears the redo stack
 * (any new write invalidates the redo branch). The UI can subscribe to be
 * notified when canUndo/canRedo change.
 */
export interface HistoryBus {
  push(command: Command): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  subscribe(listener: () => void): () => void;
}
