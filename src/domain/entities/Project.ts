/**
 * Top-level container for tasks. `color` is one of the swatches in
 * `PROJECT_COLORS` and drives the accent on the dashboard card and board.
 */
export interface Project {
  readonly id: string;
  name: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}
