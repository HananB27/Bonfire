# Tasks: Flame Visual Profiles

**Input**: Design documents from `/specs/004-flame-visual-profiles/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by Bonfire Constitution. Write/update tests before implementation in each phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm active artifacts and current code entry points before touching implementation.

- [ ] T001 Review profile requirements and contracts in specs/004-flame-visual-profiles/spec.md, specs/004-flame-visual-profiles/data-model.md, and specs/004-flame-visual-profiles/contracts/visual-profile-data.md
- [ ] T002 Review renderer and particle contracts in specs/004-flame-visual-profiles/contracts/renderer-profile-contract.md and specs/004-flame-visual-profiles/contracts/particle-variants.md
- [ ] T003 Review current flame catalog and active-style flow in src/domain/flames.ts, src/hooks/useFlames.ts, and src/screens/BonfireScreen.tsx
- [ ] T004 Review current Skia render hot paths in src/components/Bonfire/Flame.tsx, src/components/Bonfire/Embers.tsx, and src/components/Bonfire/flameModel.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add typed profile contracts and safe defaults that all user stories depend on.

**Critical**: No user story work can begin until this phase is complete.

- [ ] T005 Add VisualProfile, ShapeProfile, MotionProfile, ParticleProfile, AuraProfile, StrengthResponse, and variant union types to src/domain/flames.ts
- [ ] T006 Add an Amber-like DEFAULT_VISUAL_PROFILE fallback and safe profile getter/export in src/domain/flames.ts
- [ ] T007 [P] Add profile validation test helpers in __tests__/flames.catalog.test.ts for required sections, numeric bounds, variant names, and no missing visualProfile data
- [ ] T008 [P] Add pure helper test scaffolding in __tests__/flameModel.test.ts for profile strength response and renderer descriptor mapping
- [ ] T009 Add catalog builder support for visualProfile while preserving existing palette, embered palette, achievement, rarity, and drift behavior in src/domain/flames.ts

**Checkpoint**: Profile types and fallback exist; catalog can carry profile data without renderer changes.

---

## Phase 3: User Story 1 - Flames Have Distinct Silhouettes (Priority: P1) - MVP

**Goal**: Every active flame has data-driven shape traits, and `Flame.tsx` renders reusable silhouette variants without per-flame id branches.

**Independent Test**: Equip each of the 20 flames and verify its visible silhouette differs from Amber by tongue count, proportions, or shared shape variant, without relying only on color.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add catalog assertions for all 20 flame shape profiles and feature-map identities in __tests__/flames.catalog.test.ts
- [ ] T011 [P] [US1] Add shape descriptor and fallback behavior tests in __tests__/flameModel.test.ts
- [ ] T012 [US1] Add BonfireScreen prop-wiring regression test proving activeStyle reaches Flame while palette and dim still reach Flame in __tests__/BonfireScreen.test.tsx

### Implementation for User Story 1

- [ ] T013 [US1] Add complete visualProfile.shape data for all 20 existing flames in src/domain/flames.ts
- [ ] T014 [US1] Update FlameProps to accept activeStyle while keeping palette and dim props in src/components/Bonfire/Flame.tsx
- [ ] T015 [US1] Pass activeStyle from useFlames into Flame in src/screens/BonfireScreen.tsx
- [ ] T016 [US1] Add pure shape descriptor helpers that map ShapeProfile to reusable tongue geometry inputs in src/components/Bonfire/flameModel.ts
- [ ] T017 [US1] Replace fixed five-tongue geometry with profile-driven reusable tongue descriptors in src/components/Bonfire/Flame.tsx
- [ ] T018 [US1] Add shared shape variant drawing support for classic, split, forked, jagged, twin, lance, crown, ribbon, wing, layered, warped, and detached variants in src/components/Bonfire/Flame.tsx
- [ ] T019 [US1] Ensure missing or invalid visualProfile falls back to DEFAULT_VISUAL_PROFILE in src/components/Bonfire/Flame.tsx

**Checkpoint**: US1 complete; 20 flame silhouettes are data-driven and independently testable.

---

## Phase 4: User Story 4 - Existing Gameplay and Gallery Rules Stay Unchanged (Priority: P1)

**Goal**: Visual profiles do not change unlock logic, storage, gallery behavior, fire strength math, locked embered state, or out-state precedence.

**Independent Test**: Run existing unlock, storage, gallery, and fire-strength scenarios; outcomes stay identical except rendered visuals.

### Tests for User Story 4

- [ ] T020 [P] [US4] Extend catalog tests to assert visualProfile does not modify achievement, palette, embered palette, rarity, or drift fields in __tests__/flames.catalog.test.ts
- [ ] T021 [P] [US4] Add BonfireScreen regression tests proving activeStyle reaches Embers, palette/dim behavior remains locked-embered, and storage selection behavior is unchanged in __tests__/BonfireScreen.test.tsx
- [ ] T022 [P] [US4] Add gallery regression tests proving locked display, active-state display, and locked-tap rejection remain unchanged in __tests__/FlameGallery.test.tsx
- [ ] T023 [P] [US4] Add or update fire strength invariance tests proving profile data does not change fire strength values in __tests__/fire.test.ts

### Implementation for User Story 4

- [ ] T024 [US4] Pass activeStyle from useFlames into Embers while preserving effectivePalette and intensity props in src/screens/BonfireScreen.tsx
- [ ] T025 [US4] Update EmbersProps to accept activeStyle while preserving palette-derived color behavior in src/components/Bonfire/Embers.tsx
- [ ] T026 [US4] Preserve out-state precedence and locked embered dim handling after profile wiring in src/components/Bonfire/Flame.tsx and src/components/Bonfire/Embers.tsx
- [ ] T027 [US4] Verify useFlames return shape, existing settings persistence, and FlameRow locked/active presentation remain unchanged in src/hooks/useFlames.ts, src/hooks/useSettings.ts, and src/components/Settings/FlameRow.tsx

**Checkpoint**: US4 complete; existing behavior is guarded before advanced motion and particles are added.

---

## Phase 5: User Story 2 - Motion Expresses Elemental Identity (Priority: P2)

**Goal**: Flame motion and profile-specific strength response express identity without changing fire strength math or adding per-frame JS work.

**Independent Test**: Observe each flame for 5 seconds and verify profile-defined flicker, sway, stretch, pulse, hue shift, low-gravity feel, and strength response match the catalog.

### Tests for User Story 2

- [ ] T028 [P] [US2] Add motion profile assertions for all 20 flames in __tests__/flames.catalog.test.ts
- [ ] T029 [P] [US2] Add strength response helper tests for size, motion, particle, and aura scaling without fire strength mutation in __tests__/flameModel.test.ts

### Implementation for User Story 2

- [ ] T030 [US2] Add complete visualProfile.motion and visualProfile.strengthResponse data for all 20 flames in src/domain/flames.ts
- [ ] T031 [US2] Add pure profile motion and strength response resolver helpers in src/components/Bonfire/flameModel.ts
- [ ] T032 [US2] Apply profile flickerSpeed, sway, stretch, pulse, hueShift, gravity, and strengthResponse values to derived transforms in src/components/Bonfire/Flame.tsx
- [ ] T033 [US2] Keep reduced-motion behavior and UI-thread clock behavior intact while adding profile motion in src/components/Bonfire/Flame.tsx

**Checkpoint**: US2 complete; motion identity works independently on top of US1/US4.

---

## Phase 6: User Story 3 - Particles and Aura Match Each Flame (Priority: P3)

**Goal**: Each flame emits profile-driven particles and aura accents that match its elemental identity using shared configurable effects.

**Independent Test**: Equip every flame and verify particle variant, count, size, rise speed, drift, color source, motif, halo shape, intensity, secondary glows, and ring/orbit accents match the feature map.

### Tests for User Story 3

- [ ] T034 [US3] Add particle and aura profile assertions for all 20 flames in __tests__/flames.catalog.test.ts
- [ ] T035 [US3] Add particle variant descriptor tests for sparks, motes, ash, bubbles, shards, wisps, and stars in __tests__/flameModel.test.ts
- [ ] T036 [P] [US3] Add palette-derived particle color regression tests for non-orange variants in __tests__/palettes.test.ts

### Implementation for User Story 3

- [ ] T037 [US3] Add complete visualProfile.particles and visualProfile.aura data for all 20 flames in src/domain/flames.ts
- [ ] T038 [US3] Add pure particle descriptor helpers for count, size, rise speed, drift, color source, motif, and bounded density in src/components/Bonfire/flameModel.ts
- [ ] T039 [US3] Update Embers seed generation to memoize by dimensions and particle profile without regenerating seeds every render in src/components/Bonfire/Embers.tsx
- [ ] T040 [US3] Implement shared Embers particle variants sparks, motes, ash, bubbles, shards, wisps, and stars in src/components/Bonfire/Embers.tsx
- [ ] T041 [US3] Add profile-driven aura halo shapes, secondary glows, afterimage, ring, orbit, shock pulse, solar circle, crisp halo, and aurora band effects in src/components/Bonfire/Flame.tsx
- [ ] T042 [US3] Ensure dense particles and aura accents remain behind the UI and do not obscure settings, gallery, or calendar controls in src/components/Bonfire/Flame.tsx and src/components/Bonfire/Embers.tsx

**Checkpoint**: US3 complete; particle and aura identities are visible and reusable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate performance, documentation, comments, and full feature behavior across all stories.

- [ ] T043 [P] Update beginner-readable headers and non-obvious inline comments for profile types and catalog authoring rules in src/domain/flames.ts
- [ ] T044 [P] Update beginner-readable headers and non-obvious inline comments for profile-driven Skia rendering in src/components/Bonfire/Flame.tsx
- [ ] T045 [P] Update beginner-readable headers and non-obvious inline comments for particle variants in src/components/Bonfire/Embers.tsx
- [ ] T046 Run quickstart static validation commands npm run lint and npm test from specs/004-flame-visual-profiles/quickstart.md
- [ ] T047 Run manual visual validation for all 20 flames, particle variants, and the SC-005 silent-clip identity recognition check using specs/004-flame-visual-profiles/quickstart.md
- [ ] T048 Profile-check flame switching and gallery/calendar interaction against >=120 FPS flame and >=60 FPS UI targets documented in specs/004-flame-visual-profiles/plan.md
- [ ] T049 Fix any lint, test, performance, readability, or visual regressions found during T046-T048 in src/domain/flames.ts, src/components/Bonfire/Flame.tsx, src/components/Bonfire/Embers.tsx, src/components/Bonfire/flameModel.ts, src/screens/BonfireScreen.tsx, and __tests__/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational; MVP visual-profile data and silhouette renderer.
- **US4 (Phase 4)**: Depends on Foundational and should run immediately after US1 to guard invariants.
- **US2 (Phase 5)**: Depends on US1 and US4 because it builds on activeStyle/profile wiring.
- **US3 (Phase 6)**: Depends on US1 and US4; can run in parallel with US2 after those are complete.
- **Polish (Phase 7)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 (P1)**: Start after Foundational; no dependency on US2/US3/US4.
- **US4 (P1)**: Start after Foundational; most valuable after US1 wiring exists.
- **US2 (P2)**: Start after US1/US4; motion uses profile shape/wiring foundation.
- **US3 (P3)**: Start after US1/US4; particles/aura use profile wiring and can proceed alongside US2.

### Within Each User Story

- Tests first; they should fail or expose missing profile behavior before implementation.
- Catalog data before renderer behavior that consumes that data.
- Pure helper changes before component integration.
- Component integration before manual quickstart validation.

---

## Parallel Opportunities

- T007 and T008 can run in parallel after T005-T006.
- T010 and T011 can run in parallel before T013; T012 can run after BonfireScreen mocking context is understood.
- T020, T021, T022, and T023 can run in parallel because they target different test files.
- T028 and T029 can run in parallel.
- T036 can run in parallel with T034/T035, but T034 and T035 must be coordinated with US2 tasks that touch the same test files.
- T043, T044, and T045 can run in parallel after implementation stabilizes.
- After US1 and US4 are complete, US2 and US3 can be implemented in parallel by different developers, with coordination on src/components/Bonfire/flameModel.ts.

## Parallel Example: User Story 3

```bash
Task: "T036 [P] [US3] Add palette-derived particle color regression tests for non-orange variants in __tests__/palettes.test.ts"
```

T034 and T035 are intentionally not marked [P] because they touch the same files as US2 test tasks.

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational profile types and fallback.
3. Complete Phase 3: US1 silhouette profiles and generic renderer shape support.
4. Stop and validate: all 20 flames have non-color shape identity, and existing tests still pass.

### Incremental Delivery

1. US1: catalog carries profile data and Flame renders distinct silhouettes.
2. US4: invariants locked down so gameplay/storage/gallery/fire math cannot regress.
3. US2: add profile motion and strength response.
4. US3: add particle variants and aura accents.
5. Polish: run lint/tests/manual validation/performance pass.

### Parallel Team Strategy

1. One developer completes foundational types and fallback.
2. One developer writes catalog/profile tests while another prepares pure helper tests.
3. After US1/US4, split US2 motion and US3 particles/aura across two developers.
4. Rejoin for performance validation because Flame.tsx, Embers.tsx, and flameModel.ts share render-path risk.

## Notes

- [P] tasks touch different files or can proceed without dependencies on incomplete tasks.
- [US1], [US2], [US3], [US4] labels map directly to spec user stories.
- Preserve no-new-packages constraint.
- Preserve `palette` + `dim` locked embered behavior.
- Avoid per-flame hardcoded render branches; profile flags select shared effects.
- Keep animation UI-thread driven; avoid per-frame React state or JS allocation loops.
