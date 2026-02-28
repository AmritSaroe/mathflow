import { pick } from './utils'

const SRS_KEY = 'mathflow_srs_v3'

const load  = () => { try { return JSON.parse(localStorage.getItem(SRS_KEY) || '{}') } catch { return {} } }
const save  = (d) => { try { localStorage.setItem(SRS_KEY, JSON.stringify(d)) } catch {} }
const key   = (topicId, item) => topicId + '_' + Object.values(item).join('_')
const card  = (d, k) => d[k] || { ease: 2.5, interval: 1, due: 0, reps: 0 }

function updateCard(c, correct) {
  if (correct) {
    c.reps++
    c.interval = c.reps === 1 ? 1 : c.reps === 2 ? 3 : Math.round(c.interval * c.ease)
    c.ease = Math.max(1.3, c.ease + 0.1)
  } else {
    c.reps = 0; c.interval = 1; c.ease = Math.max(1.3, c.ease - 0.2)
  }
  c.due = Date.now() + c.interval * 60 * 1000
  return c
}

export function pickSRSItem(topicId, pool) {
  const d = load(), now = Date.now()
  const scored = pool.map(item => {
    const c = card(d, key(topicId, item))
    return { item, score: c.reps === 0 ? 0 : now - c.due }
  })
  scored.sort((a, b) => b.score - a.score)
  const topN = Math.max(1, Math.floor(scored.length * 0.3))
  return pick(scored.slice(0, topN)).item
}

export function recordSRS(topicId, item, correct) {
  const d = load(), k = key(topicId, item)
  d[k] = updateCard(card(d, k), correct)
  save(d)
}

export function getDueCount(topicId, pool) {
  if (!pool?.length) return 0
  const d = load(), now = Date.now()
  return pool.filter(item => {
    const c = card(d, key(topicId, item))
    return c.reps > 0 && now >= c.due
  }).length
}

/* Returns true if any item in the pool has been attempted at least once.
   `due > 0` means the scheduler has recorded a result for that card. */
export function hasAnyAttempts(topicId, pool) {
  if (!pool?.length) return false
  const d = load()
  return pool.some(item => (d[key(topicId, item)]?.due ?? 0) > 0)
}

export function getMasteryPercent(topicId, pool) {
  if (!pool?.length) return 0
  const d = load()
  let mastered = 0
  for (const item of pool) {
    const c = card(d, key(topicId, item))
    if (c.reps >= 3 && c.ease >= 2.3) mastered++
  }
  return Math.round(mastered / pool.length * 100)
}
