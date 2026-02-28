import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { SECTIONS, SECTION_TOPICS } from '../data/topics'
import { getDueCount, getMasteryPercent, hasAnyAttempts } from '../engine/srs'
import { getActivity } from '../engine/storage'

/* ── Helpers ─────────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 3)
}

function last7Days() {
  const out = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

/* ── M3 FilterChip ───────────────────────────────────── */
function FilterChip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="md-state"
      style={{
        padding: '6px 16px',
        borderRadius: 8,
        border: `1px solid ${selected ? 'transparent' : 'var(--md-sys-color-outline)'}`,
        background: selected ? 'var(--md-sys-color-secondary-container)' : 'none',
        color: selected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
        cursor: 'pointer',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: '0.1px',
        transition: 'all 150ms',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

/* ── Weekly bar chart ────────────────────────────────── */
function WeeklyChart({ activity }) {
  const days = last7Days()
  const maxAttempted = Math.max(1, ...days.map(d => activity[d]?.attempted ?? 0))

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72, width: '100%' }}>
      {days.map((day, i) => {
        const data = activity[day] || { attempted: 0, correct: 0 }
        const heightPct = data.attempted / maxAttempted
        const accuracy = data.attempted > 0 ? data.correct / data.attempted : 0

        const barColor = data.attempted === 0
          ? 'var(--md-sys-color-surface-variant)'
          : accuracy >= 0.8
          ? 'var(--md-custom-color-correct)'
          : accuracy >= 0.5
          ? 'var(--md-sys-color-primary)'
          : 'var(--md-sys-color-error)'

        return (
          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: '100%', height: 56, display: 'flex', alignItems: 'flex-end' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, heightPct * 100)}%` }}
                transition={{ ease: [0.2, 0, 0, 1], duration: 0.5, delay: i * 0.04 }}
                style={{ width: '100%', borderRadius: '4px 4px 2px 2px', background: barColor }}
              />
            </div>
            <span className="md-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              {formatDate(day)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Topic mastery card ──────────────────────────────── */
function TopicMasteryCard({ topic, delay }) {
  const started = topic.srs ? hasAnyAttempts(topic.id, topic.pool) : false
  const mastery = topic.srs && started ? getMasteryPercent(topic.id, topic.pool) : null
  const due = topic.srs ? getDueCount(topic.id, topic.pool) : 0

  const masteryColor = mastery == null ? 'var(--md-sys-color-on-surface-variant)'
    : mastery >= 80 ? 'var(--md-custom-color-correct)'
    : mastery >= 40 ? 'var(--md-sys-color-primary)'
    : 'var(--md-sys-color-on-surface-variant)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.2, 0, 0, 1], duration: 0.3, delay: delay / 1000 }}
      style={{
        background: 'var(--md-sys-color-surface-container)',
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Mastery ring / bar */}
      <div style={{ flexShrink: 0, width: 40, height: 40, position: 'relative' }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          {/* Track */}
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--md-sys-color-surface-variant)" strokeWidth="4"/>
          {/* Progress */}
          {mastery != null && (
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke={masteryColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - mastery / 100)}`}
              transform="rotate(-90 20 20)"
              style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.2,0,0,1)' }}
            />
          )}
        </svg>
        {mastery != null && (
          <span className="dm-mono" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 400, color: masteryColor }}>
            {mastery}%
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="md-title-small" style={{ color: 'var(--md-sys-color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {topic.name}
        </div>
        <div className="dm-mono md-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: 2 }}>
          {topic.desc}
        </div>
      </div>

      {/* Due badge — primary color, NOT red */}
      {due > 0 && (
        <span className="md-label-medium" style={{ background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', borderRadius: 8, padding: '2px 8px', flexShrink: 0 }}>
          {due}
        </span>
      )}
      {mastery == null && !due && (
        <span className="md-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', flexShrink: 0 }}>Not started</span>
      )}
    </motion.div>
  )
}

/* ── Stats screen ────────────────────────────────────── */
export default function StatsView() {
  const [filterSection, setFilterSection] = useState(null)

  const activity = useMemo(() => getActivity(), [])
  const days = last7Days()

  const weekTotals = useMemo(() => {
    let attempted = 0, correct = 0, sessions = 0
    for (const day of days) {
      const d = activity[day]
      if (d) { attempted += d.attempted; correct += d.correct; sessions += d.sessions }
    }
    return { attempted, correct, sessions, accuracy: attempted > 0 ? Math.round(correct / attempted * 100) : 0 }
  }, [activity]) // eslint-disable-line

  const visibleSections = filterSection
    ? SECTIONS.filter(s => s.key === filterSection)
    : SECTIONS

  let topicDelay = 300

  return (
    <div style={{ minHeight: '100%', background: 'var(--md-sys-color-background)', paddingBottom: 24 }}>

      {/* Top App Bar */}
      <header style={{ height: 64, padding: '0 16px', display: 'flex', alignItems: 'center', background: 'var(--md-sys-color-surface)', borderBottom: '1px solid var(--md-sys-color-outline-variant)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 className="md-headline-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>Stats</h1>
      </header>

      <div style={{ padding: '16px 16px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Last 7 days summary */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.2, 0, 0, 1], duration: 0.35 }}
        >
          <h2 className="md-title-medium" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: 12 }}>Last 7 days</h2>

          {/* Summary chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: weekTotals.attempted.toString(), sub: 'questions' },
              { label: `${weekTotals.accuracy}%`, sub: 'accuracy' },
              { label: weekTotals.sessions.toString(), sub: 'sessions' },
            ].map(item => (
              <div key={item.sub} style={{ background: 'var(--md-sys-color-surface-container)', borderRadius: 12, padding: '10px 16px', flex: 1, minWidth: 80 }}>
                <div className="dm-mono" style={{ fontSize: 24, fontWeight: 300, color: 'var(--md-sys-color-on-surface)', lineHeight: 1 }}>{item.label}</div>
                <div className="md-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.sub}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ background: 'var(--md-sys-color-surface-container)', borderRadius: 16, padding: 16 }}>
            <WeeklyChart activity={activity} />
          </div>
        </motion.section>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: [0.2, 0, 0, 1], duration: 0.35, delay: 0.1 }}
        >
          <div className="chips-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 4, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <FilterChip label="All" selected={filterSection == null} onClick={() => setFilterSection(null)} />
            {SECTIONS.map(sec => (
              <FilterChip key={sec.key} label={sec.label} selected={filterSection === sec.key} onClick={() => setFilterSection(s => s === sec.key ? null : sec.key)} />
            ))}
          </div>
        </motion.div>

        {/* Per-topic mastery cards */}
        {visibleSections.map(sec => {
          const topics = SECTION_TOPICS[sec.key] || []
          return (
            <section key={sec.key}>
              <h2 className="md-title-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 8 }}>
                {sec.label}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topics.map((topic, i) => {
                  const d = topicDelay + i * 50
                  topicDelay += 50
                  return <TopicMasteryCard key={topic.id} topic={topic} delay={d} />
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
