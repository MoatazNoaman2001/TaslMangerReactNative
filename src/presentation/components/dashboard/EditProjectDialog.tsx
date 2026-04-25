import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Button, Dialog, TextInput } from 'react-native-paper';

import type { Project } from '@/domain/entities/Project';
import { PROJECT_COLORS } from '@/domain/use-cases/projects/CreateProject';
import { ColorSwatchPicker } from '@/presentation/components/ColorSwatchPicker';
import type { Theme } from '@/presentation/theme/tokens';

import type { DialogStyleProp, PaperThemeProp } from './types';

interface Props {
  visible: boolean;
  project: Project | null;
  theme: Theme;
  dialogStyle: DialogStyleProp;
  paperTheme: PaperThemeProp;
  onDismiss: () => void;
  onSave: (id: string, patch: { name?: string; color?: string }) => void;
}

/**
 * Edit-project dialog. Same draft-state isolation as
 * {@link CreateProjectDialog}. Submits a minimal patch (only fields that
 * actually changed) so a no-op edit doesn't enter the undo stack.
 */
export function EditProjectDialog({
  visible,
  project,
  theme,
  dialogStyle,
  paperTheme,
  onDismiss,
  onSave,
}: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]!);

  useEffect(() => {
    if (visible && project) {
      setName(project.name);
      setColor(project.color);
    }
  }, [visible, project]);

  const handleSubmit = () => {
    if (!project) return;
    const trimmed = name.trim();
    const patch: { name?: string; color?: string } = {};
    if (trimmed && trimmed !== project.name) patch.name = trimmed;
    if (color !== project.color) patch.color = color;
    if (patch.name != null || patch.color != null) {
      onSave(project.id, patch);
    } else {
      onDismiss();
    }
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={dialogStyle}>
      <Dialog.Title style={{ color: theme.colors.text }}>Edit Project</Dialog.Title>
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
          Save
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
