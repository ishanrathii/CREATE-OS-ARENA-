# CreateOS Arena

A free, for-fun World Cup 2026 prediction game. Pick winners, build streaks, climb the global leaderboard, and share your rank card.

> Disclaimer: CreateOS Arena is for entertainment only. No money, no wagers, no gambling.

## Run locally

It's a static site — no build step.

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Or just open `index.html` directly in a browser.

## Deploy

Pushing to `main` (or the active feature branch) triggers `.github/workflows/pages.yml`, which publishes the site to GitHub Pages. Enable Pages once in repo Settings → Pages → "GitHub Actions".

## Structure

- `index.html` — markup for all four tabs (Predict / Leaderboard / How to play / Prizes), modals, and disclaimer.
- `style.css` — dark green theme, mobile bottom bar, responsive grid.
- `app.js` — predictions, streak logic, countdown, favourite team, share card download (canvas → PNG), leaderboard renderers, login modal.

## Wiring real services

The frontend ships with mock fixtures, leaderboard, and news. Replace these touchpoints with your APIs:

| Feature | Hook | Where |
| --- | --- | --- |
| Google sign-in via CreateOS | `fakeLogin()` | `app.js` |
| Fixtures + lock times | `MATCHES` | `app.js` |
| Live scores | live tick `setInterval` block | `app.js` |
| Leaderboard | `LEADERBOARD` | `app.js` |
| Per-match breakdown | `BREAKDOWN` | `app.js` |
| Favourite team news | `NEWS` map | `app.js` |
| Lineups | `match.lineup` | `app.js` |

## Features

- Match fixtures with venue, group, kickoff time, team flags and a live lock countdown.
- Pick UI with point system (1 favourite / 2 draw / 3 underdog).
- Streak bonus widget (3d=1×, 5d=2×, 7d=3×, 15d=5×).
- Global leaderboard with logged-in user highlighted, per-match breakdown table.
- "Always running" registration countdown (rolling 14-day cycle, never ends).
- Favourite team picker (24 teams) + theme-vote percentages.
- Live score banner with confirmed lineups ~1 hour before kickoff.
- Auto rank card every 5 days, downloadable as PNG, sharable to X / Instagram / WhatsApp.
- Rules + Points + FAQ tab.
- Prize tiers (Gold / Silver / Bronze) with claim CTA.
- Disclaimer banner pinned to the top.
- Mobile-first: bottom tab bar, stacked stats, fluid match cards.
