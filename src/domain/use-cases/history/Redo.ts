import type { HistoryBus } from '@/domain/ports/HistoryBus';

/** Re-applies the most recently undone command. Cleared by any new push. */
export class Redo {
  constructor(private readonly history: HistoryBus) {}
  execute(): void {
    this.history.redo();
  }
}
