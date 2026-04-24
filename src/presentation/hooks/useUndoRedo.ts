import { useHistoryCache } from '@/data/history/InMemoryHistoryBus';
import { useCases } from '@/composition-root';

export function useUndoRedo() {
  const canUndo = useHistoryCache((s) => s.undoStack.length > 0);
  const canRedo = useHistoryCache((s) => s.redoStack.length > 0);
  return {
    canUndo,
    canRedo,
    undo: () => useCases.undo.execute(),
    redo: () => useCases.redo.execute(),
  };
}
