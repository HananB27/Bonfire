# Implementation Plan: Flame Visual Profiles

**Branch**: `main` (no feature branch; spec dir `004-flame-visual-profiles`) | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-flame-visual-profiles/spec.md`

## Summary

Add a data-driven `visualProfile` to the existing 20 flame catalog entries so each flame differs by
shape, motion, particles, aura, and optional strength response rather than color alone. Keep the
achievement unlock engine, selected-flame storage, gallery behavior, and fire strength calculation
unchanged. `BonfireScreen` will pass the active `FlameStyle` from `useFlames` into `Flame` and
`Embers` while continuing to pass the effective `palette` and `dim` value for locked embered state.

The renderer remains generic: `Flame.tsx` reads profile values and selects reusable Skia effects
instead of branching by flame id. `Embers.tsx` grows from sparks only to shared particle variants
(`sparks`, `motes`, `ash`, `bubbles`, `shards`, `wisps`, `stars`) driven by profile data. V1 favors
shared configurable effects over bespoke one-off render code.

## Technical Context

**Language/Version**: TypeScript strict on Expo SDK 56 / React Native 0.85.3 / React 19.2.3

**Primary Dependencies**: Existing Expo app, @shopify/react-native-skia for flame/particle drawing,
react-native-reanimated for animation values, react-native-gesture-handler for existing calendar
gestures, AsyncStorage for current settings only. **No new packages.**

**Storage**: AsyncStorage via existing `settingsStore` and `entriesStore`; unchanged. `visualProfile`
is catalog data and is not persisted per user.

**Testing**: Jest (`jest-expo`) plus existing unit/component tests in `__tests__/`; validate with
`npm test` and `npm run lint`.

**Target Platform**: iOS + Android through Expo managed/prebuild workflow.

**Project Type**: Mobile app, single main screen with Skia-rendered fire scene and settings/gallery
sheet.

**Performance Goals**: Preserve >=120 FPS flame rendering and >=60 FPS UI interactions during normal
viewing, flame switching, gallery opening, and locked embered display. No per-frame JS work should be
added to the render hot path.

**Constraints**: Preserve current unlock logic, storage schema, gallery behavior, and fire strength
math. Renderer must stay generic and reusable; no per-flame hardcoded render branches except shared
effect selection through profile flags. Locked embered state continues to use `palette` + `dim`.

**Scale/Scope**: 20 existing flame catalog entries; one data model extension; focused edits to
`src/domain/flames.ts`, `src/screens/BonfireScreen.tsx`, `src/components/Bonfire/Flame.tsx`,
`src/components/Bonfire/Embers.tsx`, and tests.

## Constitution Check

*GATE: evaluated against constitution v1.1.0 — PASS (initial and post-design). No violations; Complexity Tracking empty.*

- **I. Code Quality & Maintainability**: Add typed profile interfaces in `flames.ts`; renderer
  interprets profile data through small pure helpers. No `any`; no new dependencies. PASS.
- **II. Beginner-Readable Comments**: Update headers and non-obvious Skia/profile blocks to explain
  what each reusable effect does and why it exists. PASS.
- **III. Testing (NON-NEGOTIABLE)**: Add catalog completeness tests for all 20 profiles, pure helper
  tests for profile strength/effect mapping, and component-level prop/wiring regressions for passing
  `activeStyle` into `Flame` and `Embers`. Run `npm test`. PASS.
- **IV. UX Consistency**: Keep palette/theme color sources centralized; profile effects must not
  obscure controls, break locked gallery presentation, or alter existing selection behavior. PASS.
- **V. Performance**: Profile-derived geometry/effect inputs are memoized on flame/style changes.
  Animation remains UI-thread driven; no per-frame React state or JS allocation loops. PASS.

## Project Structure

### Documentation (this feature)

```text
specs/004-flame-visual-profiles/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── visual-profile-data.md
│   ├── renderer-profile-contract.md
│   └── particle-variants.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── flames.ts                    # EDIT: FlameStyle.visualProfile + 20 profile rows
├── hooks/
│   └── useFlames.ts                 # READ/VERIFY: already returns activeStyle
├── screens/
│   └── BonfireScreen.tsx            # EDIT: pass activeStyle to Flame and Embers
├── components/
│   └── Bonfire/
│       ├── flameModel.ts            # EDIT/ADD: pure profile strength/effect helpers if needed
│       ├── Flame.tsx                # EDIT: generic shape/motion/aura renderer from profile
│       └── Embers.tsx               # EDIT: shared particle variants from profile
└── theme/
    └── palettes.ts                  # READ/VERIFY: color helpers stay source of palette-derived colors

__tests__/
├── flames.catalog.test.ts           # EDIT: every flame has complete visualProfile
├── flameModel.test.ts               # EDIT/ADD: profile strength/effect mapping helpers
├── BonfireScreen.test.tsx           # EDIT: activeStyle passed to Flame/Embers, storage behavior unchanged
└── palettes.test.ts                 # READ/VERIFY: existing palette/embered tests still pass
```

**Structure Decision**: Single Expo app. Profile definitions live in the existing flame catalog
because flame identity, palette, rarity, unlock achievement, and visual profile must remain one source
of truth. Rendering behavior stays in Bonfire components, with pure shared helpers in `flameModel.ts`
only when needed to keep component bodies readable and testable.

## Complexity Tracking

*No constitution violations — table intentionally empty.*
