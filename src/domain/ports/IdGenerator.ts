/**
 * Unique-id source. The production adapter emits UUID v7s — time-ordered,
 * so naive sorts on id approximate creation order.
 */
export interface IdGenerator {
  next(): string;
}
