import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { rand } from '../engine/generators'

/* ── Generate step-by-step worked example for 2D+2D ─── */
function makeAdd2D2DSteps(a, b) {
  const aT = Math.floor(a / 10) * 10, aO = a % 10
  const bT = Math.floor(b / 10) * 10, bO = b % 10
  const tensSum = aT + bT
  const onesSum = aO + bO
  const answer  = a + b
  return [
    { label: 'Question',    display: `${a} + ${b}` },
    { label: 'Expand',      display: `${aT} + ${aO} + ${bT} + ${bO}` },
    { label: 'Reorganise',  display: `(${aT} + ${bT}) + (${aO} + ${bO})` },
    { label: 'Solve',       display: `${tensSum} + ${onesSum}` },
    { label: 'Answer',      display: `${answer}` },
  ]
}

function newExample() {
  const a = rand(12, 99), b = rand(12, 99)
  return { a, b, steps: makeAdd2D2DSteps(a, b) }
}

/* ── Step display with slide-in animation ─────────────── */
function StepCard({ step, idx, total }) {
  return (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.2, 0, 0, 1], duration: 0.3 }}
      style={{ textAlign: 'center' }}
    >
      <div className="md-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
        Step {idx + 1} of {total} — {step.label}
      </div>
      <div
        className="dm-mono"
        style={{
          fontSize: 'clamp(32px, 9vw, 52px)',
          fontWeight: 300,
          lineHeight: 1.2,
          color: idx === total - 1 ? 'var(--md-custom-color-correct)' : 'var(--md-sys-color-on-surface)',
          letterSpacing: '-0.5px',
          wordBreak: 'break-word',
        }}
      >
        {step.display}
      </div>
    </motion.div>
  )
}

/* ── Previous steps (dimmed, stacked above) ───────────── */
function PrevSteps({ steps, currentIdx }) {
  const prev = steps.slice(0, currentIdx)
  if (!prev.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, width: '100%', maxWidth: 420 }}>
      {prev.map((s, i) => (
        <div key={i} style={{ textAlign: 'center', opacity: 0.3 + (i / prev.length) * 0.25 }}>
          <div className="md-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, fontSize: 10 }}>
            {s.label}
          </div>
          <div className="dm-mono" style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 300, color: 'var(--md-sys-color-on-surface)', letterSpacing: '-0.5px' }}>
            {s.display}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── LearnView ─────────────────────────────────────────── */
export default function LearnView({ session, onExit, onStartPractice }) {
  const [example, setExample] = useState(() => newExample())
  const [stepIdx, setStepIdx] = useState(0)

  const { steps } = example
  const isLast = stepIdx === steps.length - 1

  function nextStep() {
    if (isLast) {
      // Generate a new example and reset
      setExample(newExample())
      setStepIdx(0)
    } else {
      setStepIdx(i => i + 1)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--md-sys-color-background)' }}>

      {/* Top bar */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 4px 4px', minHeight: 52 }}>
        <button
          onClick={onExit}
          className="md-state"
          aria-label="Exit"
          style={{ width: 48, height: 48, borderRadius: 24, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        <span className="md-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', paddingRight: 8 }}>
          {session.topic.name} · Learn
        </span>
      </div>

      {/* Main area — scrollable to show all previous steps */}
      <div
        style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          padding: '24px 24px 0',
        }}
      >
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Previous steps — dimmed */}
          <PrevSteps steps={steps} currentIdx={stepIdx} />

          {/* Current step */}
          <AnimatePresence mode="wait">
            <StepCard key={stepIdx} step={steps[stepIdx]} idx={stepIdx} total={steps.length} />
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom action area */}
      <div style={{ flexShrink: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Next step / Next example button */}
        <button
          onClick={nextStep}
          className="md-state"
          style={{
            width: '100%', height: 56, borderRadius: 16, border: 'none',
            background: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
          }}
        >
          <span className="md-label-large" style={{ color: 'inherit' }}>
            {isLast ? 'Next example' : 'Next →'}
          </span>
        </button>

        {/* Start Practice — always visible */}
        <button
          onClick={onStartPractice}
          className="md-state"
          style={{
            width: '100%', height: 44, borderRadius: 16, border: '1px solid var(--md-sys-color-outline)',
            background: 'none', color: 'var(--md-sys-color-primary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span className="md-label-large">Start Practice (5 min) →</span>
        </button>
      </div>
    </div>
  )
}
