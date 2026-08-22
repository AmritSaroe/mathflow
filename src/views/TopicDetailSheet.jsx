import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MODES = [
  {
    key: 'learn',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 14l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Learn',
    sub: '20 questions · instant feedback',
  },
  {
    key: 'practice',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 7v5l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Practice',
    sub: 'timed sprint · speed mode',
  },
]

const TIMER_OPTIONS = [2, 5, 10]
const DRILL_LIMITS  = [10, 25, 50, 'All']

const DRILL_KEY = 'memoryFactLimit'
const COMPLEMENT_TARGETS = [10, 50, 100]
const COMPLEMENT_KEY = 'complementTargets'

export default function TopicDetailSheet({ topic, onClose, onStart }) {
  const isMemory = topic.section === 'memory'
  const modeOptions = topic.isComplements
    ? [
        { ...MODES[0], sub: 'visual tutorial · step by step' },
        { ...MODES[1], sub: 'direct questions · SRS review' },
      ]
    : MODES

  const [mode, setMode]           = useState(null)
  const [timerMins, setTimerMins] = useState(null)
  const [drillLimit, setDrillLimit] = useState(() => {
    const saved = localStorage.getItem(DRILL_KEY)
    if (!saved) return 25
    return saved === 'All' ? 'All' : parseInt(saved)
  })
  const [selectedTargets, setSelectedTargets] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COMPLEMENT_KEY) || '[10]')
      return COMPLEMENT_TARGETS.filter(target => saved.includes(target))
    } catch {
      return [10]
    }
  })

  const canStart = isMemory
    ? true  // drill always ready
    : (mode === 'learn' || (mode === 'practice' && timerMins != null)) &&
      (!topic.isComplements || selectedTargets.length > 0)

  function handleStart() {
    if (!canStart) return
    if (isMemory) {
      const limit = drillLimit === 'All' ? (topic.pool?.length ?? 50) : drillLimit
      localStorage.setItem(DRILL_KEY, String(drillLimit))
      onStart({ topicId: topic.id, topic, mode: 'drill', drillLimit: limit })
    } else {
      if (topic.isComplements) localStorage.setItem(COMPLEMENT_KEY, JSON.stringify(selectedTargets))
      onStart({
        topicId: topic.id,
        topic,
        mode,
        timerMins,
        complementTargets: topic.isComplements ? selectedTargets : undefined,
      })
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      {/* Scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--md-sys-color-scrim)',
          opacity: 0.32,
        }}
      />

      {/* Sheet — slides up from bottom */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ ease: [0.2, 0, 0, 1], duration: 0.35 }}
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          background: 'var(--md-sys-color-surface-container-low)',
          borderRadius: '28px 28px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        {/* Handle pill */}
        <div style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--md-sys-color-on-surface-variant)', opacity: 0.4, margin: '12px auto 0' }} />

        <div style={{ padding: '16px 24px 24px' }}>
          {/* Back / close button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={onClose}
              style={{ width: 48, height: 48, borderRadius: 24, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Topic name + description */}
          <div style={{ marginBottom: 24 }}>
            <h2 className="md-headline-small" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: 4 }}>
              {topic.name}
            </h2>
            <p className="dm-mono md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              {topic.desc}
            </p>
          </div>

          {isMemory ? (
            /* ── Memory drill UI ── */
            <>
              <p className="md-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 12, letterSpacing: '0.05em' }}>
                Number of facts
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {DRILL_LIMITS.map(lim => {
                  const isSelected = drillLimit === lim
                  return (
                    <button
                      key={lim}
                      onClick={() => setDrillLimit(lim)}
                      className="md-state"
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 8,
                        border: `1px solid ${isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                        background: isSelected ? 'var(--md-sys-color-primary-container)' : 'none',
                        color: isSelected ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                        cursor: 'pointer',
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 400,
                        fontSize: 13,
                        transition: 'all 150ms',
                      }}
                    >
                      {lim}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            /* ── Standard Learn / Practice mode cards ── */
            <>
              {topic.isComplements && (
                <div style={{ marginBottom: 20 }}>
                  <p className="md-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 10, letterSpacing: '0.05em' }}>
                    Choose targets
                  </p>
                  <div role="group" aria-label="Complement targets" style={{ display: 'flex', gap: 8, width: '100%' }}>
                    {COMPLEMENT_TARGETS.map(target => {
                      const checked = selectedTargets.includes(target)
                      return (
                        <button
                          key={target}
                          type="button"
                          className="md-state"
                          aria-pressed={checked}
                          aria-label={`Complements of ${target}${checked ? ', selected' : ''}`}
                          onClick={() => setSelectedTargets(current =>
                            checked ? current.filter(value => value !== target) : [...current, target].sort((a, b) => a - b)
                          )}
                          style={{
                            flex: '1 1 0', minWidth: 0, minHeight: 48, padding: '10px 8px',
                            borderRadius: 24, cursor: 'pointer',
                            border: `1px solid ${checked ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                            background: checked ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container)',
                            color: checked ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
                            fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 400,
                            transition: 'background 150ms, border-color 150ms, color 150ms',
                          }}
                        >
                          {target}
                        </button>
                      )
                    })}
                  </div>
                  <p className="md-body-small" style={{ margin: '8px 0 0', color: selectedTargets.length ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-error)' }}>
                    {selectedTargets.length ? `${selectedTargets.length} target${selectedTargets.length === 1 ? '' : 's'} selected` : 'Select at least one target'}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {modeOptions.map(m => {
                  const isSelected = mode === m.key
                  return (
                    <button
                      key={m.key}
                      onClick={() => { setMode(m.key); if (m.key === 'learn') setTimerMins(null) }}
                      className="md-state"
                      style={{
                        textAlign: 'left', border: 'none', borderRadius: 12, padding: 16,
                        cursor: 'pointer',
                        background: isSelected ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container)',
                        boxShadow: isSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
                        transition: 'background 150ms, box-shadow 150ms',
                        color: isSelected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)',
                      }}
                    >
                      <div style={{ marginBottom: 12, color: 'inherit' }}>{m.icon}</div>
                      <div className="md-title-medium" style={{ color: 'inherit', marginBottom: 4 }}>{m.label}</div>
                      <div className="md-body-small" style={{ color: isSelected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)' }}>
                        {m.sub}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Timer options — shown only for Practice mode */}
              <AnimatePresence>
                {mode === 'practice' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ ease: [0.2, 0, 0, 1], duration: 0.25 }}
                    style={{ overflow: 'hidden', marginBottom: 16 }}
                  >
                    <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                      {TIMER_OPTIONS.map(mins => {
                        const isSelected = timerMins === mins
                        return (
                          <button
                            key={mins}
                            onClick={() => setTimerMins(mins)}
                            className="md-state"
                            style={{
                              flex: 1, padding: '10px 0', borderRadius: 8,
                              border: `1px solid ${isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                              background: isSelected ? 'var(--md-sys-color-primary-container)' : 'none',
                              color: isSelected ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                              cursor: 'pointer',
                              fontFamily: "'DM Mono', monospace", fontWeight: 400, fontSize: 13,
                              transition: 'all 150ms',
                            }}
                          >
                            {mins} min
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Start button */}
          <button
            disabled={!canStart}
            onClick={handleStart}
            style={{
              width: '100%', height: 56, borderRadius: 16, border: 'none',
              cursor: canStart ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: canStart ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-variant)',
              color: canStart ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
              opacity: canStart ? 1 : 0.7,
              transition: 'background 200ms, color 200ms, opacity 200ms',
              boxShadow: canStart ? '0 3px 8px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <span className="md-label-large" style={{ color: 'inherit' }}>
              {isMemory ? 'Drill' : canStart ? 'Start' : 'Select a mode'}
            </span>
            {(canStart || isMemory) && (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
