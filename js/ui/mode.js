// ═══════════════════════════════════════════════════════
//  MODE SCREEN
//  Topic mode selection (Learn / Practice + timer).
//  Depends on: topics.js, navigation.js
//              S (session state, defined in practice.js)
// ═══════════════════════════════════════════════════════

function openMode(topicId) {
  S.topicId  = topicId;
  S.mode     = null;
  S.timerMins = null;

  const topic = TOPICS[topicId];
  document.getElementById('modeTitle').textContent = topic.name;
  document.getElementById('modeSub').textContent   = topic.desc;

  document.getElementById('learnCard').classList.remove('selected');
  document.getElementById('practiceCard').classList.remove('selected');
  document.getElementById('timerOptions').classList.remove('show');
  document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('startBtn').classList.remove('ready');
  document.getElementById('srsInfo').style.display = topic.srs ? 'block' : 'none';

  document.getElementById('modeBackBtn').onclick = () =>
    showScreen(S.fromSubtopic ? 'subtopicScreen' : 'homeScreen');

  showScreen('modeScreen');
}

function selectMode(m) {
  S.mode     = m;
  S.timerMins = null;
  document.getElementById('learnCard').classList.toggle('selected',    m === 'learn');
  document.getElementById('practiceCard').classList.toggle('selected', m === 'practice');
  document.getElementById('timerOptions').classList.toggle('show',     m === 'practice');
  document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('selected'));
  updateStartBtn();
}

function selectTimer(e, mins) {
  e.stopPropagation();
  S.timerMins = mins;
  document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('selected'));
  e.target.classList.add('selected');
  updateStartBtn();
}

function updateStartBtn() {
  const ready = S.mode === 'learn' || (S.mode === 'practice' && S.timerMins);
  document.getElementById('startBtn').classList.toggle('ready', !!ready);
}
