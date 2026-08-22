import { Capacitor, registerPlugin } from '@capacitor/core'

const NativeStudyReminders = registerPlugin('StudyReminders')

const REMINDER_KEY = 'mf-study-reminders'
const RUNTIME_KEY = 'mf-study-reminders-runtime'
const REMINDER_CHANNEL_ID = 'mathflow-reminders'
const LEGACY_REMINDER_IDS = [1, 2, 3, 4, 5, 6, 7].map(day => 5200 + day)
const TEST_NOTIFICATION_ID = 5299
const SCHEDULE_HORIZON_DAYS = 7
export const FOLLOWUP_DELAY_MINUTES = 45
const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7]
const DEFAULT_SLOT_ID = 'default-slot'
const DIAGNOSTIC_KEY = 'mf-study-reminders-diagnostics'
const MAX_DIAGNOSTIC_ENTRIES = 120

export const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  slots: [{
    id: DEFAULT_SLOT_ID,
    enabled: true,
    time: '18:00',
    weekdays: [...DEFAULT_WEEKDAYS],
  }],
}

function diagnosticValue(value) {
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack }
  if (value === undefined) return undefined
  try {
    JSON.stringify(value)
    return value
  } catch {
    return String(value)
  }
}

function appendDiagnostic(level, message, data) {
  try {
    const current = JSON.parse(localStorage.getItem(DIAGNOSTIC_KEY) || '[]')
    const entry = {
      at: new Date().toISOString(),
      level,
      message,
      ...(data === undefined ? {} : { data: diagnosticValue(data) }),
    }
    const next = [...(Array.isArray(current) ? current : []), entry].slice(-MAX_DIAGNOSTIC_ENTRIES)
    localStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify(next))
  } catch {
    // Diagnostics must never interfere with reminder behavior.
  }
}

function log(message, data) {
  appendDiagnostic('info', message, data)
  if (data === undefined) console.info(`[MathFlow reminders] ${message}`)
  else console.info(`[MathFlow reminders] ${message}`, data)
}

function logError(message, error) {
  appendDiagnostic('error', message, error)
  console.error(`[MathFlow reminders] ${message}`, error)
}

export function recordReminderDiagnostic(message, data) {
  logError(`UI: ${message}`, data)
}

export function getReminderDiagnostics() {
  try {
    const entries = JSON.parse(localStorage.getItem(DIAGNOSTIC_KEY) || '[]')
    return Array.isArray(entries) ? entries : []
  } catch {
    return []
  }
}

export function getReminderDiagnosticsText() {
  const header = [
    'MathFlow Study Reminders diagnostics',
    `Captured: ${new Date().toISOString()}`,
    `Platform: ${Capacitor.getPlatform()} / native=${Capacitor.isNativePlatform()}`,
    `User agent: ${typeof navigator === 'undefined' ? 'unavailable' : navigator.userAgent}`,
    '',
  ]
  const lines = getReminderDiagnostics().map(entry => {
    const data = entry.data === undefined ? '' : ` | ${JSON.stringify(entry.data)}`
    return `[${entry.at}] ${String(entry.level).toUpperCase()} ${entry.message}${data}`
  })
  return [...header, ...(lines.length ? lines : ['No reminder events recorded.'])].join('\\n')
}

export async function copyReminderDiagnostics() {
  const text = getReminderDiagnosticsText()
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return { ok: true, text }
    }
  } catch (error) {
    appendDiagnostic('error', 'Clipboard API failed; trying fallback.', error)
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    return { ok, text }
  } catch (error) {
    appendDiagnostic('error', 'Clipboard fallback failed.', error)
    return { ok: false, text }
  }
}

export function clearReminderDiagnostics() {
  try {
    localStorage.removeItem(DIAGNOSTIC_KEY)
  } catch {
    // Ignore storage failures; the diagnostics view remains usable.
  }
}

export function isNativeAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function createReminderSlot(partial = {}) {
  const now = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return {
    id: partial.id || `slot-${now}-${random}`,
    enabled: partial.enabled !== false,
    time: /^([01]\d|2[0-3]):[0-5]\d$/.test(partial.time) ? partial.time : '18:00',
    weekdays: normalizeWeekdays(partial.weekdays),
  }
}

function normalizeWeekdays(value) {
  if (value === undefined || value === null) return [...DEFAULT_WEEKDAYS]
  return [...new Set((Array.isArray(value) ? value : []).map(Number))]
    .filter(day => day >= 1 && day <= 7)
    .sort((a, b) => a - b)
}

function cloneDefaultSettings() {
  return {
    enabled: DEFAULT_REMINDER_SETTINGS.enabled,
    slots: DEFAULT_REMINDER_SETTINGS.slots.map(slot => ({ ...slot, weekdays: [...slot.weekdays] })),
  }
}

export function normalizeReminderSettings(stored) {
  if (!stored || typeof stored !== 'object') return cloneDefaultSettings()

  // Migrate the previous single-time shape without losing the user's settings.
  if (!Array.isArray(stored.slots)) {
    if (stored.time || stored.weekdays || typeof stored.enabled === 'boolean') {
      return {
        enabled: Boolean(stored.enabled),
        slots: [createReminderSlot({
          id: DEFAULT_SLOT_ID,
          enabled: true,
          time: stored.time || '18:00',
          weekdays: stored.weekdays,
        })],
      }
    }
    return cloneDefaultSettings()
  }

  const seen = new Set()
  const slots = stored.slots.map(slot => {
    const normalized = createReminderSlot(slot || {})
    if (seen.has(normalized.id)) normalized.id = createReminderSlot().id
    seen.add(normalized.id)
    return normalized
  })

  return {
    enabled: Boolean(stored.enabled),
    slots,
  }
}

export function loadReminderSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(REMINDER_KEY) || 'null')
    const normalized = normalizeReminderSettings(stored)
    // Persist the migration immediately so it is stable across reloads.
    if (stored && !Array.isArray(stored.slots)) saveReminderSettingsLocally(normalized)
    return normalized
  } catch (error) {
    logError('Could not load reminder settings; using defaults.', error)
    return cloneDefaultSettings()
  }
}

function saveReminderSettingsLocally(settings) {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(settings))
  } catch (error) {
    logError('Could not persist reminder settings locally.', error)
  }
}

function loadRuntime() {
  try {
    const stored = JSON.parse(localStorage.getItem(RUNTIME_KEY) || 'null')
    return {
      practicedDate: stored?.practicedDate || null,
      entries: Array.isArray(stored?.entries) ? stored.entries : [],
    }
  } catch {
    return { practicedDate: null, entries: [] }
  }
}

function saveRuntime(runtime) {
  try {
    localStorage.setItem(RUNTIME_KEY, JSON.stringify(runtime))
  } catch (error) {
    logError('Could not persist reminder runtime state.', error)
  }
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateAtOffset(offset) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return date
}

function localDateAt(date, time) {
  const [hour, minute] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hour, minute, 0, 0)
  return result
}

function stableHash(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function notificationId(slotId, day, variant) {
  // A stable, positive 32-bit ID derived from slot/date/variant.
  const hash = stableHash(`${slotId}:${day}:${variant}`) % 100000000
  return 100000 + hash
}

async function getLocalNotifications() {
  log('Loading Capacitor LocalNotifications bridge.')
  const module = await withTimeout(import('@capacitor/local-notifications'), 'Loading LocalNotifications bridge', 5000)
  return module.LocalNotifications
}

function withTimeout(promise, label, timeoutMs = 10000) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function nativeCall(label, callback, timeoutMs = 10000) {
  log(`${label}: start`)
  try {
    const result = await withTimeout(callback(), label, timeoutMs)
    log(`${label}: resolved`, result)
    return result
  } catch (error) {
    logError(`${label}: failed`, error)
    throw error
  }
}

async function clearScheduledReminders(LocalNotifications) {
  const runtime = loadRuntime()
  const ids = [...new Set([
    ...LEGACY_REMINDER_IDS,
    TEST_NOTIFICATION_ID,
    ...runtime.entries.flatMap(entry => [entry.primaryId, entry.followupId]),
  ].filter(Number.isInteger))]
  if (!ids.length) return

  try {
    await nativeCall('Clearing existing reminder notifications', () => LocalNotifications.cancel({
      notifications: ids.map(id => ({ id })),
    }))
  } catch (error) {
    // A fresh install may have no stored notification records. Continue scheduling.
    logError('Could not clear one or more old reminder notifications; continuing.', error)
  }
  if (Capacitor.isPluginAvailable('StudyReminders')) {
    try {
      await nativeCall('Clearing native reminder alarms', () => NativeStudyReminders.clear())
    } catch (error) {
      logError('Could not clear native reminder alarms; continuing with a fresh schedule.', error)
    }
  }
}

async function ensureReminderChannel(LocalNotifications) {
  try {
    await nativeCall('Creating reminder notification channel', () => LocalNotifications.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Study reminders',
      description: 'MathFlow practice reminders',
      importance: 4,
      visibility: 1,
      vibration: true,
    }), 5000)
  } catch (error) {
    // The channel may already exist on an upgraded install.
    logError('Reminder channel setup returned an error; Android may already have the channel.', error)
  }
}

export async function requestReminderPermission() {
  if (!isNativeAndroid()) return { granted: false, native: false }
  if (Capacitor.isPluginAvailable('StudyReminders')) {
    let permission = await nativeCall('Checking notification permission natively', () => NativeStudyReminders.permissionStatus(), 5000)
    if (!permission?.granted) {
      permission = await nativeCall('Requesting notification permission natively', () => NativeStudyReminders.requestPermission(), 10000)
    }
    return { granted: Boolean(permission?.granted), native: true }
  }
  const LocalNotifications = await getLocalNotifications()
  let permission = await nativeCall('Checking notification permission', () => LocalNotifications.checkPermissions())
  if (permission.display !== 'granted') {
    permission = await nativeCall('Requesting notification permission', () => LocalNotifications.requestPermissions())
  }
  return { granted: permission.display === 'granted', native: true }
}

function buildScheduleEntries(settings, now = new Date()) {
  const runtime = loadRuntime()
  const practicedToday = runtime.practicedDate === dateKey(now)
  const entries = []

  for (let offset = 0; offset < SCHEDULE_HORIZON_DAYS; offset += 1) {
    // Once a drill is completed, suppress the rest of today only. Future dates remain active.
    if (offset === 0 && practicedToday) continue
    const date = dateAtOffset(offset)
    const weekday = date.getDay() + 1
    const key = dateKey(date)

    for (const slot of settings.slots) {
      if (!slot.enabled || !slot.weekdays.includes(weekday)) continue
      const primaryAt = localDateAt(date, slot.time)
      const followupAt = new Date(primaryAt.getTime() + FOLLOWUP_DELAY_MINUTES * 60 * 1000)
      if (primaryAt <= now) continue

        const primaryId = notificationId(slot.id, key, 0)
      const followupId = notificationId(slot.id, key, 1)
      entries.push({
        dateKey: key,
        slotId: slot.id,
        primaryId,
        followupId,
        primaryAt: primaryAt.toISOString(),
        followupAt: followupAt.toISOString(),
        primaryAtMs: primaryAt.getTime(),
        followupAtMs: followupAt.getTime(),
        notifications: [
          {
            id: primaryId,
            title: 'MathFlow practice time',
            body: 'A quick maths drill is waiting for you.',
            schedule: { at: primaryAt, allowWhileIdle: false, isExactNotification: false },
            channelId: REMINDER_CHANNEL_ID,
            smallIcon: 'ic_stat_mathflow',
            extra: { route: 'practice', kind: 'primary', slotId: slot.id, dateKey: key },
          },
          {
            id: followupId,
            title: 'MathFlow follow-up',
            body: 'Still have a minute for one quick maths drill?',
            schedule: { at: followupAt, allowWhileIdle: false, isExactNotification: false },
            channelId: REMINDER_CHANNEL_ID,
            smallIcon: 'ic_stat_mathflow',
            extra: { route: 'practice', kind: 'followup', slotId: slot.id, dateKey: key },
          },
        ],
      })
    }
  }
  return entries
}

export async function saveReminderSettings(settings) {
  const normalized = normalizeReminderSettings(settings)
  saveReminderSettingsLocally(normalized)
  log('Saving reminder settings', normalized)

  if (!isNativeAndroid()) {
    return { ok: true, native: false, scheduled: 0, slots: normalized.slots.length }
  }

  const useNativeScheduler = Capacitor.isPluginAvailable('StudyReminders')
  let LocalNotifications = null
  if (useNativeScheduler) {
    await nativeCall('Clearing native reminder alarms', () => NativeStudyReminders.clear())
  } else {
    LocalNotifications = await getLocalNotifications()
    await clearScheduledReminders(LocalNotifications)
  }
  const runtime = loadRuntime()

  if (!normalized.enabled) {
    saveRuntime({ ...runtime, entries: [] })
    return { ok: true, native: true, scheduled: 0, slots: normalized.slots.length }
  }

  const activeSlots = normalized.slots.filter(slot => slot.enabled && slot.weekdays.length)
  if (!activeSlots.length) {
    saveRuntime({ ...runtime, entries: [] })
    return { ok: true, native: true, scheduled: 0, slots: normalized.slots.length }
  }

  const permission = await requestReminderPermission()
  if (!permission.granted) return { ok: false, native: true, reason: 'permission-denied' }
  if (!useNativeScheduler) await ensureReminderChannel(LocalNotifications)

  const scheduleEntries = buildScheduleEntries(normalized)
  const notifications = scheduleEntries.flatMap(entry => entry.notifications)
  if (!notifications.length) {
    saveRuntime({ ...runtime, entries: [] })
    return { ok: true, native: true, scheduled: 0, slots: normalized.slots.length }
  }

  const runtimeEntries = scheduleEntries.map(({ notifications: _notifications, ...entry }) => entry)
  if (Capacitor.isPluginAvailable('StudyReminders')) {
    await nativeCall('Scheduling reminder slots natively', () => NativeStudyReminders.schedule({ entries: runtimeEntries }))
  } else {
    // Compatibility fallback for an older shell; this path is not used by the rebuilt APK.
    await nativeCall('Scheduling reminder slots through LocalNotifications', () => LocalNotifications.schedule({ notifications }))
  }
  const nextRuntime = {
    practicedDate: runtime.practicedDate,
    entries: runtimeEntries,
  }
  saveRuntime(nextRuntime)
  return {
    ok: true,
    native: true,
    scheduled: scheduleEntries.length,
    slots: normalized.slots.length,
    notifications: notifications.length,
  }
}

async function cancelFollowupIds(LocalNotifications, ids, reason) {
  const uniqueIds = [...new Set(ids.filter(Number.isInteger))]
  if (!uniqueIds.length) return 0
  try {
    await nativeCall(reason, () => LocalNotifications.cancel({
      notifications: uniqueIds.map(id => ({ id })),
    }))
  } catch (error) {
    logError(`${reason}: failed`, error)
    return 0
  }
  return uniqueIds.length
}

async function cancelElapsedFollowups(LocalNotifications) {
  const now = Date.now()
  const runtime = loadRuntime()
  const due = runtime.entries.filter(entry => {
    const primaryAt = Date.parse(entry.primaryAt)
    const followupAt = Date.parse(entry.followupAt)
    return Number.isFinite(primaryAt) && Number.isFinite(followupAt) && primaryAt <= now && followupAt > now && Number.isInteger(entry.followupId)
  })
  if (!due.length) return 0

  const cancelled = await cancelFollowupIds(LocalNotifications, due.map(entry => entry.followupId), 'Cancelling follow-ups after app open')
  if (cancelled) {
    const ids = new Set(due.map(entry => entry.followupId))
    saveRuntime({ ...runtime, entries: runtime.entries.map(entry => ids.has(entry.followupId) ? { ...entry, followupId: null } : entry) })
  }
  return cancelled
}

async function cancelFollowupForNotification(notification) {
  const slotId = notification?.extra?.slotId
  const reminderDate = notification?.extra?.dateKey
  if (!slotId || !reminderDate || !isNativeAndroid()) return
  const runtime = loadRuntime()
  const entry = runtime.entries.find(item => item.slotId === slotId && item.dateKey === reminderDate && Number.isInteger(item.followupId))
  if (!entry) return
  const LocalNotifications = await getLocalNotifications()
  const cancelled = await cancelFollowupIds(LocalNotifications, [entry.followupId], 'Cancelling follow-up after primary reminder')
  if (cancelled) saveRuntime({ ...runtime, entries: runtime.entries.map(item => item === entry ? { ...item, followupId: null } : item) })
}

let reminderLifecycleInitialized = false

export async function initReminderLifecycle() {
  if (!isNativeAndroid() || reminderLifecycleInitialized) return
  reminderLifecycleInitialized = true
  if (!Capacitor.isPluginAvailable('StudyReminders')) {
    logError('Native reminder scheduler is unavailable; using compatibility scheduling.', new Error('StudyReminders plugin not registered'))
    return
  }
  try {
    await nativeCall('Checking native reminder scheduler', () => NativeStudyReminders.status(), 5000)
  } catch (error) {
    logError('Native reminder scheduler diagnostic check failed.', error)
  }
}

export async function sendTestReminder() {
  if (!isNativeAndroid()) return { ok: false, native: false, reason: 'native-only' }
  const permission = await requestReminderPermission()
  if (!permission.granted) return { ok: false, native: true, reason: 'permission-denied' }

  const at = new Date(Date.now() + 5000)
  if (Capacitor.isPluginAvailable('StudyReminders')) {
    const result = await nativeCall('Scheduling test notification natively', () => NativeStudyReminders.scheduleTest({
      id: TEST_NOTIFICATION_ID,
      atMs: at.getTime(),
    }))
    log('Test notification accepted by native scheduler', result)
    return { ok: true, native: true, pending: true, at }
  }

  const LocalNotifications = await getLocalNotifications()
  await ensureReminderChannel(LocalNotifications)
  await nativeCall('Scheduling test notification through LocalNotifications', () => LocalNotifications.schedule({
    notifications: [{
      id: TEST_NOTIFICATION_ID,
      title: 'MathFlow test reminder',
      body: 'Your practice reminder is working. Ready for one quick drill?',
      schedule: { at, allowWhileIdle: false, isExactNotification: false },
      channelId: REMINDER_CHANNEL_ID,
      smallIcon: 'ic_stat_mathflow',
      extra: { route: 'practice', kind: 'test' },
    }],
  }))
  return { ok: true, native: true, pending: true, at }
}

export async function notifyPracticeCompleted() {
  const runtime = loadRuntime()
  const today = dateKey(new Date())
  saveRuntime({
    practicedDate: today,
    entries: runtime.entries.filter(entry => entry.dateKey !== today),
  })

  if (!isNativeAndroid()) return { ok: true, native: false, cancelled: 0 }
  const ids = runtime.entries
    .filter(entry => entry.dateKey === today)
    .flatMap(entry => [entry.primaryId, entry.followupId])
    .filter(Number.isInteger)
  if (Capacitor.isPluginAvailable('StudyReminders')) {
    try {
      await nativeCall('Marking practice completed in native scheduler', () => NativeStudyReminders.markPracticeCompleted({ dateKey: today }))
      return { ok: true, native: true, cancelled: ids.length }
    } catch (error) {
      logError('Native practice completion marker failed; continuing with LocalNotifications cancellation.', error)
      return { ok: false, native: true, cancelled: 0, error }
    }
  }

  if (!ids.length) return { ok: true, native: true, cancelled: 0 }

  const LocalNotifications = await getLocalNotifications()
  try {
    await nativeCall('Cancelling remaining reminders for today', () => LocalNotifications.cancel({
      notifications: [...new Set(ids)].map(id => ({ id })),
    }))
  } catch (error) {
    logError('Could not cancel every remaining reminder for today.', error)
    return { ok: false, native: true, cancelled: 0, error }
  }
  return { ok: true, native: true, cancelled: ids.length }
}

export function refreshReminderRuntime() {
  const runtime = loadRuntime()
  const today = dateKey(new Date())
  const entries = runtime.entries.filter(entry => entry.dateKey >= today)
  if (entries.length !== runtime.entries.length) saveRuntime({ ...runtime, entries })
  return { practicedDate: runtime.practicedDate, entries: entries.length }
}
