import { Capacitor, registerPlugin } from '@capacitor/core'

const NativeSystemBars = registerPlugin('SystemBars')

export function applySystemBars(color, darkIcons) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const request = NativeSystemBars.set({ color, darkIcons })
    if (request?.catch) request.catch(() => {})
  } catch {
    // System-bar styling is cosmetic and must never interrupt the app.
  }
}
