import { useState } from 'react'

const MODES = [
  { key: 'learn',    icon: '📖', label: 'Learn',    sub: '20 questions · feedback' },
  { key: 'practice', icon: '⚡', label: 'Practice', sub: 'timed · minimal feedback' },
]

export default function ModeSheet({ topic, onStart, onClose }) {
  const [mode, setMode]           = useState(null)
  const [timerMins, setTimerMins] = useState(null)
  const ready = mode === 'learn' || (mode === 'practice' && timerMins)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:w-80 bg-[#1e1e1e] border border-[#333]
                      rounded-t-[20px] sm:rounded-[16px] p-6 pb-8 sm:pb-6">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555] hover:text-[#aaa] transition-colors font-mono text-sm"
        >
          ✕
        </button>

        {/* Topic info */}
        <p className="font-sans font-semibold text-[#f0f0f0] text-base mb-0.5">{topic.name}</p>
        <p className="font-mono text-[#666] text-[10px] mb-5">{topic.desc}</p>

        {/* Mode selection */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setTimerMins(null) }}
              className={`p-3 rounded-[10px] border text-left transition-all ${
                mode === m.key
                  ? 'bg-[#2a2a2a] border-[#e0ff5a] text-[#f0f0f0]'
                  : 'bg-[#161616] border-[#2a2a2a] text-[#666] hover:text-[#ccc] hover:border-[#444]'
              }`}
            >
              <div className="text-sm mb-1">{m.icon}</div>
              <div className="font-sans font-semibold text-[13px]">{m.label}</div>
              <div className="font-mono text-[10px] text-[#555] mt-0.5">{m.sub}</div>
            </button>
          ))}
        </div>

        {/* Timer options */}
        {mode === 'practice' && (
          <div className="flex gap-2 mb-3">
            {[2, 5, 10].map(m => (
              <button
                key={m}
                onClick={() => setTimerMins(m)}
                className={`flex-1 py-2 rounded-[8px] border font-mono text-[13px] transition-all ${
                  timerMins === m
                    ? 'bg-[#2a2a2a] border-[#e0ff5a] text-[#f0f0f0]'
                    : 'bg-[#161616] border-[#2a2a2a] text-[#666] hover:text-[#ccc]'
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        )}

        {/* Start */}
        <button
          disabled={!ready}
          onClick={() => ready && onStart({ mode, timerMins })}
          className={`w-full py-[14px] rounded-[12px] font-sans font-bold text-[13px] transition-all mt-1 ${
            ready
              ? 'bg-[#e0ff5a] text-[#111800] hover:brightness-105 cursor-pointer'
              : 'bg-[#242424] text-[#444] cursor-not-allowed'
          }`}
        >
          Start →
        </button>
      </div>
    </div>
  )
}
