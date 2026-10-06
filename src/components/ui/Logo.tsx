import { Image } from 'react-native';

const source = require('@/assets/images/favicon.png');

type Props = {
  size?: number;
  tone?: 'brand' | 'inverse';
};

export function Logo({ size = 64 }: Props) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      source={source}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
    />
  );
}
