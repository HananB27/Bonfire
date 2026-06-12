# Quickstart & Validation: Achievement-Locked Flame Styles

Builds on the running feature-001 app. **No new packages** — `npm install` only if deps drifted.

## Run

```bash
npm install            # only if needed; no new deps were added
npm run lint           # zero errors (Constitution I)
npm test               # all unit + behavior tests green (Constitution III)
npx expo start         # then press i / a, or scan with a dev client
```

## Automated validation (Jest)

| Suite | Proves |
|-------|--------|
| `fireMetrics.test.ts` | run days / unbroken chain / strong+perfect counts / comebacks are correct & order-independent |
| `achievements.test.ts` | every condition kind; streak relock on out & on edit; time unlock/expire (D+W inclusive); fire-out voids time flames; re-earn resets window; backfill-expired stays locked; order-independence (SC-002–SC-005) |
| `flames.catalog.test.ts` | ids unique, one base, embered+palette present, time flames have windows, rarity strictly ascending (SC-009) |
| `settingsStore.test.ts` | v1→v2 migration, default `amber`, round-trip (SC-007) |
| `FlameGallery.test.tsx` | locked teaser + progress + countdown; equip locked → embered on screen (SC-006, SC-008) |
| `fire.test.ts` | UNCHANGED — 001 engine still green (regression guard) |

Run a single suite: `npm test -- achievements`.

## Manual validation (device/emulator) — maps to user stories

Use the `__DEV__` "advance a day" pill to move `today` without waiting for real days.

1. **Earn & equip (US1, SC-001)** — score 5 consecutive days → open gear → **Sodium** (7-day run is
   still locked, Sapphire's 5-day run is unlocked) flips to unlocked at the right day; tap it → the
   flame recolors immediately, no restart.
2. **Streak peters out (US2, FR-005)** — with a streak flame equipped, advance 2 days without scoring →
   fire goes out (logs + smoke, no flame); reopen gear → that flame is **locked**. Score again → relit
   fire shows the **embered** variant until the condition is met again, then snaps to full.
3. **Time expire & re-earn (US3, SC-003/004)** — earn **Toxic** (3 perfect days), equip it; advance
   past its 7-day window with the fire still lit → flame **expires** (embered); the gallery shows
   "Expired — re-earn"; do 3 perfect days again → unlocked, countdown resets to 7.
4. **Fire-out voids time flame (FR-007a)** — earn a time flame, then let the fire go out inside the
   window → flame locks; relight within the window → it's unlocked again.
5. **Gallery teasers (US4, SC-008)** — open the gear mid-run: every locked flame shows name, colors,
   requirement, and live progress (streak `value/target`; time `Nd left` or re-earn).
6. **Embered preview (US6)** — equip a not-yet-earned flame → the lit fire shows its dim embered
   variant; meet the achievement → it bursts to full automatically. Amber never embers.
7. **Backfill determinism (US5, SC-005)** — page back, fill a missed day to complete a streak cond →
   the flame unlocks; reaching the same calendar via a different edit order yields the same gallery.
8. **Full-screen swipe (user ask)** — from the closed screen, swipe **up starting anywhere** → the
   calendar rises (status-bar-shade feel) and the flame lifts in lock-step. Tapping the gear (no drag)
   opens settings and does NOT open the calendar.
9. **Performance (SC-010)** — rapidly switch flames in the gallery and log scores: the flame holds its
   refresh rate (≥120 FPS on capable devices) with no sustained drop while switching.

## Tuning (the "easy to change" check)

Open `src/domain/flames.ts`. Change a `params` number (e.g. Sodium `{n:7}` → `{n:5}`) or a
`windowDays`, or append a new `FlameStyle` entry. Re-run `npm test` — only the catalog/achievement
tests reflect the change; no engine or UI edits are needed.

## References

- Mechanics: [spec.md](./spec.md) (FR-001…FR-024, SC-001…SC-010) + Appendix A catalog.
- Pure contracts: [contracts/achievement-engine.md](./contracts/achievement-engine.md),
  [contracts/flame-catalog.md](./contracts/flame-catalog.md).
- UI + swipe: [contracts/flame-gallery.md](./contracts/flame-gallery.md).
- Reused 001 engine/flame: `specs/001-bonfire-productivity-tracker/contracts/{fire-engine,flame-and-theme}.md`.
