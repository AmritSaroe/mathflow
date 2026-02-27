# MathFlow

**Mental maths practice app built for competitive exam preparation.**

A Progressive Web App (PWA) that trains rapid mental calculation through spaced repetition — the same technique used by memory champions. Works offline, installs on your home screen, and feels native on Android.

---

## Why MathFlow

Most maths apps test you randomly. MathFlow tracks every combination you've attempted and uses a spaced repetition algorithm (SM-2) to show you the things you're weakest at, more often. Over time, it builds genuine recall speed — not just familiarity.

---

## What's inside

**16 topic areas across 4 categories:**

| Category | Topics |
|---|---|
| Addition | 1D+1D, 2D+2D, XY0+2D, 3D+3D |
| Subtraction | Single digit facts, Complements to 10, Tens−1D, 2D−2D, 3D−2D, 3D−3D |
| Multiplication | 1D×1D, 2D×1D, 2D×2D |
| Memory & Recall | Times tables (2–9, 11–19, 21–29), Squares (2²–40²), Cubes (2³–20³) |

**Two modes:**
- **Learn** — 20 questions, correct answer shown large on wrong attempts, builds understanding
- **Practice** — timed (2/5/10 min), minimal feedback, builds exam rhythm

**Smart recall engine:**
- SRS on all finite question pools (tables, squares, cubes, single-digit facts)
- Tracks each combination independently — 6×7 and 7×6 are separate cards
- Mastery bars on every topic, overdue badges when you need to review

**Consistency features:**
- Daily streak tracking
- Weekly activity chart
- Daily reminder notifications (no server needed)
- Haptic feedback with on/off toggle

**Native-feel PWA:**
- Slide transitions between screens
- Swipe right to go back
- No pull-to-refresh, no bounce scroll
- Portrait locked
- Works fully offline after first load

---

## Install on Android

1. Open the app URL in Chrome
2. Tap the three-dot menu → **Add to Home screen**
3. Launch from your home screen — runs fullscreen with no browser UI

---

## Self-host or run locally

No build step, no dependencies. It's a single HTML file.

```bash
# Clone and serve
git clone https://github.com/yourusername/mathflow
cd mathflow
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## Tech

- Vanilla HTML, CSS, JavaScript — no frameworks, no build tools
- Service Worker for offline support and PWA install
- localStorage for all persistence (SRS data, streaks, activity, settings)
- SM-2 spaced repetition algorithm
- Web Vibration API for haptics
- Web Notifications API for reminders

---

## Roadmap

- [ ] Wrong answer review at end of session
- [ ] Personal bests per topic
- [ ] Division practice
- [ ] Session history log
- [ ] Android home screen badge for overdue cards

---

*Built for anyone preparing for competitive exams where mental calculation speed matters — banking, engineering, civil services, and similar.*
