/**
 * GLIMR design tokens — dark luxury palette
 * Derived from the sibling web artifact (artifacts/app/src/index.css)
 *
 * HSL conversions:
 *   background  0 0% 4%    → #0A0A0A
 *   foreground  0 0% 96%   → #F5F5F5
 *   card        0 0% 7%    → #121212
 *   primary     36 55% 64% → #D5AD71 (warm gold)
 *   secondary   0 0% 12%   → #1F1F1F
 *   muted       0 0% 12%   → #1F1F1F
 *   muted-fg    0 0% 58%   → #949494
 *   accent      36 40% 18% → #40311B
 *   accent-fg   36 55% 72% → #DEBF90
 *   border      0 0% 16%   → #292929
 *   destructive 0 60% 45%  → #B72E2E
 *   radius      1.25rem    → 20px
 */

const palette = {
  background: '#0A0A0A',
  foreground: '#F5F5F5',
  card: '#131313',
  cardForeground: '#F5F5F5',
  primary: '#D5AD71',
  primaryForeground: '#0A0A0A',
  secondary: '#1F1F1F',
  secondaryForeground: '#EBEBEB',
  muted: '#1A1A1A',
  mutedForeground: '#949494',
  accent: '#40311B',
  accentForeground: '#DEBF90',
  destructive: '#B72E2E',
  destructiveForeground: '#F5F5F5',
  border: '#292929',
  input: '#1F1F1F',
  // Legacy aliases
  text: '#F5F5F5',
  tint: '#D5AD71',
};

const colors = {
  // GLIMR is always dark — both palettes use the same dark tokens
  light: palette,
  dark: palette,
  radius: 20,
};

export default colors;
