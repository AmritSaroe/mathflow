import { Capacitor } from '@capacitor/core'

const REMINDER_KEY = 'mf-study-reminders'
const REMINDER_IDS = [1, 2, 3, 4, 5, 6, 7].map(day => 5200 + day)

export const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  time: '18:00',
  weekdays: [1, 2, 3, 4, 5, 6, 7],
}

export function isNativeAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function loadReminderSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(REMINDER_KEY) || 'null')
    return {
      ...DEFAULT_REMINDER_SETTINGS,
      ...(stored || {}),
      weekdays: Array.isArray(stored?.weekdays) && stored.weekdays.length
        ? stored.weekdays.map(Number).filter(day => day >= 1 && day <= 7).sort((a, b) => a - b)
        : DEFAULT_REMINDER_SETTINGS.weekdays,
    }
  } catch {
    return DEFAULT_REMINDER_SETTINGS
  }
}

function saveReminderSettingsLocally(settings) {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(settings))
  } catch {
    // Local storage is best-effort; native scheduling remains authoritative.
  }
}

async function getLocalNotifications() {
  return (await import('@capacitor/local-notifications')).LocalNotifications
}

async function clearScheduledReminders(LocalNotifications) {
  try {
    await LocalNotifications.cancel({
      notifications: REMINDER_IDS.map(id => ({ id })),
    })
  } catch {
    // There may be no notifications to cancel on a fresh install.
  }
}

export async function requestReminderPermission() {
  if (!isNativeAndroid()) return { granted: false, native: false }
  const LocalNotifications = await getLocalNotifications()
  let permission = await LocalNotifications.checkPermissions()
  if (permission.display !== 'granted') {
    permission = await LocalNotifications.requestPermissions()
  }
  return { granted: permission.display === 'granted', native: true }
}

export async function saveReminderSettings(settings) {
  const normalized = {
    ...DEFAULT_REMINDER_SETTINGS,
    ...settings,
    weekdays: [...new Set((settings.weekdays || []).map(Number))].filter(day => day >= 1 && day <= 7).sort((a, b) => a - b),
  }
  saveReminderSettingsLocally(normalized)

  if (!isNativeAndroid()) {
    return { ok: false, native: false, reason: 'native-only' }
  }

  const LocalNotifications = await getLocalNotifications()
  const permission = await requestReminderPermission()
  if (!permission.granted) {
    return { ok: false, native: true, reason: 'permission-denied' }
  }

  await clearScheduledReminders(LocalNotifications)
  if (!normalized.enabled) return { ok: true, native: true, scheduled: 0 }
  if (!normalized.weekdays.length) return { ok: false, native: true, reason: 'no-days' }

  const [hour, minute] = normalized.time.split(':').map(Number)
  await LocalNotifications.schedule({
    notifications: normalized.weekdays.map(weekday => ({
      id: 5200 + weekday,
      title: 'MathFlow practice time',
      body: 'A quick maths drill is waiting for you.',
      schedule: {
        on: { weekday, hour, minute },
        repeats: true,
        allowWhileIdle: true,
      },
      extra: { route: 'practice' },
    })),
  })

  return { ok: true, native: true, scheduled: normalized.weekdays.length }
}

export async function sendTestReminder() {
  if (!isNativeAndroid()) return { ok: false, native: false }
  const LocalNotifications = await getLocalNotifications()
  const permission = await requestReminderPermission()
  if (!permission.granted) return { ok: false, native: true, reason: 'permission-denied' }
  await LocalNotifications.schedule({
    notifications: [{
      id: 5299,
      title: 'MathFlow test reminder',
      body: 'Your practice reminder is working. Ready for one quick drill?',
      schedule: { at: new Date(Date.now() + 1500) },
      extra: { route: 'practice' },
    }],
  })
  return { ok: true, native: true }
}
