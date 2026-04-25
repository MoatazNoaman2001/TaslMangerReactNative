const palette = {
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5D8',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#2A2A2E',
  gray800: '#18181B',
  gray900: '#0B0B0D',
  black: '#000000',

  orange500: '#FF6B35',
  orange600: '#F25C20',
  lime400: '#C5F277',
  lime500: '#A8E055',
  teal400: '#5EE7DF',
  pink500: '#FF3D77',
  amber400: '#F5C518',
  blue500: '#3B82F6',
  green500: '#10B981',
  red500: '#EF4444',
} as const;

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

const radius = { sm: 6, md: 10, lg: 14, xl: 20, xxl: 28, round: 9999,    } as const;

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

    primary: palette.orange500,
    primaryMuted: '#FFE7DC',
    success: '#0E9F6E',
    successMuted: '#D1FAE5',
    danger: '#E11D48',
    dangerMuted: '#FEE2E2',
    warning: palette.amber400,

    priorityLow: palette.teal400,
    priorityMedium: palette.amber400,
    priorityHigh: palette.pink500,
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
    border: '#222226',
    borderStrong: '#33333A',

    text: palette.white,
    textSecondary: '#B5B5BC',
    textTertiary: '#6E6E76',
    textInverse: palette.gray900,

    primary: palette.orange500,
    primaryMuted: 'rgba(255, 107, 53, 0.16)',
    success: palette.green500,
    successMuted: 'rgba(16, 185, 129, 0.18)',
    danger: palette.red500,
    dangerMuted: 'rgba(239, 68, 68, 0.18)',
    warning: palette.amber400,

    priorityLow: palette.teal400,
    priorityMedium: palette.lime400,
    priorityHigh: palette.pink500,
  },
  spacing,
  radius,
  typography,
};
