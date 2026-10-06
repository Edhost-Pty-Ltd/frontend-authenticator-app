import { useTheme } from '@/theme';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'back'
  | 'chevron'
  | 'eye'
  | 'eye-off'
  | 'shield'
  | 'check'
  | 'alert'
  | 'copy'
  | 'mail'
  | 'user'
  | 'settings'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'logout'
  | 'device'
  | 'info'
  | 'close'
  | 'home'
  | 'key'
  | 'lock'
  | 'circle'
  | 'dot'
  | 'refresh'
  | 'plus'
  | 'trash'
  | 'camera';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color, strokeWidth = 1.75 }: Props) {
  const { colors } = useTheme();
  const stroke = color ?? colors.text;
  const props = {
    stroke,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'back' ? <Path d="M15 5 L8 12 L15 19" {...props} /> : null}
      {name === 'chevron' ? <Path d="M9 5 L16 12 L9 19" {...props} /> : null}
      {name === 'eye' ? (
        <>
          <Path d="M2.5 12 C5 7.5 8.5 5.5 12 5.5 C15.5 5.5 19 7.5 21.5 12 C19 16.5 15.5 18.5 12 18.5 C8.5 18.5 5 16.5 2.5 12 Z" {...props} />
          <Circle cx={12} cy={12} r={2.2} {...props} />
        </>
      ) : null}
      {name === 'eye-off' ? (
        <>
          <Path d="M4 6.5 C6.2 8.2 8.8 9.2 12 9.2 C15.2 9.2 17.8 8.2 20 6.5" {...props} />
          <Path d="M3 12 C5.2 15.6 8.3 17.6 12 17.6 C13.6 17.6 15.1 17.2 16.5 16.5" {...props} />
          <Path d="M5 18 L18 6" {...props} />
        </>
      ) : null}
      {name === 'shield' ? <Path d="M12 3.5 L19 6.2 V12.2 C19 16.2 16.2 19.1 12 20.6 C7.8 19.1 5 16.2 5 12.2 V6.2 Z" {...props} /> : null}
      {name === 'check' ? <Path d="M5 12.5 L9.5 17 L19 7.5" {...props} /> : null}
      {name === 'alert' ? (
        <>
          <Circle cx={12} cy={12} r={8} {...props} />
          <Path d="M12 8 V12.5" {...props} />
          <Circle cx={12} cy={15.6} r={0.8} fill={stroke} />
        </>
      ) : null}
      {name === 'copy' ? (
        <>
          <Rect x={8} y={8} width={11} height={11} rx={2} {...props} />
          <Path d="M6 16 V6.5 C6 5.7 6.7 5 7.5 5 H16" {...props} />
        </>
      ) : null}
      {name === 'mail' ? (
        <>
          <Rect x={3.5} y={5.5} width={17} height={13} rx={2} {...props} />
          <Path d="M4.5 7 L12 12.5 L19.5 7" {...props} />
        </>
      ) : null}
      {name === 'user' ? (
        <>
          <Circle cx={12} cy={8.5} r={3} {...props} />
          <Path d="M6 19 C6.8 15.6 9 14 12 14 C15 14 17.2 15.6 18 19" {...props} />
        </>
      ) : null}
      {name === 'settings' ? (
        <>
          <Path d="M4 7 H20" {...props} />
          <Path d="M4 12 H20" {...props} />
          <Path d="M4 17 H20" {...props} />
          <Circle cx={9} cy={7} r={1.7} fill={stroke} />
          <Circle cx={15} cy={12} r={1.7} fill={stroke} />
          <Circle cx={10} cy={17} r={1.7} fill={stroke} />
        </>
      ) : null}
      {name === 'sun' ? (
        <>
          <Circle cx={12} cy={12} r={3.2} {...props} />
          <Path d="M12 3.5 V5.5 M12 18.5 V20.5 M3.5 12 H5.5 M18.5 12 H20.5 M6 6 L7.4 7.4 M16.6 16.6 L18 18 M18 6 L16.6 7.4 M7.4 16.6 L6 18" {...props} />
        </>
      ) : null}
      {name === 'moon' ? <Path d="M15.5 15.2 A6.2 6.2 0 1 1 9.4 4.6 A4.8 4.8 0 0 0 15.5 15.2 Z" {...props} /> : null}
      {name === 'monitor' ? (
        <>
          <Rect x={3.5} y={4.5} width={17} height={11.5} rx={1.8} {...props} />
          <Path d="M9 19.5 H15" {...props} />
          <Path d="M12 16 V19.5" {...props} />
        </>
      ) : null}
      {name === 'logout' ? (
        <>
          <Path d="M10 4.5 H6.5 C5.7 4.5 5 5.2 5 6 V18 C5 18.8 5.7 19.5 6.5 19.5 H10" {...props} />
          <Path d="M12 12 H20" {...props} />
          <Path d="M17 9 L20 12 L17 15" {...props} />
        </>
      ) : null}
      {name === 'device' ? (
        <>
          <Rect x={8} y={3} width={8} height={18} rx={2} {...props} />
          <Path d="M11 18.2 H13" {...props} />
        </>
      ) : null}
      {name === 'info' ? (
        <>
          <Circle cx={12} cy={12} r={8} {...props} />
          <Path d="M12 11 V16" {...props} />
          <Circle cx={12} cy={8.2} r={0.8} fill={stroke} />
        </>
      ) : null}
      {name === 'close' ? <Path d="M7 7 L17 17 M17 7 L7 17" {...props} /> : null}
      {name === 'home' ? <Path d="M4 11.2 L12 4.5 L20 11.2 V19.5 H15.2 V14.2 H8.8 V19.5 H4 Z" {...props} /> : null}
      {name === 'key' ? (
        <>
          <Circle cx={8} cy={12} r={3.1} {...props} />
          <Path d="M11 12 H20.5" {...props} />
          <Path d="M17.2 12 V15" {...props} />
          <Path d="M14.4 12 V14.4" {...props} />
        </>
      ) : null}
      {name === 'lock' ? (
        <>
          <Rect x={5.5} y={10.5} width={13} height={9} rx={2} {...props} />
          <Path d="M8.2 10.5 V8.2 A3.8 3.8 0 0 1 15.8 8.2 V10.5" {...props} />
        </>
      ) : null}
      {name === 'circle' ? <Circle cx={12} cy={12} r={6.5} {...props} /> : null}
      {name === 'dot' ? <Circle cx={12} cy={12} r={4.2} fill={stroke} /> : null}
      {name === 'refresh' ? (
        <>
          <Path d="M19 12 A7 7 0 1 1 16.8 6.2" {...props} />
          <Path d="M16.5 3.5 V7 H20" {...props} />
        </>
      ) : null}
      {name === 'plus' ? <Path d="M12 5 V19 M5 12 H19" {...props} /> : null}
      {name === 'trash' ? (
        <>
          <Path d="M5 7 H19" {...props} />
          <Path d="M9 7 V5.5 H15 V7" {...props} />
          <Path d="M7 7 L8 19 H16 L17 7" {...props} />
        </>
      ) : null}
      {name === 'camera' ? (
        <>
          <Path d="M4 8.5 H7.2 L8.6 6.5 H15.4 L16.8 8.5 H20 V18 H4 Z" {...props} />
          <Circle cx={12} cy={13} r={2.8} {...props} />
        </>
      ) : null}
    </Svg>
  );
}
