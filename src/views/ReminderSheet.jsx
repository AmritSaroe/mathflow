import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
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

export default function ReminderSheet({ onClose }) {
  const native = isNativeAndroid()
  const [settings, setSettings] = useState(() => loadReminderSettings())
  const [busyAction, setBusyAction] = useState(null)
  const [status, setStatus] = useState('')
  const busy = busyAction !== null

  function toggleDay(day) {
    setSettings(current => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter(value => value !== day)
        : [...current.weekdays, day].sort((a, b) => a - b),
    }))
    setStatus('')
  }

  async function handleSave() {
    setBusyAction('save')
    setStatus('')
    try {
      const result = await saveReminderSettings(settings)
      if (result.reason === 'no-days') {
        setStatus('Choose at least one day.')
      } else if (result.reason === 'permission-denied') {
        setStatus('Notification permission is needed for reminders.')
      } else if (result.native) {
        setStatus(settings.enabled ? `Reminder set for ${result.scheduled} day${result.scheduled === 1 ? '' : 's'}.` : 'Reminders turned off.')
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
      const result = await sendTestReminder()
      setStatus(result.ok
        ? 'Test notification scheduled for now.'
        : result.reason === 'permission-denied'
          ? 'Notification permission is needed for the test.'
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
      const result = await requestReminderPermission()
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
                Keep a small practice habit going.
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
                <p className="md-title-medium" style={{ margin: 0 }}>Daily practice reminder</p>
                <p className="md-body-small" style={{ margin: '4px 0 0', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {native ? 'Works even when the app is closed and offline.' : 'Available in the Android app.'}
                </p>
              </div>
              <button
                type="button"
                className="md-state"
                aria-pressed={settings.enabled}
                onClick={handleEnabledToggle}
                style={{
                  minWidth: 74, minHeight: 44, borderRadius: 22, padding: '0 14px', cursor: 'pointer',
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

          <label style={{ display: 'block', marginTop: 20 }}>
            <span className="md-label-large" style={{ display: 'block', marginBottom: 8 }}>Reminder time</span>
            <input
              type="time"
              value={settings.time}
              onChange={event => { setSettings(current => ({ ...current, time: event.target.value })); setStatus('') }}
              style={{ width: '100%', boxSizing: 'border-box', minHeight: 52, borderRadius: 12, padding: '0 14px', border: '1px solid var(--md-sys-color-outline)', background: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-on-surface)', font: 'inherit', fontSize: 17 }}
            />
          </label>

          <div style={{ marginTop: 20 }}>
            <span className="md-label-large" style={{ display: 'block', marginBottom: 10 }}>Repeat on</span>
            <div role="group" aria-label="Reminder weekdays" style={{ display: 'flex', gap: 6, width: '100%' }}>
              {DAYS.map(day => {
                const selected = settings.weekdays.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    className="md-state"
                    aria-pressed={selected}
                    aria-label={`${day.label}${selected ? ', selected' : ''}`}
                    onClick={() => toggleDay(day.value)}
                    style={{
                      flex: '1 1 0', minWidth: 0, minHeight: 44, borderRadius: 22, padding: '0 4px', cursor: 'pointer',
                      border: `1px solid ${selected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                      background: selected ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface)',
                      color: selected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
                      font: 'inherit', fontSize: 12,
                    }}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>

          {status && (
            <p className="md-body-medium" role="status" style={{ margin: '16px 0 0', color: status.includes('needed') || status.includes('Choose') || status.includes('Could') || status.includes('took too long') ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)' }}>
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
              {busyAction === 'save' ? 'Saving…' : 'Save reminders'}
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
