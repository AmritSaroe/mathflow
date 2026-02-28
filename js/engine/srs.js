// ═══════════════════════════════════════════════════════
//  SRS ENGINE  (SM-2 simplified)
//  Tracks per-card ease, interval, due date, reps.
//  Depends on: generators.js (for pick())
// ═══════════════════════════════════════════════════════

const SRS_KEY = 'mathflow_srs_v3';

function loadSRS() {
  try { return JSON.parse(localStorage.getItem(SRS_KEY) || '{}'); }
  catch (e) { return {}; }
}

function saveSRS(data) {
  try { localStorage.setItem(SRS_KEY, JSON.stringify(data)); } catch (e) {}
}

function getCardKey(topicId, item) {
  return topicId + '_' + Object.values(item).join('_');
}

function getCardData(srsData, key) {
  return srsData[key] || { ease: 2.5, interval: 1, due: 0, reps: 0 };
}

function updateCard(card, correct) {
  if (correct) {
    card.reps++;
    if (card.reps === 1)      card.interval = 1;
    else if (card.reps === 2) card.interval = 3;
    else                      card.interval = Math.round(card.interval * card.ease);
    card.ease = Math.max(1.3, card.ease + 0.1);
  } else {
    card.reps     = 0;
    card.interval = 1;
    card.ease     = Math.max(1.3, card.ease - 0.2);
  }
  // Interval in minutes (short for practice-session context)
  card.due = Date.now() + card.interval * 60 * 1000;
  return card;
}

function pickSRSItem(topicId, pool) {
  const srsData = loadSRS();
  const now     = Date.now();

  const scored = pool.map(item => {
    const key    = getCardKey(topicId, item);
    const card   = getCardData(srsData, key);
    const overdue = now - card.due;
    // New cards get medium priority to mix with overdue ones
    const score  = card.reps === 0 ? 0 : overdue;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Pick randomly from the top 30% to avoid pure determinism
  const topN       = Math.max(1, Math.floor(scored.length * 0.3));
  const candidates = scored.slice(0, topN);
  return pick(candidates).item;
}

function recordSRS(topicId, item, correct) {
  const srsData = loadSRS();
  const key     = getCardKey(topicId, item);
  const card    = getCardData(srsData, key);
  srsData[key]  = updateCard(card, correct);
  saveSRS(srsData);
}

function getMasteryPercent(topicId, pool) {
  if (!pool || pool.length === 0) return 0;
  const srsData = loadSRS();
  let mastered  = 0;
  for (const item of pool) {
    const card = getCardData(srsData, getCardKey(topicId, item));
    if (card.reps >= 3 && card.ease >= 2.3) mastered++;
  }
  return Math.round(mastered / pool.length * 100);
}
