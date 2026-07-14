import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * GLIMR ships both a `light` and `dark` key in constants/colors.ts
 * (both map to the same dark luxury palette since GLIMR is dark-only).
 * The hook picks `dark` when the device is in dark mode, `light` otherwise.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
