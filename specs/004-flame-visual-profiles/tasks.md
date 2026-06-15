# Tasks: Flame Visual Profiles

**Input**: Design documents from `specs/004-flame-visual-profiles/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by constitution and plan. Write/adjust tests before implementation tasks in each story.

**Organization**: Tasks grouped by user story for independent implementation and validation. BonfireDesign is mandatory source of truth.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in same phase after prior dependencies are complete
- **[Story]**: User story label from `spec.md`
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current context, source references, and generated task inputs before implementation.

- [X] T001 Review BonfireDesign source files `BonfireDesign/flame-profiles.js`, `BonfireDesign/flame-renderer.jsx`, `BonfireDesign/flame-catalog.css`, and `BonfireDesign/screenshots/*`
- [X] T002 [P] Review feature requirements in `specs/004-flame-visual-profiles/spec.md`
- [X] T003 [P] Review implementation plan and research decisions in `specs/004-flame-visual-profiles/plan.md` and `specs/004-flame-visual-profiles/research.md`
- [X] T004 [P] Review data model and contracts in `specs/004-flame-visual-profiles/data-model.md`, `specs/004-flame-visual-profiles/contracts/visual-profile-data.md`, `specs/004-flame-visual-profiles/contracts/renderer-profile-contract.md`, and `specs/004-flame-visual-profiles/contracts/particle-variants.md`
- [X] T005 [P] Review current flame data and active-style flow in `src/domain/flames.ts`, `src/hooks/useFlames.ts`, and `src/screens/BonfireScreen.tsx`
- [X] T006 [P] Review current Skia render hot paths in `src/components/Bonfire/Flame.tsx`, `src/components/Bonfire/Embers.tsx`, and `src/components/Bonfire/flameModel.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared data contracts and test scaffolding required by every story.

**Critical**: No story implementation should start until this phase is complete.

- [X] T007 Add `VisualProfile`, `ShapeProfile`, `TongueTransform`, `MotionProfile`, `ParticleProfile`, `AuraProfile`, `AccentProfile`, `PaletteIntent`, `DesignReference`, and `StrengthResponse` TypeScript types in `src/domain/flames.ts`
- [X] T008 Add `BONFIRE_DESIGN_SOURCE`, `DEFAULT_VISUAL_PROFILE`, and `safeVisualProfile` exports in `src/domain/flames.ts`
- [X] T009 Update the `flame()` catalog builder to accept optional `visualProfile` without changing `id`, `achievement`, `palette`, `embered`, `rarity`, or `drift` behavior in `src/domain/flames.ts`
- [X] T010 [P] Add BonfireDesign parity fixture expectations for all 20 flame ids, design numbers, variants, edges, aura kinds, accents, particle kinds, and special scale traits in `__tests__/flames.catalog.test.ts`
- [X] T011 [P] Add shared profile descriptor test scaffolding for fallback, shape, motion, particle, aura, and accent helpers in `__tests__/flameModel.test.ts`
- [X] T012 [P] Add renderer prop-wiring test scaffolding for `activeStyle`, `palette`, `dim`, and `intensity` in `__tests__/BonfireScreen.test.tsx`
- [X] T013 Add pure helper stubs for `resolveVisualProfile`, `resolveShapeDescriptor`, `resolveMotionDescriptor`, `resolveParticleDescriptors`, `resolveAuraDescriptor`, and `resolveStrengthVisuals` in `src/components/Bonfire/flameModel.ts`

**Checkpoint**: Types, fallback, catalog builder, and helper/test scaffolds exist.

---

## Phase 3: User Story 4 - BonfireDesign Catalog Parity (Priority: P1)

**Goal**: Product catalog contains all 20 BonfireDesign-derived profile rows with traceable design metadata.

**Independent Test**: Run catalog tests and verify each `FlameStyle.visualProfile` matches `BonfireDesign/flame-profiles.js` tokens and labels without rendering the app.

### Tests for User Story 4

- [X] T014 [P] [US4] Add failing tests for required `visualProfile` sections, `source`, `designNumber`, `designTier`, `tagline`, and six non-empty `designRef` labels in `__tests__/flames.catalog.test.ts`
- [X] T015 [P] [US4] Add failing tests for BonfireDesign order and identity coverage across all 20 existing flame ids in `__tests__/flames.catalog.test.ts`
- [X] T016 [P] [US4] Add failing tests for BonfireDesign special traits: `conflagration.footprint`, `nebula.footprint`, `solfire.shape.coreScale`, `ghostlight.paletteIntent.opacity`, `spectral.paletteIntent.opacity`, and `voidfire.paletteIntent.invert` in `__tests__/flames.catalog.test.ts`

### Implementation for User Story 4

- [X] T017 [US4] Add complete BonfireDesign `visualProfile` rows for Amber, Crimson, Sapphire, Sodium, Strontium, Emerald, Lilac, and Magenta in `src/domain/flames.ts`
- [X] T018 [US4] Add complete BonfireDesign `visualProfile` rows for Ghostlight, Toxic, Wisp, Ember, Spectral, Frostfire, Conflagration, and Solfire in `src/domain/flames.ts`
- [X] T019 [US4] Add complete BonfireDesign `visualProfile` rows for Voidfire, Aurora, Phoenix, and Nebula in `src/domain/flames.ts`
- [X] T020 [US4] Add all BonfireDesign `designRef` silhouette, core, aura, particles, motion, and implementation-intent labels to the 20 profile rows in `src/domain/flames.ts`
- [X] T021 [US4] Add validation helper assertions that detect missing profile tokens and missing design labels in `__tests__/flames.catalog.test.ts`

**Checkpoint**: All 20 catalog profiles statically match BonfireDesign data and labels.

---

## Phase 4: User Story 1 - Flames Have Distinct Silhouettes (Priority: P1)

**Goal**: Active flames render BonfireDesign silhouettes, shape variants, tongue transforms, edge treatments, footprint, opacity, inversion, and core-scale traits.

**Independent Test**: Equip each flame and compare its silhouette against BonfireDesign; static tests confirm renderer descriptors for all shape variants.

### Tests for User Story 1

- [X] T022 [P] [US1] Add failing shape descriptor tests for `classic`, `lance`, `split`, `forked`, `twin`, `wide`, `warped`, `detached`, `squat`, `layered`, `crystal`, `crown`, `solar`, `inverted`, `ribbon`, and `wing` in `__tests__/flameModel.test.ts`
- [X] T023 [P] [US1] Add failing fallback tests for malformed or missing profiles resolving to Amber-like safe profile descriptors in `__tests__/flameModel.test.ts`
- [X] T024 [P] [US1] Add failing `BonfireScreen` test proving `activeStyle` reaches `Flame` while `palette`, `dim`, `width`, `height`, and `lift` still pass through in `__tests__/BonfireScreen.test.tsx`

### Implementation for User Story 1

- [X] T025 [US1] Update `FlameProps` to accept `activeStyle` while preserving `fire`, `palette`, `width`, `height`, `lift`, and `dim` props in `src/components/Bonfire/Flame.tsx`
- [X] T026 [US1] Pass `activeStyle` from `useFlames` into `Flame` in `src/screens/BonfireScreen.tsx`
- [X] T027 [US1] Implement profile fallback and shape descriptor mapping for tongue transforms, edge treatment, footprint, core scale, opacity, and inverted core in `src/components/Bonfire/flameModel.ts`
- [X] T028 [US1] Replace fixed five-tongue path generation with profile-driven tongue descriptor generation in `src/components/Bonfire/Flame.tsx`
- [X] T029 [US1] Implement Skia shape support for `classic`, `lance`, `wide`, `squat`, `solar`, and `inverted` variants in `src/components/Bonfire/Flame.tsx`
- [X] T030 [US1] Implement Skia multi-tongue support for `split`, `forked`, `twin`, `crown`, `wing`, and `ribbon` variants in `src/components/Bonfire/Flame.tsx`
- [X] T031 [US1] Implement Skia support for `layered`, `detached`, `warped`, and `crystal` variants, including ghost layers, floating fragments, warped outline equivalents, and crystal edge equivalents in `src/components/Bonfire/Flame.tsx`
- [X] T032 [US1] Apply profile `paletteIntent.opacity`, `paletteIntent.invert`, `footprint`, and `shape.coreScale` to Skia layer opacity, core drawing, group scale, and core dimensions in `src/components/Bonfire/Flame.tsx`

**Checkpoint**: Each flame has a non-color silhouette difference matching BonfireDesign.

---

## Phase 5: User Story 5 - Existing Gameplay and Gallery Rules Stay Unchanged (Priority: P1)

**Goal**: Visual profiles do not alter unlock logic, selected-flame storage, gallery behavior, fire strength math, locked embered dimming, or out-state precedence.

**Independent Test**: Existing unlock, storage, gallery, palette, and fire tests pass unchanged except for intentional prop additions.

### Tests for User Story 5

- [X] T033 [P] [US5] Add regression tests proving `visualProfile` does not change achievement params, palette sampling, embered palette, rarity ordering, or drift data in `__tests__/flames.catalog.test.ts`
- [X] T034 [P] [US5] Add regression tests proving fire strength values are identical before and after profile helper resolution in `__tests__/fire.test.ts`
- [X] T035 [P] [US5] Add regression tests proving settings storage persists only flame id and no `visualProfile` data in `__tests__/settingsStore.test.ts`
- [X] T036 [P] [US5] Add regression tests proving gallery locked display, active-state display, and locked tap rejection remain unchanged in `__tests__/FlameGallery.test.tsx`
- [X] T037 [P] [US5] Add regression tests proving out-state precedence hides live flame and profile particles when fire state is `out` or `unlit` in `__tests__/BonfireScreen.test.tsx`

### Implementation for User Story 5

- [X] T038 [US5] Verify `useFlames` still derives `states`, `activeStyle`, `effectivePalette`, `dim`, and `newlyUnlocked` without storing profile data in `src/hooks/useFlames.ts`
- [X] T039 [US5] Preserve locked embered dim behavior when `activeStyle` is passed into `Flame` and `Embers` in `src/screens/BonfireScreen.tsx`
- [X] T040 [US5] Preserve out-state precedence for profile-driven flame layers and particle layers in `src/components/Bonfire/Flame.tsx` and `src/components/Bonfire/Embers.tsx`
- [X] T041 [US5] Verify settings persistence and flame equip guard still reject unavailable flames in `src/hooks/useSettings.ts`, `src/data/settingsStore.ts`, and `src/screens/BonfireScreen.tsx`

**Checkpoint**: Current gameplay, persistence, gallery, and fire math behavior remain unchanged.

---

## Phase 6: User Story 2 - Motion Expresses Elemental Identity (Priority: P2)

**Goal**: Flames use BonfireDesign motion families, speed, sway, pulse, phase lag, float, warp, ribbon, hue drift, and strength response.

**Independent Test**: Observe each flame for 5 seconds and verify motion matches BonfireDesign expectations; helper tests confirm motion descriptors.

### Tests for User Story 2

- [X] T042 [P] [US2] Add failing motion parity tests for all 20 `motion.family`, `motion.speed`, `sway`, `pulse`, `hueDrift`, `warp`, and `ribbon` values in `__tests__/flames.catalog.test.ts`
- [X] T043 [P] [US2] Add failing motion descriptor tests for smooth, harsh, low-gravity float, coal pulse, core pulse, hue drift, warped outline, ribbon wave, and per-tongue lag behavior in `__tests__/flameModel.test.ts`
- [X] T044 [P] [US2] Add failing strength-response tests proving size, motion, particle, aura, and accent scaling reads existing strength without mutating fire strength in `__tests__/flameModel.test.ts`

### Implementation for User Story 2

- [X] T045 [US2] Implement profile motion descriptor mapping for `family`, `speed`, `sway`, `pulse`, `hueDrift`, `warp`, `ribbon`, `lag`, and `float` in `src/components/Bonfire/flameModel.ts`
- [X] T046 [US2] Apply smooth and harsh flicker families plus BonfireDesign speed multipliers to tongue transforms in `src/components/Bonfire/Flame.tsx`
- [X] T047 [US2] Apply per-tongue `lag`, detached-fragment `float`, group `sway`, `pulse`, `hueDrift`, `warp`, and `ribbon` motion behavior in `src/components/Bonfire/Flame.tsx`
- [X] T048 [US2] Implement `resolveStrengthVisuals` for profile-specific size, motion, particle, aura, and accent scaling without changing `flameVisual(fire)` outputs in `src/components/Bonfire/flameModel.ts`
- [X] T049 [US2] Keep reduced-motion behavior freezing or minimizing all profile motion loops in `src/components/Bonfire/Flame.tsx` and `src/components/Bonfire/Embers.tsx`

**Checkpoint**: Motion identity matches BonfireDesign without changing gameplay math.

---

## Phase 7: User Story 3 - Particles and Aura Match Each Flame (Priority: P3)

**Goal**: Flames emit BonfireDesign particles, aura kinds, aura modifiers, and accents including rings, solar circle, shock pulse, afterimages, aurora band, and multi-variant particle mixes.

**Independent Test**: Equip every flame and verify particle/aura/accent behavior against BonfireDesign; helper tests confirm all variants and mixes.

### Tests for User Story 3

- [X] T050 [P] [US3] Add failing particle parity tests for all 20 flame `particles` arrays, including Ember, Solfire, Aurora, Phoenix, and Nebula multi-variant mixes in `__tests__/flames.catalog.test.ts`
- [X] T051 [P] [US3] Add failing aura and accent parity tests for all 20 flame `aura` and `accents` values in `__tests__/flames.catalog.test.ts`
- [X] T052 [P] [US3] Add failing particle descriptor tests for `sparks`, `motes`, `ash`, `bubbles`, `shards`, `wisps`, and `stars` in `__tests__/flameModel.test.ts`
- [X] T053 [P] [US3] Add failing aura/accent descriptor tests for `oval`, `tall`, `wide`, `circular`, `ring`, `dim`, `crisp`, `afterimage`, `shockPulse`, `solarCircle`, `orbitRing`, `voidRing`, and `auroraBand` in `__tests__/flameModel.test.ts`

### Implementation for User Story 3

- [X] T054 [US3] Update `EmbersProps` to accept `activeStyle` while preserving `palette`, `intensity`, `width`, and `height` props in `src/components/Bonfire/Embers.tsx`
- [X] T055 [US3] Pass `activeStyle` from `useFlames` into `Embers` in `src/screens/BonfireScreen.tsx`
- [X] T056 [US3] Implement particle descriptor mapping for BonfireDesign `kind`, `n`, `color`, `size`, `rise`, and `speed` controls in `src/components/Bonfire/flameModel.ts`
- [X] T057 [US3] Replace fixed fire ember seed pool with profile-driven deterministic multi-variant seed pools memoized by dimensions, profile, palette, and intensity in `src/components/Bonfire/Embers.tsx`
- [X] T058 [US3] Implement Skia particle drawing for `sparks`, `motes`, `ash`, `bubbles`, `shards`, `wisps`, and `stars` in `src/components/Bonfire/Embers.tsx`
- [X] T059 [US3] Implement aura descriptor mapping for `oval`, `tall`, `wide`, `circular`, `ring`, `dim`, and `crisp` in `src/components/Bonfire/flameModel.ts`
- [X] T060 [US3] Replace fixed halo sizing with profile-driven aura and ground-glow descriptors in `src/components/Bonfire/Flame.tsx`
- [X] T061 [US3] Implement Skia accents for `afterimage`, `shockPulse`, `solarCircle`, `orbitRing`, `voidRing`, and `auroraBand` in `src/components/Bonfire/Flame.tsx`
- [X] T062 [US3] Ensure dense particles and aura accents remain behind settings, gallery, and calendar controls in `src/components/Bonfire/Flame.tsx`, `src/components/Bonfire/Embers.tsx`, and `src/screens/BonfireScreen.tsx`

**Checkpoint**: Particle, aura, and accent identity matches BonfireDesign.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, comments, and performance/design review across all stories.

- [X] T063 [P] Update beginner-readable profile type and catalog authoring comments in `src/domain/flames.ts`
- [X] T064 [P] Update beginner-readable profile helper comments in `src/components/Bonfire/flameModel.ts`
- [X] T065 [P] Update beginner-readable Skia renderer comments explaining BonfireDesign shape, motion, aura, and accent mappings in `src/components/Bonfire/Flame.tsx`
- [X] T066 [P] Update beginner-readable particle variant comments explaining BonfireDesign particle mappings in `src/components/Bonfire/Embers.tsx`
- [X] T067 Run `npm run lint` from repository root and fix any issues in `src/domain/flames.ts`, `src/components/Bonfire/flameModel.ts`, `src/components/Bonfire/Flame.tsx`, `src/components/Bonfire/Embers.tsx`, `src/screens/BonfireScreen.tsx`, and `__tests__/`
- [X] T068 Run `npm test` from repository root and fix any failures in `src/domain/flames.ts`, `src/components/Bonfire/flameModel.ts`, `src/components/Bonfire/Flame.tsx`, `src/components/Bonfire/Embers.tsx`, `src/screens/BonfireScreen.tsx`, and `__tests__/`
- [ ] T069 Run manual BonfireDesign parity validation from `specs/004-flame-visual-profiles/quickstart.md` using `BonfireDesign/flame-profiles.js`, `BonfireDesign/flame-renderer.jsx`, `BonfireDesign/flame-catalog.css`, and all files in `BonfireDesign/screenshots/*`
- [ ] T070 Run SC-006 silent-clip identity validation by recording short silent clips for all 20 flames andW confirming reviewers identify at least 80% of flame identities in `specs/004-flame-visual-profiles/quickstart.md`
- [ ] T071 Run manual performance validation with a concrete FPS/frame-timing tool for flame switching, gallery open/close, and calendar open/close, recording evidence that flame rendering stays >=120 FPS and UI interactions stay >=60 FPS in `specs/004-flame-visual-profiles/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup; blocks all story work
- **US4 Catalog Parity (Phase 3)**: Depends on Foundational; should finish before renderer stories because it supplies source data
- **US1 Silhouettes (Phase 4)**: Depends on Foundational and benefits from US4 profile data
- **US5 Invariants (Phase 5)**: Depends on Foundational and should run alongside/after US1 wiring changes
- **US2 Motion (Phase 6)**: Depends on US1 profile-driven tongue renderer
- **US3 Particles/Aura (Phase 7)**: Depends on US4 profile data and can run after US1 wiring; aura accents depend on US1 flame renderer
- **Polish (Phase 8)**: Depends on all desired stories

### User Story Dependencies

- **US4 (P1)**: Static catalog parity; no dependency on other stories after Foundation
- **US1 (P1)**: Shape renderer; depends on Foundation and uses US4 profile rows
- **US5 (P1)**: Regression guard; depends on Foundation and profile wiring from US1/US3 where relevant
- **US2 (P2)**: Motion renderer; depends on US1 shape descriptor and render path
- **US3 (P3)**: Particles/aura renderer; depends on US4 profile data and US1 flame renderer

### Parallel Opportunities

- T002-T006 can run in parallel after T001
- T010-T012 can run in parallel after T007-T009
- T014-T016 can run in parallel before T017-T021
- T022-T024 can run in parallel before T025-T032
- T033-T037 can run in parallel before T038-T041
- T042-T044 can run in parallel before T045-T049
- T050-T053 can run in parallel before T054-T062
- T063-T066 can run in parallel after story implementation

---

## Parallel Example: User Story 4

```bash
Task: "T014 [P] [US4] Add required visualProfile section tests in __tests__/flames.catalog.test.ts"
Task: "T015 [P] [US4] Add BonfireDesign order and identity tests in __tests__/flames.catalog.test.ts"
Task: "T016 [P] [US4] Add BonfireDesign special trait tests in __tests__/flames.catalog.test.ts"
```

## Parallel Example: User Story 1

```bash
Task: "T022 [P] [US1] Add shape descriptor tests in __tests__/flameModel.test.ts"
Task: "T023 [P] [US1] Add fallback tests in __tests__/flameModel.test.ts"
Task: "T024 [P] [US1] Add Flame activeStyle wiring test in __tests__/BonfireScreen.test.tsx"
```

## Parallel Example: User Story 5

```bash
Task: "T033 [P] [US5] Add catalog invariance tests in __tests__/flames.catalog.test.ts"
Task: "T034 [P] [US5] Add fire strength invariance tests in __tests__/fire.test.ts"
Task: "T035 [P] [US5] Add settings storage tests in __tests__/settingsStore.test.ts"
Task: "T036 [P] [US5] Add gallery regression tests in __tests__/FlameGallery.test.tsx"
Task: "T037 [P] [US5] Add out-state precedence tests in __tests__/BonfireScreen.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T042 [P] [US2] Add motion parity tests in __tests__/flames.catalog.test.ts"
Task: "T043 [P] [US2] Add motion descriptor tests in __tests__/flameModel.test.ts"
Task: "T044 [P] [US2] Add strength-response tests in __tests__/flameModel.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T050 [P] [US3] Add particle parity tests in __tests__/flames.catalog.test.ts"
Task: "T051 [P] [US3] Add aura and accent parity tests in __tests__/flames.catalog.test.ts"
Task: "T052 [P] [US3] Add particle descriptor tests in __tests__/flameModel.test.ts"
Task: "T053 [P] [US3] Add aura/accent descriptor tests in __tests__/flameModel.test.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US4) so the product catalog carries all BonfireDesign profile data.
3. Complete Phase 4 (US1) so users can see distinct BonfireDesign silhouettes.
4. Stop and validate static catalog parity plus silhouette rendering before adding richer motion/particles.

### Incremental Delivery

1. US4: BonfireDesign profile data and traceability.
2. US1: Visible shape/silhouette identity.
3. US5: Regression guard for unlock/storage/gallery/fire math.
4. US2: BonfireDesign motion identity.
5. US3: BonfireDesign particles, aura, and accents.
6. Polish: comments, lint, tests, manual parity, silent-clip identity validation, performance validation.

### Parallel Team Strategy

1. Team completes Setup and Foundational together.
2. One developer implements US4 catalog data while another prepares US1 renderer tests.
3. After profile rows exist, renderer work can split between US1 shape, US2 motion, and US3 particles/aura.
4. US5 regression tests should run throughout wiring changes to catch behavior drift.
