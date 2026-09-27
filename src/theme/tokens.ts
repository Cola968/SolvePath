import { useColorScheme } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  huge: 40,
  giant: 56,
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;

export const typeScale = {
  caption: 12,
  body: 16,
  lead: 18,
  title: 24,
  hero: 30,
} as const;

const light = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F4F8',
  surfaceStrong: '#E8EDF5',
  ink: '#101828',
  muted: '#667085',
  primary: '#2563EB',
  primaryStrong: '#1D4ED8',
  primarySoft: '#EAF1FF',
  accent: '#0F766E',
  accentSoft: '#E7F6F3',
  border: '#E4E7EC',
  borderStrong: '#CBD5E1',
  danger: '#B42318',
  dangerSoft: '#FEF3F2',
  success: '#027A48',
  successSoft: '#ECFDF3',
  warning: '#B54708',
  warningSoft: '#FFF7ED',
  white: '#FFFFFF',
  shadow: '#101828',
};

const dark = {
  background: '#0B0F17',
  surface: '#121826',
  surfaceAlt: '#1A2232',
  surfaceStrong: '#222C3E',
  ink: '#F2F4F7',
  muted: '#98A2B3',
  primary: '#79A7FF',
  primaryStrong: '#4F83F1',
  primarySoft: '#182A4E',
  accent: '#63C7BC',
  accentSoft: '#123A37',
  border: '#253044',
  borderStrong: '#344054',
  danger: '#FDA29B',
  dangerSoft: '#482321',
  success: '#6CE9A6',
  successSoft: '#12372A',
  warning: '#FEC84B',
  warningSoft: '#463613',
  white: '#FFFFFF',
  shadow: '#000000',
};

export type Palette = typeof light;

export function useTheme(): { colors: Palette; isDark: boolean } {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
