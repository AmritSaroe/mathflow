// ═══════════════════════════════════════════════════════
//  RESULT SCREEN
//  Depends on: topics.js, srs.js, storage.js,
//              navigation.js, home.js (buildHomeScreen,
//              updateStreakDisplay), practice.js (S)
// ═══════════════════════════════════════════════════════

function showResult() {
  if (S.timerInterval) { clearInterval(S.timerInterval); S.timerInterval = null; }

  recordActivity(S.attempted, S.correct);
  updateStreakDisplay();

  const elapsed  = Math.max(1, Math.round((Date.now() - S.startTime) / 1000));
  const accuracy = S.attempted > 0 ? Math.round(S.correct / S.attempted * 100) : 0;
  const qpm      = (S.attempted / (elapsed / 60)).toFixed(1);
  const topic    = TOPICS[S.topicId];

  document.getElementById('resultBig').textContent   = `${S.correct}/${S.attempted}`;
  document.getElementById('resultTopic').textContent =
    topic.name + ' · ' + (S.mode === 'practice' ? `${S.timerMins} min practice` : 'learn mode');

  let statsHTML = `
    <div class="stat-row"><span class="stat-label">accuracy</span><span class="stat-val">${accuracy}%</span></div>
    <div class="stat-row"><span class="stat-label">correct</span><span class="stat-val">${S.correct}</span></div>
    <div class="stat-row"><span class="stat-label">attempted</span><span class="stat-val">${S.attempted}</span></div>`;

  if (S.mode === 'practice') {
    statsHTML += `<div class="stat-row"><span class="stat-label">questions/min</span><span class="stat-val">${qpm}</span></div>`;
  }

  if (topic.srs) {
    const mastery = getMasteryPercent(S.topicId, topic.pool);
    statsHTML += `<div class="stat-row"><span class="stat-label">mastery</span><span class="stat-val">${mastery}%</span></div>`;
  }

  document.getElementById('resultStats').innerHTML = statsHTML;

  let msg = '';
  if      (accuracy === 100) msg = 'perfect accuracy 🎯';
  else if (accuracy >= 90)   msg = 'excellent — keep pushing';
  else if (accuracy >= 70)   msg = 'solid — accuracy before speed';
  else                       msg = 'keep practising — consistency first';

  document.getElementById('resultMessage').textContent = msg;
  showScreen('resultScreen');
  buildHomeScreen(); // refresh mastery bars on home
}
