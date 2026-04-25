import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ListRenderItemInfo } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';

import type { Task } from '@/domain/entities/Task';
import type { TaskStatus } from '@/domain/value-objects/TaskStatus';
import { useKanbanColumns } from '@/presentation/hooks/useKanbanColumns';
import { useTaskActions } from '@/presentation/hooks/useTaskActions';
import { useTheme } from '@/presentation/theme/ThemeProvider';
import type { Theme } from '@/presentation/theme/tokens';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  projectId: string;
  status: TaskStatus;
}

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done'];

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const STATUS_ACTION_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'Start',
  done: 'Done',
};

export function KanbanColumn({ projectId, status }: KanbanColumnProps) {
  const theme = useTheme();
  const columns = useKanbanColumns(projectId);

  const columnTasks = columns[status];

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Task>) => (
      <View style={styles.row}>
        <SwipeableTaskRow task={item}>
          <TaskCard.Root task={item}>
            <TaskCard.Header task={item} />
            <TaskCard.Body task={item} />
            <TaskCard.Footer task={item} />
          </TaskCard.Root>
        </SwipeableTaskRow>
      </View>
    ),
    [],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xl,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              lineHeight: theme.typography.h3.lineHeight,
            },
          ]}
        >
          {STATUS_LABEL[status]}
        </Text>

        <View
          style={[
            styles.countPill,
            {
              backgroundColor: theme.colors.primaryMuted,
              borderRadius: theme.radius.round,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: theme.typography.small.fontSize,
              fontWeight: theme.typography.small.fontWeight,
              lineHeight: theme.typography.small.lineHeight,
            }}
          >
            {columnTasks.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={columnTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          {
            padding: theme.spacing.md,
            paddingBottom: theme.spacing.xl,
          },
        ]}
        ListEmptyComponent={<EmptyColumn />}
      />
    </View>
  );
}

function SwipeableTaskRow({
  task,
  children,
}: {
  task: Task;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const actions = useTaskActions();

  const targets = useMemo(
    () => STATUS_ORDER.filter((nextStatus) => nextStatus !== task.status),
    [task.status],
  );

  const renderRightActions = useCallback(
    () => (
      <View style={styles.swipeActions}>
        {targets.map((target, index) => {
          const backgroundColor = getStatusActionColor(target, theme);
          const textColor =
            target === 'todo' ? theme.colors.text : theme.colors.textInverse;

          return (
            <Pressable
              key={target}
              accessibilityRole="button"
              onPress={() => actions.changeStatus(task.id, target)}
              style={({ pressed }) => [
                styles.swipeAction,
                {
                  backgroundColor,
                  opacity: pressed ? 0.82 : 1,
                  marginLeft: index === 0 ? 0 : theme.spacing.xs,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.swipeActionText,
                  {
                    color: textColor,
                    fontSize: theme.typography.small.fontSize,
                    fontWeight: theme.typography.small.fontWeight,
                    lineHeight: theme.typography.small.lineHeight,
                  },
                ]}
              >
                {STATUS_ACTION_LABEL[target]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    ),
    [actions, targets, task.id, theme],
  );

  return (
    <Swipeable
      friction={2}
      overshootRight={false}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}

function EmptyColumn() {
  const theme = useTheme();

  return (
    <View style={styles.empty}>
      <Text
        style={[
          styles.emptyTitle,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.bodyBold.fontSize,
            fontWeight: theme.typography.bodyBold.fontWeight,
            lineHeight: theme.typography.bodyBold.lineHeight,
          },
        ]}
      >
        No tasks
      </Text>

      <Text
        style={[
          styles.emptySubtitle,
          {
            color: theme.colors.textTertiary,
            fontSize: theme.typography.caption.fontSize,
            fontWeight: theme.typography.caption.fontWeight,
            lineHeight: theme.typography.caption.lineHeight,
            marginTop: theme.spacing.xs,
          },
        ]}
      >
        Cards you move here will appear in this column.
      </Text>
    </View>
  );
}

function getStatusActionColor(status: TaskStatus, theme: Theme): string {
  switch (status) {
    case 'todo':
      return theme.colors.borderStrong;
    case 'in_progress':
      return theme.colors.primary;
    case 'done':
      return theme.colors.success;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
  },
  countPill: {
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  row: {
    marginBottom: 12,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  swipeAction: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  swipeActionText: {
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});