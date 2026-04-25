/**
 * Shapes shared between the dashboard screen and its dialog components.
 * Kept loose on purpose — these props originate from inline objects in the
 * screen and are only narrowed enough that consumers can type their use.
 */
export type DialogStyleProp = {
  backgroundColor: string;
  borderRadius: number;
  transform: { translateY: number }[];
};

export type PaperThemeProp = { colors: Record<string, string> };
