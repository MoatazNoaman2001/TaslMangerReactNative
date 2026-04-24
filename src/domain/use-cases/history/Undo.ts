import type { HistoryBus } from '@/domain/ports/HistoryBus';

export class Undo {
  constructor(private readonly history: HistoryBus) {}
  execute(): void {
    this.history.undo();
  }
}
