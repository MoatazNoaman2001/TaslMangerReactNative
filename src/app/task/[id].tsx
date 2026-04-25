import React, { useCallback, useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
    Button,
    Checkbox,
    Dialog,
    Divider,
    IconButton,
    Portal,
    ProgressBar,
    Text,
    TextInput,
} from 'react-native-paper';

import {
    TASK_PRIORITIES,
    TASK_PRIORITY,
    type TaskPriority,
} from '@/domain/value-objects/TaskPriority';
import {
    TASK_STATUSES,
    TASK_STATUS,
    type TaskStatus,
} from '@/domain/value-objects/TaskStatus';
import { useTask } from '@/presentation/hooks/useTask';
import { useTaskActions } from '@/presentation/hooks/useTaskActions';
import { useSubtaskProgress } from '@/presentation/hooks/useSubtaskProgress';
import { useTheme } from '@/presentation/theme/ThemeProvider';
import type { Theme } from '@/presentation/theme/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DueDateStrip } from '@/presentation/components/DueDateStrip';

const STATUS_LABEL: Record<TaskStatus, string> = {
    [TASK_STATUS.todo]: 'To do',
    [TASK_STATUS.inProgress]: 'In progress',
    [TASK_STATUS.done]: 'Done',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
    [TASK_PRIORITY.low]: 'Low',
    [TASK_PRIORITY.medium]: 'Medium',
    [TASK_PRIORITY.high]: 'High',
};

export default function TaskDetailsScreen() {
    const theme = useTheme();
    const params = useLocalSearchParams();
    const actions = useTaskActions();

    const rawId = params.id;
    const taskId = Array.isArray(rawId) ? rawId[0] : rawId;

    const task = useTask(taskId);
    const progress = useSubtaskProgress(taskId);

    const [titleDraft, setTitleDraft] = useState(task?.title ?? '');
    const [descriptionDraft, setDescriptionDraft] = useState(task?.description ?? '');
    const [subtaskDraft, setSubtaskDraft] = useState('');
    const [deleteVisible, setDeleteVisible] = useState(false);

    useEffect(() => {
        if (!task) return;
        setTitleDraft(task.title);
        setDescriptionDraft(task.description);
    }, [task?.id]);

    const commitTitle = useCallback(() => {
        if (!task) return;

        const nextTitle = titleDraft.trim();

        if (nextTitle.length === 0) {
            setTitleDraft(task.title);
            return;
        }

        if (nextTitle !== task.title) {
            actions.updateDetails(task.id, { title: nextTitle });
        }
    }, [actions, task, titleDraft]);

    const commitDescription = useCallback(() => {
        if (!task) return;

        const nextDescription = descriptionDraft.trim();

        if (nextDescription !== task.description) {
            actions.updateDetails(task.id, { description: nextDescription });
        }
    }, [actions, task, descriptionDraft]);

    const handleStatusChange = useCallback(
        (status: TaskStatus) => {
            if (!task || task.status === status) return;
            actions.changeStatus(task.id, status);
        },
        [actions, task],
    );

    const handlePriorityChange = useCallback(
        (priority: TaskPriority) => {
            if (!task || task.priority === priority) return;
            actions.updateDetails(task.id, { priority });
        },
        [actions, task],
    );

    const handleAddSubtask = useCallback(() => {
        if (!task) return;

        const title = subtaskDraft.trim();
        if (title.length === 0) return;

        actions.addSubtask(task.id, title);
        setSubtaskDraft('');
    }, [actions, task, subtaskDraft]);

    const handleToggleSubtask = useCallback(
        (subtaskId: string) => {
            if (!task) return;
            actions.toggleSubtask(task.id, subtaskId);
        },
        [actions, task],
    );

    const handleRemoveSubtask = useCallback(
        (subtaskId: string) => {
            if (!task) return;
            actions.removeSubtask(task.id, subtaskId);
        },
        [actions, task],
    );

    const handleConfirmDelete = useCallback(() => {
        if (!task) return;

        setDeleteVisible(false);
        actions.remove(task.id);
        router.back();
    }, [actions, task]);

    const handleDueDateChange = useCallback(
        (next: number | null) => {
            if (!task) return;
            actions.updateDetails(task.id, { dueDate: next });
        },
        [actions, task],
    );

    if (!taskId || !task) {
        return (
            <SafeAreaView
                edges={["top"]}
                style={[styles.screen, { backgroundColor: theme.colors.background }]}

            >
                <View
                    style={[
                        styles.screen,
                        styles.centered,
                        { backgroundColor: theme.colors.background, padding: theme.spacing.xl },
                    ]}
                >
                    <Stack.Screen options={{ title: 'Task' }} />

                    <Text
                        style={[
                            styles.centerTitle,
                            {
                                color: theme.colors.text,
                                fontSize: theme.typography.h2.fontSize,
                                fontWeight: theme.typography.h2.fontWeight,
                                lineHeight: theme.typography.h2.lineHeight,
                            },
                        ]}
                    >
                        Task not found
                    </Text>

                    <Text
                        style={[
                            styles.centerSubtitle,
                            {
                                color: theme.colors.textSecondary,
                                fontSize: theme.typography.body.fontSize,
                                fontWeight: theme.typography.body.fontWeight,
                                lineHeight: theme.typography.body.lineHeight,
                                marginTop: theme.spacing.sm,
                            },
                        ]}
                    >
                        The requested task does not exist.
                    </Text>

                    <Button
                        mode="contained"
                        onPress={() => router.back()}
                        style={{ marginTop: theme.spacing.lg }}
                    >
                        Go back
                    </Button>
                </View>

            </SafeAreaView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <SafeAreaView
                edges={["top"]}
                style={{ backgroundColor: theme.colors.background }}
            >
                <Stack.Screen options={{ title: task.title }} />

                <Animated.View
                    entering={FadeInUp.duration(360).springify().damping(18)}
                    style={[
                        styles.topBar,
                        {
                            paddingHorizontal: theme.spacing.sm,
                            paddingVertical: theme.spacing.xs,
                        },
                    ]}
                >
                    <IconButton
                        icon="chevron-left"
                        size={26}
                        iconColor={theme.colors.text}
                        onPress={() => router.back()}
                        accessibilityLabel="Go back"
                        style={styles.iconBtn}
                    />

                    <View style={styles.topBarTitleWrap}>
                        <Text
                            numberOfLines={1}
                            style={{
                                color: theme.colors.text,
                                textAlign: 'center',
                                fontSize: theme.typography.bodyBold.fontSize,
                                fontWeight: theme.typography.bodyBold.fontWeight,
                            }}
                        >
                            Task details
                        </Text>
                    </View>

                    <Button
                        mode="contained"
                        compact
                        buttonColor={theme.colors.primary}
                        textColor={theme.colors.textInverse}
                        style={{ borderRadius: theme.radius.round, marginRight: theme.spacing.sm }}
                        labelStyle={{ fontWeight: '700', marginHorizontal: 14 }}
                        onPress={() => {
                            commitTitle();
                            commitDescription();
                            router.back();
                        }}
                    >
                        Done
                    </Button>
                </Animated.View>
            </SafeAreaView>

            <ScrollView
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.content,
                    {
                        padding: theme.spacing.lg,
                        paddingBottom: theme.spacing.xxl,
                    },
                ]}
            >
                <Section title="Details" delay={40}>
                    <TextInput
                        mode="outlined"
                        label="Title"
                        value={titleDraft}
                        onChangeText={setTitleDraft}
                        onBlur={commitTitle}
                        onSubmitEditing={commitTitle}
                        returnKeyType="done"
                        style={styles.input}
                    />

                    <TextInput
                        mode="outlined"
                        label="Description"
                        value={descriptionDraft}
                        onChangeText={setDescriptionDraft}
                        onBlur={commitDescription}
                        multiline
                        numberOfLines={5}
                        style={[styles.input, styles.descriptionInput]}
                    />
                </Section>

                <Section title="Status" delay={120}>
                    <StatusSelector
                        value={task.status}
                        onChange={handleStatusChange}
                    />
                </Section>

                <Section title="Priority" delay={200}>
                    <PrioritySelector
                        value={task.priority}
                        onChange={handlePriorityChange}
                    />
                </Section>

                <Section title="Due date" delay={280}>
                    <DueDateStrip value={task.dueDate} onChange={handleDueDateChange} />
                </Section>

                <Section
                    title="Subtasks"
                    delay={360}
                    right={
                        <Text
                            style={{
                                color: theme.colors.textSecondary,
                                fontSize: theme.typography.caption.fontSize,
                                fontWeight: theme.typography.caption.fontWeight,
                                lineHeight: theme.typography.caption.lineHeight,
                            }}
                        >
                            {progress.completed}/{progress.total}
                        </Text>
                    }
                >
                    <ProgressBar
                        progress={progress.ratio}
                        color={theme.colors.primary}
                        style={[
                            styles.progress,
                            {
                                backgroundColor: theme.colors.border,
                                borderRadius: theme.radius.round,
                            },
                        ]}
                    />

                    <View style={[styles.addSubtaskRow, { marginTop: theme.spacing.md }]}>
                        <TextInput
                            mode="outlined"
                            label="New subtask"
                            value={subtaskDraft}
                            onChangeText={setSubtaskDraft}
                            onSubmitEditing={handleAddSubtask}
                            returnKeyType="done"
                            style={styles.addSubtaskInput}
                        />

                        <IconButton
                            icon="plus"
                            size={24}
                            onPress={handleAddSubtask}
                            accessibilityLabel="Add subtask"
                            style={{ marginLeft: theme.spacing.xs }}
                        />
                    </View>

                    <View style={{ marginTop: theme.spacing.sm }}>
                        {task.subtasks.length === 0 ? (
                            <Text
                                style={[
                                    styles.emptySubtasks,
                                    {
                                        color: theme.colors.textTertiary,
                                        fontSize: theme.typography.caption.fontSize,
                                        fontWeight: theme.typography.caption.fontWeight,
                                        lineHeight: theme.typography.caption.lineHeight,
                                        paddingVertical: theme.spacing.md,
                                    },
                                ]}
                            >
                                No subtasks yet.
                            </Text>
                        ) : (
                            task.subtasks.map((subtask, index) => (
                                <View key={subtask.id}>
                                    {index > 0 ? <Divider /> : null}

                                    <View
                                        style={[
                                            styles.subtaskRow,
                                            {
                                                paddingVertical: theme.spacing.sm,
                                            },
                                        ]}
                                    >
                                        <Checkbox
                                            status={subtask.completed ? 'checked' : 'unchecked'}
                                            color={theme.colors.primary}
                                            onPress={() => handleToggleSubtask(subtask.id)}
                                        />

                                        <Pressable
                                            accessibilityRole="button"
                                            onPress={() => handleToggleSubtask(subtask.id)}
                                            style={styles.subtaskTextButton}
                                        >
                                            <Text
                                                style={[
                                                    styles.subtaskTitle,
                                                    {
                                                        color: subtask.completed
                                                            ? theme.colors.textTertiary
                                                            : theme.colors.text,
                                                        fontSize: theme.typography.body.fontSize,
                                                        fontWeight: theme.typography.body.fontWeight,
                                                        lineHeight: theme.typography.body.lineHeight,
                                                        textDecorationLine: subtask.completed
                                                            ? 'line-through'
                                                            : 'none',
                                                    },
                                                ]}
                                            >
                                                {subtask.title}
                                            </Text>
                                        </Pressable>

                                        <IconButton
                                            icon="close"
                                            size={20}
                                            iconColor={theme.colors.textTertiary}
                                            onPress={() => handleRemoveSubtask(subtask.id)}
                                            accessibilityLabel="Remove subtask"
                                        />
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </Section>

                <Section title="Metadata" delay={440}>
                    <MetadataRow
                        label="Created"
                        value={formatDateTime(task.createdAt)}
                    />

                    <MetadataRow
                        label="Updated"
                        value={formatDateTime(task.updatedAt)}
                    />

                    <MetadataRow
                        label="Due"
                        value={task.dueDate == null ? 'No due date' : formatDate(task.dueDate)}
                    />

                    <MetadataRow
                        label="Completed"
                        value={
                            task.completedAt == null
                                ? 'Not completed'
                                : formatDateTime(task.completedAt)
                        }
                    />
                </Section>

                <Button
                    mode="outlined"
                    icon="delete-outline"
                    textColor={theme.colors.danger}
                    onPress={() => setDeleteVisible(true)}
                    style={{ marginTop: theme.spacing.md }}
                >
                    Delete task
                </Button>
            </ScrollView>

            <Portal>
                <Dialog
                    visible={deleteVisible}
                    onDismiss={() => setDeleteVisible(false)}
                >
                    <Dialog.Title>Delete task?</Dialog.Title>

                    <Dialog.Content>
                        <Text>
                            This will remove “{task.title}”. You can undo from the project board.
                        </Text>
                    </Dialog.Content>

                    <Dialog.Actions>
                        <Button onPress={() => setDeleteVisible(false)}>
                            Cancel
                        </Button>

                        <Button
                            textColor={theme.colors.danger}
                            onPress={handleConfirmDelete}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </KeyboardAvoidingView>
    );
}

function Section({
    title,
    right,
    children,
    delay = 0,
}: {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
}) {
    const theme = useTheme();

    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(420).springify().damping(18)}
            style={[
                styles.section,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.xl,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.md,
                },
            ]}
        >
            <View style={[styles.sectionHeader, { marginBottom: theme.spacing.md }]}>
                <Text
                    style={{
                        color: theme.colors.text,
                        fontSize: theme.typography.h3.fontSize,
                        fontWeight: theme.typography.h3.fontWeight,
                        lineHeight: theme.typography.h3.lineHeight,
                    }}
                >
                    {title}
                </Text>

                {right ? <View>{right}</View> : null}
            </View>

            {children}
        </Animated.View>
    );
}

function StatusSelector({
    value,
    onChange,
}: {
    value: TaskStatus;
    onChange: (status: TaskStatus) => void;
}) {
    const theme = useTheme();

    return (
        <View style={styles.pillRow}>
            {TASK_STATUSES.map((status) => {
                const selected = status === value;
                const tone = getStatusTone(status, selected, theme);

                return (
                    <Pressable
                        key={status}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => onChange(status)}
                        style={({ pressed }) => [
                            styles.pill,
                            {
                                backgroundColor: tone.backgroundColor,
                                borderColor: tone.borderColor,
                                borderRadius: theme.radius.round,
                                paddingHorizontal: theme.spacing.md,
                                paddingVertical: theme.spacing.sm,
                                opacity: pressed ? 0.82 : 1,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: tone.textColor,
                                fontSize: theme.typography.caption.fontSize,
                                fontWeight: theme.typography.bodyBold.fontWeight,
                                lineHeight: theme.typography.caption.lineHeight,
                            }}
                        >
                            {STATUS_LABEL[status]}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function PrioritySelector({
    value,
    onChange,
}: {
    value: TaskPriority;
    onChange: (priority: TaskPriority) => void;
}) {
    const theme = useTheme();

    return (
        <View style={styles.pillRow}>
            {TASK_PRIORITIES.map((priority) => {
                const selected = priority === value;
                const color = getPriorityColor(priority, theme);

                return (
                    <Pressable
                        key={priority}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => onChange(priority)}
                        style={({ pressed }) => [
                            styles.pill,
                            {
                                backgroundColor: selected ? color : theme.colors.surface,
                                borderColor: selected ? color : theme.colors.borderStrong,
                                borderRadius: theme.radius.round,
                                paddingHorizontal: theme.spacing.md,
                                paddingVertical: theme.spacing.sm,
                                opacity: pressed ? 0.82 : 1,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: selected ? theme.colors.textInverse : color,
                                fontSize: theme.typography.caption.fontSize,
                                fontWeight: theme.typography.bodyBold.fontWeight,
                                lineHeight: theme.typography.caption.lineHeight,
                            }}
                        >
                            {PRIORITY_LABEL[priority]}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function MetadataRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    const theme = useTheme();

    return (
        <View style={styles.metadataRow}>
            <Text
                style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.caption.fontSize,
                    fontWeight: theme.typography.caption.fontWeight,
                    lineHeight: theme.typography.caption.lineHeight,
                }}
            >
                {label}
            </Text>

            <Text
                style={{
                    color: theme.colors.text,
                    fontSize: theme.typography.caption.fontSize,
                    fontWeight: theme.typography.bodyBold.fontWeight,
                    lineHeight: theme.typography.caption.lineHeight,
                }}
            >
                {value}
            </Text>
        </View>
    );
}

function getStatusTone(
    status: TaskStatus,
    selected: boolean,
    theme: Theme,
): {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
} {
    if (!selected) {
        return {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderStrong,
            textColor: theme.colors.textSecondary,
        };
    }

    switch (status) {
        case TASK_STATUS.todo:
            return {
                backgroundColor: theme.colors.borderStrong,
                borderColor: theme.colors.borderStrong,
                textColor: theme.colors.text,
            };

        case TASK_STATUS.inProgress:
            return {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
                textColor: theme.colors.textInverse,
            };

        case TASK_STATUS.done:
            return {
                backgroundColor: theme.colors.success,
                borderColor: theme.colors.success,
                textColor: theme.colors.textInverse,
            };
    }
}

function getPriorityColor(priority: TaskPriority, theme: Theme): string {
    switch (priority) {
        case TASK_PRIORITY.low:
            return theme.colors.priorityLow;

        case TASK_PRIORITY.medium:
            return theme.colors.priorityMedium;

        case TASK_PRIORITY.high:
            return theme.colors.priorityHigh;
    }
}

function formatDate(value: number): string {
    return new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatDateTime(value: number): string {
    return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerTitle: {
        textAlign: 'center',
    },
    centerSubtitle: {
        textAlign: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        margin: 0,
    },
    topBarTitleWrap: {
        flex: 1,
        minWidth: 0,
    },
    topBarTitle: {
        textAlign: 'center',
    },
    content: {},
    section: {
        borderWidth: StyleSheet.hairlineWidth,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        marginBottom: 12,
    },
    descriptionInput: {
        minHeight: 120,
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pill: {
        borderWidth: StyleSheet.hairlineWidth,
        marginRight: 8,
        marginBottom: 8,
    },
    progress: {
        height: 6,
        overflow: 'hidden',
    },
    addSubtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addSubtaskInput: {
        flex: 1,
    },
    emptySubtasks: {
        textAlign: 'center',
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtaskTextButton: {
        flex: 1,
        minWidth: 0,
    },
    subtaskTitle: {},
    metadataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
});