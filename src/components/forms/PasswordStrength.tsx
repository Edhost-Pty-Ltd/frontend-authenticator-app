import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';
import { passwordChecks } from '@/utils/validation';

const requirements = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'upper', label: 'An uppercase letter' },
  { key: 'lower', label: 'A lowercase letter' },
  { key: 'number', label: 'A number' },
] as const;

export function PasswordStrength({ password }: { password: string }) {
  const { colors, radius } = useTheme();
  const checks = passwordChecks(password);
  const met = requirements.filter((item) => checks[item.key]).length;
  const level = password.length === 0 ? 0 : met <= 2 ? 1 : met === 3 ? 2 : 3;
  const label = ['Enter a password', 'Weak', 'Medium', 'Strong'][level];
  const tone = level === 0 ? colors.border : level === 1 ? colors.error : level === 2 ? colors.warning : colors.success;
  const textTone = level <= 1 ? 'danger' : level === 2 ? 'warning' : 'success';

  return (
    <View style={{ gap: 10 }} accessibilityRole="summary" accessibilityLabel={`Password strength ${label}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="label">Password strength</Text>
        <Text variant="label" tone={password.length === 0 ? 'muted' : textTone}>
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: 4 }, (_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 6,
              borderRadius: radius.pill,
              backgroundColor: index < (level === 0 ? 0 : level === 1 ? 1 : level === 2 ? 3 : 4) ? tone : colors.border,
            }}
          />
        ))}
      </View>
      <View style={{ gap: 6 }}>
        {requirements.map((item) => {
          const done = checks[item.key];
          return (
            <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name={done ? 'check' : 'circle'} size={16} color={done ? colors.success : colors.placeholder} />
              <Text variant="caption" tone={done ? 'default' : 'muted'} accessibilityLabel={`${item.label}, ${done ? 'met' : 'not met'}`}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
