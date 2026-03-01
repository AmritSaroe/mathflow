import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SECTIONS, SECTION_TOPICS } from '../data/topics'
import { getDueCount } from '../engine/srs'

/* ── Section icons ─────────────────────────────────── */
const SECTION_ICONS = {
  addition:       ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  subtraction:    ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h12" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  multiplication: ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  memory:         ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.8l-4.9 2.4.9-5.5L2 7.8l5.6-.8z"
            stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
}

/* ── M3 Badge ──────────────────────────────────────── */
function Badge({ count }) {
  if (!count) return null
  return (
    <span
      className="md-label-medium"
      style={{
        background: 'var(--md-sys-color-primary)',
        color: 'var(--md-sys-color-on-primary)',
        borderRadius: 8,
        padding: '2px 8px',
        minWidth: 24,
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      {count}
    </span>
  )
}

/* ── M3 Filled Card — Topic card ───────────────────── */
function TopicCard({ topic, dueCount, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="md-state"
      style={{
        background: 'var(--md-sys-color-surface-variant)',
        border: 'none',
        borderRadius: 12,
        padding: 16,
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        color: 'var(--md-sys-color-on-surface)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span className="md-title-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>
          {topic.name}
        </span>
        <Badge count={dueCount} />
      </div>
      <span
        className="dm-mono md-body-small"
        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
      >
        {topic.desc}
      </span>
    </button>
  )
}

/* ── M3 Sun / Moon icons ───────────────────────────── */
function SunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.05 5.05l1.41 1.41M15.54 15.54l1.41 1.41M15.54 6.46l-1.41 1.41M6.46 15.54l-1.41 1.41"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M19 13.5A8 8 0 018.5 3a8 8 0 100 16A8.002 8.002 0 0019 13.5z"
            stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Home view ─────────────────────────────────────── */
export default function HomeView({ theme, onToggleTheme, onSelectTopic }) {
  const [openKey, setOpenKey] = useState(null)

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

  /* Default: open section with most due items */
  useEffect(() => {
    let best = SECTIONS[0].key, max = -1
    for (const sec of SECTIONS) {
      if (sectionDue[sec.key] > max) { max = sectionDue[sec.key]; best = sec.key }
    }
    setOpenKey(best)
  }, []) // eslint-disable-line

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--md-sys-color-background)',
      }}
    >
      {/* ── M3 Top App Bar (small) ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          padding: '0 4px 0 16px',
          background: 'var(--md-sys-color-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo.svg"
            width="32"
            height="32"
            alt="MathFlow logo"
            style={{ flexShrink: 0, borderRadius: 7 }}
          />

          <h1 className="md-headline-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            MathFlow
          </h1>
        </div>

        {/* Theme toggle — M3 icon button */}
        <button
          onClick={onToggleTheme}
          className="md-state"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 48, height: 48,
            borderRadius: 24,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* ── M3 Accordion list ── */}
      <main style={{ padding: '8px 16px 24px', maxWidth: 640, margin: '0 auto' }}>
        {SECTIONS.map(sec => {
          const SectionIcon = SECTION_ICONS[sec.key]
          const topics = SECTION_TOPICS[sec.key] || []
          const due = sectionDue[sec.key]
          const isOpen = openKey === sec.key
          const iconColor = isOpen
            ? 'var(--md-sys-color-primary)'
            : 'var(--md-sys-color-on-surface-variant)'

          return (
            <div key={sec.key} style={{ marginBottom: 4 }}>
              {/* Section header — M3 List Item */}
              <button
                onClick={() => setOpenKey(k => k === sec.key ? null : sec.key)}
                className="md-state"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 16px',
                  background: isOpen
                    ? 'var(--md-sys-color-surface-container-low)'
                    : 'var(--md-sys-color-surface)',
                  border: 'none',
                  borderRadius: isOpen ? '12px 12px 0 0' : 12,
                  cursor: 'pointer',
                  color: 'var(--md-sys-color-on-surface)',
                  transition: 'background 200ms, border-radius 200ms',
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>
                  <SectionIcon color={iconColor} />
                </span>

                <span
                  className="md-title-medium"
                  style={{ flex: 1, color: 'var(--md-sys-color-on-surface)' }}
                >
                  {sec.label}
                </span>

                <Badge count={due} />

                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ ease: [0.2, 0, 0, 1], duration: 0.25 }}
                  style={{ flexShrink: 0, color: 'var(--md-sys-color-on-surface-variant)', display: 'flex' }}
                >
                  <ChevronDown />
                </motion.span>
              </button>

              {/* Expandable topic grid — animated with Framer Motion */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ ease: [0.2, 0, 0, 1], duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        padding: '8px 0 4px',
                        background: 'var(--md-sys-color-surface)',
                        borderRadius: '0 0 12px 12px',
                        paddingInline: 8,
                        paddingBottom: 8,
                      }}
                    >
                      {topics.map(topic => (
                        <TopicCard
                          key={topic.id}
                          topic={topic}
                          dueCount={dueCounts[topic.id]}
                          onSelect={() => onSelectTopic(topic)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </main>
    </div>
  )
}
