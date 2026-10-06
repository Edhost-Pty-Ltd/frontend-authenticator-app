import { useState, type ReactNode, type Ref } from 'react';
import { Platform, Pressable, TextInput, View, type KeyboardTypeOptions, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  inputRef?: Ref<TextInput>;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  editable?: boolean;
  icon?: IconName;
  trailing?: ReactNode;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secureTextEntry,
  keyboardType,
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  inputRef,
  autoCapitalize = 'none',
  autoCorrect = false,
  editable = true,
  trailing,
}: Props) {
  const { colors, radius, fonts } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

  return (
    <View style={{ gap: 8 }}>
      <Text variant="label" nativeID={`${label}-label`}>
        {label}
      </Text>
      <View
        style={{
          minHeight: 54,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor,
          backgroundColor: colors.input,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          opacity: editable ? 1 : 0.6,
        }}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={hint}
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 16,
            lineHeight: 22,
            fontFamily: fonts.regular,
            paddingVertical: 14,
            ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
          }}
        />
        {trailing}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function PasswordField({
  label,
  value,
  onChangeText,
  error,
  placeholder = 'Enter your password',
  textContentType = 'password',
  autoComplete = 'password',
  returnKeyType,
  onSubmitEditing,
  inputRef,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  placeholder?: string;
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  inputRef?: Ref<TextInput>;
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={error}
      placeholder={placeholder}
      secureTextEntry={!visible}
      textContentType={textContentType}
      autoComplete={autoComplete}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      inputRef={inputRef}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((current) => !current)}
          hitSlop={8}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={visible ? 'eye-off' : 'eye'} color={colors.muted} />
        </Pressable>
      }
    />
  );
}
