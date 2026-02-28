// ═══════════════════════════════════════════════════════
//  STATS SCREEN
//  Builds streak card, weekly bar chart, all-time stats.
//  Depends on: storage.js, settings.js (updateHapticsToggle)
// ═══════════════════════════════════════════════════════

function buildStatsScreen() {
  const streak     = getStreak();
  const streakData = loadStreak();
  const today      = getTodayStr();

  document.getElementById('statsStreakNum').textContent = streak;

  const msgEl = document.getElementById('statsStreakMsg');
  msgEl.style.color = '';
  if (streak === 0) {
    msgEl.textContent = 'practise today to start your streak';
  } else if (streakData.lastDate === today) {
    msgEl.textContent = `✓ practised today · ${streak} day${streak > 1 ? 's' : ''} running`;
  } else {
    msgEl.textContent  = '⚠ practise today to keep your streak!';
    msgEl.style.color  = 'var(--wrong)';
  }

  buildWeeklyChart();
  updateHapticsToggle();

  // All-time stats
  let activity = {};
  try { activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}'); } catch (e) {}

  const days          = Object.values(activity);
  const totalAttempted = days.reduce((s, d) => s + d.attempted, 0);
  const totalCorrect   = days.reduce((s, d) => s + d.correct,   0);
  const totalSessions  = days.reduce((s, d) => s + d.sessions,  0);
  const avgAcc         = totalAttempted > 0 ? Math.round(totalCorrect / totalAttempted * 100) : 0;

  const row = (label, val) => `
    <div style="display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:12px">
      <span style="color:var(--muted)">${label}</span>
      <span style="color:var(--text);font-weight:500">${val}</span>
    </div>`;

  document.getElementById('allTimeStats').innerHTML =
    row('total questions', totalAttempted) +
    row('overall accuracy', avgAcc + '%') +
    row('total sessions', totalSessions) +
    row('days active', days.length);
}

function buildWeeklyChart() {
  let activity = {};
  try { activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}'); } catch (e) {}

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d       = new Date(Date.now() - i * 86400000);
    const key     = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
    days.push({ key, label: dayName, count: activity[key]?.attempted || 0 });
  }

  const max      = Math.max(...days.map(d => d.count), 1);
  const chartEl  = document.getElementById('weeklyChart');
  const labelsEl = document.getElementById('weeklyLabels');
  const today    = getTodayStr();

  chartEl.innerHTML  = '';
  labelsEl.innerHTML = '';

  days.forEach(day => {
    const pct    = Math.max(day.count > 0 ? 8 : 0, Math.round(day.count / max * 100));
    const isToday = day.key === today;
    const col    = day.count > 0
      ? (isToday ? 'var(--accent)' : 'rgba(200,240,96,0.45)')
      : 'var(--border)';

    const bar = document.createElement('div');
    bar.style.cssText = `flex:1;background:${col};border-radius:4px 4px 0 0;height:${pct}%;min-height:${day.count > 0 ? 4 : 2}px;transition:height 0.3s ease;align-self:flex-end`;
    chartEl.appendChild(bar);

    const label = document.createElement('div');
    label.style.cssText = `flex:1;text-align:center;font-family:'DM Mono',monospace;font-size:10px;color:${isToday ? 'var(--accent)' : 'var(--muted)'}`;
    label.textContent = day.label;
    labelsEl.appendChild(label);
  });
}
