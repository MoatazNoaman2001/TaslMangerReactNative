import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  List,
  FAB,
  Dialog,
  TextInput,
  Button,
  Portal,
  ProgressBar,
} from 'react-native-paper';
import { useProjects } from '@/presentation/hooks/useProjects';
import { useProjectActions } from '@/presentation/hooks/useProjectActions';
import { useTaskCache } from '@/data/persistence/MmkvTaskRepository';
import { useTheme } from '@/presentation/theme/ThemeProvider';
import type { Project } from '@/domain/entities/Project';
import { PROJECT_COLORS } from '@/domain/use-cases/projects/CreateProject';
import { ColorSwatchPicker } from '@/presentation/components/ColorSwatchPicker';
import { useKeyboardHeight } from '@/presentation/hooks/useKeyboardHeight';

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
  const dialogStyle = {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    transform: [{ translateY: -keyboardHeight / 2 }],
  };

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

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  const filteredTodayTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return totals.todayTasks;
    return totals.todayTasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [totals.todayTasks, query]);

  // Dialog states
  const [createVisible, setCreateVisible] = useState(false);
  const [newName, setNewName] = useState('');
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]!);
  const [editColor, setEditColor] = useState(PROJECT_COLORS[0]!);

  const paperTheme = {
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
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      actions.create(trimmed, newColor);
      setNewName('');
      setNewColor(PROJECT_COLORS[0]!);
      setCreateVisible(false);
    }
  };

  const openCreate = () => {
    setNewColor(PROJECT_COLORS[projects.length % PROJECT_COLORS.length]!);
    setCreateVisible(true);
  };

  const handleOpenMenu = (project: Project) => {
    setSelectedProject(project);
    setMenuVisible(true);
  };

  const handleRenamePress = () => {
    if (selectedProject) {
      setRenameValue(selectedProject.name);
      setEditColor(selectedProject.color);
      setMenuVisible(false);
      setRenameVisible(true);
    }
  };

  const handleRename = () => {
    if (!selectedProject) return;
    const trimmed = renameValue.trim();
    const patch: { name?: string; color?: string } = {};
    if (trimmed && trimmed !== selectedProject.name) patch.name = trimmed;
    if (editColor !== selectedProject.color) patch.color = editColor;
    if (patch.name != null || patch.color != null) {
      actions.update(selectedProject.id, patch);
    }
    setRenameVisible(false);
    setSelectedProject(null);
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
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textTertiary, fontSize: 18, fontWeight: '500' }}>
              Hello
            </Text>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.h1.fontWeight,
                marginTop: 2,
              }}
            >
              Your projects
            </Text>
          </View>
        </View>

        {projects.length > 0 ? (
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.primaryMuted,
                borderRadius: theme.radius.xxl,
                padding: theme.spacing.lg,
                marginTop: theme.spacing.lg,
              },
            ]}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 13 }}>
              Today's overview
            </Text>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: '700',
                marginTop: 6,
                lineHeight: 28,
              }}
            >
              {totals.all === 0
                ? 'No tasks yet'
                : `You completed ${totals.done} of ${totals.all} tasks`}
            </Text>
            <View style={{ marginTop: theme.spacing.md }}>
              <ProgressBar
                progress={completionRatio}
                color={theme.colors.primary}
                style={{
                  height: 8,
                  borderRadius: theme.radius.round,
                  backgroundColor: theme.colors.surfaceElevated,
                }}
              />
            </View>
          </View>
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
            {projects.map((project, idx) => {
              const s = stats[project.id] ?? { total: 0, done: 0, overdue: 0 };
              const ratio = s.total > 0 ? s.done / s.total : 0;
              return (
                <Animated.View
                  key={project.id}
                  entering={FadeInDown.delay(60 * idx).duration(380).springify().damping(18)}
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
                      marginBottom: theme.spacing.md,
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
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Portal>
        {/* Create Project Dialog */}
        <Dialog
          visible={createVisible}
          onDismiss={() => setCreateVisible(false)}
          style={dialogStyle}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>New Project</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Project Name"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              theme={paperTheme}
              autoFocus
            />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 16, marginBottom: 8, fontSize: 13, fontWeight: '600' }}>
              Color
            </Text>
            <ColorSwatchPicker colors={PROJECT_COLORS} value={newColor} onChange={setNewColor} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor={theme.colors.textSecondary} onPress={() => setCreateVisible(false)}>
              Cancel
            </Button>
            <Button textColor={theme.colors.primary} onPress={handleCreate}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

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

        {/* Rename Dialog */}
        <Dialog
          visible={renameVisible}
          onDismiss={() => setRenameVisible(false)}
          style={dialogStyle}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>Edit Project</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Project Name"
              value={renameValue}
              onChangeText={setRenameValue}
              mode="outlined"
              theme={paperTheme}
              autoFocus
            />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 16, marginBottom: 8, fontSize: 13, fontWeight: '600' }}>
              Color
            </Text>
            <ColorSwatchPicker colors={PROJECT_COLORS} value={editColor} onChange={setEditColor} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor={theme.colors.textSecondary} onPress={() => setRenameVisible(false)}>
              Cancel
            </Button>
            <Button textColor={theme.colors.primary} onPress={handleRename}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
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
  summaryCard: {},
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