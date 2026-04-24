const palette = {
  // Neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5D8',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',

  // Brand + semantic
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  green500: '#10B981',
  green600: '#059669',
  red500: '#EF4444',
  red600: '#DC2626',
  amber500: '#F59E0B',
  blue500: '#3B82F6',
} as const;

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

const radius = { sm: 6, md: 10, lg: 14, xl: 20, round: 9999 } as const;

const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
} as const;

type Colors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  primary: string;
  primaryMuted: string;
  success: string;
  successMuted: string;
  danger: string;
  dangerMuted: string;
  warning: string;

  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
};

export type Theme = {
  name: 'light' | 'dark';
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: palette.gray50,
    surface: palette.white,
    surfaceElevated: palette.white,
    border: palette.gray200,
    borderStrong: palette.gray300,

    text: palette.gray900,
    textSecondary: palette.gray600,
    textTertiary: palette.gray400,
    textInverse: palette.white,

    primary: palette.indigo600,
    primaryMuted: '#EEF2FF',
    success: palette.green600,
    successMuted: '#D1FAE5',
    danger: palette.red600,
    dangerMuted: '#FEE2E2',
    warning: palette.amber500,

    priorityLow: palette.blue500,
    priorityMedium: palette.amber500,
    priorityHigh: palette.red500,
  },
  spacing,
  radius,
  typography,
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: palette.gray900,
    surface: palette.gray800,
    surfaceElevated: palette.gray700,
    border: palette.gray700,
    borderStrong: palette.gray600,

    text: palette.gray50,
    textSecondary: palette.gray300,
    textTertiary: palette.gray500,
    textInverse: palette.gray900,

    primary: palette.indigo500,
    primaryMuted: 'rgba(99, 102, 241, 0.15)',
    success: palette.green500,
    successMuted: 'rgba(16, 185, 129, 0.15)',
    danger: palette.red500,
    dangerMuted: 'rgba(239, 68, 68, 0.15)',
    warning: palette.amber500,

    priorityLow: palette.blue500,
    priorityMedium: palette.amber500,
    priorityHigh: palette.red500,
  },
  spacing,
  radius,
  typography,
};
