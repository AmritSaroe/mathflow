const STREAK_KEY   = 'mathflow_streak_v3'
const ACTIVITY_KEY = 'mathflow_activity_v3'

const today     = () => new Date().toISOString().slice(0, 10)
const yesterday = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10)

function loadStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":null}') }
  catch { return { count: 0, lastDate: null } }
}

function updateStreak(date) {
  const s = loadStreak()
  if (s.lastDate === date) return
  s.count = s.lastDate === yesterday() ? s.count + 1 : 1
  s.lastDate = date
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)) } catch {}
}

export function getStreak() {
  const s = loadStreak(), d = today(), y = yesterday()
  return (s.lastDate === d || s.lastDate === y) ? s.count : 0
}

export function recordActivity(attempted, correct) {
  const d = today()
  let activity = {}
  try { activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}') } catch {}
  if (!activity[d]) activity[d] = { attempted: 0, correct: 0, sessions: 0 }
  activity[d].attempted += attempted
  activity[d].correct   += correct
  activity[d].sessions++
  const keys = Object.keys(activity).sort()
  if (keys.length > 30) delete activity[keys[0]]
  try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)) } catch {}
  updateStreak(d)
}

export function getActivity() {
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}') } catch { return {} }
}
