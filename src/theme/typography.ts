export const typeScale = {
  display: { fontSize: 36, lineHeight: 44, letterSpacing: -0.6 },
  heading: { fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  subheading: { fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  caption: { fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  label: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  button: { fontSize: 16, lineHeight: 22, letterSpacing: 0.1 },
} as const;

export type TypeVariant = keyof typeof typeScale;

export const fontFamilies = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  display: 'Fraunces_600SemiBold',
} as const;

export type FontRole = keyof typeof fontFamilies;
