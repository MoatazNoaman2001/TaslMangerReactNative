import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Button, Dialog, TextInput } from 'react-native-paper';

import { PROJECT_COLORS } from '@/domain/use-cases/projects/CreateProject';
import { ColorSwatchPicker } from '@/presentation/components/ColorSwatchPicker';
import type { Theme } from '@/presentation/theme/tokens';

import type { DialogStyleProp, PaperThemeProp } from './types';

interface Props {
  visible: boolean;
  initialColor: string;
  theme: Theme;
  dialogStyle: DialogStyleProp;
  paperTheme: PaperThemeProp;
  onDismiss: () => void;
  onCreate: (name: string, color: string) => void;
}

/**
 * Dialog for creating a new project. Owns its own draft state so typing
 * never re-renders the dashboard tree — that workaround was load-bearing on
 * Android where heavy parent re-renders caused Paper's TextInput to
 * duplicate keystrokes.
 */
export function CreateProjectDialog({
  visible,
  initialColor,
  theme,
  dialogStyle,
  paperTheme,
  onDismiss,
  onCreate,
}: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (visible) {
      setName('');
      setColor(initialColor);
    }
  }, [visible, initialColor]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) onCreate(trimmed, color);
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={dialogStyle}>
      <Dialog.Title style={{ color: theme.colors.text }}>New Project</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label="Project Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          theme={paperTheme}
          autoFocus
        />
        <Text
          style={{
            color: theme.colors.textSecondary,
            marginTop: 16,
            marginBottom: 8,
            fontSize: 13,
            fontWeight: '600',
          }}
        >
          Color
        </Text>
        <ColorSwatchPicker colors={PROJECT_COLORS} value={color} onChange={setColor} />
      </Dialog.Content>
      <Dialog.Actions>
        <Button textColor={theme.colors.textSecondary} onPress={onDismiss}>
          Cancel
        </Button>
        <Button textColor={theme.colors.primary} onPress={handleSubmit}>
          Create
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
