# Phase 0 Research: Bonfire Productivity Tracker (design-faithful Expo build)

All Technical Context unknowns resolved below. No remaining NEEDS CLARIFICATION.

## R1 — Migrate to Expo

- **Decision**: Adopt **Expo** (current SDK) with config plugins, keeping the option to `expo
  prebuild` for the native modules. Align the project's React Native / React versions to whatever the
  chosen Expo SDK bundles (do not pin RN 0.86 against an incompatible SDK).
- **Rationale**: User mandate. Expo gives first-class config plugins + build tooling for the native
  modules we need (Skia, Reanimated, gesture-handler), EAS builds, and `npx expo start`.
- **Migration steps**: add `expo`; create `app.config.ts`/`app.json` (name "Bonfire", portrait,
  dark, plugins for reanimated + gesture-handler + skia); switch the entry to
  `registerRootComponent` (`index.ts`); add the Reanimated Babel plugin (must be last) in
  `babel.config.js`; wrap the app in `GestureHandlerRootView`; swap the Jest preset to `jest-expo`.
- **Alternatives**: stay on bare RN 0.86 CLI (rejected — user requires Expo); Expo managed without
  prebuild (works if all native deps have config plugins — Skia/Reanimated/gesture-handler do).
- **Risk**: if the Expo SDK doesn't yet support RN 0.86, downgrade RN to the SDK's version. Existing
  pure code (engine, dates, stores) is framework-agnostic and ports unchanged.

## R2 — Render the flame with React Native Skia (design fidelity + 120 FPS)

- **Decision**: Build the flame with **@shopify/react-native-skia**, mapping each CSS layer in
  `BonfireDesign/styles.css` to a Skia primitive on a single `<Canvas>`:
  - flame tongues (`.flame base/mid/inner/core/tongue`) → stacked `Group`s with vertical
    `LinearGradient` shaders + `Blur` image filter + `BlendMode.Screen`.
  - `.halo` / `.ground-glow` / `.log-warm` → `Circle`/`Oval` with `RadialGradient` + blur.
  - `--bright` brightness → a brightness `ColorMatrix`/opacity on the flame group.
  - ember particles (`.ember` + `emberrise`) → Skia circles with radial-gradient paint, positions
    driven by a Reanimated clock (R3).
- **Rationale**: The look depends on blur, radial/linear gradients, and `mix-blend-mode: screen` —
  none of which plain RN views support. Skia renders all of it on the GPU, so the many animated
  blurred layers stay at the display refresh rate (≥120 FPS). This is the decisive choice for "almost
  identical flame + 120 FPS".
- **No degrade path**: full fidelity is non-negotiable — we do NOT reduce blur passes, layer count,
  or particle counts to chase frame rate. The compositing is engineered to hold 120 FPS at full
  fidelity on capable hardware; on low-end devices fidelity is kept and FPS may fall (fidelity >
  FPS). See plan.md → Performance Goals.
- **Compositing detail (the hard part — tasks T022a–T022d)**: build the additive glow by drawing each
  tongue (geometry T022a, palette `LinearGradient` T022b) into a `Group` that applies a per-tongue
  `Blur` image filter and composites with `BlendMode.Screen` plus a brightness factor (`--bright`),
  exactly mirroring the CSS `filter: blur()` + `mix-blend-mode: screen` stack; the halo/ground-glow
  (T022d) are blurred `RadialGradient` ovals behind it. This is validated against
  `BonfireDesign/screenshots/open.png`.
- **Intensity curve (from `fire.jsx`/`logic.js`)**: `intensity(strength) = 1 − e^(−strength/14)`;
  flame height `= lit ? 60 + 268·t : 30` (spark); `glow = lit ? 0.35 + 0.6·t : unlit ? 0.12 : 0`;
  `bright = 0.85 + 0.45·t`. Ported verbatim into `flameModel.ts` so the RN flame scales like the
  design. (This supersedes the prior sqrt/soft-cap; the exponential already soft-caps, satisfying
  spec SC-002 / the soft-cap clarification.)
- **Alternatives**: Lottie (canned, can't scale continuously with strength — rejected); stacked
  blurred `Animated.View`s (the prior build — cannot reproduce blend/blur or hold FPS — rejected);
  GL/shaders directly (more work than Skia — rejected).

## R3 — Drive animation on the UI thread with Reanimated

- **Decision**: Use **react-native-reanimated** shared values + `useFrameCallback`/`withRepeat` to
  drive the flame flicker (the `flick-a/b/c/tongue` keyframes), the ignite/grow pops, halo/ground
  flicker, ember motion, and the sheet drag — all on the UI thread.
- **Rationale**: UI-thread animation is decoupled from JS, so it renders at panel refresh (120 FPS)
  even while JS recomputes the fire. Skia integrates with Reanimated shared values directly.
- **Practice**: strength→target values computed once per change in JS (pure `flameModel`), then a
  shared value eases to the target (spring); per-frame flicker/ember updates never touch JS state.

## R4 — Calendar as a swipe-up bottom sheet

- **Decision**: Implement the rising calendar window with **react-native-gesture-handler** (pan) +
  **Reanimated** for the sheet translate, plus a scrim that dims and a `lift` value that shifts/scales
  the flame up as the sheet opens (mirroring `app.jsx`'s `calProg`/`lift`). Default open affordance =
  the swipe handle (`openStyle: 'Swipe handle'` in the design).
- **Rationale**: Matches the design's interaction exactly and satisfies FR-018/FR-019 (clean view,
  swipe up to reveal, swipe down to hide). A library sheet (`@gorhom/bottom-sheet`) is an option but a
  small custom sheet reproduces the flame-lift coupling more faithfully.
- **FR-020 note**: keep the `‹ ›` month nav from the design, but **disable `›` when viewing the
  current month** (no future months) — the only deliberate deviation from the design's unrestricted
  next button.

## R5 — Persistence (scores + settings) and the fire engine

- **Decision**: Keep **@react-native-async-storage/async-storage** (Expo-compatible) for both the
  date→score map and the flame-color setting, behind `entriesStore`/`settingsStore`. The pure engine
  `fire.ts` mirrors `BonfireDesign/logic.js` exactly (same `contribution`, `computeFire`,
  `classifyDay`, `fireLabel`), so the RN behavior equals the design's.
- **Rationale**: Tiny dataset; the design already proves these rules. Reusing the design's logic
  guarantees identical fire behavior and gives a ready-made test oracle.
- **Default flame color**: Amber (the design's `TWEAK_DEFAULTS.flame`).

## R6 — Theme & palette port

- **Decision**: Port `styles.css` `:root` variables into `theme/tokens.ts` (bg-0/1/2, ink/ink-dim/
  ink-faint, heat-1..5, line, sheet) and the three flame palettes from `app.jsx` into
  `theme/palettes.ts` (Amber/Crimson/Sapphire, each = ember/amber/gold/core/red). The chosen palette
  feeds the Skia flame gradient stops and the calendar heat ramp.
- **Rationale**: Single source of truth identical to the design = visual parity (Constitution IV).

## R7 — Testing under Expo + native modules

- **Decision**: `jest-expo` preset; mock `@shopify/react-native-skia`, `react-native-reanimated`
  (its bundled mock), `react-native-gesture-handler` (its jest setup), and AsyncStorage (in-memory).
  Pure modules (`fire`, `dates`, `flameModel`, stores) are tested without rendering.
- **Rationale**: Keeps tests deterministic and fast (Constitution III) while the GPU/animation code is
  validated visually against the screenshots (quickstart).
