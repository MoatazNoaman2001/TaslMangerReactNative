import React, { useCallback } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from 'react-native';
import { router, Stack, type Href, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, Text } from 'react-native-paper';

import type { TaskStatus } from '@/domain/value-objects/TaskStatus';
import { KanbanColumn } from '@/presentation/components/KanbanColumn';
import { useProject } from '@/presentation/hooks/useProject';
import { useTaskActions } from '@/presentation/hooks/useTaskActions';
import { useUndoRedo } from '@/presentation/hooks/useUndoRedo';
import { useTheme } from '@/presentation/theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export default function ProjectKanbanScreen() {
    const theme = useTheme();
    const params = useLocalSearchParams();
    const { width } = useWindowDimensions();

    const rawId = params.id;
    const projectId = Array.isArray(rawId) ? rawId[0] : rawId;

    const project = useProject(projectId);
    const taskActions = useTaskActions();
    const { canUndo, canRedo, undo, redo } = useUndoRedo();

    const gutter = theme.spacing.lg;
    const columnWidth = Math.max(280, width - gutter * 2);
    const snapInterval = columnWidth + gutter;

    const handleAddTask = useCallback(() => {
        if (!projectId) return;

        const task = taskActions.create({
            projectId,
            title: 'Untitled task',
        });

        router.push(`/task/${task.id}` as Href);
    }, [projectId, taskActions]);

    if (!projectId || !project) {
        return (
            <View
                style={[
                    styles.screen,
                    {
                        backgroundColor: theme.colors.background,
                    },
                ]}
            >
                <Stack.Screen options={{ title: 'Project' }} />

                <View style={[styles.emptyState, { padding: theme.spacing.xl }]}>
                    <Text
                        style={[
                            styles.emptyTitle,
                            {
                                color: theme.colors.text,
                                fontSize: theme.typography.h2.fontSize,
                                fontWeight: theme.typography.h2.fontWeight,
                                lineHeight: theme.typography.h2.lineHeight,
                            },
                        ]}
                    >
                        Project not found
                    </Text>

                    <Text
                        style={[
                            styles.emptySubtitle,
                            {
                                color: theme.colors.textSecondary,
                                fontSize: theme.typography.body.fontSize,
                                fontWeight: theme.typography.body.fontWeight,
                                lineHeight: theme.typography.body.lineHeight,
                                marginTop: theme.spacing.sm,
                            },
                        ]}
                    >
                        The requested project does not exist.
                    </Text>

                    <Button
                        mode="contained"
                        onPress={() => router.back()}
                        style={{ marginTop: theme.spacing.lg }}
                    >
                        Go back
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView
            edges={["top"]}
            style={[styles.screen, { backgroundColor: theme.colors.background }]}
        >
            <Stack.Screen options={{ title: project.name, headerShown: false }} />
            <View
                style={[
                    styles.screen,
                    {
                        backgroundColor: theme.colors.background,
                    },
                ]}
            >
                <View
                    style={[
                        styles.header,
                        {
                            backgroundColor: theme.colors.background,
                            borderBottomColor: theme.colors.border,
                            paddingHorizontal: theme.spacing.sm,
                            paddingVertical: theme.spacing.md,
                        },
                    ]}
                >
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={() => router.back()}
                        accessibilityLabel="Go back"
                    />

                    <View style={styles.headerTitleWrap}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.projectName,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.typography.h2.fontSize,
                                    fontWeight: theme.typography.h2.fontWeight,
                                    lineHeight: theme.typography.h2.lineHeight,
                                },
                            ]}
                        >
                            {project.name}
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        <IconButton
                            icon="undo"
                            size={22}
                            disabled={!canUndo}
                            onPress={undo}
                            accessibilityLabel="Undo"
                        />

                        <IconButton
                            icon="redo"
                            size={22}
                            disabled={!canRedo}
                            onPress={redo}
                            accessibilityLabel="Redo"
                        />

                        <IconButton
                            icon="plus"
                            size={24}
                            onPress={handleAddTask}
                            accessibilityLabel="Add task"
                        />
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToAlignment="start"
                    snapToInterval={snapInterval}
                    style={styles.board}
                    contentContainerStyle={[
                        styles.boardContent,
                        {
                            paddingHorizontal: gutter,
                            paddingVertical: theme.spacing.lg,
                        },
                    ]}
                >
                    {STATUSES.map((status, index) => (
                        <View
                            key={status}
                            style={[
                                styles.columnPage,
                                {
                                    width: columnWidth,
                                    marginRight: index === STATUSES.length - 1 ? 0 : gutter,
                                },
                            ]}
                        >
                            <KanbanColumn projectId={projectId} status={status} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitleWrap: {
        flex: 1,
        minWidth: 0,
    },
    projectName: {},
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    board: {
        flex: 1,
    },
    boardContent: {
        alignItems: 'stretch',
    },
    columnPage: {
        height: '100%',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
    },
});