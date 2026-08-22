import {
  themeFromSourceColor,
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from '@material/material-color-utilities'

export const PALETTES = [
  { id: 'purple', name: 'Purple', seed: '#6750A4', description: 'Material baseline' },
  { id: 'blue', name: 'Blue', seed: '#45618F', description: 'Calm and focused' },
  { id: 'indigo', name: 'Indigo', seed: '#4F5F92', description: 'Deep and steady' },
  { id: 'cyan', name: 'Cyan', seed: '#006874', description: 'Fresh and clear' },
  { id: 'teal', name: 'Teal', seed: '#006A60', description: 'Balanced and calm' },
  { id: 'green', name: 'Green', seed: '#386A20', description: 'Natural and positive' },
  { id: 'lime', name: 'Lime', seed: '#596400', description: 'Bright and energetic' },
  { id: 'yellow', name: 'Yellow', seed: '#725D00', description: 'Warm and optimistic' },
  { id: 'orange', name: 'Orange', seed: '#8A5100', description: 'Warm and active' },
  { id: 'red', name: 'Red', seed: '#BA1A1A', description: 'Bold and expressive' },
  { id: 'pink', name: 'Pink', seed: '#984061', description: 'Playful and friendly' },
  { id: 'neutral', name: 'Neutral', seed: '#5F5F5F', description: 'Quiet and minimal' },
]

const DEFAULT_PALETTE = 'purple'
const PALETTE_KEY = 'mf-palette'
const ROLES = {
  background: 'background',
  onBackground: 'on-background',
  surface: 'surface',
  onSurface: 'on-surface',
  surfaceVariant: 'surface-variant',
  onSurfaceVariant: 'on-surface-variant',
  primary: 'primary',
  onPrimary: 'on-primary',
  primaryContainer: 'primary-container',
  onPrimaryContainer: 'on-primary-container',
  secondary: 'secondary',
  onSecondary: 'on-secondary',
  secondaryContainer: 'secondary-container',
  onSecondaryContainer: 'on-secondary-container',
  tertiary: 'tertiary',
  onTertiary: 'on-tertiary',
  tertiaryContainer: 'tertiary-container',
  onTertiaryContainer: 'on-tertiary-container',
  error: 'error',
  onError: 'on-error',
  errorContainer: 'error-container',
  onErrorContainer: 'on-error-container',
  outline: 'outline',
  outlineVariant: 'outline-variant',
  scrim: 'scrim',
  shadow: 'shadow',
  inverseSurface: 'inverse-surface',
  inverseOnSurface: 'inverse-on-surface',
  inversePrimary: 'inverse-primary',
}

const SUCCESS_PALETTE = TonalPalette.fromHueAndChroma(142, 48)

function paletteById(id) {
  return PALETTES.find(palette => palette.id === id) || PALETTES[0]
}

export function getSavedPalette() {
  const saved = localStorage.getItem(PALETTE_KEY)
  return paletteById(saved).id
}

export function applyTheme(isDark, paletteId = getSavedPalette()) {
  const palette = paletteById(paletteId)
  const theme = themeFromSourceColor(argbFromHex(palette.seed))
  const scheme = isDark ? theme.schemes.dark : theme.schemes.light
  const root = document.documentElement

  for (const [prop, cssName] of Object.entries(ROLES)) {
    const argb = scheme[prop]
    if (argb != null) root.style.setProperty(`--md-sys-color-${cssName}`, hexFromArgb(argb))
  }

  const successTone = isDark ? 80 : 40
  const onSuccessTone = isDark ? 20 : 100
  root.style.setProperty('--md-custom-color-correct', hexFromArgb(SUCCESS_PALETTE.tone(successTone)))
  root.style.setProperty('--md-custom-color-on-correct', hexFromArgb(SUCCESS_PALETTE.tone(onSuccessTone)))
  root.style.setProperty('--md-sys-color-surface-container-low', hexFromArgb(surfaceAtElevation(scheme, 0.05)))
  root.style.setProperty('--md-sys-color-surface-container', hexFromArgb(surfaceAtElevation(scheme, 0.08)))
  root.style.setProperty('--md-sys-color-surface-container-high', hexFromArgb(surfaceAtElevation(scheme, 0.11)))
  root.style.setProperty('--md-sys-color-surface-container-highest', hexFromArgb(surfaceAtElevation(scheme, 0.14)))
  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
  root.setAttribute('data-palette', palette.id)
  return palette.id
}

function surfaceAtElevation(scheme, opacity) {
  const surf = scheme.surface
  const prim = scheme.primary
  const sr = (surf >> 16) & 0xff
  const sg = (surf >> 8) & 0xff
  const sb = surf & 0xff
  const pr = (prim >> 16) & 0xff
  const pg = (prim >> 8) & 0xff
  const pb = prim & 0xff
  const r = Math.round(sr + (pr - sr) * opacity)
  const g = Math.round(sg + (pg - sg) * opacity)
  const b = Math.round(sb + (pb - sb) * opacity)
  return (0xff000000 | (r << 16) | (g << 8) | b) >>> 0
}

export function initTheme() {
  const savedTheme = localStorage.getItem('mf-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = savedTheme != null ? savedTheme === 'dark' : prefersDark
  applyTheme(isDark, getSavedPalette())
  return isDark ? 'dark' : 'light'
}
