import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/presentation/theme/ThemeProvider';

interface ColorSwatchPickerProps {
  colors: readonly string[];
  value: string;
  onChange: (color: string) => void;
}

export function ColorSwatchPicker({ colors, value, onChange }: ColorSwatchPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {colors.map((c) => {
        const selected = c === value;
        return (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            hitSlop={6}
            style={({ pressed }) => [
              styles.swatch,
              {
                backgroundColor: c,
                borderColor: selected ? theme.colors.text : 'transparent',
                transform: [{ scale: pressed ? 0.92 : selected ? 1.05 : 1 }],
              },
            ]}
          >
            {selected ? (
              <View
                style={[
                  styles.inner,
                  { backgroundColor: theme.colors.background },
                ]}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
