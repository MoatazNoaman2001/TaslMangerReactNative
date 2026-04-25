import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Portal, Snackbar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/presentation/theme/ThemeProvider';
import { useTaskActions } from '@/presentation/hooks/useTaskActions';
import { useUndoRedo } from '@/presentation/hooks/useUndoRedo';
import type { TaskStatus } from '@/domain/value-objects/TaskStatus';

interface SwipeableTaskRowProps {
    taskId: string;
    children: React.ReactNode;
}

export function SwipeableTaskRow({ taskId, children }: SwipeableTaskRowProps) {
    const theme = useTheme();
    const taskActions = useTaskActions();
    const { undo } = useUndoRedo();

    const [snackVisible, setSnackVisible] = useState(false);

    // UI Thread Shared Values
    const rowWidth = useSharedValue(0);
    const rowHeight = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const handleLayout = (e: LayoutChangeEvent) => {
        rowWidth.value = e.nativeEvent.layout.width;
        rowHeight.value = e.nativeEvent.layout.height;
    };

    // JS Thread Final Actions
    const triggerDelete = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        rowHeight.value = withTiming(0, { duration: 250 }, (finished) => {
            if (finished) {
                runOnJS(taskActions.remove)(taskId);
                runOnJS(setSnackVisible)(true);
            }
        });
    }, [taskId, taskActions]);

    const triggerComplete = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        taskActions.changeStatus(taskId, 'done' as TaskStatus);
    }, [taskId, taskActions]);

    const handleUndo = useCallback(() => {
        undo();
        setSnackVisible(false);
    }, [undo]);

    const pan = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-5, 5])
        .onUpdate((e) => {
            const maxSwipe = rowWidth.value * 0.7;
            let tx = e.translationX;

            // Rubber-band effect past 70% width
            if (Math.abs(tx) > maxSwipe) {
                tx = maxSwipe * Math.sign(tx) + (tx - maxSwipe * Math.sign(tx)) * 0.2;
            }

            translateX.value = tx;
        })
        .onEnd((e) => {
            const threshold = rowWidth.value * 0.4;

            if (e.translationX < -threshold) {
                // Swipe Left -> Delete
                translateX.value = withTiming(-rowWidth.value, { duration: 250 });
                opacity.value = withTiming(0, { duration: 250 });
                rowHeight.value = withDelay(200, withTiming(0, { duration: 200 }));
                runOnJS(triggerDelete)();
            } else if (e.translationX > threshold) {
                // Swipe Right -> Complete
                translateX.value = withTiming(rowWidth.value, { duration: 250 });
                opacity.value = withTiming(0, { duration: 250 });
                rowHeight.value = withDelay(200, withTiming(0, { duration: 200 }));
                runOnJS(triggerComplete)();
            } else {
                // Snap back with spring
                translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
            }
        });

    // UI Thread Styles
    const containerStyle = useAnimatedStyle(() => ({
        height: rowHeight.value > 0 ? rowHeight.value : undefined,
        opacity: opacity.value,
        overflow: 'hidden' as const,
    }));

    const foregroundStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const deleteTextStyle = useAnimatedStyle(() => {
        const thr = rowWidth.value * 0.4;
        return {
            opacity: interpolate(
                translateX.value,
                [-thr * 0.5, -thr],
                [0, 1],
                Extrapolation.CLAMP
            ),
        };
    });

    const doneTextStyle = useAnimatedStyle(() => {
        const thr = rowWidth.value * 0.4;
        return {
            opacity: interpolate(
                translateX.value,
                [thr * 0.5, thr],
                [0, 1],
                Extrapolation.CLAMP
            ),
        };
    });

    return (
        <>
            <Animated.View onLayout={handleLayout} style={containerStyle}>
                {/* Delete Background (Reveals on Left Swipe) */}
                <View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: theme.colors.dangerMuted,
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            paddingRight: theme.spacing.xl,
                        },
                    ]}
                >
                    <Animated.Text
                        style={[
                            styles.actionText,
                            { color: theme.colors.danger, fontSize: theme.typography.bodyBold.fontSize, fontWeight: '600' },
                            deleteTextStyle,
                        ]}
                    >
                        Delete
                    </Animated.Text>
                </View>

                {/* Done Background (Reveals on Right Swipe) */}
                <View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: theme.colors.successMuted,
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            paddingLeft: theme.spacing.xl,
                        },
                    ]}
                >
                    <Animated.Text
                        style={[
                            styles.actionText,
                            { color: theme.colors.success, fontSize: theme.typography.bodyBold.fontSize, fontWeight: '600' },
                            doneTextStyle,
                        ]}
                    >
                        ✓ Done
                    </Animated.Text>
                </View>

                {/* Foreground Content */}
                <GestureDetector gesture={pan}>
                    {/* REMOVE StyleSheet.absoluteFill here */}
                    <Animated.View style={[{ backgroundColor: theme.colors.surface }, foregroundStyle]}>
                        {children}
                    </Animated.View>
                </GestureDetector>

            </Animated.View>

            {/* Snackbar in Portal survives row unmount during collapse animation */}
            <Portal>
                <Snackbar
                    visible={snackVisible}
                    onDismiss={() => setSnackVisible(false)}
                    action={{
                        label: 'Undo',
                        onPress: handleUndo,
                        textColor: theme.colors.primary,
                    }}
                    duration={4000}
                    style={{ backgroundColor: theme.colors.surfaceElevated }}
                >
                    Task deleted
                </Snackbar>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    actionText: {
        letterSpacing: 0.2,
    },
});