import { useEffect, useState } from 'react'
import { PALETTES } from '../theme/material'
import {
  clearReminderDiagnostics,
  copyReminderDiagnostics,
  getReminderDiagnostics,
  getReminderDiagnosticsText,
  loadReminderSettings,
} from '../native/notifications'

function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M8 4.5L15 11l-7 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ThemeIcon({ dark }) {
  return dark ? (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M18.5 13.5A7.5 7.5 0 0 1 8.5 3.2 7.5 7.5 0 1 0 18.5 13.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="3.7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 2.5v2M11 17.5v2M2.5 11h2M17.5 11h2M5 5l1.5 1.5M15.5 15.5L17 17M17 5l-1.5 1.5M6.5 15.5L5 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5.5 9.5a5.5 5.5 0 0 1 11 0c0 6 2 6 2 7H3.5c0-1 2-1 2-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 19h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function reminderSummary(settings) {
  if (!settings.enabled) return 'Off'
  const active = settings.slots.filter(slot => slot.enabled && slot.weekdays.length)
  if (!active.length) return 'On · no active times'
  const times = active.slice(0, 2).map(slot => {
    const [hour, minute] = slot.time.split(':').map(Number)
    const suffix = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`
  })
  const extra = active.length > 2 ? ` +${active.length - 2}` : ''
  return `On · ${times.join(', ')}${extra}`
}

export default function SettingsView({ theme, palette, onToggleTheme, onPaletteChange, onOpenReminders, remindersRevision }) {
  const [settings, setSettings] = useState(() => loadReminderSettings())
  const [diagnosticEntries, setDiagnosticEntries] = useState(() => getReminderDiagnostics())
  const [copyState, setCopyState] = useState('')
  const dark = theme === 'dark'

  function refresh() {
    setSettings(loadReminderSettings())
    setDiagnosticEntries(getReminderDiagnostics())
  }

  useEffect(() => {
    if (remindersRevision > 0) refresh()
  }, [remindersRevision]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCopyDiagnostics() {
    setCopyState('Copying…')
    const result = await copyReminderDiagnostics()
    setDiagnosticEntries(getReminderDiagnostics())
    setCopyState(result.ok ? 'Copied' : 'Copy failed')
  }

  function handleClearDiagnostics() {
    clearReminderDiagnostics()
    setDiagnosticEntries([])
    setCopyState('')
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--md-sys-color-background)' }}>
      <header style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', background: 'var(--md-sys-color-surface)', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
        <h1 className="md-headline-small" style={{ margin: 0, color: 'var(--md-sys-color-on-surface)' }}>Settings</h1>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 32px' }}>
        <p className="md-label-large" style={{ margin: '0 0 8px 4px', color: 'var(--md-sys-color-on-surface-variant)' }}>Practice</p>
        <button
          type="button"
          className="md-state"
          onClick={() => { refresh(); onOpenReminders() }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: 'none', borderRadius: 16, background: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)', textAlign: 'left', cursor: 'pointer' }}
        >
          <span style={{ width: 42, height: 42, borderRadius: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', flexShrink: 0 }}><BellIcon /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="md-title-medium" style={{ display: 'block' }}>Study reminders</span>
            <span className="md-body-medium" style={{ display: 'block', marginTop: 3, color: 'var(--md-sys-color-on-surface-variant)' }}>{reminderSummary(settings)}</span>
          </span>
          <span style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'flex' }}><ChevronRight /></span>
        </button>

        <p className="md-label-large" style={{ margin: '28px 0 8px 4px', color: 'var(--md-sys-color-on-surface-variant)' }}>Appearance</p>
        <button
          type="button"
          className="md-state"
          onClick={onToggleTheme}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: 'none', borderRadius: 16, background: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)', textAlign: 'left', cursor: 'pointer' }}
        >
          <span style={{ width: 42, height: 42, borderRadius: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--md-sys-color-surface-container-high)', color: 'var(--md-sys-color-on-surface-variant)', flexShrink: 0 }}><ThemeIcon dark={dark} /></span>
          <span style={{ flex: 1 }}>
            <span className="md-title-medium" style={{ display: 'block' }}>Theme</span>
            <span className="md-body-medium" style={{ display: 'block', marginTop: 3, color: 'var(--md-sys-color-on-surface-variant)' }}>{dark ? 'Dark mode' : 'Light mode'}</span>
          </span>
          <span className="md-label-large" style={{ color: 'var(--md-sys-color-primary)' }}>Change</span>
        </button>

        <p className="md-label-large" style={{ margin: '28px 0 8px 4px', color: 'var(--md-sys-color-on-surface-variant)' }}>Color palette</p>
        <div role="radiogroup" aria-label="Color palette" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {PALETTES.map(option => {
            const selected = palette === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className="md-state"
                onClick={() => onPaletteChange(option.id)}
                style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px', borderRadius: 14, border: selected ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)', background: selected ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)', textAlign: 'left', cursor: 'pointer' }}
              >
                <span aria-hidden="true" style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 14, background: option.seed, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.16)' }} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="md-label-large" style={{ display: 'block', color: selected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                  <span className="md-body-small" style={{ display: 'block', marginTop: 2, color: selected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.description}</span>
                </span>
                {selected && <span aria-hidden="true" style={{ color: 'var(--md-sys-color-primary)', fontSize: 18, lineHeight: 1 }}>✓</span>}
              </button>
            )
          })}
        </div>
        <p className="md-body-small" style={{ margin: '8px 4px 0', color: 'var(--md-sys-color-on-surface-variant)' }}>Each palette creates a coordinated Material 3 light and dark color scheme.</p>

        <p className="md-label-large" style={{ margin: '28px 0 8px 4px', color: 'var(--md-sys-color-on-surface-variant)' }}>Help and troubleshooting</p>
        <details style={{ borderRadius: 16, padding: '2px 16px 14px', background: 'var(--md-sys-color-surface-container)' }}>
          <summary className="md-title-medium" style={{ padding: '14px 0', cursor: 'pointer', color: 'var(--md-sys-color-on-surface)' }}>Reminder diagnostics</summary>
          <p className="md-body-small" style={{ margin: '0 0 12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Use this only when a reminder or notification behaves unexpectedly. The log stays on this device until cleared.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="md-body-small" style={{ flex: 1, color: 'var(--md-sys-color-on-surface-variant)' }}>{diagnosticEntries.length} saved event{diagnosticEntries.length === 1 ? '' : 's'}</span>
            <button type="button" className="md-state" onClick={handleCopyDiagnostics} style={{ minHeight: 38, borderRadius: 19, padding: '0 12px', border: '1px solid var(--md-sys-color-primary)', background: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', font: 'inherit' }}>{copyState || 'Copy log'}</button>
            <button type="button" className="md-state" onClick={handleClearDiagnostics} disabled={!diagnosticEntries.length} style={{ minHeight: 38, borderRadius: 19, padding: '0 12px', border: '1px solid var(--md-sys-color-outline)', background: 'transparent', color: 'var(--md-sys-color-on-surface-variant)', font: 'inherit', opacity: diagnosticEntries.length ? 1 : 0.5 }}>Clear</button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 240, overflowY: 'auto', margin: 0, padding: 10, borderRadius: 10, background: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-on-surface-variant)', fontSize: 11, lineHeight: 1.45 }}>{getReminderDiagnosticsText()}</pre>
        </details>

        <p className="md-body-small" style={{ margin: '28px 4px 0', color: 'var(--md-sys-color-on-surface-variant)' }}>MathFlow keeps reminders and diagnostics on this device. No account or internet connection is required.</p>
      </main>
    </div>
  )
}
