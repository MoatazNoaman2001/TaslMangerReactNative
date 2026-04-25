import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useTheme } from '@/presentation/theme/ThemeProvider';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-phase errors anywhere below it in the tree and shows a
 * recoverable fallback instead of unmounting the whole app. Wraps the root
 * navigator in `_layout.tsx` so a crash in one screen never freezes the rest.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    if (this.state.error) {
      return (
        this.props.fallback ?? <ErrorFallback error={this.state.error} onReset={this.reset} />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text
        style={{
          color: theme.colors.danger,
          fontSize: theme.typography.h2.fontSize,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
          textAlign: 'center',
        }}
      >
        {error.message || 'An unexpected error occurred.'}
      </Text>
      <Button
        mode="contained"
        onPress={onReset}
        buttonColor={theme.colors.primary}
        textColor={theme.colors.textInverse}
        style={{ marginTop: theme.spacing.lg, borderRadius: theme.radius.round }}
      >
        Try again
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
