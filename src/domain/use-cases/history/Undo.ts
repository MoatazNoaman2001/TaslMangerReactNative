import type { HistoryBus } from '@/domain/ports/HistoryBus';

/** Pops the last command from the history bus and inverts it. */
export class Undo {
  constructor(private readonly history: HistoryBus) {}
  execute(): void {
    this.history.undo();
  }
}
