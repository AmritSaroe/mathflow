import { useState } from 'react'
import { SECTIONS, SECTION_TOPICS } from '../data/topics'
import ModeSheet from '../components/ModeSheet'

function TopicCard({ topic, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#242424] border border-[#333] rounded-[12px] p-4 text-left w-full
                 hover:border-[#e0ff5a] hover:bg-[#2e2e2e] active:scale-[0.97]
                 transition-all duration-100 cursor-pointer"
    >
      <div className="font-sans font-semibold text-[#f0f0f0] text-sm leading-snug">
        {topic.name}
      </div>
      <div className="font-mono text-[#666] text-[10px] mt-1.5 leading-relaxed">
        {topic.desc}
      </div>
    </button>
  )
}

export default function HomeView({ onStartSession }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f0f0f0]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-[#2a2a2a] px-6 py-4">
        <h1 className="font-mono text-[#e0ff5a] text-[13px] tracking-[0.15em] uppercase font-normal">
          MathFlow
        </h1>
        <p className="font-mono text-[#555] text-[11px] mt-0.5">
          pick a topic to practise
        </p>
      </header>

      {/* ── Topic grid ── */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {SECTIONS.map(sec => (
          <section key={sec.key}>
            <h2 className="font-mono text-[#555] text-[10px] tracking-[0.25em] uppercase mb-4">
              {sec.label}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(SECTION_TOPICS[sec.key] || []).map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onClick={() => setSelected(topic)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ── Mode sheet ── */}
      {selected && (
        <ModeSheet
          topic={selected}
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
