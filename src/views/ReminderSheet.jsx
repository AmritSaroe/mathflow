import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  createReminderSlot,
  isNativeAndroid,
  loadReminderSettings,
  requestReminderPermission,
  saveReminderSettings,
  sendTestReminder,
} from '../native/notifications'

const DAYS = [
  { value: 1, label: 'Sun' },
  { value: 2, label: 'Mon' },
  { value: 3, label: 'Tue' },
  { value: 4, label: 'Wed' },
  { value: 5, label: 'Thu' },
  { value: 6, label: 'Fri' },
  { value: 7, label: 'Sat' },
]

function withUiTimeout(promise, label, timeoutMs = 12000) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

function nextReminderTime(slots) {
  if (!slots.length) return '09:00'
  const latest = [...slots].sort((a, b) => a.time.localeCompare(b.time)).at(-1)?.time || '18:00'
  const [hour, minute] = latest.split(':').map(Number)
  return `${String((hour + Math.floor((minute + 60) / 60)) % 24).padStart(2, '0')}:${String((minute + 60) % 60).padStart(2, '0')}`
}

export default function ReminderSheet({ onClose }) {
  const native = isNativeAndroid()
  const [settings, setSettings] = useState(() => loadReminderSettings())
  const [busyAction, setBusyAction] = useState(null)
  const [status, setStatus] = useState('')
  const busy = busyAction !== null

  function updateSlot(slotId, patch) {
    setSettings(current => ({
      ...current,
      slots: current.slots.map(slot => slot.id === slotId ? { ...slot, ...patch } : slot),
    }))
    setStatus('')
  }

  function toggleSlotDay(slotId, day) {
    setSettings(current => ({
      ...current,
      slots: current.slots.map(slot => {
        if (slot.id !== slotId) return slot
        const weekdays = slot.weekdays.includes(day)
          ? slot.weekdays.filter(value => value !== day)
          : [...slot.weekdays, day].sort((a, b) => a - b)
        return { ...slot, weekdays }
      }),
    }))
    setStatus('')
  }

  function addReminder() {
    setSettings(current => ({
      ...current,
      slots: [...current.slots, createReminderSlot({ time: nextReminderTime(current.slots) })],
    }))
    setStatus('')
  }

  function removeReminder(slotId) {
    setSettings(current => ({
      ...current,
      slots: current.slots.filter(slot => slot.id !== slotId),
    }))
    setStatus('')
  }

  async function handleSave() {
    setBusyAction('save')
    setStatus('')
    try {
      const result = await withUiTimeout(saveReminderSettings(settings), 'Saving reminders')
      if (result.reason === 'permission-denied') {
        setStatus('Notification permission is needed for reminders.')
      } else if (result.native) {
        setStatus(settings.enabled
          ? `${result.scheduled} reminder${result.scheduled === 1 ? '' : 's'} set across ${result.slots} slot${result.slots === 1 ? '' : 's'}.`
          : 'Reminders turned off.')
      } else {
        setStatus('Reminder settings saved. Native notifications are available in the Android app.')
      }
    } catch (error) {
      setStatus(error?.message?.includes('timed out')
        ? 'Android notifications took too long. Please try again.'
        : 'Could not save reminder settings. Please try again.')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleTest() {
    setBusyAction('test')
    setStatus('')
    try {
      const result = await withUiTimeout(sendTestReminder(), 'Testing notification')
      setStatus(result.ok
        ? 'Test notification scheduled for about 5 seconds from now.'
        : result.reason === 'permission-denied'
          ? 'Notification permission is needed for the test.'
          : result.pending === false
            ? 'Android did not retain the test reminder.'
            : 'Install the Android app to test a notification.')
    } catch (error) {
      setStatus(error?.message?.includes('timed out')
        ? 'The test took too long. Please try again.'
        : 'Could not schedule the test notification. Please try again.')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleEnabledToggle() {
    const nextEnabled = !settings.enabled
    setSettings(current => ({ ...current, enabled: nextEnabled }))
    setStatus('')
    if (!nextEnabled || !native) return

    setBusyAction('permission')
    try {
      const result = await withUiTimeout(requestReminderPermission(), 'Requesting notification permission')
      if (!result.granted) setStatus('Notification permission is needed for reminders.')
    } catch (error) {
      setStatus(error?.message?.includes('timed out')
        ? 'Permission request took too long. Please try again.'
        : 'Could not request notification permission. Please try again.')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(0, 0, 0, 0.52)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.section
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ ease: [0.2, 0, 0, 1], duration: 0.28 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-title"
          onClick={event => event.stopPropagation()}
          style={{
            width: 'min(100%, 640px)', maxHeight: '90dvh', overflowY: 'auto',
            background: 'var(--md-sys-color-surface-container)',
            color: 'var(--md-sys-color-on-surface)',
            borderRadius: '28px 28px 0 0', padding: '12px 20px 28px',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.28)',
          }}
        >
          <div style={{ width: 32, height: 4, borderRadius: 4, background: 'var(--md-sys-color-outline)', margin: '0 auto 18px' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h2 id="reminder-title" className="md-headline-small" style={{ margin: 0 }}>Study reminders</h2>
              <p className="md-body-medium" style={{ margin: '6px 0 0', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Set more than one small practice moment.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="md-state"
              aria-label="Close study reminders"
              style={{ width: 44, height: 44, border: 'none', borderRadius: 22, background: 'transparent', color: 'var(--md-sys-color-on-surface-variant)', cursor: 'pointer', fontSize: 24 }}
            >
              ×
            </button>
          </div>

          <div style={{ marginTop: 24, padding: 16, borderRadius: 16, background: 'var(--md-sys-color-surface-container-high)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p className="md-title-medium" style={{ margin: 0 }}>Daily practice reminders</p>
                <p className="md-body-small" style={{ margin: '4px 0 0', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {native ? 'Works when the app is closed and offline.' : 'Available in the Android app.'}
                </p>
              </div>
              <button
                type="button"
                className="md-state"
                aria-pressed={settings.enabled}
                onClick={handleEnabledToggle}
                disabled={busy}
                style={{
                  minWidth: 74, minHeight: 44, borderRadius: 22, padding: '0 14px', cursor: busy ? 'wait' : 'pointer',
                  border: `1px solid ${settings.enabled ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                  background: settings.enabled ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface)',
                  color: settings.enabled ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
                  font: 'inherit',
                }}
              >
                {settings.enabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span className="md-label-large">Reminder slots</span>
              <span className="md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{settings.slots.length} configured</span>
            </div>

            {settings.slots.length === 0 && (
              <div style={{ padding: 16, borderRadius: 16, background: 'var(--md-sys-color-surface-container-high)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                No slots yet. Add one to start receiving reminders.
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              {settings.slots.map((slot, index) => (
                <div key={slot.id} style={{ padding: 14, borderRadius: 18, background: 'var(--md-sys-color-surface-container-high)', border: '1px solid var(--md-sys-color-outline-variant)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="md-label-large" style={{ flex: 1 }}>Reminder {index + 1}</span>
                    <button
                      type="button"
                      className="md-state"
                      aria-pressed={slot.enabled}
                      onClick={() => updateSlot(slot.id, { enabled: !slot.enabled })}
                      disabled={busy}
                      style={{ minHeight: 36, borderRadius: 18, padding: '0 12px', border: `1px solid ${slot.enabled ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`, background: slot.enabled ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface)', color: slot.enabled ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)', font: 'inherit', cursor: busy ? 'wait' : 'pointer' }}
                    >
                      {slot.enabled ? 'On' : 'Off'}
                    </button>
                    <button
                      type="button"
                      className="md-state"
                      aria-label={`Remove reminder ${index + 1}`}
                      onClick={() => removeReminder(slot.id)}
                      disabled={busy}
                      style={{ width: 36, height: 36, borderRadius: 18, border: 'none', background: 'transparent', color: 'var(--md-sys-color-on-surface-variant)', fontSize: 22, cursor: busy ? 'wait' : 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <label style={{ display: 'block', marginTop: 12 }}>
                    <span className="md-label-medium" style={{ display: 'block', marginBottom: 6, color: 'var(--md-sys-color-on-surface-variant)' }}>Time</span>
                    <input
                      type="time"
                      value={slot.time}
                      onChange={event => updateSlot(slot.id, { time: event.target.value })}
                      disabled={busy}
                      style={{ width: '100%', boxSizing: 'border-box', minHeight: 48, borderRadius: 12, padding: '0 12px', border: '1px solid var(--md-sys-color-outline)', background: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-on-surface)', font: 'inherit', fontSize: 17 }}
                    />
                  </label>

                  <div style={{ marginTop: 12 }}>
                    <span className="md-label-medium" style={{ display: 'block', marginBottom: 7, color: 'var(--md-sys-color-on-surface-variant)' }}>Repeat on</span>
                    <div role="group" aria-label={`Reminder ${index + 1} weekdays`} style={{ display: 'flex', gap: 5, width: '100%' }}>
                      {DAYS.map(day => {
                        const selected = slot.weekdays.includes(day.value)
                        return (
                          <button
                            key={day.value}
                            type="button"
                            className="md-state"
                            aria-pressed={selected}
                            aria-label={`${day.label}${selected ? ', selected' : ''}`}
                            onClick={() => toggleSlotDay(slot.id, day.value)}
                            disabled={busy}
                            style={{ flex: '1 1 0', minWidth: 0, minHeight: 38, borderRadius: 19, padding: '0 2px', cursor: busy ? 'wait' : 'pointer', border: `1px solid ${selected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`, background: selected ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface)', color: selected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)', font: 'inherit', fontSize: 11 }}
                          >
                            {day.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="md-state"
              onClick={addReminder}
              disabled={busy}
              style={{ width: '100%', minHeight: 48, marginTop: 12, borderRadius: 24, border: '1px dashed var(--md-sys-color-outline)', background: 'transparent', color: 'var(--md-sys-color-primary)', font: 'inherit', fontWeight: 600, cursor: busy ? 'wait' : 'pointer' }}
            >
              + Add reminder
            </button>
          </div>

          {status && (
            <p className="md-body-medium" role="status" style={{ margin: '16px 0 0', color: status.includes('needed') || status.includes('No ') || status.includes('Could') || status.includes('took too long') || status.includes('did not') ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)' }}>
              {status}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              className="md-state"
              onClick={handleSave}
              disabled={busy}
              style={{ flex: 1, minHeight: 52, border: 'none', borderRadius: 26, cursor: busy ? 'wait' : 'pointer', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', font: 'inherit', fontWeight: 600, opacity: busy ? 0.7 : 1 }}
            >
              {busyAction === 'save' ? 'Saving…' : busyAction === 'permission' ? 'Permission…' : 'Save reminders'}
            </button>
            <button
              type="button"
              className="md-state"
              onClick={handleTest}
              disabled={busy || !native}
              style={{ minHeight: 52, borderRadius: 26, padding: '0 16px', border: '1px solid var(--md-sys-color-outline)', cursor: busy || !native ? 'not-allowed' : 'pointer', background: 'transparent', color: 'var(--md-sys-color-on-surface)', font: 'inherit', opacity: busy || !native ? 0.5 : 1 }}
            >
              {busyAction === 'test' ? 'Testing…' : 'Test'}
            </button>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  )
}
