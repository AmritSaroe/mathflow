// ═══════════════════════════════════════════════════════
//  NAVIGATION
//  showScreen(), screen history, swipe-back gesture,
//  and the isDesktop() device check used across UI files.
// ═══════════════════════════════════════════════════════

// ── Device check ─────────────────────────────────────
function isDesktop() {
  return window.matchMedia('(pointer: fine)').matches || window.innerWidth >= 700;
}

// ── Screen history stack ──────────────────────────────
const screenHistory = ['homeScreen'];

function showScreen(id) {
  const current = screenHistory[screenHistory.length - 1];
  if (current === id) return;

  // ── Desktop: sidebar always visible, right panel swaps instantly ──
  if (isDesktop()) {
    const isBack = screenHistory.includes(id);
    if (isBack) screenHistory.splice(screenHistory.lastIndexOf(id) + 1);
    else        screenHistory.push(id);

    document.querySelectorAll('.screen:not(#homeScreen)').forEach(s => s.classList.remove('active'));
    if (id !== 'homeScreen') document.getElementById(id).classList.add('active');
    if (id === 'statsScreen') buildStatsScreen();
    if (id !== 'homeScreen') document.getElementById(id).scrollTop = 0;
    return;
  }

  const allScreens = document.querySelectorAll('.screen');
  const incoming   = document.getElementById(id);
  const outgoing   = document.getElementById(current);
  const isBack     = screenHistory.includes(id);

  if (isBack) {
    // Going back — incoming slides in from left, outgoing exits right
    screenHistory.splice(screenHistory.lastIndexOf(id) + 1);

    allScreens.forEach(s => {
      s.classList.remove('active', 'slide-out');
      if (s !== incoming && s !== outgoing) s.style.transform = 'translateX(100%)';
    });

    outgoing.style.transform  = 'translateX(0)';
    outgoing.style.transition = 'transform 0.28s cubic-bezier(0.4,0,0.2,1)';
    incoming.style.transform  = 'translateX(-30%)';
    incoming.style.transition = 'none';
    incoming.classList.add('active');

    requestAnimationFrame(() => requestAnimationFrame(() => {
      outgoing.style.transform  = 'translateX(100%)';
      incoming.style.transition = 'transform 0.28s cubic-bezier(0.4,0,0.2,1)';
      incoming.style.transform  = 'translateX(0)';
    }));
  } else {
    // Going forward — incoming slides in from right
    screenHistory.push(id);

    allScreens.forEach(s => {
      s.classList.remove('active', 'slide-out');
      if (s !== incoming && s !== outgoing) s.style.transform = 'translateX(100%)';
    });

    incoming.style.transform  = 'translateX(100%)';
    incoming.style.transition = 'none';
    incoming.classList.add('active');

    requestAnimationFrame(() => requestAnimationFrame(() => {
      outgoing.style.transition = 'transform 0.28s cubic-bezier(0.4,0,0.2,1)';
      outgoing.style.transform  = 'translateX(-30%)';
      incoming.style.transition = 'transform 0.28s cubic-bezier(0.4,0,0.2,1)';
      incoming.style.transform  = 'translateX(0)';
    }));
  }

  if (id === 'statsScreen') buildStatsScreen();
  incoming.scrollTop = 0;
}

// ── Edge swipe to go back (mobile) ───────────────────
let touchStartX = 0;
let touchStartY = 0;
let isSwiping   = false;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isSwiping   = touchStartX < 40; // only from left edge
}, { passive: true });

document.addEventListener('touchend', e => {
  if (!isSwiping) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
  if (dx > 60 && dy < 80 && screenHistory.length > 1) {
    showScreen(screenHistory[screenHistory.length - 2]);
  }
  isSwiping = false;
}, { passive: true });
