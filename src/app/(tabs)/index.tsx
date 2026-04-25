import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput as RNTextInput,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  List,
  FAB,
  Dialog,
  Button,
  Portal,
  ProgressBar,
} from 'react-native-paper';
import { useProjects } from '@/presentation/hooks/useProjects';
import { useProjectActions } from '@/presentation/hooks/useProjectActions';
import { useTaskCache } from '@/data/persistence/MmkvTaskRepository';
import { useTheme } from '@/presentation/theme/ThemeProvider';
import type { Project } from '@/domain/entities/Project';
import type { Task } from '@/domain/entities/Task';
import { PROJECT_COLORS } from '@/domain/use-cases/projects/CreateProject';
import { SwipeToDelete } from '@/presentation/components/SwipeToDelete';
import { useKeyboardHeight } from '@/presentation/hooks/useKeyboardHeight';
import { CreateProjectDialog } from '@/presentation/components/dashboard/CreateProjectDialog';
import { EditProjectDialog } from '@/presentation/components/dashboard/EditProjectDialog';
import { HeaderIconButton } from '@/presentation/components/dashboard/HeaderIconButton';
import { StatCard } from '@/presentation/components/dashboard/StatCard';
import { TaskRow } from '@/presentation/components/dashboard/TaskRow';
import { shortDate, todayLabel } from '@/presentation/components/dashboard/dateUtils';

interface ProjectStats {
  total: number;
  done: number;
  overdue: number;
}

export default function ProjectsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const projects = useProjects();
  const actions = useProjectActions();
  const keyboardHeight = useKeyboardHeight();
  const dialogStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      transform: [{ translateY: -keyboardHeight / 2 }],
    }),
    [theme.colors.surfaceElevated, theme.radius.lg, keyboardHeight],
  );

  const allTasks = useTaskCache((s) => s.tasks);
  const stats = useMemo(() => {
    const map: Record<string, ProjectStats> = {};
    const now = Date.now();
    for (const t of allTasks) {
      const s = (map[t.projectId] ??= { total: 0, done: 0, overdue: 0 });
      s.total += 1;
      if (t.status === 'done') s.done += 1;
      else if (t.dueDate != null && t.dueDate < now) s.overdue += 1;
    }
    return map;
  }, [allTasks]);

  const totals = useMemo(() => {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const all = allTasks.length;
    const done = allTasks.filter((t) => t.status === 'done').length;
    const inProgress = allTasks.filter((t) => t.status === 'in_progress').length;
    const overdue = allTasks.filter(
      (t) => t.status !== 'done' && t.dueDate != null && t.dueDate < now,
    ).length;
    const todayTasks = allTasks
      .filter(
        (t) =>
          t.status !== 'done' &&
          t.dueDate != null &&
          ((t.dueDate >= startOfDay.getTime() && t.dueDate <= endOfDay.getTime()) ||
            t.dueDate < now),
      )
      .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));
    const priorityTasks = allTasks
      .filter((t) => t.status !== 'done' && t.priority === 'high')
      .slice(0, 5);
    return { all, done, inProgress, overdue, todayTasks, priorityTasks };
  }, [allTasks]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const inProgressTasks = useMemo(
    () =>
      allTasks
        .filter((t) => t.status === 'in_progress')
        .sort((a, b) => (a.dueDate ?? Number.POSITIVE_INFINITY) - (b.dueDate ?? Number.POSITIVE_INFINITY)),
    [allTasks],
  );

  const doneTasks = useMemo(
    () =>
      allTasks
        .filter((t) => t.status === 'done')
        .sort((a, b) => (b.completedAt ?? b.updatedAt ?? 0) - (a.completedAt ?? a.updatedAt ?? 0)),
    [allTasks],
  );

  const notifications = useMemo(() => {
    const now = Date.now();
    const inOneHour = now + 60 * 60 * 1000;
    return allTasks
      .filter((t) => t.status !== 'done' && t.dueDate != null && t.dueDate < inOneHour)
      .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));
  }, [allTasks]);

  const filteredProjects = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, trimmedQuery]);

  const filteredTasks = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (!q) return [] as Task[];
    return allTasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q) ||
          t.subtasks.some((s) => s.title.toLowerCase().includes(q)),
      )
      .sort((a, b) => (a.dueDate ?? Number.POSITIVE_INFINITY) - (b.dueDate ?? Number.POSITIVE_INFINITY));
  }, [allTasks, trimmedQuery]);

  const filteredTodayTasks = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (!q) return totals.todayTasks;
    return totals.todayTasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [totals.todayTasks, trimmedQuery]);

  const [taskListSheet, setTaskListSheet] = useState<{
    open: boolean;
    title: string;
    tasks: Task[];
    emptyMsg: string;
  }>({ open: false, title: '', tasks: [], emptyMsg: '' });

  const openTaskList = (title: string, tasks: Task[], emptyMsg: string) => {
    setTaskListSheet({ open: true, title, tasks, emptyMsg });
  };

  const closeTaskList = () => setTaskListSheet((s) => ({ ...s, open: false }));

  // Dialog states
  const [createVisible, setCreateVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const initialNewProjectColor = useMemo(
    () => PROJECT_COLORS[projects.length % PROJECT_COLORS.length]!,
    [projects.length],
  );

  const paperTheme = useMemo(
    () => ({
      colors: {
        surface: theme.colors.surface,
        onSurface: theme.colors.text,
        onSurfaceVariant: theme.colors.textSecondary,
        primary: theme.colors.primary,
        outline: theme.colors.border,
        background: theme.colors.background,
        text: theme.colors.text,
        placeholder: theme.colors.textTertiary,
        error: theme.colors.danger,
      },
    }),
    [theme],
  );

  const openCreate = () => setCreateVisible(true);

  const handleOpenMenu = (project: Project) => {
    setSelectedProject(project);
    setMenuVisible(true);
  };

  const handleRenamePress = () => {
    if (selectedProject) {
      setMenuVisible(false);
      setRenameVisible(true);
    }
  };

  const handleDelete = () => {
    if (selectedProject) {
      actions.remove(selectedProject.id);
    }
    setMenuVisible(false);
    setSelectedProject(null);
  };

  const completionRatio = totals.all > 0 ? totals.done / totals.all : 0;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ color: theme.colors.textTertiary, fontSize: 13, fontWeight: '500' }}>
              {todayLabel()}
            </Text>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.h1.fontWeight,
                marginTop: 2,
              }}
            >
              Hello there
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <HeaderIconButton
              icon={searchOpen ? 'close' : 'search'}
              onPress={() => {
                setSearchOpen((v) => !v);
                if (searchOpen) setQuery('');
              }}
              theme={theme}
            />
            <HeaderIconButton
              icon="notifications-outline"
              badge={notifications.length}
              onPress={() =>
                openTaskList(
                  'Notifications',
                  notifications,
                  "You're all caught up!",
                )
              }
              theme={theme}
            />
          </View>
        </View>

        {searchOpen ? (
          <Animated.View
            entering={FadeInDown.duration(220)}
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
            <RNTextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search projects and tasks"
              placeholderTextColor={theme.colors.textTertiary}
              style={{
                flex: 1,
                marginLeft: 8,
                color: theme.colors.text,
                fontSize: 14,
                paddingVertical: 0,
              }}
              autoFocus
            />
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInDown.delay(60).duration(380).springify().damping(18)}
          style={{ marginTop: theme.spacing.lg }}
        >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.primaryMuted,
              borderRadius: theme.radius.xxl,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={[styles.heroDateChip, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="calendar" size={13} color={theme.colors.textInverse} />
              <Text
                style={{
                  color: theme.colors.textInverse,
                  fontSize: 12,
                  fontWeight: '700',
                  marginLeft: 6,
                }}
              >
                {shortDate(Date.now())}
              </Text>
            </View>
            {totals.overdue > 0 ? (
              <View style={[styles.urgentChip, { backgroundColor: theme.colors.danger }]}>
                <Ionicons name="alert-circle" size={13} color={theme.colors.textInverse} />
                <Text
                  style={{
                    color: theme.colors.textInverse,
                    fontSize: 12,
                    fontWeight: '700',
                    marginLeft: 4,
                  }}
                >
                  {totals.overdue} overdue
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 26,
              fontWeight: '800',
              marginTop: 14,
              lineHeight: 32,
            }}
          >
            {totals.todayTasks.length === 0
              ? 'Nothing due today'
              : `${totals.todayTasks.length} task${totals.todayTasks.length === 1 ? '' : 's'} for today`}
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {totals.all === 0
              ? 'Create a project to get started'
              : `${totals.done} of ${totals.all} done overall`}
          </Text>
          <View style={{ marginTop: theme.spacing.md }}>
            <ProgressBar
              progress={completionRatio}
              color={theme.colors.primary}
              style={{
                height: 8,
                borderRadius: theme.radius.round,
                backgroundColor: theme.colors.surface,
              }}
            />
          </View>
        </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(380).springify().damping(18)}
          style={styles.statsRow}
        >
          <StatCard
            theme={theme}
            icon="time-outline"
            label="In progress"
            value={`${totals.inProgress}`}
            caption={`${Math.max(0, totals.all - totals.done - totals.inProgress)} to start`}
            accent={theme.colors.priorityMedium}
            onPress={() =>
              openTaskList('In progress', inProgressTasks, 'No tasks in progress')
            }
          />
          <StatCard
            theme={theme}
            icon="trophy-outline"
            label="Completed"
            value={`${Math.round(completionRatio * 100)}%`}
            caption={`${totals.done}/${totals.all} done`}
            accent={theme.colors.success}
            onPress={() => openTaskList('Completed', doneTasks, 'No completed tasks yet')}
          />
        </Animated.View>

        {isSearching ? (
          <Animated.View
            entering={FadeInDown.duration(220)}
            style={{ marginTop: theme.spacing.lg }}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: '700',
                }}
              >
                Tasks
              </Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 13, fontWeight: '600' }}>
                {filteredTasks.length}
              </Text>
            </View>
            {filteredTasks.length === 0 ? (
              <Text
                style={{
                  color: theme.colors.textTertiary,
                  textAlign: 'center',
                  paddingVertical: 16,
                  fontSize: 13,
                }}
              >
                No tasks match "{trimmedQuery}"
              </Text>
            ) : (
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderRadius: theme.radius.xxl,
                  marginTop: theme.spacing.sm,
                  overflow: 'hidden',
                }}
              >
                {filteredTasks.slice(0, 8).map((t, i) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    theme={theme}
                    isLast={i === Math.min(filteredTasks.length, 8) - 1}
                    onPress={() => router.push(`/task/${t.id}`)}
                  />
                ))}
              </View>
            )}
          </Animated.View>
        ) : null}

        {!isSearching && filteredTodayTasks.length > 0 ? (
          <Animated.View
            entering={FadeInDown.delay(180).duration(380).springify().damping(18)}
            style={{ marginTop: theme.spacing.lg }}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: '700',
                }}
              >
                Today
              </Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 13, fontWeight: '600' }}>
                {filteredTodayTasks.length}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: theme.radius.xxl,
                marginTop: theme.spacing.sm,
                overflow: 'hidden',
              }}
            >
              {filteredTodayTasks.slice(0, 5).map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  theme={theme}
                  isLast={i === Math.min(filteredTodayTasks.length, 5) - 1}
                  onPress={() => router.push(`/task/${t.id}`)}
                />
              ))}
            </View>
          </Animated.View>
        ) : null}

        {!isSearching && totals.priorityTasks.length > 0 ? (
          <Animated.View
            entering={FadeInDown.delay(220).duration(380).springify().damping(18)}
            style={{ marginTop: theme.spacing.lg }}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: '700',
                }}
              >
                High priority
              </Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 13, fontWeight: '600' }}>
                {totals.priorityTasks.length}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: theme.radius.xxl,
                marginTop: theme.spacing.sm,
                overflow: 'hidden',
              }}
            >
              {totals.priorityTasks.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  theme={theme}
                  isLast={i === totals.priorityTasks.length - 1}
                  onPress={() => router.push(`/task/${t.id}`)}
                />
              ))}
            </View>
          </Animated.View>
        ) : null}

        {projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No projects yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Tap the + button to create your first project and start organizing your tasks.
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: theme.spacing.lg }}>
            <View style={styles.sectionHeader}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: '700',
                }}
              >
                Projects
              </Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 13, fontWeight: '600' }}>
                {filteredProjects.length}
              </Text>
            </View>
            <View style={{ marginTop: theme.spacing.sm }}>
              {filteredProjects.length === 0 ? (
                <Text
                  style={{
                    color: theme.colors.textTertiary,
                    textAlign: 'center',
                    paddingVertical: 24,
                    fontSize: 13,
                  }}
                >
                  No projects match "{query}"
                </Text>
              ) : (
                filteredProjects.map((project, idx) => {
                  const s = stats[project.id] ?? { total: 0, done: 0, overdue: 0 };
                  const ratio = s.total > 0 ? s.done / s.total : 0;
                  return (
                    <Animated.View
                      key={project.id}
                      entering={FadeInDown.delay(60 * idx).duration(380).springify().damping(18)}
                      style={{ marginBottom: theme.spacing.md }}
                    >
                      <SwipeToDelete
                        theme={theme}
                        onDelete={() => actions.remove(project.id)}
                        confirmTitle={`Delete "${project.name}"?`}
                        confirmMessage="All tasks in this project will be removed. This cannot be undone."
                        buttonRadius={theme.radius.xxl}
                      >
                      <Pressable
                        onPress={() => router.push(`/project/${project.id}`)}
                        onLongPress={() => handleOpenMenu(project)}
                        style={({ pressed }) => [
                          {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                            borderRadius: theme.radius.xxl,
                            borderWidth: StyleSheet.hairlineWidth,
                            padding: theme.spacing.lg,
                            opacity: pressed ? 0.85 : 1,
                            transform: [{ scale: pressed ? 0.985 : 1 }],
                          },
                        ]}
                      >
                        <View style={styles.cardHeader}>
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 12,
                              backgroundColor: project.color,
                            }}
                          />
                          <View style={{ flex: 1, marginLeft: theme.spacing.md, minWidth: 0 }}>
                            <Text
                              numberOfLines={1}
                              style={{
                                color: theme.colors.text,
                                fontSize: theme.typography.h3.fontSize,
                                fontWeight: '700',
                              }}
                            >
                              {project.name}
                            </Text>
                            <Text
                              style={{
                                color: theme.colors.textSecondary,
                                fontSize: 13,
                                marginTop: 2,
                              }}
                            >
                              {s.total === 0
                                ? 'No tasks yet'
                                : `${s.done}/${s.total} done${s.overdue > 0 ? ` · ${s.overdue} overdue` : ''}`}
                            </Text>
                          </View>
                          <Text
                            style={{
                              color: theme.colors.textTertiary,
                              fontSize: 13,
                              fontWeight: '700',
                            }}
                          >
                            {Math.round(ratio * 100)}%
                          </Text>
                        </View>
                        <ProgressBar
                          progress={ratio}
                          color={s.overdue > 0 ? theme.colors.danger : theme.colors.priorityMedium}
                          style={{
                            height: 6,
                            borderRadius: theme.radius.round,
                            backgroundColor: theme.colors.border,
                            marginTop: theme.spacing.md,
                          }}
                        />
                      </Pressable>
                      </SwipeToDelete>
                    </Animated.View>
                  );
                })
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={taskListSheet.open}
          onDismiss={closeTaskList}
          style={dialogStyle}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>
            {taskListSheet.tasks.length > 0
              ? `${taskListSheet.title} · ${taskListSheet.tasks.length}`
              : taskListSheet.title}
          </Dialog.Title>
          <Dialog.Content style={{ paddingHorizontal: 0 }}>
            {taskListSheet.tasks.length === 0 ? (
              <Text
                style={{
                  color: theme.colors.textTertiary,
                  paddingHorizontal: 24,
                  paddingVertical: 24,
                  textAlign: 'center',
                  fontSize: 14,
                }}
              >
                {taskListSheet.emptyMsg}
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {taskListSheet.tasks.map((t, i) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    theme={theme}
                    isLast={i === taskListSheet.tasks.length - 1}
                    onPress={() => {
                      closeTaskList();
                      router.push(`/task/${t.id}`);
                    }}
                  />
                ))}
              </ScrollView>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor={theme.colors.primary} onPress={closeTaskList}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>

        <CreateProjectDialog
          visible={createVisible}
          initialColor={initialNewProjectColor}
          theme={theme}
          dialogStyle={dialogStyle}
          paperTheme={paperTheme}
          onDismiss={() => setCreateVisible(false)}
          onCreate={(name, color) => {
            actions.create(name, color);
            setCreateVisible(false);
          }}
        />

        {/* Long Press Action Sheet (Menu) Dialog */}
        <Dialog
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          style={dialogStyle}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>
            {selectedProject?.name}
          </Dialog.Title>
          <Dialog.Content style={{ paddingVertical: 0 }}>
            <List.Item
              title="Rename"
              left={(props) => <List.Icon {...props} icon="pencil-outline" color={theme.colors.primary} />}
              titleStyle={{ color: theme.colors.text }}
              onPress={handleRenamePress}
              style={{ borderRadius: theme.radius.md }}
            />
            <List.Item
              title="Delete"
              left={(props) => <List.Icon {...props} icon="delete-outline" color={theme.colors.danger} />}
              titleStyle={{ color: theme.colors.danger }}
              onPress={handleDelete}
              style={{ borderRadius: theme.radius.md }}
            />
          </Dialog.Content>
        </Dialog>

        <EditProjectDialog
          visible={renameVisible}
          project={selectedProject}
          theme={theme}
          dialogStyle={dialogStyle}
          paperTheme={paperTheme}
          onDismiss={() => {
            setRenameVisible(false);
            setSelectedProject(null);
          }}
          onSave={(id, patch) => {
            actions.update(id, patch);
            setRenameVisible(false);
            setSelectedProject(null);
          }}
        />
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.textInverse}
        onPress={openCreate}
        theme={paperTheme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroCard: {
    padding: 18,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  urgentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
});
