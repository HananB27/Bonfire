# Quickstart & Validation Guide: Bonfire Productivity Tracker (Expo, design-faithful)

How to run, test, and validate. Implementation detail lives in `tasks.md` and the source; see
[data-model.md](./data-model.md) and [contracts/](./contracts/) for exact shapes. The canonical look
is `BonfireDesign/` (code + `screenshots/`).

## Prerequisites

- Node (current LTS), and the Expo toolchain (`npx expo`).
- Install dependencies:
  ```sh
  npx expo install @shopify/react-native-skia react-native-reanimated react-native-gesture-handler \
    expo-linear-gradient @react-native-async-storage/async-storage react-native-safe-area-context
  ```
- Babel: add `react-native-reanimated/plugin` (last) in `babel.config.js`.
- Wrap the app in `GestureHandlerRootView` (in `App.tsx`).

## Design step (MUST DO before/while building UI)

Match `BonfireDesign/` closely (plan.md → **Design Source (MUST DO)**):
- Port `styles.css :root` → `src/theme/tokens.ts`; `app.jsx FLAME_PALETTES` → `src/theme/palettes.ts`.
- Reproduce the flame from `fire.jsx`/`styles.css` in Skia (`Flame.tsx`/`Embers.tsx`).
- Keep the app side-by-side with `screenshots/open.png`, `open2.png`, `open3.png` while building.

## Run

```sh
npx expo start            # then press a (Android) / i (iOS), or scan with a dev client
```

## Lint & test (constitution quality gates)

```sh
npm run lint              # zero errors required
npm test                  # all green required (jest-expo)
```

## Validation scenarios

### V1 — Log today, fire grows (US1 / SC-001, SC-002)
Open app → clean full-screen flame. Swipe up → calendar. Tap today → pick 5 → flame ignites/grows;
caption updates (e.g. "strength 4"). Visible update < 3s.

### V2 — Streak & extinguish (US2 / SC-003, SC-010)
Seed a lit fire; one missed past day → still lit. Use the `__DEV__` advance-day control until two
consecutive past days are empty → flame disappears (out): no flame, no embers, cold logs + smoke wisp.

### V3 — Backfill across months (US3 / SC-004 / FR-020)
From an out state, page the calendar **back** a month (confirm the `›` next button is disabled on the
current month), score one of the missed days → fire recomputes to lit. Order-independence covered by
`fire.test.ts`.

### V4 — Reveal/hide calendar (US4 / SC-009)
On open the calendar is hidden; swipe up reveals it (flame lifts/dims); swipe down hides it.

### V5 — Fire color (US5 / SC-008)
Tap the top-right settings button → choose Crimson → flame recolors immediately; choose Sapphire →
blue flame; restart app → color persists.

### V6 — Persistence (SC-006 / FR-014)
Record scores, force-quit, reopen → scores + fire state intact (after the brief loading placeholder,
FR-015 — no unlit flash).

### V7 — Performance & fidelity (Perf Goals / SC-007 + design MUST DO)
Profile on a 120 Hz device while logging: UI-thread FPS holds at panel refresh (≥120). Compare the
running flame + calendar to the screenshots — it should look almost identical.

## Expected automated coverage
- `fire.test.ts` — engine behavior (matches `BonfireDesign/logic.js`).
- `dates.test.ts` — today-not-missed boundary.
- `flameModel.test.ts` — intensity curve + monotonic height.
- `entriesStore.test.ts` / `settingsStore.test.ts` — round-trips (scores; flame color default Amber).
- `BonfireScreen.test.tsx` — grow on score; 2 misses → out; swipe reveals calendar; color change
  (native modules mocked).
