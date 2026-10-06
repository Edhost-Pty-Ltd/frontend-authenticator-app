import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type Props = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
};

export function Screen({
  children,
  header,
  footer,
  scroll = true,
  edges = ['top', 'right', 'bottom', 'left'],
  contentStyle,
}: Props) {
  const { colors } = useTheme();
  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[{ flexGrow: 1, paddingHorizontal: 24, paddingTop: header ? 4 : 20, paddingBottom: footer ? 12 : 28 }, contentStyle]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingHorizontal: 24, paddingTop: header ? 4 : 20 }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header ? <View style={{ paddingHorizontal: 8 }}>{header}</View> : null}
        {body}
        {footer ? <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 8, gap: 10 }}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
