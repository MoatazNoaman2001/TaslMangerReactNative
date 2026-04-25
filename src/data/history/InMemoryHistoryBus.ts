import { create } from 'zustand';
import type { Command } from '@/domain/ports/Command';
import type { HistoryBus } from '@/domain/ports/HistoryBus';

/**
 * Cap on retained commands. Past this size the oldest command is dropped on
 * push — keeps memory bounded if the user makes a long sequence of edits
 * without ever undoing.
 */
const MAX_HISTORY = 50;

interface HistoryState {
  undoStack: Command[];
  redoStack: Command[];
}

const historyStore = create<HistoryState>(() => ({
  undoStack: [],
  redoStack: [],
}));

/**
 * Two-stack undo/redo bus backed by a Zustand store, so the UI can
 * subscribe via `useHistoryCache` to enable/disable undo/redo buttons
 * without polling.
 */
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
