import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Task } from '@/domain/entities/Task';
import type { Theme } from '@/presentation/theme/tokens';

import { formatDue } from './dateUtils';

interface Props {
  task: Task;
  theme: Theme;
  isLast: boolean;
  onPress: () => void;
}

/**
 * Compact one-line task row used inside the dashboard list cards (Today,
 * High priority) and the task-list dialog (In progress, Completed,
 * Notifications). Renders a coloured priority spine, the title, and a
 * relative due-date hint.
 */
export function TaskRow({ task, theme, isLast, onPress }: Props) {
  const now = Date.now();
  const isOverdue = task.dueDate != null && task.dueDate < now && task.status !== 'done';
  const priorityColor =
    task.priority === 'high'
      ? theme.colors.priorityHigh
      : task.priority === 'medium'
      ? theme.colors.priorityMedium
      : theme.colors.priorityLow;
  const dueText = task.dueDate != null ? formatDue(task.dueDate, now) : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: priorityColor }} />
      <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}
        >
          {task.title}
        </Text>
        {dueText ? (
          <Text
            style={{
              color: isOverdue ? theme.colors.danger : theme.colors.textTertiary,
              fontSize: 12,
              marginTop: 2,
              fontWeight: '500',
            }}
          >
            {dueText}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
    </Pressable>
  );
}
