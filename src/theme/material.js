import {
  themeFromSourceColor,
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from '@material/material-color-utilities'

// M3 baseline purple seed — the only hardcoded hex in the codebase
const SEED = '#6750a4'

const _theme = themeFromSourceColor(argbFromHex(SEED))

// Custom success/correct green — derived from M3 tonal palette principles
const _successPalette = TonalPalette.fromHueAndChroma(142, 48)

// M3 color role → CSS custom property name
const ROLES = {
  background:           'background',
  onBackground:         'on-background',
  surface:              'surface',
  onSurface:            'on-surface',
  surfaceVariant:       'surface-variant',
  onSurfaceVariant:     'on-surface-variant',
  primary:              'primary',
  onPrimary:            'on-primary',
  primaryContainer:     'primary-container',
  onPrimaryContainer:   'on-primary-container',
  secondary:            'secondary',
  onSecondary:          'on-secondary',
  secondaryContainer:   'secondary-container',
  onSecondaryContainer: 'on-secondary-container',
  tertiary:             'tertiary',
  onTertiary:           'on-tertiary',
  tertiaryContainer:    'tertiary-container',
  onTertiaryContainer:  'on-tertiary-container',
  error:                'error',
  onError:              'on-error',
  errorContainer:       'error-container',
  onErrorContainer:     'on-error-container',
  outline:              'outline',
  outlineVariant:       'outline-variant',
  scrim:                'scrim',
  shadow:               'shadow',
  inverseSurface:       'inverse-surface',
  inverseOnSurface:     'inverse-on-surface',
  inversePrimary:       'inverse-primary',
}

export function applyTheme(isDark) {
  const scheme = isDark ? _theme.schemes.dark : _theme.schemes.light
  const root = document.documentElement

  for (const [prop, cssName] of Object.entries(ROLES)) {
    const argb = scheme[prop]
    if (argb != null) {
      root.style.setProperty(`--md-sys-color-${cssName}`, hexFromArgb(argb))
    }
  }

  // Custom correct/success color (M3-derived green tonal palette)
  const successTone = isDark ? 80 : 40
  const onSuccessTone = isDark ? 20 : 100
  root.style.setProperty('--md-custom-color-correct', hexFromArgb(_successPalette.tone(successTone)))
  root.style.setProperty('--md-custom-color-on-correct', hexFromArgb(_successPalette.tone(onSuccessTone)))

  // M3 surface tones (surface + primary tint overlay)
  // Elevation level 1 = surface + 5% primary  (used for cards, nav bar)
  // Elevation level 2 = surface + 8% primary  (used for bottom sheets)
  root.style.setProperty('--md-sys-color-surface-container-low',
    hexFromArgb(surfaceAtElevation(scheme, 0.05, isDark)))
  root.style.setProperty('--md-sys-color-surface-container',
    hexFromArgb(surfaceAtElevation(scheme, 0.08, isDark)))
  root.style.setProperty('--md-sys-color-surface-container-high',
    hexFromArgb(surfaceAtElevation(scheme, 0.11, isDark)))
  root.style.setProperty('--md-sys-color-surface-container-highest',
    hexFromArgb(surfaceAtElevation(scheme, 0.14, isDark)))

  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

// Blend surface with primary at a given opacity (M3 elevation tints)
function surfaceAtElevation(scheme, primaryOpacity, isDark) {
  const surf = scheme.surface
  const prim = scheme.primary
  const sr = (surf >> 16) & 0xff, sg = (surf >> 8) & 0xff, sb = surf & 0xff
  const pr = (prim >> 16) & 0xff, pg = (prim >> 8) & 0xff, pb = prim & 0xff
  const t = primaryOpacity
  const r = Math.round(sr + (pr - sr) * t)
  const g = Math.round(sg + (pg - sg) * t)
  const b = Math.round(sb + (pb - sb) * t)
  return (0xff000000 | (r << 16) | (g << 8) | b) >>> 0
}

export function initTheme() {
  const saved = localStorage.getItem('mf-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved != null ? saved === 'dark' : prefersDark
  applyTheme(isDark)
  return isDark ? 'dark' : 'light'
}
