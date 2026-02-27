import { useState } from 'react'
import { SECTIONS, SECTION_TOPICS } from '../data/topics'
import ModeSheet from '../components/ModeSheet'

/* ── Section accent colours ─────────────────────────── */
const SECTION_META = {
  addition:       { color: '#5b8de8', dim: '#5b8de820' },
  subtraction:    { color: '#9875d4', dim: '#9875d420' },
  multiplication: { color: '#d4924a', dim: '#d4924a20' },
  memory:         { color: '#45b88e', dim: '#45b88e20' },
}

/* ── Topic card ─────────────────────────────────────── */
function TopicCard({ topic, onClick, delay }) {
  const meta = SECTION_META[topic.section] ?? SECTION_META.addition

  return (
    <button
      onClick={onClick}
      className="group relative bg-[#101010] border border-[#1c1c1c] rounded-[16px]
                 p-[18px] text-left w-full cursor-pointer select-none
                 transition-all duration-200 active:scale-[0.96]
                 anim-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = meta.color + '50'
        el.style.boxShadow   = `0 0 0 1px ${meta.color}22, 0 6px 24px ${meta.color}10`
        el.style.transform   = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = ''
        el.style.boxShadow   = ''
        el.style.transform   = ''
      }}
    >
      {/* Accent dot */}
      <span
        className="absolute top-[14px] right-[14px] w-[6px] h-[6px] rounded-full
                   opacity-40 group-hover:opacity-80 transition-opacity duration-200"
        style={{ background: meta.color }}
      />

      <div className="font-semibold text-[#e8e8e5] text-[13.5px] leading-snug pr-4">
        {topic.name}
      </div>
      <div className="mt-1.5 font-mono text-[11px] leading-relaxed text-[#323232]">
        {topic.desc}
      </div>
    </button>
  )
}

/* ── Section divider ────────────────────────────────── */
function SectionLabel({ label, color, delay }) {
  return (
    <div
      className="flex items-center gap-2.5 mb-[14px] anim-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className="inline-block w-[7px] h-[7px] rounded-[2px] flex-shrink-0"
        style={{ background: color }}
      />
      <span
        className="font-mono text-[10.5px] tracking-[0.22em] uppercase"
        style={{ color: color + 'aa' }}
      >
        {label}
      </span>
      <span className="flex-1 h-px bg-[#141414]" />
    </div>
  )
}

/* ── Home view ──────────────────────────────────────── */
export default function HomeView({ onStartSession }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* ── Hero header ── */}
      <header className="px-6 pt-12 pb-10 max-w-4xl mx-auto">
        <div className="anim-fade-up">
          <div className="flex items-end gap-3 mb-2">
            <h1 className="font-bold text-[30px] text-[#f0f0ee] tracking-tight leading-none">
              MathFlow
            </h1>
            <span
              className="font-mono text-[9px] tracking-[0.2em] uppercase mb-0.5
                         px-1.5 py-0.5 rounded border"
              style={{ color: '#d4f53c', borderColor: '#d4f53c30', background: '#d4f53c0a' }}
            >
              beta
            </span>
          </div>
          <p className="font-mono text-[11px] text-[#282828] tracking-wide mt-1">
            master arithmetic · one problem at a time
          </p>
        </div>
      </header>

      {/* ── Topic grid ── */}
      <main className="px-6 pb-20 max-w-4xl mx-auto space-y-10">
        {SECTIONS.map((sec, si) => {
          const meta   = SECTION_META[sec.key]
          const topics = SECTION_TOPICS[sec.key] || []

          return (
            <section key={sec.key}>
              <SectionLabel
                label={sec.label}
                color={meta?.color}
                delay={si * 55}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {topics.map((topic, ti) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onClick={() => setSelected(topic)}
                    delay={si * 50 + ti * 38}
                  />
                ))}
              </div>
            </section>
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
