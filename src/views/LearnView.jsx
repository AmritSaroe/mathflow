import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { rand } from '../engine/generators'

/* ── Step data ────────────────────────────────────────── */
function makeAdd2D2DSteps(a, b) {
  const aT = Math.floor(a / 10) * 10, aO = a % 10
  const bT = Math.floor(b / 10) * 10, bO = b % 10
  const tensSum = aT + bT
  const onesSum = aO + bO
  return [
    { label: 'Question',   type: 'simple',     display: `${a} + ${b}` },
    { label: 'Expand',     type: 'simple',     display: `${aT} + ${aO} + ${bT} + ${bO}` },
    { label: 'Reorganise', type: 'reorganise', tensA: aT, tensB: bT, unitsA: aO, unitsB: bO },
    { label: 'Solve',      type: 'solve',      tens: tensSum, units: onesSum },
    { label: 'Answer',     type: 'answer',     display: `${a + b}` },
  ]
}

function newExample() {
  const a = rand(12, 99), b = rand(12, 99)
  return { a, b, steps: makeAdd2D2DSteps(a, b) }
}

/* ── Math text ────────────────────────────────────────── */
function MathText({ children, size = 'large', color }) {
  const fontSize = size === 'large'  ? 'clamp(28px, 8vw, 44px)'
                 : size === 'medium' ? 'clamp(20px, 5.5vw, 32px)'
                 :                    'clamp(14px, 4vw, 20px)'
  return (
    <div
      className="dm-mono"
      style={{
        fontSize,
        fontWeight: 300,
        lineHeight: 1.3,
        color: color || 'var(--md-sys-color-on-surface)',
        letterSpacing: '-0.5px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}

/* ── Step content variants ────────────────────────────── */
function SimpleContent({ step }) {
  const len = step.display.length
  const size = len <= 7 ? 'large' : 'medium'
  return <MathText size={size}>{step.display}</MathText>
}

function ReorganiseContent({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <MathText size="medium">({step.tensA} + {step.tensB})</MathText>
      <MathText size="small">+</MathText>
      <MathText size="medium">({step.unitsA} + {step.unitsB})</MathText>
    </div>
  )
}

function SolveContent({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <MathText size="large">{step.tens}</MathText>
      <MathText size="small">+</MathText>
      <MathText size="large">{step.units}</MathText>
      <div style={{ width: 64, height: 2, background: 'var(--md-sys-color-outline-variant)', borderRadius: 1, marginTop: 6 }} />
    </div>
  )
}

function AnswerContent({ step }) {
  return <MathText size="large" color="var(--md-custom-color-correct)">{step.display}</MathText>
}

/* ── Card ─────────────────────────────────────────────── */
function StepCard({ step, isCurrent, cardRef }) {
  return (
    <motion.div
      ref={isCurrent ? cardRef : undefined}
      initial={isCurrent ? { y: 48, opacity: 0, scale: 1 } : false}
      animate={
        isCurrent
          ? { y: 0, opacity: 1, scale: 1 }
          : { y: 0, opacity: 0.4, scale: 0.85 }
      }
      transition={{ ease: [0.2, 0, 0, 1], duration: 0.3 }}
      style={{
        background: 'var(--md-sys-color-surface)',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        boxShadow: isCurrent
          ? '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)'
          : '0 1px 2px rgba(0,0,0,0.06)',
        transformOrigin: 'top center',
      }}
    >
      <div
        className="md-label-small"
        style={{
          color: 'var(--md-sys-color-on-surface-variant)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        {step.label}
      </div>

      {step.type === 'simple'     && <SimpleContent step={step} />}
      {step.type === 'reorganise' && <ReorganiseContent step={step} />}
      {step.type === 'solve'      && <SolveContent step={step} />}
      {step.type === 'answer'     && <AnswerContent step={step} />}
    </motion.div>
  )
}

/* ── LearnView ─────────────────────────────────────────── */
export default function LearnView({ session, onExit, onStartPractice }) {
  const [example, setExample]     = useState(() => newExample())
  const [stepIdx, setStepIdx]     = useState(0)
  const [exampleKey, setExampleKey] = useState(0)
  const scrollRef    = useRef(null)
  const currentCardRef = useRef(null)

  const { steps } = example
  const isLast = stepIdx === steps.length - 1

  // Scroll to bottom whenever a new card appears
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(t)
  }, [stepIdx, exampleKey])

  function nextStep() {
    if (isLast) {
      setExample(newExample())
      setStepIdx(0)
      setExampleKey(k => k + 1)
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

      {/* Scrollable card stack */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          {steps.slice(0, stepIdx + 1).map((step, i) => (
            <StepCard
              key={`${exampleKey}-${i}`}
              step={step}
              isCurrent={i === stepIdx}
              cardRef={currentCardRef}
            />
          ))}
        </div>
      </div>

      {/* Fixed bottom action area */}
      <div style={{ flexShrink: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!isLast ? (
          <button
            onClick={nextStep}
            className="md-state"
            style={{
              width: '100%', height: 56, borderRadius: 16, border: 'none',
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
            }}
          >
            <span className="md-label-large" style={{ color: 'inherit' }}>Next →</span>
          </button>
        ) : (
          <>
            <button
              onClick={onStartPractice}
              className="md-state"
              style={{
                width: '100%', height: 56, borderRadius: 16, border: 'none',
                background: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
              }}
            >
              <span className="md-label-large" style={{ color: 'inherit' }}>Start Practice →</span>
            </button>
            <button
              onClick={nextStep}
              className="md-state"
              style={{
                width: '100%', height: 44, borderRadius: 16, border: 'none',
                background: 'none', color: 'var(--md-sys-color-primary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="md-label-large">Another example</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
