import { useMemo } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '@/presentation/theme/ThemeProvider';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

function AppShell() {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        onPrimary: theme.colors.textInverse,
        primaryContainer: theme.colors.primaryMuted,
        onPrimaryContainer: theme.colors.primary,
        secondary: theme.colors.priorityMedium,
        onSecondary: theme.colors.textInverse,
        background: theme.colors.background,
        onBackground: theme.colors.text,
        surface: theme.colors.surface,
        onSurface: theme.colors.text,
        surfaceVariant: theme.colors.surfaceElevated,
        onSurfaceVariant: theme.colors.textSecondary,
        surfaceDisabled: theme.colors.border,
        onSurfaceDisabled: theme.colors.textTertiary,
        outline: theme.colors.borderStrong,
        outlineVariant: theme.colors.border,
        error: theme.colors.danger,
        onError: theme.colors.textInverse,
        elevation: {
          ...base.colors.elevation,
          level0: 'transparent',
          level1: theme.colors.surface,
          level2: theme.colors.surfaceElevated,
          level3: theme.colors.surfaceElevated,
        },
      },
    };
  }, [theme, isDark]);

  return (
    <SafeAreaProvider style={styles.root}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="project/[id]" />
          <Stack.Screen name="task/[id]" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});