import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import NavBar from './components/NavBar'
import UpdatePrompt from './components/UpdatePrompt'
import HomeView from './views/HomeView'
import StatsView from './views/StatsView'
import PracticeView from './views/PracticeView'
import ResultView from './views/ResultView'
import LearnView from './views/LearnView'
import TopicDetailSheet from './views/TopicDetailSheet'
import { initTheme, applyTheme } from './theme/material'
import { TOPICS } from './data/topics'

/* ── M3 screen transition variants ───────────────────── */
const SCREEN = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { ease: [0.2, 0, 0, 1], duration: 0.3 } },
  exit:    { opacity: 0, y: 16, transition: { ease: [0.3, 0, 1, 1], duration: 0.2 } },
}

export default function App() {
  const [tab, setTab]             = useState('home')
  const [theme, setTheme]         = useState(() => initTheme())
  const [selectedTopic, setTopic] = useState(null)
  const [session, setSession]     = useState(null)
  const [sessionId, setSessionId] = useState(0)
  const [result, setResult]       = useState(null)
  const [lastTopicId, setLastTopicId] = useState(() => localStorage.getItem('mf-lastTopicId'))

  /* ── Theme toggle ──────────────────────────────────── */
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next === 'dark')
    localStorage.setItem('mf-theme', next)
  }

  /* ── Session lifecycle ─────────────────────────────── */
  function startSession(config) {
    setSession(config)
    setSessionId(id => id + 1)
    setTopic(null)
    localStorage.setItem('mf-lastTopicId', config.topicId)
    setLastTopicId(config.topicId)
  }

  function handleSessionDone(stats) {
    setResult({ ...stats, session })
    setSession(null)
  }

  function handleAgain() {
    if (result?.session) {
      setSession(result.session)
      setSessionId(id => id + 1)
      setResult(null)
    }
  }

  function handleHome() {
    setSession(null)
    setResult(null)
    setTab('home')
  }

  /* ── FAB: continue last topic ──────────────────────── */
  function openLastTopic() {
    const topic = lastTopicId && TOPICS[lastTopicId]
    if (topic) setTopic({ id: lastTopicId, ...topic })
  }

  const inPractice = session != null
  const inResult   = result != null
  const showNav    = !inPractice && !inResult

  /* ── Learn mode for add_2d2d uses step-by-step LearnView ── */
  const isLearnView = inPractice && session.mode === 'learn' && session.topicId === 'add_2d2d'

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Main content area ────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Home / Stats — tab screens */}
        <AnimatePresence mode="wait">
          {showNav && tab === 'home' && (
            <motion.div key="home" variants={SCREEN} initial="initial" animate="animate" exit="exit"
                        style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
              <HomeView
                theme={theme}
                onToggleTheme={toggleTheme}
                onSelectTopic={setTopic}
              />
            </motion.div>
          )}
          {showNav && tab === 'stats' && (
            <motion.div key="stats" variants={SCREEN} initial="initial" animate="animate" exit="exit"
                        style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
              <StatsView />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step-by-step learn view (add_2d2d only) */}
        <AnimatePresence>
          {isLearnView && (
            <motion.div
              key={`learn-${sessionId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              style={{ position: 'absolute', inset: 0, zIndex: 50 }}
            >
              <LearnView
                key={sessionId}
                session={session}
                onExit={handleHome}
                onStartPractice={() => startSession({ ...session, mode: 'practice', timerMins: 5 })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Practice / drill session — full-screen overlay */}
        <AnimatePresence>
          {inPractice && !isLearnView && (
            <motion.div
              key={`practice-${sessionId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              style={{ position: 'absolute', inset: 0, zIndex: 50 }}
            >
              <PracticeView
                key={sessionId}
                session={session}
                onDone={handleSessionDone}
                onExit={handleHome}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result screen — full-screen overlay */}
        <AnimatePresence>
          {inResult && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { ease: [0.2, 0, 0, 1], duration: 0.35 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              style={{ position: 'absolute', inset: 0, zIndex: 50 }}
            >
              <ResultView
                result={result}
                onAgain={handleAgain}
                onHome={handleHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── M3 Navigation Bar — slides out during practice/result ── */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0, transition: { ease: [0.2, 0, 0, 1], duration: 0.3 } }}
            exit={{ y: 80, transition: { ease: [0.3, 0, 1, 1], duration: 0.2 } }}
          >
            <NavBar active={tab} onChange={setTab} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB: Continue → (last used topic) ── */}
      <AnimatePresence>
        {showNav && lastTopicId && TOPICS[lastTopicId] && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { ease: [0.2, 0, 0, 1], duration: 0.25, delay: 0.1 } }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
            onClick={openLastTopic}
            className="md-state"
            style={{
              position: 'fixed',
              bottom: 96,
              right: 16,
              zIndex: 40,
              height: 56,
              borderRadius: 16,
              padding: '0 20px 0 16px',
              background: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <polygon points="4,2 16,9 4,16" fill="currentColor"/>
            </svg>
            <span className="md-label-large" style={{ color: 'inherit' }}>Continue</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── PWA Update Snackbar ── */}
      <UpdatePrompt />

      {/* ── Topic Detail Bottom Sheet ── */}
      <AnimatePresence>
        {selectedTopic && (
          <TopicDetailSheet
            key={selectedTopic.id}
            topic={selectedTopic}
            onClose={() => setTopic(null)}
            onStart={startSession}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
