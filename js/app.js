// ═══════════════════════════════════════════════════════
//  APP ENTRY POINT
//  Runs after all other scripts are loaded (defer order).
//  Depends on: everything.
// ═══════════════════════════════════════════════════════

// ── Initialise UI ─────────────────────────────────────
buildHomeScreen();
updateStreakDisplay();
applyTheme(isLightTheme());

// Set initial off-screen positions for non-active screens
document.querySelectorAll('.screen').forEach(s => {
  if (!s.classList.contains('active')) {
    s.style.transform  = 'translateX(100%)';
    s.style.transition = 'none';
  }
});

// ── Service worker (PWA offline support) ──────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
