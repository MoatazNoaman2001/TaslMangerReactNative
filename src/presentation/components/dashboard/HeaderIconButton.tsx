import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Theme } from '@/presentation/theme/tokens';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  theme: Theme;
}

/**
 * Circular icon button used in the dashboard header (search + notifications).
 * Renders a small badge bubble in the corner when `badge > 0`.
 */
export function HeaderIconButton({ icon, onPress, badge, theme }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 8,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={theme.colors.text} />
      {badge != null && badge > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: theme.colors.danger,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
            borderWidth: 2,
            borderColor: theme.colors.background,
          }}
        >
          <Text style={{ color: theme.colors.textInverse, fontSize: 10, fontWeight: '700' }}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
