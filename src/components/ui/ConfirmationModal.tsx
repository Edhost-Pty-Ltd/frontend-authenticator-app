import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const { colors, radius } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable
        accessibilityViewIsModal
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Pressable
          onPress={() => {}}
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: colors.card,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 24,
            gap: 16,
          }}>
          <View style={{ gap: 8 }}>
            <Text variant="subheading" accessibilityRole="header">
              {title}
            </Text>
            <Text tone="muted">{message}</Text>
          </View>
          <Button label={cancelLabel} variant="secondary" onPress={onCancel} disabled={loading} />
          <Button
            label={confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            onPress={onConfirm}
            loading={loading}
            loadingLabel={confirmLabel}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
