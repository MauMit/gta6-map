# GTA 6 — Leonida Interactive Map

An interactive map of Leonida with 2,532 markers, collectible tracking, notes,
checklists, custom markers and heatmaps — hosted on GitHub Pages, with
**Sign in with Google** so your progress is saved to your account and follows
you across devices.

Based on the openLeonida offline map.

## How progress is saved

- **Not signed in:** progress is saved in this browser only (localStorage), exactly like the original.
- **Signed in with Google:** every change is also saved to your account (Firebase / Firestore,
  one private document per user). Open the map on another device, sign in, and your progress loads.
  - The first time you sign in, anything you already marked on that device is uploaded.
  - If two devices both changed things while apart, they are merged (nothing found gets lost).
  - Changes made on one open device appear on the other within a second or two.
- Export / Import (JSON) still work as a manual backup.

## Setup

Google sign-in needs a free Firebase project. Follow **[SETUP.md](SETUP.md)** once (about 5 minutes),
then paste your config into `firebase-config.js`. Until then the site works, saving locally.

## Files added for the web version

| File | Purpose |
| --- | --- |
| `cloud-sync.js` | Google sign-in and cloud sync (loads the Firebase SDK from Google's CDN) |
| `firebase-config.js` | Your Firebase project's web config (fill in from SETUP.md) |
| `firestore.rules` | Security rules: each user can read/write only their own progress |
| `.github/workflows/pages.yml` | Deploys the site to GitHub Pages on every push to `main` |

Screenshots in `assets/img/` were re-encoded from PNG to WebP (1600 px) to keep the site under
GitHub Pages' 1 GB size limit.

GTA 6 © Rockstar Games. Unofficial fan map, not affiliated with Rockstar Games or Take-Two.
