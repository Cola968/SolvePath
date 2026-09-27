import { useColorScheme } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
  giant: 72,
} as const;

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

export const typeScale = {
  caption: 12,
  body: 16,
  lead: 18,
  title: 25,
  hero: 36,
} as const;

const light = {
  background: '#F3F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#E9F1EE',
  surfaceStrong: '#DCEAE5',
  ink: '#142823',
  muted: '#657872',
  primary: '#176B59',
  primaryStrong: '#0D4D40',
  primarySoft: '#DDEFE9',
  accent: '#4267D5',
  accentSoft: '#E8EEFF',
  border: '#D8E4E0',
  borderStrong: '#BCD2CB',
  danger: '#A0443D',
  dangerSoft: '#FBEAE7',
  success: '#166B59',
  successSoft: '#DDEFE9',
  warning: '#8B6111',
  warningSoft: '#FFF3D5',
  white: '#FFFFFF',
  shadow: '#0B281F',
};

const dark = {
  background: '#0D1815',
  surface: '#162722',
  surfaceAlt: '#1D332D',
  surfaceStrong: '#29453D',
  ink: '#EDF5F2',
  muted: '#A6BAB3',
  primary: '#8DD0B8',
  primaryStrong: '#B9E6D6',
  primarySoft: '#24483D',
  accent: '#9BAFFF',
  accentSoft: '#283456',
  border: '#304B43',
  borderStrong: '#45675D',
  danger: '#F2A39B',
  dangerSoft: '#4B2D2A',
  success: '#8DD0B8',
  successSoft: '#24483D',
  warning: '#F0C56C',
  warningSoft: '#4B3C1F',
  white: '#FFFFFF',
  shadow: '#000000',
};

export type Palette = typeof light;

export function useTheme(): { colors: Palette; isDark: boolean } {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
