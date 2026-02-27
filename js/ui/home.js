// ═══════════════════════════════════════════════════════
//  HOME SCREEN
//  Builds topic card lists.  On desktop, shows all
//  individual topics in a CSS grid; on mobile, sections
//  with multiple topics show a group card that opens the
//  subtopic screen.
//  Depends on: topics.js, srs.js, storage.js, navigation.js
// ═══════════════════════════════════════════════════════

function buildHomeScreen() {
  for (const [section, { containerId }] of Object.entries(SECTIONS)) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const topics = SECTION_TOPICS[section] || [];

    if (isDesktop()) {
      // Desktop: show all individual topics so the grid is populated
      topics.forEach(t => container.appendChild(makeTopicCard(t.id, t)));
    } else {
      // Mobile: single group card (→ subtopic screen) or direct card
      if (topics.length === 1) {
        container.appendChild(makeTopicCard(topics[0].id, topics[0]));
      } else {
        container.appendChild(makeGroupCard(section, topics));
      }
    }
  }
}

function makeTopicCard(topicId, topic) {
  const div     = document.createElement('div');
  div.className = 'topic-card';

  const mastery = topic.srs ? getMasteryPercent(topicId, topic.pool) : null;
  const overdue = topic.srs ? getOverdueCount(topicId, topic.pool)   : 0;

  div.innerHTML = `
    <div class="topic-icon">${getTopicIcon(topic.section)}</div>
    <div class="topic-info">
      <div class="topic-name">${topic.name}</div>
      <div class="topic-sub">${topic.desc}</div>
    </div>
    <div class="topic-right">
      ${overdue > 0
        ? `<div style="background:var(--wrong);color:#fff;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;padding:2px 7px;border-radius:10px">${overdue} due</div>`
        : (topic.srs ? `<div class="srs-badge">SRS</div>` : '')}
      ${mastery !== null
        ? `<div class="mastery-bar-wrap"><div class="mastery-bar-fill" style="width:${mastery}%"></div></div>`
        : ''}
      <div class="topic-arrow">›</div>
    </div>`;

  div.onclick = () => openMode(topicId);
  return div;
}

function makeGroupCard(section, topics) {
  const div     = document.createElement('div');
  div.className = 'topic-card';
  div.innerHTML = `
    <div class="topic-icon">${getTopicIcon(section)}</div>
    <div class="topic-info">
      <div class="topic-name">${capitalize(section)}</div>
      <div class="topic-sub">${topics.length} variations</div>
    </div>
    <div class="topic-right">
      <div class="topic-arrow">›</div>
    </div>`;
  div.onclick = () => openSubtopic(section, topics);
  return div;
}

function getTopicIcon(section) {
  return { addition: '+', subtraction: '−', multiplication: '×', memory: '∑' }[section] || '?';
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Streak display (home header) ──────────────────────
function updateStreakDisplay() {
  const count = getStreak();
  const el    = document.getElementById('streakDisplay');
  if (count > 0) {
    el.style.display = 'block';
    el.textContent   = `🔥 ${count}`;
  } else {
    el.style.display = 'none';
  }
}
