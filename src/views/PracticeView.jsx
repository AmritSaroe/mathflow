import { useEffect, useReducer, useRef, useState } from 'react'
import { pickSRSItem, recordSRS } from '../engine/srs'
import { recordActivity } from '../engine/storage'
import NumPad from '../components/NumPad'

// ── Session reducer ──────────────────────────────────────
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

const desktop = () =>
  window.matchMedia('(pointer: fine)').matches || window.innerWidth >= 700

// ── Component ────────────────────────────────────────────
export default function PracticeView({ session, onExit, onAgain }) {
  const { topicId, topic, mode, timerMins } = session

  const [st, dispatch]       = useReducer(reducer, INIT)
  const [question, setQ]     = useState(null)
  const [srsItem, setSrsItem] = useState(null)
  const [timerSecs, setTimer] = useState(mode === 'practice' ? timerMins * 60 : null)
  const [flash, setFlash]    = useState(null) // 'correct' | 'wrong' | null

  const isDesktop  = desktop()
  const inputRef   = useRef(null)
  const timerRef   = useRef(null)
  const stRef      = useRef(st)
  stRef.current    = st

  // ── Question generation ────────────────────────────────
  function genQ() {
    if (topic.srs) {
      const it = pickSRSItem(topicId, topic.pool)
      return { q: topic.generate(it), it }
    }
    return { q: topic.generate(), it: null }
  }

  function nextQuestion() {
    if (mode === 'learn' && stRef.current.qNum >= 20) {
      dispatch({ type: 'DONE' }); return
    }
    const { q, it } = genQ()
    setQ(q); setSrsItem(it); setFlash(null)
    dispatch({ type: 'CONTINUE' })
    if (isDesktop) setTimeout(() => inputRef.current?.focus(), 80)
  }

  // Stable refs so timeouts always call the latest version
  const nextQRef  = useRef(nextQuestion);  nextQRef.current  = nextQuestion
  const submitRef = useRef(null)

  // ── Init & timer ──────────────────────────────────────
  useEffect(() => { nextQRef.current() }, [])           // first question

  useEffect(() => {
    if (mode !== 'practice') return
    timerRef.current = setInterval(() => {
      setTimer(s => {
        if (s <= 1) { clearInterval(timerRef.current); dispatch({ type: 'DONE' }); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (st.status === 'done') recordActivity(st.attempted, st.correct)
  }, [st.status])

  // ── Submit ────────────────────────────────────────────
  function submit(inputVal) {
    const cur = stRef.current
    const val = inputVal ?? cur.input
    if (cur.locked || !val || !question) return

    const isCorrect = parseInt(val) === question.answer

    if (isCorrect) {
      if (topic.srs && srsItem) recordSRS(topicId, srsItem, true)
      dispatch({ type: 'CORRECT' })
      setFlash('correct')
      setTimeout(() => nextQRef.current(), mode === 'practice' ? 180 : 620)
    } else {
      if (topic.srs && srsItem) recordSRS(topicId, srsItem, false)
      dispatch({ type: 'WRONG', reveal: mode === 'learn' })
      setFlash('wrong')
      if (mode === 'practice') setTimeout(() => nextQRef.current(), 180)
    }
  }
  submitRef.current = submit

  // ── Desktop: space / enter on reveal ──────────────────
  useEffect(() => {
    if (!isDesktop) return
    const h = (e) => {
      if (stRef.current.status === 'reveal' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault(); nextQRef.current()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isDesktop])

  // ── Desktop input ─────────────────────────────────────
  function handleDesktopChange(e) {
    const cur = stRef.current
    if (cur.locked) { e.target.value = cur.input; return }
    const clean  = e.target.value.replace(/\D/g, '')
    const ansLen = question ? String(Math.abs(question.answer)).length : 4
    const val    = clean.slice(0, Math.min(ansLen + 1, 5))
    dispatch({ type: 'INPUT', val })
    if (question && val.length === ansLen) setTimeout(() => submitRef.current(val), 80)
  }

  // ── Numpad ────────────────────────────────────────────
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
      if (question && next.length === question.maxDigits) setTimeout(() => submitRef.current(next), 80)
    }
  }

  // ── Helpers ───────────────────────────────────────────
  const fmt    = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const qColor = flash === 'correct' ? '#3de88a' : flash === 'wrong' ? '#ff4d4d' : '#f0f0f0'
  const aBorder = `2px solid ${flash === 'wrong' ? '#ff4d4d' : st.input ? '#e0ff5a' : '#333'}`

  // ── Result screen ─────────────────────────────────────
  if (st.status === 'done') {
    const pct = st.attempted > 0 ? Math.round(st.correct / st.attempted * 100) : 0
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center gap-6">
        <p className="font-mono text-[10px] text-[#555] tracking-[0.25em] uppercase">
          session complete
        </p>
        <div className="font-mono font-light leading-none tracking-tight text-[#f0f0f0]"
             style={{ fontSize: 80 }}>
          {pct}%
        </div>
        <p className="font-mono text-[#777] text-sm">{topic.name}</p>
        <div className="flex gap-8 font-mono text-sm text-[#555]">
          <span><span className="text-[#f0f0f0]">{st.correct}</span> correct</span>
          <span><span className="text-[#f0f0f0]">{st.attempted}</span> total</span>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onExit}
            className="px-6 py-3 bg-[#242424] border border-[#333] rounded-[12px]
                       text-[#aaa] text-sm font-semibold hover:bg-[#2e2e2e] transition-colors"
          >
            Home
          </button>
          <button
            onClick={onAgain}
            className="px-8 py-3 bg-[#e0ff5a] text-[#111800] rounded-[12px]
                       text-sm font-bold hover:brightness-105 transition-all"
          >
            Again →
          </button>
        </div>
      </div>
    )
  }

  // ── Practice screen ───────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#1a1a1a] flex flex-col text-[#f0f0f0]">

      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-5 border-b border-[#2a2a2a]"
        style={{ height: 52 }}
      >
        <span className="font-mono text-[#e0ff5a] text-[11px] tracking-[0.1em] uppercase">
          {topic.name}
        </span>
        <div className="flex items-center gap-4">
          {mode === 'practice' && timerSecs != null && (
            <span className={`font-mono text-sm ${timerSecs <= 30 ? 'text-[#ff4d4d]' : 'text-[#666]'}`}>
              {fmt(timerSecs)}
            </span>
          )}
          {mode === 'learn' && (
            <span className="font-mono text-xs text-[#666]">
              Q {Math.min(st.qNum + 1, 20)} / 20
            </span>
          )}
          <button
            onClick={() => { if (st.attempted === 0 || confirm('Exit? Progress is saved.')) onExit() }}
            className="text-[#444] hover:text-[#aaa] transition-colors font-mono text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Progress bar (learn mode) */}
      {mode === 'learn' && (
        <div className="flex-shrink-0 h-px bg-[#2a2a2a]">
          <div
            className="h-full bg-[#e0ff5a] transition-all duration-300"
            style={{ width: `${(st.qNum / 20) * 100}%` }}
          />
        </div>
      )}

      {/* Arena */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <div
          className="w-full flex flex-col items-center gap-5 px-8"
          style={{ maxWidth: 540 }}
        >

          {/* Score row */}
          <div className="flex gap-12 pb-5 border-b border-[#2a2a2a] w-full justify-center">
            {[
              { val: st.correct, label: 'correct' },
              { val: st.streak,  label: 'streak'  },
            ].map(s => (
              <div key={s.label} className="flex flex-col-reverse items-center gap-1">
                <span className="font-mono text-[11px] text-[#555] tracking-[0.1em]">
                  {s.label}
                </span>
                <span
                  className="font-mono font-light leading-none tracking-tight text-[#f0f0f0]"
                  style={{ fontSize: 48 }}
                >
                  {s.val}
                </span>
              </div>
            ))}
          </div>

          {/* Type label */}
          <span
            className="font-mono text-[10px] text-[#555] tracking-[0.2em] uppercase"
            style={{ minHeight: 14 }}
          >
            {question?.typeLabel ?? '\u00a0'}
          </span>

          {/* Question */}
          <div
            className="font-mono text-center leading-none tracking-tight transition-colors duration-100 select-none"
            style={{ fontSize: 88, color: qColor }}
          >
            {question?.display ?? '—'}
          </div>

          {/* Answer input */}
          <div style={{ width: '100%', maxWidth: 300 }}>
            {isDesktop ? (
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={st.input}
                onChange={handleDesktopChange}
                className="w-full bg-transparent outline-none font-mono font-light
                           text-[#e0ff5a] text-center pb-2 caret-[#e0ff5a] transition-colors"
                style={{ fontSize: 64, border: 'none', borderBottom: aBorder }}
              />
            ) : (
              <div
                className="font-mono font-light text-center pb-2 transition-colors select-none"
                style={{
                  fontSize: 44,
                  color: flash === 'wrong' ? '#ff4d4d' : '#e0ff5a',
                  borderBottom: aBorder,
                }}
              >
                {st.input || '_'}
              </div>
            )}

            {/* Learn-mode feedback line */}
            {mode === 'learn' && (
              <div
                className="font-mono text-[11px] text-center mt-2 transition-colors"
                style={{
                  minHeight: 16,
                  color: flash === 'correct' ? '#3de88a'
                       : flash === 'wrong'   ? '#ff4d4d'
                       : 'transparent',
                }}
              >
                {flash === 'correct' ? '✓ correct' : flash === 'wrong' ? '✗ wrong' : '.'}
              </div>
            )}
          </div>

          {/* Desktop hint */}
          {isDesktop && (
            <span className="font-mono text-[11px] text-[#444] tracking-[0.08em]">
              type · auto-submits · space to continue
            </span>
          )}

        </div>
      </div>

      {/* Numpad (mobile) */}
      {!isDesktop && <NumPad onKey={handleNumpadKey} />}

      {/* Wrong-answer reveal overlay */}
      {st.status === 'reveal' && (
        <div
          className="absolute inset-x-0 bottom-0 z-20 bg-[#1a1a1a]
                     flex flex-col items-center justify-center gap-4 cursor-pointer"
          style={{ top: 52 }}
          onClick={() => nextQRef.current()}
        >
          <span className="font-mono text-[11px] text-[#ff4d4d] tracking-[0.2em] uppercase">
            ✗ incorrect
          </span>
          <span className="font-mono text-2xl text-[#666]">{question?.display}</span>
          <span
            className="font-mono font-light text-[#e0ff5a] leading-none tracking-tight"
            style={{ fontSize: 80 }}
          >
            {question?.answer}
          </span>
          <span className="font-mono text-[11px] text-[#444] mt-4">
            {isDesktop ? 'press space or enter to continue' : 'tap anywhere to continue'}
          </span>
        </div>
      )}

    </div>
  )
}
