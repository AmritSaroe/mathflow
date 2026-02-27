import { useState } from 'react'
import HomeView from './views/HomeView'
import PracticeView from './views/PracticeView'
import InstallPrompt from './components/InstallPrompt'

export default function App() {
  const [view, setView]         = useState('home')
  const [session, setSession]   = useState(null)
  const [sessionId, setSessionId] = useState(0)

  function startSession(config) {
    setSession(config)
    setView('practice')
    setSessionId(id => id + 1)
  }

  if (view === 'practice' && session) {
    return (
      <PracticeView
        key={sessionId}
        session={session}
        onExit={() => setView('home')}
        onAgain={() => setSessionId(id => id + 1)}
      />
    )
  }

  return (
    <>
      <HomeView onStartSession={startSession} />
      <InstallPrompt />
    </>
  )
}
