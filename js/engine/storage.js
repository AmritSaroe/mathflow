// ═══════════════════════════════════════════════════════
//  STORAGE HELPERS
//  Haptics, theme, streak, activity, overdue counts.
//  Depends on: srs.js (for loadSRS, getCardKey, getCardData)
// ═══════════════════════════════════════════════════════

const HAPTICS_KEY  = 'mathflow_haptics_v3';
const THEME_KEY    = 'mathflow_theme_v3';
const STREAK_KEY   = 'mathflow_streak_v3';
const ACTIVITY_KEY = 'mathflow_activity_v3';

// ── Haptics ───────────────────────────────────────────
function hapticsEnabled() {
  return localStorage.getItem(HAPTICS_KEY) !== 'off';
}

function vibrate(pattern) {
  if (!hapticsEnabled()) return;
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

const HAPTIC = {
  tap:     () => vibrate(8),
  correct: () => vibrate(40),
  wrong:   () => vibrate([30, 60, 30]),
};

// ── Theme ─────────────────────────────────────────────
function isLightTheme() {
  return localStorage.getItem(THEME_KEY) === 'light';
}

// ── Streak ────────────────────────────────────────────
function loadStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":null}'); }
  catch (e) { return { count: 0, lastDate: null }; }
}

function saveStreak(data) {
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(data)); } catch (e) {}
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(today) {
  const streak    = loadStreak();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (streak.lastDate === today)      return; // already recorded
  if (streak.lastDate === yesterday)  streak.count++;
  else                                streak.count = 1; // reset or fresh start
  streak.lastDate = today;
  saveStreak(streak);
}

function getStreak() {
  const streak    = loadStreak();
  const today     = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (streak.lastDate !== today && streak.lastDate !== yesterday) return 0;
  return streak.count;
}

// ── Activity ──────────────────────────────────────────
function recordActivity(attempted, correct) {
  const today = getTodayStr();
  let activity  = {};
  try { activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}'); } catch (e) {}

  if (!activity[today]) activity[today] = { attempted: 0, correct: 0, sessions: 0 };
  activity[today].attempted += attempted;
  activity[today].correct   += correct;
  activity[today].sessions++;

  // Keep only the last 30 days
  const keys = Object.keys(activity).sort();
  if (keys.length > 30) delete activity[keys[0]];

  try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)); } catch (e) {}

  updateStreak(today);
}

// ── Overdue SRS count (for home screen badges) ────────
function getOverdueCount(topicId, pool) {
  if (!pool) return 0;
  const srsData = loadSRS();
  const now     = Date.now();
  let count     = 0;
  for (const item of pool) {
    const card = getCardData(srsData, getCardKey(topicId, item));
    if (card.reps === 0 || (card.reps > 0 && now > card.due)) count++;
  }
  return count;
}
