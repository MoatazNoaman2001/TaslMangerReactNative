import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '@/presentation/theme/ThemeProvider';

interface DueDateStripProps {
  value: number | null;
  onChange: (value: number | null) => void;
  rangeDays?: number;
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DueDateStrip({ value, onChange, rangeDays = 14 }: DueDateStripProps) {
  const theme = useTheme();

  const days = useMemo(() => {
    const start = startOfDay(new Date());
    return Array.from({ length: rangeDays }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [rangeDays]);

  const selectedKey = value != null ? dayKey(new Date(value)) : null;
  const todayKey = dayKey(new Date());

  return (
    <View>
      <View style={styles.headerRow}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.bodyBold.fontSize,
            fontWeight: theme.typography.bodyBold.fontWeight,
          }}
        >
          {value != null ? formatLong(new Date(value)) : 'No due date'}
        </Text>

        {value != null ? (
          <Pressable onPress={() => onChange(null)} hitSlop={8}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.strip, { paddingVertical: theme.spacing.sm }]}
      >
        {days.map((d) => {
          const key = dayKey(d);
          const selected = key === selectedKey;
          const isToday = key === todayKey;

          return (
            <Pressable
              key={key}
              onPress={() => onChange(endOfDay(d).getTime())}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: selected
                    ? theme.colors.primary
                    : theme.colors.surfaceElevated,
                  borderColor: selected
                    ? theme.colors.primary
                    : theme.colors.border,
                  borderRadius: theme.radius.lg,
                  marginRight: theme.spacing.sm,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? theme.colors.textInverse : theme.colors.textTertiary,
                  fontSize: theme.typography.small.fontSize,
                  fontWeight: '600',
                }}
              >
                {WEEKDAY[d.getDay()]}
              </Text>
              <Text
                style={{
                  color: selected ? theme.colors.textInverse : theme.colors.text,
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: '700',
                  marginTop: 2,
                }}
              >
                {d.getDate()}
              </Text>
              {isToday ? (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: selected ? theme.colors.textInverse : theme.colors.primary },
                  ]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatLong(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strip: {
    flexDirection: 'row',
  },
  cell: {
    width: 56,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
