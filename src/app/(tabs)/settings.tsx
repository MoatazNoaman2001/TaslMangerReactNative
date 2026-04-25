import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, useThemePreference } from '@/presentation/theme/ThemeProvider';
import { useProjects } from '@/presentation/hooks/useProjects';
import { useTaskCache } from '@/data/persistence/MmkvTaskRepository';
import { useProjectCache } from '@/data/persistence/MmkvProjectRepository';
import { clearStorage } from '@/data/persistence/mmkv';
import type { ThemePreference } from '@/domain/entities/Settings';
import type { Theme } from '@/presentation/theme/tokens';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();
  const projects = useProjects();
  const tasks = useTaskCache((s) => s.tasks);

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').length;
    const overdue = tasks.filter(
      (t) => t.status !== 'done' && t.dueDate != null && t.dueDate < Date.now(),
    ).length;
    return { projects: projects.length, tasks: tasks.length, done, overdue };
  }, [projects, tasks]);

  const confirmClear = () => {
    Alert.alert(
      'Clear all data?',
      'This will permanently delete every project, task and setting on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearStorage();
            useTaskCache.setState({ tasks: [] });
            useProjectCache.setState({ projects: [] });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(360).springify().damping(18)}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: 13, fontWeight: '500' }}>
            Configure
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.h1.fontSize,
              fontWeight: theme.typography.h1.fontWeight,
              marginTop: 2,
            }}
          >
            Settings
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(60).duration(380).springify().damping(18)}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.xxl,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          <Text style={[styles.label, { color: theme.colors.textTertiary }]}>Overview</Text>
          <View style={styles.statRow}>
            <Stat label="Projects" value={stats.projects} theme={theme} />
            <Stat label="Tasks" value={stats.tasks} theme={theme} />
            <Stat label="Done" value={stats.done} theme={theme} accent={theme.colors.success} />
            <Stat label="Overdue" value={stats.overdue} theme={theme} accent={stats.overdue > 0 ? theme.colors.danger : undefined} />
          </View>
        </Animated.View>

        <Section title="Appearance" delay={120} theme={theme}>
          <Text style={[styles.label, { color: theme.colors.textTertiary, marginBottom: theme.spacing.sm }]}>
            Theme
          </Text>
          <View style={styles.segment}>
            {THEME_OPTIONS.map((opt) => {
              const selected = opt.value === preference;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPreference(opt.value)}
                  style={({ pressed }) => [
                    styles.segmentItem,
                    {
                      backgroundColor: selected ? theme.colors.primary : 'transparent',
                      borderColor: selected ? theme.colors.primary : theme.colors.border,
                      borderRadius: theme.radius.lg,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={selected ? theme.colors.textInverse : theme.colors.textSecondary}
                  />
                  <Text
                    style={{
                      color: selected ? theme.colors.textInverse : theme.colors.text,
                      fontSize: 13,
                      fontWeight: '600',
                      marginLeft: 6,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Notifications" delay={180} theme={theme}>
          <Row
            title="Daily summary"
            subtitle="Coming soon"
            theme={theme}
            right={<Switch value={false} disabled color={theme.colors.primary} />}
          />
          <Row
            title="Due-date reminders"
            subtitle="Coming soon"
            theme={theme}
            right={<Switch value={false} disabled color={theme.colors.primary} />}
          />
        </Section>

        <Section title="Data" delay={240} theme={theme}>
          <Pressable
            onPress={confirmClear}
            style={({ pressed }) => [
              styles.actionRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Text style={{ color: theme.colors.danger, fontWeight: '600', fontSize: 15 }}>
                Clear all data
              </Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 12, marginTop: 2 }}>
                Wipe projects, tasks and settings from this device
              </Text>
            </View>
          </Pressable>
        </Section>

        <Section title="About" delay={300} theme={theme}>
          <Row title="App" subtitle="TaskForge" theme={theme} />
          <Row title="Version" subtitle="1.0.0" theme={theme} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  delay = 0,
  theme,
  children,
}: {
  title: string;
  delay?: number;
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(380).springify().damping(18)}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xxl,
          marginTop: theme.spacing.md,
        },
      ]}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: '700',
          marginBottom: theme.spacing.md,
        }}
      >
        {title}
      </Text>
      {children}
    </Animated.View>
  );
}

function Row({
  title,
  subtitle,
  right,
  theme,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  theme: Theme;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: theme.colors.textTertiary, fontSize: 12, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? null}
    </View>
  );
}

function Stat({
  label,
  value,
  theme,
  accent,
}: {
  label: string;
  value: number;
  theme: Theme;
  accent?: string;
}) {
  return (
    <View style={styles.stat}>
      <Text
        style={{
          color: accent ?? theme.colors.text,
          fontSize: 22,
          fontWeight: '700',
        }}
      >
        {value}
      </Text>
      <Text style={{ color: theme.colors.textTertiary, fontSize: 12, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  stat: {
    flex: 1,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
