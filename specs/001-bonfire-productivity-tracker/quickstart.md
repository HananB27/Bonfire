# Quickstart & Validation Guide: Bonfire Productivity Tracker

How to run, test, and validate the feature end-to-end. Implementation details live in `tasks.md` and
the source; this is a run/validation guide. See [data-model.md](./data-model.md) and
[contracts/](./contracts/) for exact shapes/behaviors.

## Prerequisites

- Node ≥ 22.11.0 (see `package.json` engines).
- React Native 0.86 toolchain set up (see project `README.md` — Metro, Android Studio / Xcode).
- Add the persistence dependency:
  ```sh
  npm install @react-native-async-storage/async-storage
  ```
  (iOS: `cd ios && pod install` on first add.)

## Design step (MUST DO before building UI)

Fetch and read the design, then implement `Bonfire.html`:
- URL: `https://api.anthropic.com/v1/design/h/eOB-vSewWG4d4riVK_jhKg?open_file=Bonfire.html`
- Read its README, extract tokens into `src/components/theme/tokens.ts`, reproduce the flame states
  and calendar styling in RN. See plan.md → **Design Source (MUST DO)**.

## Run

```sh
npm start            # Metro
npm run android      # or: npm run ios
```

## Lint & test (constitution quality gates)

```sh
npm run lint         # zero errors required
npm test             # all green required
```

## Validation scenarios (prove the feature works)

Each maps to a user story / success criterion. Run on a device/emulator after building.

### V1 — Log today, fire grows (US1 / SC-001, SC-002)
1. Fresh install → fire shown **unlit** (spark/empty).
2. Tap today, pick **3** → fire ignites; size = strength 2.
3. Change today to **5** → fire grows to the max single-day size.
4. Change today to **1** → fire stays lit, size unchanged.
- Expect: visible update < 3s each time.

### V2 — Streak & extinguish (US2 / SC-003)
1. Seed a lit fire (a few scored days).
2. Leave exactly one past day empty → fire still **lit**.
3. Use the dev "advance date" control (dev build only) so two consecutive past days are empty → fire
   shown **out**, strength **0**.
4. Log any new day → fire relights from a fresh spark, accumulating from 0.

### V3 — Backfill recompute (US3 / SC-004)
1. From the V2 "out" state, tap one of the two missed days and assign a score.
2. Expect: the two-miss gap shrinks to one; fire recomputes to **lit** with correct size.
3. Verify order-independence: entering the same scores in any order yields the same fire (covered by
   `__tests__/fire.test.ts`).

### V4 — Persistence (SC-006 / FR-014)
1. Record several scores, force-quit the app, reopen.
2. Expect: all scores and the fire state are exactly as left.

### V5 — Performance (Performance Goals / Principle V)
1. Open the device Perf Monitor.
2. Rapidly log/change scores while the flame animates.
3. Expect: UI-thread FPS holds at the panel refresh rate (120 on 120 Hz devices), no sustained drops.

## Expected automated coverage
- `fire.test.ts` — exhaustive engine behavior (the [fire-engine contract](./contracts/fire-engine.md)
  table).
- `dates.test.ts` — today-not-missed boundary.
- `entriesStore.test.ts` — persistence round-trip (mocked AsyncStorage).
- `BonfireScreen.test.tsx` — logging grows the fire; two consecutive misses extinguish it.
