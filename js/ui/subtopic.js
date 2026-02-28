// ═══════════════════════════════════════════════════════
//  SUBTOPIC SCREEN
//  Used on mobile when a section has multiple topics.
//  Depends on: topics.js, srs.js, navigation.js, home.js
//              (capitalize, getTopicIcon)
// ═══════════════════════════════════════════════════════

function openSubtopic(section, topics) {
  document.getElementById('subtopicTitle').textContent = capitalize(section);
  document.getElementById('subtopicSub').textContent   = `${topics.length} variations`;

  const list    = document.getElementById('subtopicList');
  list.innerHTML = '';

  topics.forEach(topic => {
    const mastery = topic.srs ? getMasteryPercent(topic.id, topic.pool) : null;
    const div     = document.createElement('div');
    div.className = 'subtopic-card';
    div.innerHTML = `
      <div class="subtopic-left">
        <div class="subtopic-name">${topic.name}</div>
        <div class="subtopic-desc">${topic.desc}</div>
      </div>
      <div class="subtopic-right">
        ${topic.srs ? `<div class="srs-badge">SRS</div>` : ''}
        ${mastery !== null
          ? `<div class="mastery-bar-wrap"><div class="mastery-bar-fill" style="width:${mastery}%"></div></div>`
          : ''}
        <div class="subtopic-arrow">›</div>
      </div>`;
    div.onclick = () => { S.fromSubtopic = true; openMode(topic.id); };
    list.appendChild(div);
  });

  showScreen('subtopicScreen');
}
