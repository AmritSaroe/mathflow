import { motion } from 'framer-motion'

/**
 * M3 Session Results screen.
 * Shows score, accuracy, mode-specific stats, and action buttons.
 *
 * Props:
 *   result  — { correct, attempted, session: { topic, mode, timerMins } }
 *   onAgain — restart same session
 *   onHome  — go back to home
 */

const ENTER = { ease: [0.2, 0, 0, 1], duration: 0.4 }
const STAGGER_BASE = 80 // ms between each element's entrance

function StatCard({ label, value, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ENTER, delay: delay / 1000 }}
      style={{
        background: 'var(--md-sys-color-surface-container)',
        borderRadius: 16,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span className="md-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span className="dm-mono" style={{ fontSize: 36, fontWeight: 300, lineHeight: 1, color: color || 'var(--md-sys-color-on-surface)' }}>
        {value}
      </span>
      {sub && (
        <span className="md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{sub}</span>
      )}
    </motion.div>
  )
}

export default function ResultView({ result, onAgain, onHome }) {
  const { correct, attempted, session } = result
  const { topic, mode, timerMins } = session

  const pct = attempted > 0 ? Math.round(correct / attempted * 100) : 0

  const pctColor = pct >= 80
    ? 'var(--md-custom-color-correct)'
    : pct >= 50
    ? 'var(--md-sys-color-tertiary)'
    : 'var(--md-sys-color-error)'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--md-sys-color-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 40px',
        overflowY: 'auto',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Session complete label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="md-label-medium"
          style={{ color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}
        >
          session complete
        </motion.p>

        {/* Big accuracy percentage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ease: [0.2, 0, 0, 1], duration: 0.5, delay: 0.05 }}
          style={{ textAlign: 'center' }}
        >
          <span className="dm-mono" style={{ fontSize: 96, fontWeight: 300, lineHeight: 1, color: pctColor }}>
            {pct}
          </span>
          <span className="dm-mono" style={{ fontSize: 40, fontWeight: 300, color: pctColor, opacity: 0.6 }}>%</span>
        </motion.div>

        {/* Topic name */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTER, delay: 0.15 }}
          className="md-title-medium"
          style={{ color: 'var(--md-sys-color-on-surface)', textAlign: 'center' }}
        >
          {topic.name}
        </motion.p>

        {/* Stat cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StatCard
            label="Correct"
            value={correct}
            sub={`out of ${attempted}`}
            delay={STAGGER_BASE * 3}
          />
          <StatCard
            label="Accuracy"
            value={`${pct}%`}
            color={pctColor}
            delay={STAGGER_BASE * 4}
          />
          {mode === 'practice' && timerMins && (
            <StatCard
              label="Time"
              value={`${timerMins}m`}
              sub="timed sprint"
              delay={STAGGER_BASE * 5}
            />
          )}
          {mode === 'learn' && (
            <StatCard
              label="Mode"
              value="20 q"
              sub="learn"
              delay={STAGGER_BASE * 5}
            />
          )}
          <StatCard
            label="Wrong"
            value={attempted - correct}
            color={attempted - correct > 0 ? 'var(--md-sys-color-error)' : undefined}
            delay={STAGGER_BASE * 6}
          />
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTER, delay: 0.5 }}
          style={{ display: 'flex', gap: 12, marginTop: 8 }}
        >
          {/* TextButton: Back home */}
          <button
            onClick={onHome}
            className="md-state"
            style={{
              flex: 1, height: 40, borderRadius: 20, border: 'none',
              background: 'none', cursor: 'pointer',
              color: 'var(--md-sys-color-primary)',
            }}
          >
            <span className="md-label-large">← Home</span>
          </button>

          {/* FilledButton: Practice again */}
          <button
            onClick={onAgain}
            className="md-state"
            style={{
              flex: 2, height: 40, borderRadius: 20, border: 'none',
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <span className="md-label-large">Again →</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
