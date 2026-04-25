/**
 * Time source. Indirected so use cases can be tested with a frozen clock
 * instead of `Date.now()`.
 */
export interface Clock {
  now(): number;
}
