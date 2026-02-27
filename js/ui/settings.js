// ═══════════════════════════════════════════════════════
//  SETTINGS  — theme & haptics
//  Depends on: storage.js (HAPTIC, HAPTICS_KEY, THEME_KEY,
//              hapticsEnabled, isLightTheme)
// ═══════════════════════════════════════════════════════

// ── Theme ─────────────────────────────────────────────
function applyTheme(light) {
  document.documentElement.classList.toggle('light', light);
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', light ? '#f4f4f0' : '#0f0f0f');
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = light ? '🌙' : '☀️';
  updateThemeToggle();
}

function toggleTheme() {
  const light = !isLightTheme();
  localStorage.setItem(THEME_KEY, light ? 'light' : 'dark');
  applyTheme(light);
}

function updateThemeToggle() {
  const on     = isLightTheme();
  const toggle = document.getElementById('themeToggle');
  const thumb  = document.getElementById('themeThumb');
  if (!toggle) return;
  toggle.style.background  = on ? 'var(--accent)' : 'var(--border)';
  thumb.style.left          = on ? '21px' : '3px';
  thumb.style.background    = on ? '#fff' : '#888';
}

// ── Haptics ───────────────────────────────────────────
function toggleHaptics() {
  const enabled = hapticsEnabled();
  localStorage.setItem(HAPTICS_KEY, enabled ? 'off' : 'on');
  updateHapticsToggle();
  if (!enabled) HAPTIC.tap();
}

function updateHapticsToggle() {
  const on     = hapticsEnabled();
  const toggle = document.getElementById('hapticsToggle');
  const thumb  = document.getElementById('hapticsThumb');
  if (!toggle) return;
  toggle.style.background = on ? 'var(--accent)' : 'var(--border)';
  thumb.style.left         = on ? '21px' : '3px';
  thumb.style.background   = on ? '#fff' : '#888';
  updateThemeToggle();
}
