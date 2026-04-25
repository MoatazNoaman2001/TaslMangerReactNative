import React, { useRef } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import type { Theme } from '@/presentation/theme/tokens';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  confirmTitle: string;
  confirmMessage?: string;
  theme: Theme;
  buttonRadius?: number;
  buttonWidth?: number;
}

export function SwipeToDelete({
  children,
  onDelete,
  confirmTitle,
  confirmMessage,
  theme,
  buttonRadius = 16,
  buttonWidth = 88,
}: SwipeToDeleteProps) {
  const ref = useRef<Swipeable>(null);

  const handlePress = () => {
    Alert.alert(confirmTitle, confirmMessage, [
      { text: 'Cancel', style: 'cancel', onPress: () => ref.current?.close() },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          ref.current?.close();
          onDelete();
        },
      },
    ]);
  };

  return (
    <Swipeable
      ref={ref}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={() => (
        <View
          style={{
            justifyContent: 'center',
            paddingLeft: 8,
          }}
        >
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => ({
              backgroundColor: theme.colors.danger,
              alignItems: 'center',
              justifyContent: 'center',
              width: buttonWidth,
              height: '100%',
              borderRadius: buttonRadius,
              opacity: pressed ? 0.85 : 1,
              paddingVertical: 12,
            })}
          >
            <Ionicons name="trash-outline" size={22} color={theme.colors.textInverse} />
            <Text
              style={{
                color: theme.colors.textInverse,
                fontSize: 11,
                fontWeight: '700',
                marginTop: 4,
              }}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      )}
    >
      {children}
    </Swipeable>
  );
}
