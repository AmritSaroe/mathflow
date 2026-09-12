import { Capacitor, registerPlugin } from '@capacitor/core'

const NativeSystemBars = registerPlugin('SystemBars')

export function applySystemBars(color, darkIcons) {
  if (!Capacitor.isNativePlatform()) return
  NativeSystemBars.set({ color, darkIcons }).catch(() => {})
}
