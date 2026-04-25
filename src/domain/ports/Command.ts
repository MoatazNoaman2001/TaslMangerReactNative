/**
 * Command pattern unit — a single reversible action. Use cases construct
 * commands and hand them to the {@link HistoryBus}; the bus runs `execute`
 * immediately and stores `undo` for later. `label` is used by the UI when
 * surfacing undo/redo affordances.
 */
export interface Command {
  readonly label: string;
  execute(): void;
  undo(): void;
}
