import { useEffect, useReducer, useRef, useState } from 'react'
import { pickSRSItem, recordSRS } from '../engine/srs'
import { recordActivity } from '../engine/storage'
import NumPad from '../components/NumPad'

/* ── Constants ───────────────────────────────────────── */
const ACCENT = '#d4f53c'
const GREEN  = '#22d36e'
const RED    = '#f04848'

/* ── Session reducer ─────────────────────────────────── */
const INIT = {
  input: '', locked: false,
  correct: 0, attempted: 0, streak: 0, qNum: 0,
  status: 'question', // 'question' | 'reveal' | 'done'
}

function reducer(s, a) {
  switch (a.type) {
    case 'INPUT':    return { ...s, input: a.val }
    case 'CORRECT':  return { ...s, locked: true, correct: s.correct + 1, attempted: s.attempted + 1, streak: s.streak + 1, qNum: s.qNum + 1 }
    case 'WRONG':    return { ...s, locked: true, attempted: s.attempted + 1, streak: 0, qNum: s.qNum + 1, status: a.reveal ? 'reveal' : 'question' }
    case 'CONTINUE': return { ...s, input: '', locked: false, status: 'question' }
    case 'DONE':     return { ...s, status: 'done' }
    default:         return s
  }
}

const isDesktop = () =>
  window.matchMedia('(pointer: fine)').matches || window.innerWidth >= 700

/* ── Component ───────────────────────────────────────── */
export default function PracticeView({ session, onExit, onAgain }) {
  const { topicId, topic, mode, timerMins } = session

  const [st, dispatch]       = useReducer(reducer, INIT)
  const [question, setQ]     = useState(null)
  const [srsItem, setSrsItem] = useState(null)
  const [timerSecs, setTimer] = useState(mode === 'practice' ? timerMins * 60 : null)
  const [flash, setFlash]    = useState(null)   // 'correct' | 'wrong' | null
  const [feedKey, setFeedKey] = useState(0)     // increments per submit → retriggers CSS anim

  const desktop    = isDesktop()
  const inputRef   = useRef(null)
  const timerRef   = useRef(null)
  const isDoneRef  = useRef(false)          // sync flag — set before React batches DONE
  const stRef      = useRef(st); stRef.current = st
  const qRef      = useRef(question); qRef.current = question
  const qDisplayRef = useRef(null)

  /* ── Question generation ─────────────────────────── */
  function genQ() {
    if (topic.srs) {
      const it = pickSRSItem(topicId, topic.pool)
      return { q: topic.generate(it), it }
    }
    return { q: topic.generate(), it: null }
  }

  function nextQuestion() {
    if (isDoneRef.current || stRef.current.status === 'done') return
    if (mode === 'learn' && stRef.current.qNum >= 20) {
      dispatch({ type: 'DONE' }); return
    }
    const { q, it } = genQ()
    setQ(q); setSrsItem(it); setFlash(null)
    dispatch({ type: 'CONTINUE' })
    if (desktop) setTimeout(() => inputRef.current?.focus(), 80)
  }

  const nextQRef  = useRef(nextQuestion); nextQRef.current = nextQuestion
  const submitRef = useRef(null)

  /* ── Init & timer ────────────────────────────────── */
  useEffect(() => { nextQRef.current() }, [])

  useEffect(() => {
    if (mode !== 'practice') return
    timerRef.current = setInterval(() => {
      setTimer(s => {
        if (s <= 1) { clearInterval(timerRef.current); isDoneRef.current = true; dispatch({ type: 'DONE' }); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (st.status === 'done') recordActivity(st.attempted, st.correct)
  }, [st.status])

  /* ── Submit ──────────────────────────────────────── */
  function submit(inputVal) {
    const cur = stRef.current
    const val = inputVal ?? cur.input
    if (isDoneRef.current || cur.locked || !val || !qRef.current) return

    const isCorrect = parseInt(val) === qRef.current.answer

    setFeedKey(k => k + 1)

    if (isCorrect) {
      if (topic.srs && srsItem) recordSRS(topicId, srsItem, true)
      dispatch({ type: 'CORRECT' })
      setFlash('correct')
      setTimeout(() => nextQRef.current(), mode === 'practice' ? 200 : 650)
    } else {
      if (topic.srs && srsItem) recordSRS(topicId, srsItem, false)
      dispatch({ type: 'WRONG', reveal: mode === 'learn' })
      setFlash('wrong')
      if (mode === 'practice') setTimeout(() => nextQRef.current(), 200)
    }
  }
  submitRef.current = submit

  /* ── Desktop: space / enter to continue reveal ───── */
  useEffect(() => {
    if (!desktop) return
    const h = (e) => {
      if (stRef.current.status === 'reveal' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault(); nextQRef.current()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [desktop])

  /* ── Desktop: keyboard input ─────────────────────── */
  function handleDesktopChange(e) {
    const cur = stRef.current
    if (cur.locked) { e.target.value = cur.input; return }
    const clean  = e.target.value.replace(/\D/g, '')
    const ansLen = qRef.current ? String(Math.abs(qRef.current.answer)).length : 4
    const val    = clean.slice(0, Math.min(ansLen + 1, 5))
    dispatch({ type: 'INPUT', val })
    if (qRef.current && val.length === ansLen) setTimeout(() => submitRef.current(val), 80)
  }

  /* ── Numpad ──────────────────────────────────────── */
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

  /* ── Helpers ─────────────────────────────────────── */
  const fmt      = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const qColor   = flash === 'correct' ? GREEN : flash === 'wrong' ? RED : '#f0f0ee'
  const qAnim    = flash === 'correct' ? 'anim-pop' : flash === 'wrong' ? 'anim-shake' : 'anim-fade-up'
  const aBorderC = flash === 'wrong' ? RED : st.input ? ACCENT : '#1e1e1e'

  /* ── Result screen ───────────────────────────────── */
  if (st.status === 'done') {
    const pct     = st.attempted > 0 ? Math.round(st.correct / st.attempted * 100) : 0
    const pctColor = pct >= 80 ? GREEN : pct >= 50 ? '#e8c84a' : RED

    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-6"
           style={{ background: 'var(--bg)' }}>

        <p className="font-mono text-[10px] text-[#282828] tracking-[0.28em] uppercase anim-fade-up">
          session complete
        </p>

        {/* Percentage */}
        <div
          className="font-mono font-light leading-none tracking-tight anim-scale-in"
          style={{ fontSize: 96, color: pctColor, animationDelay: '80ms' }}
        >
          {pct}<span style={{ fontSize: 40, color: pctColor + '80' }}>%</span>
        </div>

        {/* Topic */}
        <p
          className="font-semibold text-[14px] text-[#383838] anim-fade-up"
          style={{ animationDelay: '140ms' }}
        >
          {topic.name}
        </p>

        {/* Stats row */}
        <div
          className="flex gap-8 font-mono text-[13px] text-[#282828] anim-fade-up"
          style={{ animationDelay: '190ms' }}
        >
          <span>
            <span className="text-[#c0c0bb]">{st.correct}</span> correct
          </span>
          <span>
            <span className="text-[#c0c0bb]">{st.attempted}</span> total
          </span>
        </div>

        {/* Action buttons */}
        <div
          className="flex gap-3 mt-2 anim-fade-up"
          style={{ animationDelay: '260ms' }}
        >
          <button
            onClick={onExit}
            className="px-6 py-3.5 bg-[#111] border border-[#1e1e1e] rounded-[13px]
                       text-[#555] text-[13px] font-semibold transition-all
                       hover:bg-[#181818] hover:text-[#888] active:scale-[0.96]"
          >
            ← Home
          </button>
          <button
            onClick={onAgain}
            className="px-8 py-3.5 rounded-[13px] text-[13px] font-bold
                       transition-all active:scale-[0.96]"
            style={{
              background: ACCENT,
              color: '#0a1400',
              boxShadow: `0 4px 20px ${ACCENT}30`,
            }}
          >
            Again →
          </button>
        </div>
      </div>
    )
  }

  /* ── Practice screen ─────────────────────────────── */
  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-5 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)', height: 52 }}
      >
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: ACCENT + 'cc' }}>
          {topic.name}
        </span>

        <div className="flex items-center gap-4">
          {mode === 'practice' && timerSecs != null && (
            <span
              className={`font-mono text-[13px] tabular-nums ${timerSecs <= 30 ? 'anim-timer-warn' : ''}`}
              style={{ color: timerSecs <= 30 ? RED : '#333' }}
            >
              {fmt(timerSecs)}
            </span>
          )}
          {mode === 'learn' && (
            <span className="font-mono text-[11px] text-[#282828]">
              {Math.min(st.qNum + 1, 20)}<span className="text-[#1e1e1e]"> / 20</span>
            </span>
          )}
          <button
            onClick={() => {
              if (st.attempted === 0 || confirm('Exit? Progress is saved.')) onExit()
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full
                       text-[#2a2a2a] hover:text-[#666] hover:bg-[#141414]
                       transition-all duration-150"
          >
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Progress bar (learn mode) */}
      {mode === 'learn' && (
        <div className="flex-shrink-0 h-[2px] bg-[#0f0f0f]">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${(st.qNum / 20) * 100}%`, background: ACCENT + '80' }}
          />
        </div>
      )}

      {/* ── Arena ── */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-6">
        <div className="w-full flex flex-col items-center gap-6" style={{ maxWidth: 520 }}>

          {/* Score row */}
          <div className="flex gap-14 pb-6 w-full justify-center border-b border-[#111]">
            {[
              { val: st.correct, label: 'correct' },
              { val: st.streak,  label: 'streak'  },
            ].map(s => (
              <div key={s.label} className="flex flex-col-reverse items-center gap-1">
                <span className="font-mono text-[10px] text-[#242424] tracking-[0.14em] uppercase">
                  {s.label}
                </span>
                <span
                  key={s.val}                  /* remounts on change → retriggers anim */
                  className="font-mono font-light leading-none tabular-nums anim-score-in"
                  style={{ fontSize: 52, color: '#d8d8d4' }}
                >
                  {s.val}
                </span>
              </div>
            ))}
          </div>

          {/* Type label */}
          <span
            className="font-mono text-[10px] text-[#202020] tracking-[0.22em] uppercase"
            style={{ minHeight: 14 }}
          >
            {question?.typeLabel ?? '\u00a0'}
          </span>

          {/* Question display */}
          <div
            key={feedKey}                       /* remounts on each submit → CSS anim fires */
            ref={qDisplayRef}
            className={`font-mono text-center leading-none tracking-tight select-none
                        transition-colors duration-100 ${qAnim}`}
            style={{ fontSize: 84, color: qColor }}
          >
            {question?.display ?? '—'}
          </div>

          {/* Answer area */}
          <div style={{ width: '100%', maxWidth: 280 }}>
            {desktop ? (
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={st.input}
                onChange={handleDesktopChange}
                className="w-full bg-transparent outline-none font-mono font-light
                           text-center pb-2.5 caret-[#d4f53c] transition-colors duration-100"
                style={{
                  fontSize: 60,
                  color: flash === 'wrong' ? RED : ACCENT,
                  border: 'none',
                  borderBottom: `2px solid ${aBorderC}`,
                }}
              />
            ) : (
              <div
                className="font-mono font-light text-center pb-2.5 select-none
                           transition-colors duration-100 tabular-nums"
                style={{
                  fontSize: 48,
                  color: flash === 'wrong' ? RED : ACCENT,
                  borderBottom: `2px solid ${aBorderC}`,
                }}
              >
                {st.input || <span style={{ color: '#1e1e1e' }}>_</span>}
              </div>
            )}

            {/* Learn feedback line */}
            {mode === 'learn' && (
              <div
                className="font-mono text-[11px] text-center mt-2 transition-colors duration-150"
                style={{
                  minHeight: 16,
                  color: flash === 'correct' ? GREEN
                       : flash === 'wrong'   ? RED
                       : 'transparent',
                }}
              >
                {flash === 'correct' ? '✓  correct' : flash === 'wrong' ? '✗  wrong' : '.'}
              </div>
            )}
          </div>

          {/* Desktop hint */}
          {desktop && (
            <p className="font-mono text-[11px] text-[#1e1e1e] tracking-[0.08em]">
              type · auto-submits on correct digit count
            </p>
          )}

        </div>
      </div>

      {/* Mobile numpad */}
      {!desktop && <NumPad onKey={handleNumpadKey} />}

      {/* Wrong-answer reveal (learn mode) */}
      {st.status === 'reveal' && (
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center
                     justify-center gap-5 cursor-pointer anim-fade-in"
          style={{
            top: 52,
            background: 'var(--bg)',
          }}
          onClick={() => nextQRef.current()}
        >
          <span className="font-mono text-[10px] tracking-[0.26em] uppercase"
                style={{ color: RED + 'cc' }}>
            ✗  incorrect
          </span>
          <span className="font-mono text-[22px] text-[#282828]">
            {question?.display}
          </span>
          <span
            className="font-mono font-light leading-none tracking-tight anim-scale-in"
            style={{ fontSize: 80, color: GREEN }}
          >
            {question?.answer}
          </span>
          <span className="font-mono text-[11px] text-[#1e1e1e] mt-6">
            {desktop ? 'press space or enter to continue' : 'tap anywhere to continue'}
          </span>
        </div>
      )}

    </div>
  )
}
