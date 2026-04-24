import type { HistoryBus } from '@/domain/ports/HistoryBus';

export class Redo {
  constructor(private readonly history: HistoryBus) {}
  execute(): void {
    this.history.redo();
  }
}
