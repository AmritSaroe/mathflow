import { Capacitor } from '@capacitor/core'

const REMINDER_KEY = 'mf-study-reminders'
const REMINDER_CHANNEL_ID = 'mathflow-reminders'
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

function withTimeout(promise, label, timeoutMs = 10000) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function clearScheduledReminders(LocalNotifications) {
  try {
    await withTimeout(LocalNotifications.cancel({
      notifications: REMINDER_IDS.map(id => ({ id })),
    }), 'Clearing study reminders')
  } catch {
    // There may be no notifications to cancel on a fresh install.
  }
}

async function ensureReminderChannel(LocalNotifications) {
  try {
    await withTimeout(LocalNotifications.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Study reminders',
      description: 'MathFlow practice reminders',
      importance: 4,
      visibility: 1,
      vibration: true,
    }), 'Creating reminder channel', 5000)
  } catch {
    // The channel may already exist on an upgraded install.
  }
}

async function checkExactAlarmSetting(LocalNotifications) {
  try {
    const result = await withTimeout(LocalNotifications.checkExactNotificationSetting(), 'Checking exact alarm setting', 5000)
    return result?.value !== false
  } catch {
    // Older Android/plugin combinations may not expose this setting.
    return true
  }
}

export async function requestReminderPermission() {
  if (!isNativeAndroid()) return { granted: false, native: false }
  const LocalNotifications = await getLocalNotifications()
  let permission = await withTimeout(LocalNotifications.checkPermissions(), 'Checking notification permission')
  if (permission.display !== 'granted') {
    permission = await withTimeout(LocalNotifications.requestPermissions(), 'Requesting notification permission')
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
  await clearScheduledReminders(LocalNotifications)
  if (!normalized.enabled) return { ok: true, native: true, scheduled: 0 }
  if (!normalized.weekdays.length) return { ok: false, native: true, reason: 'no-days' }

  const permission = await requestReminderPermission()
  if (!permission.granted) {
    return { ok: false, native: true, reason: 'permission-denied' }
  }
  await ensureReminderChannel(LocalNotifications)

  const [hour, minute] = normalized.time.split(':').map(Number)
  await withTimeout(LocalNotifications.schedule({
    notifications: normalized.weekdays.map(weekday => ({
      id: 5200 + weekday,
      title: 'MathFlow practice time',
      body: 'A quick maths drill is waiting for you.',
      schedule: {
        on: { weekday, hour, minute },
        repeats: true,
        allowWhileIdle: false,
      },
      channelId: REMINDER_CHANNEL_ID,
      extra: { route: 'practice' },
    })),
  }), 'Scheduling study reminders')

  return { ok: true, native: true, scheduled: normalized.weekdays.length }
}

export async function sendTestReminder() {
  if (!isNativeAndroid()) return { ok: false, native: false }
  const LocalNotifications = await getLocalNotifications()
  const permission = await requestReminderPermission()
  if (!permission.granted) return { ok: false, native: true, reason: 'permission-denied' }
  await ensureReminderChannel(LocalNotifications)
  const exactAlarmsAvailable = await checkExactAlarmSetting(LocalNotifications)
  await withTimeout(LocalNotifications.schedule({
    notifications: [{
      id: 5299,
      title: 'MathFlow test reminder',
      body: 'Your practice reminder is working. Ready for one quick drill?',
      schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
      channelId: REMINDER_CHANNEL_ID,
      extra: { route: 'practice' },
    }],
  }), 'Scheduling test notification')
  return { ok: true, native: true, exactAlarmsAvailable }
}
