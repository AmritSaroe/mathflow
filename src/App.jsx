import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import NavBar from './components/NavBar'
import HomeView from './views/HomeView'
import StatsView from './views/StatsView'
import PracticeView from './views/PracticeView'
import ResultView from './views/ResultView'
import TopicDetailSheet from './views/TopicDetailSheet'
import { initTheme, applyTheme } from './theme/material'

/* ── M3 screen transition variants ───────────────────── */
const SCREEN = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { ease: [0.2, 0, 0, 1], duration: 0.3 } },
  exit:    { opacity: 0, y: 16, transition: { ease: [0.3, 0, 1, 1], duration: 0.2 } },
}

export default function App() {
  const [tab, setTab]             = useState('home')  // 'home' | 'stats'
  const [theme, setTheme]         = useState(() => initTheme())
  const [selectedTopic, setTopic] = useState(null)   // opens TopicDetailSheet
  const [session, setSession]     = useState(null)   // active session config
  const [sessionId, setSessionId] = useState(0)
  const [result, setResult]       = useState(null)   // completed session result

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

  function handleTabChange(key) {
    // Practice tab redirects to Home (topic selection is done from Home)
    setTab(key === 'practice' ? 'home' : key)
  }

  const inPractice = session != null
  const inResult   = result != null
  const showNav    = !inPractice && !inResult

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

        {/* Practice session — full-screen overlay, zero chrome */}
        <AnimatePresence>
          {inPractice && (
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
            <NavBar active={tab} onChange={handleTabChange} />
          </motion.div>
        )}
      </AnimatePresence>

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
