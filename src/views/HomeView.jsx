import { useState, useEffect, useMemo } from 'react'
import { SECTIONS, SECTION_TOPICS } from '../data/topics'
import { getDueCount } from '../engine/srs'
import ModeSheet from '../components/ModeSheet'

/* ── Section accent colours ─────────────────────────── */
const SECTION_META = {
  addition:       { color: '#5b8de8' },
  subtraction:    { color: '#9875d4' },
  multiplication: { color: '#d4924a' },
  memory:         { color: '#45b88e' },
}

/* ── Theme toggle ────────────────────────────────────── */
function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('mf-theme') || 'dark'
  )
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('mf-theme', theme)
  }, [theme])
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }
}

/* ── Topic card ─────────────────────────────────────── */
function TopicCard({ topic, dueCount, onClick, delay }) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-[13px] border px-4 py-3.5
                 transition-colors duration-150 active:scale-[0.97] anim-fade-up"
      style={{
        background:   'var(--surface)',
        borderColor:  'var(--border)',
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hi)'
        e.currentTarget.style.background  = 'var(--surface2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background  = 'var(--surface)'
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-[13px] leading-snug"
              style={{ color: 'var(--text)' }}>
          {topic.name}
        </span>
        {dueCount > 0 && (
          <span className="flex-shrink-0 font-mono text-[10px] font-semibold
                           px-1.5 py-0.5 rounded-md mt-px"
                style={{ background: '#d4f53c18', color: '#d4f53c' }}>
            {dueCount}
          </span>
        )}
      </div>
      <p className="mt-1.5 font-mono text-[11px] leading-relaxed"
         style={{ color: 'var(--muted2)' }}>
        {topic.desc}
      </p>
    </button>
  )
}

/* ── Home view ──────────────────────────────────────── */
export default function HomeView({ onStartSession }) {
  const { theme, toggle } = useTheme()
  const [selected, setSelected] = useState(null)
  const [openKey,  setOpenKey]  = useState(null)

  /* Compute per-topic due counts once on mount */
  const dueCounts = useMemo(() => {
    const out = {}
    for (const sec of SECTIONS) {
      for (const t of (SECTION_TOPICS[sec.key] || [])) {
        out[t.id] = t.srs ? getDueCount(t.id, t.pool) : 0
      }
    }
    return out
  }, [])

  /* Aggregate due count per section */
  const sectionDue = useMemo(() => {
    const out = {}
    for (const sec of SECTIONS) {
      out[sec.key] = (SECTION_TOPICS[sec.key] || [])
        .reduce((s, t) => s + (dueCounts[t.id] || 0), 0)
    }
    return out
  }, [dueCounts])

  /* Default: open the section with the most due items, else first */
  useEffect(() => {
    let best = SECTIONS[0].key, max = -1
    for (const sec of SECTIONS) {
      if (sectionDue[sec.key] > max) { max = sectionDue[sec.key]; best = sec.key }
    }
    setOpenKey(best)
  }, []) // eslint-disable-line

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 pt-10 pb-8 max-w-lg mx-auto">
        <div className="anim-fade-up">
          <div className="flex items-end gap-2.5">
            <h1 className="font-bold text-[28px] tracking-tight leading-none"
                style={{ color: 'var(--text)' }}>
              MathFlow
            </h1>
            <span className="font-mono text-[8px] tracking-[0.18em] uppercase mb-0.5
                             px-1.5 py-0.5 rounded border"
                  style={{ color: '#d4f53c80', borderColor: '#d4f53c1a', background: 'transparent' }}>
              beta
            </span>
          </div>
          <p className="font-mono text-[11px] tracking-wide mt-1"
             style={{ color: 'var(--muted2)' }}>
            master arithmetic · one problem at a time
          </p>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full
                     transition-all duration-150 active:scale-[0.90] anim-fade-up"
          style={{ background: 'var(--surface2)', color: 'var(--muted)' }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            /* Sun — click to go light */
            <svg viewBox="0 0 18 18" className="w-[17px] h-[17px]" fill="none">
              <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M12.9 5.1l-1.4 1.4M4.1 13.9l-1.4-1.4"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          ) : (
            /* Moon — click to go dark */
            <svg viewBox="0 0 18 18" className="w-[16px] h-[16px]" fill="none">
              <path d="M15 10.8A7 7 0 017.2 3a7 7 0 100 14A7.001 7.001 0 0015 10.8z"
                    stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </header>

      {/* ── Category accordion ── */}
      <main className="px-6 pb-24 max-w-lg mx-auto space-y-2">
        {SECTIONS.map((sec, si) => {
          const meta   = SECTION_META[sec.key]
          const topics = SECTION_TOPICS[sec.key] || []
          const due    = sectionDue[sec.key]
          const isOpen = openKey === sec.key

          return (
            <div key={sec.key} className="anim-fade-up"
                 style={{ animationDelay: `${si * 55}ms` }}>

              {/* Category button */}
              <button
                onClick={() => setOpenKey(k => k === sec.key ? null : sec.key)}
                className="w-full flex items-center justify-between rounded-[16px] border
                           px-5 py-4 transition-all duration-200 text-left active:scale-[0.985]"
                style={{
                  background:  'var(--surface)',
                  borderColor: isOpen ? meta.color + '55' : 'var(--border)',
                  boxShadow:   isOpen ? `0 0 0 1px ${meta.color}18` : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-[3px] flex-shrink-0 transition-opacity duration-200"
                        style={{ background: meta.color, opacity: isOpen ? 1 : 0.45 }} />
                  <span className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>
                    {sec.label}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {due > 0 && (
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#d4f53c18', color: '#d4f53c' }}>
                      {due}
                    </span>
                  )}
                  <svg viewBox="0 0 10 6" className="w-2.5 h-2.5 flex-shrink-0 transition-transform duration-300"
                       style={{ color: meta.color + '80',
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                       fill="none">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {/* Expandable topic grid */}
              <div style={{
                maxHeight:  isOpen ? `${topics.length * 140}px` : '0',
                overflow:   'hidden',
                transition: 'max-height 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {topics.map((topic, ti) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      dueCount={dueCounts[topic.id]}
                      onClick={() => setSelected(topic)}
                      delay={isOpen ? ti * 30 : 0}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </main>

      {/* ── Mode sheet ── */}
      {selected && (
        <ModeSheet
          topic={selected}
          sectionColor={SECTION_META[selected.section]?.color ?? '#d4f53c'}
          onClose={() => setSelected(null)}
          onStart={(opts) => {
            setSelected(null)
            onStartSession({ topicId: selected.id, topic: selected, ...opts })
          }}
        />
      )}
    </div>
  )
}
