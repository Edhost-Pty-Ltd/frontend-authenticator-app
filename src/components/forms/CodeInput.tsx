import { useEffect, useRef } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
};

export function CodeInput({ value, onChange, onComplete, error, editable = true, autoFocus }: Props) {
  const { colors, radius, fonts } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const lastCompleted = useRef('');

  useEffect(() => {
    if (value.length < 6) lastCompleted.current = '';
  }, [value]);

  return (
    <Pressable accessibilityRole="none" onPress={() => inputRef.current?.focus()}>
      <View style={{ position: 'relative' }}>
        <View style={{ flexDirection: 'row', gap: 8 }} pointerEvents="none">
          {Array.from({ length: 6 }, (_, index) => {
            const digit = value[index] ?? '';
            const active = value.length === index;
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  maxWidth: 56,
                  height: 58,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: error ? colors.error : active ? colors.primary : colors.border,
                  backgroundColor: colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text variant="subheading" accessibilityElementsHidden>
                  {digit}
                </Text>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          autoFocus={autoFocus}
          editable={editable}
          onChangeText={(next) => {
            const digits = next.replace(/\D/g, '').slice(0, 6);
            onChange(digits);
            if (digits.length === 6 && digits !== lastCompleted.current) {
              lastCompleted.current = digits;
              onComplete?.(digits);
            }
          }}
          keyboardType="number-pad"
          inputMode="numeric"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={6}
          caretHidden
          accessibilityLabel="6-digit authentication code"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.02,
            color: 'transparent',
            fontFamily: fonts.semibold,
            ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
          }}
        />
      </View>
    </Pressable>
  );
}
