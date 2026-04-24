import { create } from 'zustand';
import type { Command } from '@/domain/ports/Command';
import type { HistoryBus } from '@/domain/ports/HistoryBus';

const MAX_HISTORY = 50;

interface HistoryState {
  undoStack: Command[];
  redoStack: Command[];
}

const historyStore = create<HistoryState>(() => ({
  undoStack: [],
  redoStack: [],
}));

export class InMemoryHistoryBus implements HistoryBus {
  push(cmd: Command): void {
    cmd.execute();
    const { undoStack } = historyStore.getState();
    const next = [...undoStack, cmd];
    if (next.length > MAX_HISTORY) next.shift();
    historyStore.setState({ undoStack: next, redoStack: [] });
  }

  undo(): void {
    const { undoStack, redoStack } = historyStore.getState();
    const cmd = undoStack[undoStack.length - 1];
    if (!cmd) return;
    cmd.undo();
    historyStore.setState({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, cmd],
    });
  }

  redo(): void {
    const { undoStack, redoStack } = historyStore.getState();
    const cmd = redoStack[redoStack.length - 1];
    if (!cmd) return;
    cmd.execute();
    historyStore.setState({
      undoStack: [...undoStack, cmd],
      redoStack: redoStack.slice(0, -1),
    });
  }

  canUndo(): boolean {
    return historyStore.getState().undoStack.length > 0;
  }

  canRedo(): boolean {
    return historyStore.getState().redoStack.length > 0;
  }

  subscribe(listener: () => void): () => void {
    return historyStore.subscribe(listener);
  }
}

export const useHistoryCache = historyStore;
