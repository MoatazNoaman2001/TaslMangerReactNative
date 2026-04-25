import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Theme } from '@/presentation/theme/tokens';

interface Props {
  theme: Theme;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  caption?: string;
  accent?: string;
  onPress?: () => void;
}

/**
 * Half-width pressable stat card on the dashboard. Shows an accent-tinted
 * icon, a large value, a small label, and an optional caption. When
 * `onPress` is omitted the card renders as a non-interactive surface.
 */
export function StatCard({ theme, icon, label, value, caption, accent, onPress }: Props) {
  const tint = accent ?? theme.colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xxl,
          opacity: pressed && onPress ? 0.7 : 1,
          transform: [{ scale: pressed && onPress ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          // Append alpha to the accent hex so the bubble uses a tinted wash
          // matching the icon colour without needing a second token.
          backgroundColor: tint + '24',
        }}
      >
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '800', marginTop: 12 }}>
        {value}
      </Text>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontSize: 13,
          fontWeight: '600',
          marginTop: 2,
        }}
      >
        {label}
      </Text>
      {caption ? (
        <Text style={{ color: theme.colors.textTertiary, fontSize: 11, marginTop: 2 }}>
          {caption}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
