import { useState } from 'react'

const MODES = [
  {
    key: 'learn',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" className="w-[18px] h-[18px]">
        <path d="M9 2L2 6l7 4 7-4-7-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M2 11l7 4 7-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label:  'Learn',
    sub:    '20 questions · instant feedback',
  },
  {
    key: 'practice',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" className="w-[18px] h-[18px]">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M9 5v4l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    label:  'Practice',
    sub:    'timed sprint · speed mode',
  },
]

export default function ModeSheet({ topic, sectionColor, onStart, onClose }) {
  const [mode, setMode]           = useState(null)
  const [timerMins, setTimerMins] = useState(null)
  const ready  = mode === 'learn' || (mode === 'practice' && timerMins)
  const accent = sectionColor ?? '#d4f53c'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md anim-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:w-[360px] rounded-t-[24px] sm:rounded-[22px]
                   px-6 pt-5 pb-8 sm:pb-6 border anim-slide-up sm:anim-scale-in"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Handle pill (mobile only) */}
        <div className="mx-auto w-10 h-1 rounded-full bg-[#242424] mb-5 sm:hidden" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center
                     rounded-full text-[#383838] hover:text-[#777] hover:bg-[#181818]
                     transition-all duration-150"
        >
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Topic name + description */}
        <div className="mb-5 pr-8">
          <p className="font-semibold text-[15px] text-[#f0f0ee]">{topic.name}</p>
          <p className="font-mono text-[11px] text-[#303030] mt-0.5">{topic.desc}</p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {MODES.map(m => {
            const active = mode === m.key
            return (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); setTimerMins(null) }}
                className="p-4 rounded-[14px] border text-left transition-all duration-150
                           active:scale-[0.97]"
                style={
                  active
                    ? { background: 'var(--surface2)', borderColor: accent + '55',
                        boxShadow: `0 0 0 1px ${accent}18, inset 0 0 0 1px ${accent}10` }
                    : { background: 'var(--bg)', borderColor: 'var(--border)' }
                }
              >
                <div
                  className="mb-2.5 transition-colors duration-150"
                  style={{ color: active ? accent : '#2e2e2e' }}
                >
                  {m.icon}
                </div>
                <div className="font-semibold text-[13px] text-[#e0e0dd]">{m.label}</div>
                <div className="font-mono text-[10px] text-[#2c2c2c] mt-0.5">{m.sub}</div>
              </button>
            )
          })}
        </div>

        {/* Timer options (practice mode) */}
        {mode === 'practice' && (
          <div className="flex gap-2 mb-3 anim-fade-up">
            {[2, 5, 10].map(m => {
              const sel = timerMins === m
              return (
                <button
                  key={m}
                  onClick={() => setTimerMins(m)}
                  className="flex-1 py-2.5 rounded-[10px] border font-mono text-[13px]
                             transition-all duration-150 active:scale-[0.96]"
                  style={
                    sel
                      ? { background: 'var(--surface2)', borderColor: accent + '55', color: accent }
                      : { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--muted2)' }
                  }
                >
                  {m} min
                </button>
              )
            })}
          </div>
        )}

        {/* Start button */}
        <button
          disabled={!ready}
          onClick={() => ready && onStart({ mode, timerMins })}
          className="w-full py-[15px] rounded-[14px] font-semibold text-[14px]
                     transition-all duration-150 mt-1 active:scale-[0.97]"
          style={
            ready
              ? { background: accent, color: '#0a1400', boxShadow: `0 4px 20px ${accent}30` }
              : { background: '#111', color: '#282828', cursor: 'not-allowed' }
          }
        >
          {ready ? 'Start →' : 'Select a mode'}
        </button>
      </div>
    </div>
  )
}
