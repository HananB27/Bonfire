---
description: "Task list for Achievement-Locked Flame Styles"
---

# Tasks: Achievement-Locked Flame Styles

**Input**: Design documents from `specs/002-achievement-flame-unlocks/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (flame-catalog,
achievement-engine, settings-store, flame-gallery)

**Tests**: INCLUDED — Constitution III (Testing Standards) is NON-NEGOTIABLE and the plan requests
exhaustive engine tests. Pure-domain tasks ship with their tests.

**Brownfield note**: Extends the existing Bonfire app (feature 001). `src/domain/fire.ts`
(`computeFire`) and `__tests__/fire.test.ts` stay UNCHANGED — richer metrics live in a new module.
**No new packages** are added.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US6 (user-story phases only)
- Paths are repository-root relative.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm a clean baseline and the no-new-deps constraint before changes.

- [X] T001 Verify baseline is green and dependency-frozen: run `npm run lint` and `npm test` (all pass on the current tree); confirm `package.json` will gain NO new dependencies for this feature.

**Checkpoint**: Baseline green, constraint recorded.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared derived-state spine every user story needs — pure metrics, the editable
catalog, the achievement engine, settings v2, the hooks, and the `dim` flame knob.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

- [X] T002 [P] Add a Monday-based `startOfWeek(dateKey)` helper (and ensure `addDays`/`diffDays` are exported) in `src/domain/dates.ts`, for the calendar-week conditions.
- [X] T003 [P] Extend `src/theme/palettes.ts`: keep `Palette`; add `paletteFromGradient(stops: string[]): Palette` (sample cool→hot into `{red,ember,amber,gold,core}`), `emberedPalette(p: Palette): Palette` (desaturate toward luma ~70% + darken ~0.5), and `EMBERED_DIM = 0.45`. Keep the legacy `FlameColor`→stops map for migration only.
- [X] T004 [P] Unit test the palette helpers in `__tests__/palettes.test.ts`: sampling order (cool stop→`red`, hot stop→`core`), `emberedPalette` desaturates+darkens and `emberedPalette(p) !== p` for every stop (guards the Ember-flame vs "embered"-state naming collision), all stops valid hex.
- [X] T005 Create `src/domain/fireMetrics.ts`: `computeMetrics(entries, today): RunMetrics` — one deterministic walk (same rules as `computeFire`, today injected) returning `runStart/runDays/runSpanDays/unbrokenChain/strongDaysInRun/perfectDaysInRun/scoreSumInRun/comebacks/timeline` (per contracts/achievement-engine.md). `comebacks` store `{relightDay, endDay, peak}` only — the day a run crosses a specific strength threshold is derived later from `timeline` (U1). Depends on T002.
- [X] T006 Unit test `src/domain/fireMetrics.ts` in `__tests__/fireMetrics.test.ts`: the oracle table (7-straight, gap-tolerant run, 2-gap reset, out→zeros, comeback detection); assert order-independence. Depends on T005.
- [X] T007 Create `src/domain/flames.ts`: the editable catalog `FLAMES` (all 20 entries — 1 base + 8 streak + 11 time — from spec Appendix A with the `kind`/`params`/`windowDays` table in contracts/flame-catalog.md; `ember` and `phoenix` use the research-R6 rules, not the looser Appendix prose), `BASE_FLAME_ID='amber'`, `flameById(id)`; build each entry's `palette` (`paletteFromGradient`) and `embered` (`emberedPalette`). Depends on T002, T003.
- [X] T008 [P] Catalog invariants test in `__tests__/flames.catalog.test.ts`: ids unique, exactly one base (null achievement), every other flame has an achievement, every `time` flame has a positive `windowDays`, every flame has `palette`+`embered`, `rarity` strictly ascending with all time > all streak > base (SC-009), non-empty `requirement`. Depends on T007.
- [X] T009 Create `src/domain/achievements.ts`: one pure evaluator per `ConditionKind` plus `evaluateFlame(flame, m, fire, today)` and `evaluateAll(flames, entries, today, fire)`, applying the final gate — streak: `lit && condition`; time: latest completion `D`, `unlocked = D!==null && today ≤ D+windowDays && lit`, plus `daysLeft`/`expired` (contracts/achievement-engine.md). Depends on T005, T007, T002.
- [X] T010 Unit test `src/domain/achievements.ts` in `__tests__/achievements.test.ts`: oracle rows #1–#10 — streak satisfy/relock-on-out/relock-on-edit; time unlock today, `today=D+W` unlocked, `today=D+W+1` expired, in-window-but-out → locked then relight → unlocked, expired→re-complete resets window, backfilled-expired stays locked. Depends on T009.
- [X] T011 [P] Migrate `src/data/settingsStore.ts` to v2 schema `{ flameStyle: FlameId }` under key `bonfire.settings.v2`; `loadSettings` reads v2, else migrates v1 `flameColor` (`Amber→'amber'`/`Crimson→'crimson'`/`Sapphire→'sapphire'`) and writes forward; validate id against the catalog; default `'amber'`; never throw. Depends on T007.
- [X] T012 [P] Update `__tests__/settingsStore.test.ts`: v2 default, v1→v2 migration, unknown/corrupt id → `'amber'`, save→load round-trip. Depends on T011.
- [X] T013 Update `src/hooks/useSettings.ts`: replace `setFlameColor` with `setFlameStyle(id: FlameId)` (validate via `flameById`, accept locked ids per FR-012), keep `ready`. Depends on T011.
- [X] T014 Create `src/hooks/useFlames.ts`: `useFlames(entries, today, fire, flameStyleId)` returning `states` (memoized `evaluateAll` keyed on `entries,today,fire.state,fire.strength`), `activeStyle`, `activeUnlocked`, `effectivePalette` (`unlocked ? palette : embered`), `dim` (`unlocked ? 1 : EMBERED_DIM`). MUST keep evaluation out of any render/worklet path (SC-010). Depends on T009, T003, T013.
- [X] T015 [P] Minimal edit `src/components/Bonfire/Flame.tsx`: add optional `dim?: number` (default 1) scaling `glow`/`bright`; colors still come from the `palette` prop. No behavior change when `dim===1`.

**Checkpoint**: The pure engine + catalog + settings v2 + hooks compile and their unit tests pass. UI can now consume `useFlames`.

---

## Phase 3: User Story 1 - Earn and equip a flame (Priority: P1) 🎯 MVP

**Goal**: Meeting an achievement unlocks its flame; the user equips it from the gallery and the bonfire recolors immediately, no restart.

**Independent Test**: From a fresh state, log scores until a flame's condition is met → it flips to unlocked → equip it → the flame renders in the new style.

- [X] T016 [P] [US1] Create `src/components/Settings/FlameRow.tsx` (minimal): a row showing the flame's gradient swatch (`expo-linear-gradient` over `gradient`/`embered`), name, active ✓, and unlocked/locked label.
- [X] T017 [US1] Create `src/components/Settings/FlameGallery.tsx`: lazy `Modal` + `ScrollView` of `FlameRow`s in catalog order; `onEquip(id)` for unlocked flames; closes on equip. Depends on T016.
- [X] T018 [US1] Edit `src/components/Settings/SettingsSheet.tsx`: the gear now opens `FlameGallery` (remove the Amber/Crimson/Sapphire color picker); pass `states`, active `flameStyle`, and `onEquip`. Depends on T017.
- [X] T019 [US1] Wire `src/screens/BonfireScreen.tsx`: call `useFlames(entries, today, fire, settings.flameStyle)`; feed `effectivePalette` + `dim` into `Flame` and `Embers`; pass `states`/`flameStyle`/`setFlameStyle` to `SettingsSheet`. Depends on T014, T015, T018.
- [X] T020 [US1] Behavior test `__tests__/BonfireScreen.test.tsx` (extend): scoring to meet a streak condition marks that flame unlocked in `states`; equipping it switches `effectivePalette`; default state shows only `amber` equippable. Depends on T019.

**Checkpoint**: Earn → equip → recolor works end-to-end (MVP).

---

## Phase 4: User Story 2 - Streak flames peter out when the fire goes out (Priority: P2)

**Goal**: A streak flame is unlocked only while its run satisfies it; the fire going out relocks it, and an equipped one renders embered after relight until re-earned (out-state visuals win while out).

**Independent Test**: Earn+equip a streak flame, let 2 days lapse → fire out + flame locked + no flame drawn; relight → embered until condition re-met → full.

- [X] T021 [US2] Confirm out-state precedence in `src/screens/BonfireScreen.tsx`: when `fire.state!=='lit'` the existing Hearth/smoke path renders and `Flame` stays hidden (no embered flame while out); when lit + locked, `effectivePalette=embered`+`dim` applies. Depends on T019.
- [X] T022 [US2] Behavior test `__tests__/BonfireScreen.test.tsx` (extend): equip streak flame → advance 2 unscored days → `states[flame].unlocked===false` and no flame canvas drawn; relight → embered palette; re-meet condition → full. (Engine relock already covered by T010.) Depends on T021.

**Checkpoint**: Streak relock + embered-after-relight verified on screen.

---

## Phase 5: User Story 3 - Time flames expire after their window (Priority: P2)

**Goal**: A time flame unlocks on its achievement day, stays unlocked through `D+W` inclusive while lit, expires after, resets on re-completion (no banking), and is voided while the fire is out.

**Independent Test**: Earn a time flame → countdown shows `W`; advance past `D+W` → expired+locked+embered; re-complete → window resets; go out in-window → locked, relight → unlocked.

- [X] T023 [US3] In `src/components/Settings/FlameRow.tsx`, render the time-flame status from `AchievementState`: unlocked → "Nd left"; expired → "Expired — re-earn". Depends on T016.
- [X] T024 [US3] Tests: extend `__tests__/achievements.test.ts` for the expire/`D+W`-inclusive/re-earn/fire-out-voids cases, plus an explicit **earn→lose→earn-again** cycle proving flames are re-earnable indefinitely (FR-022); and `__tests__/FlameGallery.test.tsx` for the countdown/expired text (UI). Depends on T023, T010.

**Checkpoint**: Time expiry, re-earn, and the lit-gate behave per FR-007/007a/008/009.

---

## Phase 6: User Story 4 - Gallery teasers with live progress (Priority: P3)

**Goal**: Every flame is visible with name, colors, requirement, and live progress (streak `value/target`; time days-left / re-earn).

**Independent Test**: Open the gallery mid-run → each locked flame shows its requirement and a progress value that updates as scores are logged.

- [X] T025 [US4] Flesh out `src/components/Settings/FlameRow.tsx`: all four states (unlocked / locked-streak with `progress.value/target` bar / locked-time partial / expired re-earn), requirement text, and accessibility labels (`accessibilityRole="radio"`, selected state). Depends on T016, T023.
- [X] T026 [US4] Flesh out `src/components/Settings/FlameGallery.tsx`: tier headers (Base → Streak → Time) in rarity order, active ✓, scrollable full catalog. Depends on T025.
- [X] T027 [P] [US4] Gallery test `__tests__/FlameGallery.test.tsx` (extend): locked streak at run 4/7 shows "4/7"; unlocked time shows "Nd left"; expired shows re-earn; every locked row shows name+colors+requirement (SC-008). Depends on T026.

**Checkpoint**: Full legible catalog with progress.

---

## Phase 7: User Story 5 - Editing past days recomputes deterministically (Priority: P3)

**Goal**: Backfills/edits recompute unlock states order-independently; a backfilled-but-expired time completion grants nothing; clearing a day can relock a streak flame.

**Independent Test**: Reach a calendar two different edit orders → identical unlocked set.

- [X] T028 [P] [US5] Property/regression tests in `__tests__/achievements.test.ts`: two orderings of the same edit set → identical `states` map (SC-005); clearing a day drops the run below a streak cond → relock (US5.2); a time cond completed only by an old backfilled day stays locked (US5.4). (Engine is already pure; this locks the behavior in.) Depends on T009.

**Checkpoint**: Order-independence proven by tests.

---

## Phase 8: User Story 6 - Embered preview of a not-yet-earned flame (Priority: P4)

**Goal**: The user can equip any flame (even locked); a locked equipped flame renders embered and bursts to full automatically when earned. Amber never embers.

**Independent Test**: Equip a locked flame → fire shows embered variant → meet the achievement → full color, no further action.

- [X] T029 [US6] Allow equipping locked flames in `src/components/Settings/FlameGallery.tsx` (`onEquip` accepts any id, not only unlocked) with a subtle "preview" affordance on locked rows. Depends on T026.
- [X] T030 [US6] Test `__tests__/BonfireScreen.test.tsx` (extend): equip a locked flame → `effectivePalette===embered` + `dim<1`; meeting its achievement flips to full automatically; equipping `amber` is always full. Depends on T029.

**Checkpoint**: Embered preview + auto-burst verified.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: The user's plan-level asks (full-screen swipe, no-drop switching) plus cleanup and final validation.

- [X] T031 [P] Full-screen swipe-to-open (FR-025) in `src/components/Calendar/CalendarSheet.tsx`: add a full-screen upward `Gesture.Pan` overlay (z below the gear/dev pill, `pointerEvents="box-none"`, `activeOffsetY([-12, 9999])`) that drives the existing `progress` shared value; keep the bottom handle as the visible affordance; verify a gear tap (no drag) does NOT open the calendar (contracts/flame-gallery.md "Full-screen swipe").
- [X] T032 [P] Performance guard for flame switching (SC-010): confirm `useFlames`' `evaluateAll` is memoized and never called inside Skia render or a worklet; switching flames only swaps the palette prop. Add a comment asserting the invariant in `src/hooks/useFlames.ts` and a lightweight render-count test if practical.
- [X] T033 [P] Remove the now-dead color-picker code paths in `src/components/Settings/SettingsSheet.tsx` (and any `FlameColor`-only UI), keeping `FlameColor` solely where v1→v2 migration needs it.
- [X] T034 [P] Comments pass (Constitution II): header + plain-language inline comments on `src/domain/fireMetrics.ts`, `src/domain/achievements.ts`, `src/domain/flames.ts`, `src/hooks/useFlames.ts` — explain the run walk, the time-window math, and the memoization.
- [X] T035 [P] Unlock feedback (FR-023, SHOULD): when a flame transitions locked→unlocked, give brief in-app feedback — e.g. a one-shot highlight/scale on its `FlameGallery` row and/or a subtle flash on the fire. Compute the transition from `useFlames` state without persisting anything. Files: `src/hooks/useFlames.ts` (expose newly-unlocked ids since last render), `src/components/Settings/FlameRow.tsx`.
- [X] T036 Run `npm run lint` and `npm test` — all green; confirm `package.json` is unchanged (no new dependencies).
- [ ] T037 Run `specs/002-achievement-flame-unlocks/quickstart.md` manual validation on a device/emulator (all checks incl. earn→equip, streak relock, time expire/re-earn, gallery teasers, embered preview, backfill determinism, full-screen swipe, unlock feedback, performance).

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (P1)**: none.
- **Foundational (P2)**: after Setup. BLOCKS all user stories.
- **User stories (P3–P8)**: after Foundational. US1 first (MVP). US2/US3 depend on US1's screen wiring (T019) for their on-screen checks; US4 extends US1/US3's gallery; US5 is engine-only tests; US6 extends US4's gallery.
- **Polish (P9)**: after the desired stories.

### Key task dependencies

- T005→T006; T007→{T008, T009, T011}; T009→{T010, T014}; T011→{T012, T013}; T013→T014; T014+T015+T018→T019.
- US gallery chain: T016→T017→T018→T019→T020; T023/T025→T026→{T027, T029}.

### Parallel opportunities

- Setup: n/a (single task).
- Foundational kickoff in parallel: **T002, T003, T015** (independent files). Then T004‖(T005), and after T007: **T008 ‖ T011** (different files).
- US1: T016 is `[P]` (new file) while T021/T022 wait on T019.
- US4 test T027 `[P]`; US5 test T028 `[P]`; Polish T031–T035 are `[P]` (different files).

---

## Parallel Example: Foundational kickoff

```bash
# Independent new/edited files — start together:
Task: "T002 add startOfWeek in src/domain/dates.ts"
Task: "T003 add palette helpers in src/theme/palettes.ts"
Task: "T015 add dim prop in src/components/Bonfire/Flame.tsx"
# After T007 (catalog) lands:
Task: "T008 catalog invariants test in __tests__/flames.catalog.test.ts"
Task: "T011 settings v2 + migration in src/data/settingsStore.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational (the whole derived-state spine) → 3. Phase 3 US1 →
4. **STOP & VALIDATE**: earn a streak flame, equip it, watch the flame recolor live → 5. Demo.

### Incremental delivery

Foundational → US1 (MVP: earn+equip) → US2 (streak relock/embered) → US3 (time expire/re-earn) →
US4 (rich gallery) → US5 (determinism tests) → US6 (embered preview) → Polish (full-screen swipe,
perf, cleanup, quickstart). Each story is independently testable and adds value without breaking
prior ones. `src/domain/fire.ts` + `__tests__/fire.test.ts` remain untouched throughout.

## Notes

- `[P]` = different files, no incomplete dependency.
- The entire flame catalog (visuals, conditions, windows) is `src/domain/flames.ts` — the single file
  to edit for tuning (the "easy to change" requirement).
- No new dependencies; gallery uses core RN `Modal`/`ScrollView` + existing `expo-linear-gradient`.
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.
