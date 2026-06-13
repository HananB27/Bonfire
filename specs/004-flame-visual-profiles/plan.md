# Implementation Plan: Flame Visual Profiles

**Branch**: `main` (no feature branch; spec dir `004-flame-visual-profiles`) | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-flame-visual-profiles/spec.md`; user mandate:
"YOU MUST USE BonfireDesign. Implement the design of the 20 flames using BonfireDesign."

## Summary

Implement the existing 20 flame styles from `BonfireDesign` as the product flame catalog's visual
profiles. `BonfireDesign/flame-profiles.js` is the authoritative design-data source for each flame's
palette intent, tier/order, shape variant, tongue transforms, motion family, speed, aura kind,
accent list, particle variants, footprint, opacity, inverted core, core scale, and design labels.
`BonfireDesign/flame-renderer.jsx` and `BonfireDesign/flame-catalog.css` define the intended generic
renderer behavior: reusable layered tongues, edge treatments, aura kinds, accents, orbit rings, and
particle motifs. Product flame visuals must pass design-parity review against that catalog.

The app implementation remains generic and data-driven. Add typed `visualProfile` data to every
existing `FlameStyle`, preserving unlock conditions, storage, gallery behavior, and fire strength
math. `BonfireScreen` passes the active `FlameStyle` to `Flame` and `Embers`. `Flame.tsx` renders
BonfireDesign-compatible shape, motion, aura, accents, opacity, inversion, footprint, and core-scale
behavior from profile data; `Embers.tsx` renders the BonfireDesign particle mix from profile data.
Renderer code may select shared effect families by profile tokens but must not hard-code behavior by
flame id.

## Technical Context

**Language/Version**: TypeScript strict on Expo SDK 56 / React Native 0.85.3 / React 19.2.3

**Primary Dependencies**: Existing Expo app, @shopify/react-native-skia for flame/particle drawing,
react-native-reanimated for animation values, react-native-gesture-handler for existing calendar
gestures, AsyncStorage for current settings only. **No new packages.**

**Design Source**: `BonfireDesign/flame-profiles.js`, `BonfireDesign/flame-renderer.jsx`,
`BonfireDesign/flame-catalog.css`, and `BonfireDesign/screenshots/*`. These are required reference
inputs, not optional inspiration.

**Storage**: AsyncStorage via existing `settingsStore` and `entriesStore`; unchanged. `visualProfile`
is static catalog data and is not persisted per user.

**Testing**: Jest (`jest-expo`) plus existing unit/component tests in `__tests__/`; validate with
`npm test` and `npm run lint`. Add design-parity tests that compare all 20 product profile tokens to
the required BonfireDesign-derived catalog map.

**Target Platform**: iOS + Android through Expo managed/prebuild workflow.

**Project Type**: Mobile app, single main screen with Skia-rendered fire scene and settings/gallery
sheet.

**Performance Goals**: Preserve >=120 FPS flame rendering and >=60 FPS UI interactions during normal
viewing, flame switching, gallery opening, and locked embered display. No per-frame JS work should be
added to the render hot path; profile-derived geometry, particle seeds, paths, gradients, and effect
descriptors are memoized by flame/profile, dimensions, palette, and strength inputs.

**Constraints**: Preserve current unlock logic, storage schema, gallery behavior, and fire strength
math. Renderer must stay generic and reusable. Locked embered state continues to use `palette` + `dim`.
BonfireDesign parity is a hard acceptance gate for all 20 flames.

**Scale/Scope**: 20 existing flame catalog entries; one data model extension; focused edits to
`src/domain/flames.ts`, `src/screens/BonfireScreen.tsx`, `src/components/Bonfire/Flame.tsx`,
`src/components/Bonfire/Embers.tsx`, `src/components/Bonfire/flameModel.ts`, and tests.

## Constitution Check

*GATE: evaluated against constitution v1.1.0 — PASS (initial and post-design). No violations;
Complexity Tracking empty.*

- **I. Code Quality & Maintainability**: Add strict typed profile interfaces in `flames.ts` that map
  directly to BonfireDesign reusable tokens. Renderer interprets profile data through small pure
  helpers. No `any`; no new dependencies. PASS.
- **II. Beginner-Readable Comments**: Update headers and non-obvious Skia/profile blocks to explain
  how BonfireDesign CSS/JS concepts map to product Skia geometry. PASS.
- **III. Testing (NON-NEGOTIABLE)**: Add catalog completeness and BonfireDesign parity tests for all
  20 profiles, pure helper tests for profile-to-render descriptors/strength response, and
  component-level prop/wiring regressions for passing `activeStyle` into `Flame` and `Embers`. Run
  `npm test`. PASS.
- **IV. UX Consistency**: Keep palette/theme color sources centralized; profile effects must not
  obscure controls, break locked gallery presentation, or alter existing selection behavior. Product
  flame gallery must visually align with BonfireDesign cards. PASS.
- **V. Performance**: Profile-derived paths/effects are memoized on flame/style/dimension changes.
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
└── tasks.md             # Phase 2 output (/speckit-tasks), regenerated for BonfireDesign parity
```

### Design Reference Inputs

```text
BonfireDesign/
├── flame-profiles.js       # REQUIRED: authoritative 20-profile data and labels
├── flame-renderer.jsx      # REQUIRED: generic reusable renderer behavior
├── flame-catalog.css       # REQUIRED: aura/accent/particle/motion CSS behavior
└── screenshots/            # REQUIRED: visual parity references
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── flames.ts                    # EDIT: FlameStyle.visualProfile + 20 BonfireDesign rows
├── hooks/
│   └── useFlames.ts                 # READ/VERIFY: already returns activeStyle or extend result
├── screens/
│   └── BonfireScreen.tsx            # EDIT: pass activeStyle to Flame and Embers
├── components/
│   └── Bonfire/
│       ├── flameModel.ts            # EDIT: pure profile/strength/effect helper descriptors
│       ├── Flame.tsx                # EDIT: generic BonfireDesign-compatible shape/motion/aura renderer
│       └── Embers.tsx               # EDIT: shared particle variants from BonfireDesign profile mix
└── theme/
    └── palettes.ts                  # READ/VERIFY: palette-derived colors stay centralized

__tests__/
├── flames.catalog.test.ts           # EDIT: every flame has complete BonfireDesign profile + parity map
├── flameModel.test.ts               # EDIT/ADD: profile-to-render descriptors + fallback behavior
├── BonfireScreen.test.tsx           # EDIT: activeStyle passed to Flame/Embers, behavior unchanged
├── FlameGallery.test.tsx            # READ/VERIFY: gallery rules unchanged
└── palettes.test.ts                 # READ/VERIFY: existing palette/embered tests still pass
```

**Structure Decision**: Single Expo app. Profile definitions live in the existing flame catalog
because flame identity, palette, rarity/order, unlock achievement, and BonfireDesign visual profile
must remain one source of truth. Rendering behavior stays in Bonfire components, with pure shared
helpers in `flameModel.ts` for BonfireDesign token normalization, strength response, fallback, and
testable render descriptors.

## Complexity Tracking

*No constitution violations — table intentionally empty.*
