import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function hapticSuccess() {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics are optional feedback.
  }
}

export async function hapticError() {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Haptics are optional feedback.
  }
}
