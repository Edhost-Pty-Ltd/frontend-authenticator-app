import { useTheme } from '@/theme';
import { typeScale, type TypeVariant } from '@/theme/typography';
import { Text as NativeText, type TextProps as NativeTextProps, type TextStyle } from 'react-native';

type Tone = 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'onPrimary' | 'onDanger';

type Props = NativeTextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  center?: boolean;
};

const variantFont: Record<TypeVariant, 'regular' | 'medium' | 'semibold' | 'display'> = {
  display: 'display',
  heading: 'semibold',
  subheading: 'semibold',
  body: 'regular',
  caption: 'regular',
  label: 'medium',
  button: 'semibold',
};

export function Text({ variant = 'body', tone = 'default', center, style, ...props }: Props) {
  const { colors, fonts } = useTheme();
  const toneColor: Record<Tone, string> = {
    default: colors.text,
    muted: colors.muted,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    onPrimary: colors.onPrimary,
    onDanger: colors.onDanger,
  };
  const scale = typeScale[variant];
  const textStyle: TextStyle = {
    color: toneColor[tone],
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    letterSpacing: scale.letterSpacing,
    fontFamily: fonts[variantFont[variant]],
    textAlign: center ? 'center' : undefined,
  };

  return <NativeText style={[textStyle, style]} {...props} />;
}
