// ═══════════════════════════════════════════════════════
//  PRACTICE SCREEN
//  Session state, question flow, numpad, desktop input.
//  Depends on: topics.js, srs.js, storage.js, navigation.js
// ═══════════════════════════════════════════════════════

// ── Session state ─────────────────────────────────────
let S = {
  topicId:          null,
  mode:             null,
  timerMins:        null,
  input:            '',
  locked:           false,
  correct:          0,
  attempted:        0,
  streak:           0,
  qNum:             0,
  current:          null,
  currentItem:      null,
  timerInterval:    null,
  timerSecondsLeft: 0,
  startTime:        null,
  fromSubtopic:     false
};

// ── Session start ─────────────────────────────────────
function startSession() {
  if (S.timerInterval) { clearInterval(S.timerInterval); S.timerInterval = null; }

  S.input = ''; S.locked = false; S.correct = 0; S.attempted = 0;
  S.streak = 0; S.qNum = 0; S.startTime = Date.now();

  document.getElementById('correctCount').textContent = '0';
  document.getElementById('streakVal').textContent    = '0';
  document.getElementById('progressBar').style.width  = '0%';

  const topic = TOPICS[S.topicId];
  document.getElementById('practiceTopicLabel').textContent = topic.name;

  if (S.mode === 'practice') {
    S.timerSecondsLeft = S.timerMins * 60;
    updateTimerDisplay();
    S.timerInterval = setInterval(timerTick, 1000);
  } else {
    document.getElementById('practiceMeta').innerHTML =
      `Q <span class="val" id="qNumDisplay">1</span>/20`;
  }

  showScreen('practiceScreen');
  nextQuestion();
}

// ── Timer ─────────────────────────────────────────────
function timerTick() {
  S.timerSecondsLeft--;
  updateTimerDisplay();
  if (S.timerSecondsLeft <= 0) {
    clearInterval(S.timerInterval);
    S.timerInterval = null;
    showResult();
  }
}

function updateTimerDisplay() {
  const m   = Math.floor(S.timerSecondsLeft / 60);
  const sec = S.timerSecondsLeft % 60;
  const str = `${m}:${sec.toString().padStart(2, '0')}`;
  const urgent = S.timerSecondsLeft <= 30;
  document.getElementById('practiceMeta').innerHTML =
    `<span style="font-family:'DM Mono',monospace;font-size:12px;${urgent ? 'color:var(--wrong)' : ''}">${str}</span>`;
}

// ── Question flow ─────────────────────────────────────
function nextQuestion() {
  if (S.mode === 'learn' && S.qNum >= 20) { showResult(); return; }

  const existing = document.getElementById('answerReveal');
  if (existing) existing.remove();

  const topic = TOPICS[S.topicId];

  if (topic.srs) {
    S.currentItem = pickSRSItem(S.topicId, topic.pool);
    S.current     = topic.generate(S.currentItem);
  } else {
    S.currentItem = null;
    S.current     = topic.generate();
  }

  S.input = ''; S.locked = false;
  focusDesktopInput();

  document.getElementById('question').className   = 'question';
  document.getElementById('question').textContent  = S.current.display;
  document.getElementById('questionTypeLabel').textContent = S.current.typeLabel || '';
  document.getElementById('feedback').textContent  = '\u00a0';
  document.getElementById('feedback').className    = 'feedback';
  updateDisplay();

  if (S.mode === 'learn') {
    const el = document.getElementById('qNumDisplay');
    if (el) el.textContent = S.qNum + 1;
    document.getElementById('progressBar').style.width = (S.qNum / 20 * 100) + '%';
  }
}

// ── Answer display (mobile) ───────────────────────────
function updateDisplay() {
  const el      = document.getElementById('answerDisplay');
  el.textContent = S.input || '_';
  el.className   = 'answer-display' + (S.input ? ' has-value' : '');
}

// ── Desktop keyboard input ────────────────────────────
function focusDesktopInput() {
  if (!isDesktop()) return;
  const inp = document.getElementById('answerInput');
  if (!inp) return;
  inp.value = '';
  inp.classList.remove('wrong');
  setTimeout(() => inp.focus(), 80);
}

(function wireDesktopInput() {
  const inp = document.getElementById('answerInput');
  if (!inp) return;

  inp.addEventListener('input', () => {
    if (!document.getElementById('practiceScreen').classList.contains('active')) return;
    if (S.locked) { inp.value = S.input; return; }

    const clean  = inp.value.replace(/[^0-9]/g, '');
    const ansLen = S.current ? String(Math.abs(S.current.answer)).length : 4;
    const maxD   = Math.min(ansLen + 1, 5);
    S.input      = clean.slice(0, maxD);
    inp.value    = S.input;

    if (S.current && S.input.length === ansLen) {
      inp.blur();
      setTimeout(submit, 80);
    }
  });

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const reveal = document.getElementById('answerReveal');
      if (reveal) { e.preventDefault(); reveal.click(); return; }
      if (e.key === 'Enter' && S.input && !S.locked) { inp.blur(); submit(); }
    }
  });
})();

// ── Submit answer ─────────────────────────────────────
function submit() {
  if (S.locked || !S.input) return;
  S.locked = true; S.attempted++; S.qNum++;

  const val       = parseInt(S.input);
  const correct   = val === S.current.answer;
  const qEl       = document.getElementById('question');
  const ansEl     = isDesktop()
    ? document.getElementById('answerInput')
    : document.getElementById('answerDisplay');
  const fbEl      = document.getElementById('feedback');
  const isPractice = S.mode === 'practice';
  const topic     = TOPICS[S.topicId];

  if (correct) {
    S.correct++; S.streak++;
    qEl.classList.add('flash-correct');
    HAPTIC.correct();
    if (!isPractice) { fbEl.textContent = '✓ correct'; fbEl.className = 'feedback correct'; }
    if (topic.srs && S.currentItem) recordSRS(S.topicId, S.currentItem, true);
    document.getElementById('correctCount').textContent = S.correct;
    document.getElementById('streakVal').textContent    = S.streak;
    setTimeout(nextQuestion, isPractice ? 180 : 620);
  } else {
    S.streak = 0;
    HAPTIC.wrong();
    if (topic.srs && S.currentItem) recordSRS(S.topicId, S.currentItem, false);
    document.getElementById('correctCount').textContent = S.correct;
    document.getElementById('streakVal').textContent    = S.streak;

    if (isPractice) {
      qEl.classList.add('flash-wrong');
      if (isDesktop()) { ansEl.classList.add('wrong'); }
      else              { ansEl.className = 'answer-display wrong'; }
      setTimeout(nextQuestion, 180);
    } else {
      showAnswerReveal(S.current.display, S.current.answer);
    }
  }
}

// ── Wrong-answer reveal (Learn mode) ─────────────────
function showAnswerReveal(question, answer) {
  const existing = document.getElementById('answerReveal');
  if (existing) existing.remove();

  const reveal     = document.createElement('div');
  reveal.id        = 'answerReveal';
  reveal.className = 'answer-reveal';
  reveal.innerHTML = `
    <div class="reveal-label">✗ incorrect</div>
    <div class="reveal-question">${question}</div>
    <div class="reveal-answer">${answer}</div>
    <div class="reveal-hint">${isDesktop() ? 'press space or enter to continue' : 'tap anywhere to continue'}</div>`;

  document.getElementById('practiceScreen').appendChild(reveal);

  reveal.addEventListener('click', () => {
    reveal.style.opacity    = '0';
    reveal.style.transition = 'opacity 0.15s ease';
    setTimeout(() => {
      reveal.remove();
      nextQuestion();
      if (isDesktop()) focusDesktopInput();
    }, 150);
  }, { once: true });
}

// ── Exit practice ─────────────────────────────────────
function confirmExitPractice() {
  if (S.attempted === 0 || confirm('Exit session? Your progress will be saved.')) {
    if (S.timerInterval) { clearInterval(S.timerInterval); S.timerInterval = null; }
    showScreen('homeScreen');
  }
}

// ── Mobile numpad ─────────────────────────────────────
document.getElementById('numpad').addEventListener('click', e => {
  if (!document.getElementById('practiceScreen').classList.contains('active')) return;
  const key = e.target.closest('.key');
  if (!key || S.locked) return;
  HAPTIC.tap();
  const val = key.dataset.val;

  if (val === 'del') {
    S.input = S.input.slice(0, -1);
    updateDisplay();
  } else if (val === 'submit') {
    if (S.input) submit();
  } else {
    if (S.input.length >= 5) return;
    S.input += val;
    updateDisplay();
    if (S.current && S.input.length === S.current.maxDigits) {
      setTimeout(submit, 80);
    }
  }
});
