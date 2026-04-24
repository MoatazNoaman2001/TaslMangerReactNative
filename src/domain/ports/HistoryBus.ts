import type { Command } from './Command';

export interface HistoryBus {
  push(command: Command): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  subscribe(listener: () => void): () => void;
}
