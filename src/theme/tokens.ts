import { useColorScheme } from 'react-native';

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const;
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
export const typeScale = { caption: 12, body: 16, lead: 18, title: 25, hero: 34 } as const;

const light = {
  background: '#F5F7F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EAF1EF',
  ink: '#172B27',
  muted: '#60746F',
  primary: '#1D6B5C',
  primarySoft: '#DCEDE8',
  border: '#DCE6E2',
  danger: '#9B413B',
  dangerSoft: '#F9E8E5',
  success: '#1D6B5C',
  successSoft: '#DCEDE8',
  white: '#FFFFFF',
};
const dark = {
  background: '#101C1A',
  surface: '#192A26',
  surfaceAlt: '#223A33',
  ink: '#E9F2EE',
  muted: '#A5BAB2',
  primary: '#8BC9B4',
  primarySoft: '#2A4A3F',
  border: '#355046',
  danger: '#F0A39B',
  dangerSoft: '#4B2E2B',
  success: '#8BC9B4',
  successSoft: '#2A4A3F',
  white: '#101C1A',
};

export type Palette = typeof light;
export function useTheme(): { colors: Palette; isDark: boolean } {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
