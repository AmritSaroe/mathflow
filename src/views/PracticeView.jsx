import { useEffect, useReducer, useRef, useState } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { pickSRSItem, recordSRS } from '../engine/srs'
import { recordActivity } from '../engine/storage'
import NumPad from '../components/NumPad'

/* ── Session reducer (logic unchanged) ────────────────── */
const INIT = {
  input: '', locked: false,
  correct: 0, attempted: 0, qNum: 0,
  status: 'question', // 'question' | 'reveal' | 'done'
}

function reducer(s, a) {
  switch (a.type) {
    case 'INPUT':    return { ...s, input: a.val }
    case 'CORRECT':  return { ...s, locked: true, correct: s.correct + 1, attempted: s.attempted + 1, qNum: s.qNum + 1 }
    case 'WRONG':    return { ...s, locked: true, attempted: s.attempted + 1, qNum: s.qNum + 1, status: a.reveal ? 'reveal' : 'question' }
    case 'CONTINUE': return { ...s, input: '', locked: false, status: 'question' }
    case 'DONE':     return { ...s, status: 'done' }
    default:         return s
  }
}

const isDesktop = () =>
  window.matchMedia('(pointer: fine)').matches || window.innerWidth >= 700

/* ── M3 Linear Progress Indicator ─────────────────────── */
function LinearProgress({ value }) {
  return (
    <div style={{ height: 4, background: 'var(--md-sys-color-surface-variant)', flexShrink: 0 }}>
      <div style={{
        height: '100%',
        width: `${Math.min(1, value) * 100}%`,
        background: 'var(--md-sys-color-primary)',
        transition: 'width 400ms cubic-bezier(0.2, 0, 0, 1)',
        borderRadius: '0 2px 2px 0',
      }} />
    </div>
  )
}

/* ── M3 AlertDialog — exit confirm ────────────────────── */
function ExitDialog({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'var(--md-sys-color-scrim)', opacity: 0.32 }} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ ease: [0.2, 0, 0, 1], duration: 0.2 }}
        style={{
          position: 'relative', zIndex: 1,
          background: 'var(--md-sys-color-surface-container-high)',
          borderRadius: 28, padding: '24px 24px 20px',
          width: '100%', maxWidth: 320,
          boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
        }}
      >
        <h3 className="md-headline-small" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: 16 }}>
          Exit session?
        </h3>
        <p className="md-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 24 }}>
          Progress in this session won't be saved.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            className="md-state"
            style={{ padding: '10px 24px', borderRadius: 20, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--md-sys-color-primary)' }}
          >
            <span className="md-label-large">Cancel</span>
          </button>
          <button
            onClick={onConfirm}
            className="md-state"
            style={{ padding: '10px 24px', borderRadius: 20, border: 'none', background: 'var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error)', cursor: 'pointer' }}
          >
            <span className="md-label-large">Exit</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── PracticeView ──────────────────────────────────────── */
export default function PracticeView({ session, onDone, onExit }) {
  const { topicId, topic, mode, timerMins } = session

  const [st, dispatch]        = useReducer(reducer, INIT)
  const [question, setQ]      = useState(null)
  const [srsItem, setSrsItem] = useState(null)
  const [timerSecs, setTimer] = useState(mode === 'practice' ? timerMins * 60 : null)
  const [flash, setFlash]     = useState(null)   // 'correct' | 'wrong' | null
  const [shaking, setShaking] = useState(false)
  const [showExit, setShowExit] = useState(false)

  const qControls = useAnimation()
  const desktop   = isDesktop()
  const inputRef  = useRef(null)
  const timerRef  = useRef(null)
  const isDoneRef = useRef(false)
  const stRef     = useRef(st); stRef.current = st
  const qRef      = useRef(question); qRef.current = question

  /* ── Question generation (logic unchanged) ─────────── */
  function genQ() {
    if (topic.srs) {
      const it = pickSRSItem(topicId, topic.pool)
      return { q: topic.generate(it), it }
    }
    return { q: topic.generate(), it: null }
  }

  /* ── Next question + M3 slide-in animation ──────────── */
  const nextQRef = useRef(null)
  nextQRef.current = function nextQuestion() {
    if (isDoneRef.current || stRef.current.status === 'done') return
    if (mode === 'learn' && stRef.current.qNum >= 20) {
      dispatch({ type: 'DONE' }); return
    }
    const { q, it } = genQ()
    qControls.set({ x: '100vw', opacity: 0 })
    setQ(q); setSrsItem(it); setFlash(null)
    dispatch({ type: 'CONTINUE' })
    qControls.start({ x: 0, opacity: 1, transition: { ease: [0, 0, 0, 1], duration: 0.3 } })
    if (desktop) setTimeout(() => inputRef.current?.focus(), 80)
  }

  const submitRef = useRef(null)

  /* ── Init (logic unchanged) ─────────────────────────── */
  useEffect(() => { nextQRef.current() }, []) // eslint-disable-line

  /* ── Timer (logic unchanged) ─────────────────────────── */
  useEffect(() => {
    if (mode !== 'practice') return
    timerRef.current = setInterval(() => {
      setTimer(s => {
        if (s <= 1) { clearInterval(timerRef.current); isDoneRef.current = true; dispatch({ type: 'DONE' }); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, []) // eslint-disable-line

  /* ── Done → record activity + notify parent ─────────── */
  useEffect(() => {
    if (st.status === 'done') {
      recordActivity(st.attempted, st.correct)
      onDone({ correct: st.correct, attempted: st.attempted })
    }
  }, [st.status]) // eslint-disable-line

  /* ── Auto-advance reveal after 1.5s (learn mode) ────── */
  const doSlideNext = async () => {
    await qControls.start({ x: '-100vw', opacity: 0, transition: { ease: [0.3, 0, 1, 1], duration: 0.25 } })
    nextQRef.current()
  }

  useEffect(() => {
    if (st.status !== 'reveal') return
    const t = setTimeout(doSlideNext, 1500)
    return () => clearTimeout(t)
  }, [st.status]) // eslint-disable-line

  /* ── Desktop: space/enter skips reveal early ─────────── */
  useEffect(() => {
    if (!desktop) return
    const h = (e) => {
      if (stRef.current.status === 'reveal' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault(); doSlideNext()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [desktop]) // eslint-disable-line

  /* ── Submit (logic unchanged + M3 animations) ────────── */
  function submit(inputVal) {
    const cur = stRef.current
    const val = inputVal ?? cur.input
    if (isDoneRef.current || cur.locked || !val || !qRef.current) return

    const isCorrect = parseInt(val) === qRef.current.answer

    if (isCorrect) {
      if (topic.srs && srsItem) recordSRS(topicId, srsItem, true)
      dispatch({ type: 'CORRECT' })
      setFlash('correct')
      // Correct: green flash → slide out left → new q slides in from right
      ;(async () => {
        await new Promise(r => setTimeout(r, mode === 'practice' ? 80 : 200))
        await qControls.start({ x: '-100vw', opacity: 0, transition: { ease: [0.3, 0, 1, 1], duration: 0.25 } })
        nextQRef.current()
      })()
    } else {
      if (topic.srs && srsItem) recordSRS(topicId, srsItem, false)
      dispatch({ type: 'WRONG', reveal: mode === 'learn' })
      setFlash('wrong')
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
      if (mode === 'practice') {
        setTimeout(async () => {
          await qControls.start({ x: '-100vw', opacity: 0, transition: { ease: [0.3, 0, 1, 1], duration: 0.25 } })
          nextQRef.current()
        }, 300)
      }
      // learn: reveal overlay shown + auto-advances via useEffect
    }
  }
  submitRef.current = submit

  /* ── Desktop keyboard (logic unchanged) ─────────────── */
  function handleDesktopChange(e) {
    const cur = stRef.current
    if (cur.locked) { e.target.value = cur.input; return }
    const clean  = e.target.value.replace(/\D/g, '')
    const ansLen = qRef.current ? String(Math.abs(qRef.current.answer)).length : 4
    const val    = clean.slice(0, Math.min(ansLen + 1, 5))
    dispatch({ type: 'INPUT', val })
    if (qRef.current && val.length === ansLen) setTimeout(() => submitRef.current(val), 80)
  }

  /* ── Numpad (logic unchanged) ────────────────────────── */
  function handleNumpadKey(key) {
    const cur = stRef.current
    if (cur.locked) return
    if (key === 'del') {
      dispatch({ type: 'INPUT', val: cur.input.slice(0, -1) })
    } else if (key === 'submit') {
      submitRef.current()
    } else {
      if (cur.input.length >= 5) return
      const next = cur.input + key
      dispatch({ type: 'INPUT', val: next })
      if (qRef.current && next.length === qRef.current.maxDigits)
        setTimeout(() => submitRef.current(next), 80)
    }
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const questionColor = flash === 'correct'
    ? 'var(--md-custom-color-correct)'
    : flash === 'wrong'
    ? 'var(--md-sys-color-error)'
    : 'var(--md-sys-color-on-surface)'

  const answerColor = flash === 'correct'
    ? 'var(--md-custom-color-correct)'
    : flash === 'wrong'
    ? 'var(--md-sys-color-error)'
    : 'var(--md-sys-color-primary)'

  const inputBorderColor = flash === 'wrong'
    ? 'var(--md-sys-color-error)'
    : st.input ? 'var(--md-sys-color-primary)'
    : 'var(--md-sys-color-outline)'

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--md-sys-color-background)' }}>

      {/* M3 Linear Progress Indicator */}
      {mode === 'learn' && <LinearProgress value={st.qNum / 20} />}
      {mode === 'practice' && timerMins && <LinearProgress value={timerSecs / (timerMins * 60)} />}

      {/* Top bar — X close + counter */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 4px 4px', minHeight: 52 }}>
        <button
          onClick={() => { if (st.attempted === 0) { onExit(); return }; setShowExit(true) }}
          className="md-state"
          aria-label="Exit session"
          style={{ width: 48, height: 48, borderRadius: 24, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingRight: 8 }}>
          {mode === 'practice' && timerSecs != null && (
            <span className={`dm-mono md-label-medium${timerSecs <= 30 ? ' anim-timer-warn' : ''}`}
                  style={{ color: timerSecs <= 30 ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)' }}>
              {fmt(timerSecs)}
            </span>
          )}
          {mode === 'learn' && (
            <span className="md-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              {Math.min(st.qNum + 1, 20)}<span style={{ color: 'var(--md-sys-color-outline)' }}> / 20</span>
            </span>
          )}
        </div>
      </div>

      {/* Arena */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 24px', gap: 20 }}>

        {/* Correct / Attempted counters */}
        <div style={{ display: 'flex', gap: 48, paddingBottom: 20, borderBottom: '1px solid var(--md-sys-color-outline-variant)', width: '100%', maxWidth: 480, justifyContent: 'center' }}>
          {[{ val: st.correct, label: 'correct' }, { val: st.attempted, label: 'total' }].map(s => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span key={s.val} className="dm-mono anim-score-in"
                    style={{ fontSize: 44, lineHeight: 1, fontWeight: 300, color: 'var(--md-sys-color-on-surface)' }}>
                {s.val}
              </span>
              <span className="md-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Operation label — Label Small, muted */}
        <span className="md-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.2em', textTransform: 'uppercase', minHeight: 16 }}>
          {question?.typeLabel ?? '\u00a0'}
        </span>

        {/* Question — Display Large, DM Mono, Framer Motion animated */}
        <motion.div
          animate={qControls}
          className={`dm-mono${shaking ? ' anim-shake' : ''}`}
          style={{
            fontSize: 'clamp(44px, 12vw, 68px)',
            lineHeight: 1,
            letterSpacing: '-0.5px',
            textAlign: 'center',
            color: questionColor,
            transition: 'color 100ms',
            userSelect: 'none',
            maxWidth: 480,
            width: '100%',
          }}
        >
          {question?.display ?? '—'}
        </motion.div>

        {/* Answer display */}
        <div style={{ width: '100%', maxWidth: 340 }}>
          {desktop ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={st.input}
              onChange={handleDesktopChange}
              className="dm-mono"
              style={{
                width: '100%', background: 'transparent', outline: 'none',
                fontSize: 48, fontWeight: 300, textAlign: 'center',
                paddingBottom: 8, caretColor: 'var(--md-sys-color-primary)',
                color: answerColor, border: 'none',
                borderBottom: `2px solid ${inputBorderColor}`,
                transition: 'color 100ms, border-color 150ms',
              }}
            />
          ) : (
            <div
              className="dm-mono"
              style={{
                fontSize: 40, fontWeight: 300, textAlign: 'center', paddingBottom: 8,
                color: answerColor,
                borderBottom: `2px solid ${inputBorderColor}`,
                transition: 'color 100ms, border-color 150ms',
                userSelect: 'none', minHeight: 56,
              }}
            >
              {st.input || <span style={{ color: 'var(--md-sys-color-outline)' }}>_</span>}
            </div>
          )}

          {mode === 'learn' && (
            <div className="md-label-medium" style={{
              textAlign: 'center', marginTop: 8, minHeight: 20,
              color: flash === 'correct' ? 'var(--md-custom-color-correct)' : flash === 'wrong' ? 'var(--md-sys-color-error)' : 'transparent',
              transition: 'color 150ms', letterSpacing: '0.05em',
            }}>
              {flash === 'correct' ? '✓  correct' : flash === 'wrong' ? '✗  wrong' : '.'}
            </div>
          )}
        </div>

        {desktop && (
          <p className="md-label-small" style={{ color: 'var(--md-sys-color-outline)', letterSpacing: '0.06em' }}>
            type · auto-submits on correct digit count
          </p>
        )}
      </div>

      {/* Mobile numpad */}
      {!desktop && <NumPad onKey={handleNumpadKey} />}

      {/* Wrong-answer reveal overlay (learn mode) — tap anywhere or auto 1.5s */}
      <AnimatePresence>
        {st.status === 'reveal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={doSlideNext}
            style={{
              position: 'absolute', inset: 0, top: 52,
              background: 'var(--md-sys-color-background)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
              cursor: 'pointer', zIndex: 20,
            }}
          >
            <span className="md-label-large" style={{ color: 'var(--md-sys-color-error)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ✗  incorrect
            </span>
            <span className="dm-mono" style={{ fontSize: 22, color: 'var(--md-sys-color-on-surface-variant)' }}>
              {question?.display}
            </span>
            <span className="dm-mono" style={{ fontSize: 72, fontWeight: 300, lineHeight: 1, color: 'var(--md-custom-color-correct)' }}>
              {question?.answer}
            </span>
            <span className="md-label-small" style={{ color: 'var(--md-sys-color-outline)', marginTop: 16, letterSpacing: '0.06em' }}>
              {desktop ? 'press space or enter · or tap to continue' : 'tap anywhere to continue'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* M3 AlertDialog — exit confirm */}
      <AnimatePresence>
        {showExit && <ExitDialog onConfirm={onExit} onCancel={() => setShowExit(false)} />}
      </AnimatePresence>
    </div>
  )
}
