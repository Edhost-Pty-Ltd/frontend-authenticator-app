export const brandInk = '#10211F';
export const brandDeep = '#143F3A';
export const brandFoam = '#F4F1EA';
export const brandTide = '#8ED9CF';

export type ColorPalette = {
  background: string;
  chrome: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  placeholder: string;
  border: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  secondary: string;
  danger: string;
  onDanger: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  successMuted: string;
  warningMuted: string;
  errorMuted: string;
  infoMuted: string;
  input: string;
  overlay: string;
  inverse: string;
};

export const lightColors: ColorPalette = {
  background: '#F3F0EA',
  chrome: '#E6E0D4',
  surface: '#EAE4DA',
  card: '#FFFcf8',
  text: '#16211F',
  muted: '#3F4C48',
  placeholder: '#6E7874',
  border: '#D9D2C6',
  primary: brandDeep,
  primaryPressed: '#0E2F2B',
  onPrimary: brandFoam,
  secondary: '#E4DDD2',
  danger: '#9B2C23',
  onDanger: '#FFF8F6',
  success: '#1B7A4E',
  warning: '#8A5A12',
  error: '#9B2C23',
  info: '#1D5C8A',
  successMuted: '#E4F3EB',
  warningMuted: '#F8EEDD',
  errorMuted: '#F8E8E6',
  infoMuted: '#E5F0F8',
  input: '#F7F4EE',
  overlay: 'rgba(16, 33, 31, 0.48)',
  inverse: brandFoam,
};

export const darkColors: ColorPalette = {
  background: '#0E1412',
  chrome: '#090C0B',
  surface: '#151C1A',
  card: '#1B2421',
  text: '#F3F0E8',
  muted: '#C3CCC8',
  placeholder: '#8F9A96',
  border: '#2C3834',
  primary: brandTide,
  primaryPressed: '#A5E6DD',
  onPrimary: brandInk,
  secondary: '#24302C',
  danger: '#F0A8A1',
  onDanger: '#2A1210',
  success: '#7DDCAB',
  warning: '#E6C07A',
  error: '#F0A8A1',
  info: '#9CC8E6',
  successMuted: '#163328',
  warningMuted: '#332916',
  errorMuted: '#3A201E',
  infoMuted: '#172833',
  input: '#121917',
  overlay: 'rgba(0, 0, 0, 0.62)',
  inverse: brandFoam,
};
