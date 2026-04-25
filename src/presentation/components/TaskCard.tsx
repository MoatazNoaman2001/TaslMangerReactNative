import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { router, type Href } from 'expo-router';
import { ProgressBar, Text } from 'react-native-paper';

import type { Task } from '@/domain/entities/Task';
import type { TaskPriority } from '@/domain/value-objects/TaskPriority';
import { useSubtaskProgress } from '@/presentation/hooks/useSubtaskProgress';
import { useTheme } from '@/presentation/theme/ThemeProvider';

interface TaskCardRootProps {
  task: Pick<Task, 'id'>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onLongPress?: () => void;
}

interface TaskCardHeaderProps {
  task: Pick<Task, 'title' | 'priority'>;
}

interface TaskCardBodyProps {
  task: Pick<Task, 'id' | 'description'>;
}

interface TaskCardFooterProps {
  task: Pick<Task, 'id' | 'dueDate' | 'status'>;
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function TaskCardRoot({
  task,
  children,
  style,
  disabled = false,
  onLongPress,
}: TaskCardRootProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onLongPress={onLongPress}
      onPress={() => router.push(`/task/${task.id}` as Href)}
      style={({ pressed }) => [
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
        },
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

function TaskCardHeader({ task }: TaskCardHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Text
        numberOfLines={2}
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: theme.typography.bodyBold.fontSize,
            fontWeight: theme.typography.bodyBold.fontWeight,
            lineHeight: theme.typography.bodyBold.lineHeight,
          },
        ]}
      >
        {task.title}
      </Text>

      <PriorityBadge priority={task.priority} />
    </View>
  );
}

function TaskCardBody({ task }: TaskCardBodyProps) {
  const theme = useTheme();
  const progress = useSubtaskProgress(task.id);
  const hasDescription = task.description.trim().length > 0;

  if (!hasDescription && progress.total === 0) return null;

  return (
    <View style={[styles.body, { marginTop: theme.spacing.sm }]}>
      {hasDescription ? (
        <Text
          numberOfLines={2}
          style={[
            styles.description,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.caption.fontSize,
              fontWeight: theme.typography.caption.fontWeight,
              lineHeight: theme.typography.caption.lineHeight,
            },
          ]}
        >
          {task.description}
        </Text>
      ) : null}

      {progress.total > 0 ? (
        <ProgressBar
          progress={progress.ratio}
          color={theme.colors.primary}
          style={[
            styles.progress,
            {
              backgroundColor: theme.colors.border,
              borderRadius: theme.radius.round,
              marginTop: hasDescription ? theme.spacing.sm : 0,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function TaskCardFooter({ task }: TaskCardFooterProps) {
  const theme = useTheme();
  const progress = useSubtaskProgress(task.id);

  const isOverdue =
    task.dueDate != null &&
    task.status !== 'done' &&
    task.dueDate < Date.now();

  return (
    <View style={[styles.footer, { marginTop: theme.spacing.md }]}>
      <Text
        numberOfLines={1}
        style={[
          styles.footerText,
          {
            color: isOverdue ? theme.colors.danger : theme.colors.textTertiary,
            fontSize: theme.typography.small.fontSize,
            fontWeight: theme.typography.small.fontWeight,
            lineHeight: theme.typography.small.lineHeight,
          },
        ]}
      >
        {formatDueDate(task.dueDate)}
      </Text>

      <Text
        numberOfLines={1}
        style={[
          styles.subtaskCount,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.small.fontSize,
            fontWeight: theme.typography.small.fontWeight,
            lineHeight: theme.typography.small.lineHeight,
          },
        ]}
      >
        {progress.completed}/{progress.total}
      </Text>
    </View>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const theme = useTheme();
  const color = getPriorityColor(priority, theme.colors);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          borderRadius: theme.radius.round,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 4,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.badgeText,
          {
            color: priority === 'medium' ? theme.colors.textInverse : '#FFFFFF',
            fontSize: theme.typography.small.fontSize,
            fontWeight: '700',
            lineHeight: theme.typography.small.lineHeight,
          },
        ]}
      >
        {PRIORITY_LABEL[priority]}
      </Text>
    </View>
  );
}

function getPriorityColor(
  priority: TaskPriority,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (priority) {
    case 'low':
      return colors.priorityLow;
    case 'medium':
      return colors.priorityMedium;
    case 'high':
      return colors.priorityHigh;
  }
}

function formatDueDate(value: number | null): string {
  if (value == null) return 'No due date';

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export const TaskCard = {
  Root: TaskCardRoot,
  Header: TaskCardHeader,
  Body: TaskCardBody,
  Footer: TaskCardFooter,
} as const;

const styles = StyleSheet.create({
  root: {
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  disabled: {
    opacity: 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    marginLeft: 8,
  },
  badgeText: {},
  body: {},
  description: {},
  progress: {
    height: 5,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    flex: 1,
    minWidth: 0,
  },
  subtaskCount: {
    marginLeft: 8,
  },
});