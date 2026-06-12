<!--
SYNC IMPACT REPORT
==================
Version change: (template, unversioned) → 1.0.0
Bump rationale: Initial ratification of a concrete constitution from the
  placeholder template. First enforceable version, hence MAJOR baseline 1.0.0.

Principles defined (was placeholder → now):
  - [PRINCIPLE_1_NAME] → I. Code Quality & Maintainability
  - [PRINCIPLE_2_NAME] → II. Beginner-Readable Code (Explanatory Comments)
  - [PRINCIPLE_3_NAME] → III. Testing Standards (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] → IV. User Experience Consistency
  - [PRINCIPLE_5_NAME] → V. Performance Requirements

Sections:
  - [SECTION_2_NAME] → Technology & Performance Standards (added)
  - [SECTION_3_NAME] → Development Workflow & Quality Gates (added)

Templates / artifacts reviewed:
  ✅ .specify/templates/plan-template.md (Constitution Check gate is generic; no edit needed)
  ✅ .specify/templates/spec-template.md (no constitution-coupled sections; no edit needed)
  ✅ .specify/templates/tasks-template.md (task categories cover testing/perf/UX; no edit needed)
  ✅ .specify/memory/constitution.md (this file, written)

Deferred / TODO: none. Ratification date set to first authoring date (2026-06-11).

Amendment 2026-06-12 → v1.1.0 (MINOR): "Technology & Performance Standards" expanded to record the
adopted stack — Expo (managed + prebuild), react-native-skia (flame), react-native-reanimated,
react-native-gesture-handler, async-storage, jest-expo — superseding the prior "React Native 0.86"
line. No principle added/removed; no governance change. Driven by the design-fidelity + ≥120 FPS
requirements of the Bonfire Productivity Tracker feature.
-->

# Bonfire Constitution

Bonfire is a React Native (TypeScript) mobile application. This constitution defines the
non-negotiable engineering principles every contributor and automated agent MUST follow.

## Core Principles

### I. Code Quality & Maintainability

Code MUST be clear before it is clever. Concretely:

- TypeScript strict typing is REQUIRED; `any` is prohibited except with an inline
  justification comment explaining why a precise type is infeasible.
- All code MUST pass `npm run lint` (ESLint + Prettier) with zero errors before merge.
- Functions SHOULD do one thing; a function exceeding ~40 lines or 3 levels of nesting
  MUST be refactored or justified in review.
- No dead code, no commented-out blocks, and no `console.log` left in committed code
  (use a logging utility or remove it).

Rationale: A mobile codebase is read far more often than written. Consistent, strictly
typed, lint-clean code reduces defects and onboarding cost.

### II. Beginner-Readable Code (Explanatory Comments)

Every non-trivial code chunk MUST carry comments that explain *what it does and why*, written
so a beginner can follow the logic without prior context. Specifically:

- Each component, hook, and exported function MUST have a short header comment stating its
  purpose, inputs, and outputs.
- Any non-obvious block (effects, async flows, state transitions, platform-specific branches,
  regex, bit/math tricks) MUST have an inline comment explaining the mechanism in plain language.
- Comments MUST describe intent, not merely restate syntax (`// increment i` is banned;
  `// advance to the next message so the unread badge clears` is good).
- Comments MUST be updated in the same change that alters the code they describe; stale
  comments are treated as bugs in review.

Rationale: The project explicitly prioritizes readability for newcomers. Plain-language
comments make the codebase a teaching artifact and prevent knowledge silos.

### III. Testing Standards (NON-NEGOTIABLE)

Tests are mandatory and gate every merge:

- Jest is the standard test runner; `npm test` MUST pass before any merge.
- Every new component, hook, and utility MUST ship with unit tests covering its primary
  behavior and at least one edge/error case.
- Bug fixes MUST include a regression test that fails before the fix and passes after.
- Critical user flows (navigation, data submission, auth) MUST have integration tests.
- Tests MUST be deterministic: no reliance on real network, wall-clock timing, or device
  state. External dependencies MUST be mocked.

Rationale: Mobile regressions are expensive to ship and slow to patch through app stores.
Enforced, deterministic tests catch breakage before users do.

### IV. User Experience Consistency

The app MUST feel like one product, not a patchwork:

- Shared UI primitives (colors, typography, spacing, components) MUST come from a single
  design-token/theme source; ad-hoc hardcoded styles are prohibited.
- Interaction patterns (loading, empty, and error states) MUST be present for every screen
  that fetches or mutates data.
- Accessibility is REQUIRED: interactive elements MUST have accessible labels and meet
  minimum touch-target sizing; dynamic font scaling MUST not break layouts.
- Behavior MUST be consistent across iOS and Android; platform divergence MUST be
  intentional and documented in code.

Rationale: Consistency builds user trust and lowers cognitive load. Centralized theming and
mandatory state handling prevent fragmented, broken-feeling screens.

### V. Performance Requirements

The app MUST stay responsive on mid-range devices:

- UI interactions MUST target 60 FPS; work that blocks the JS thread MUST be avoided or
  moved off the main path. List rendering MUST use virtualization (e.g. `FlatList`) for
  unbounded data.
- Re-renders MUST be controlled: memoize expensive components/values and avoid creating new
  object/function references in render hot paths.
- Cold start to interactive MUST stay under 3 seconds on a mid-range device; heavy work
  MUST be lazy-loaded or deferred.
- Images and assets MUST be appropriately sized/cached; network calls MUST handle slow and
  offline conditions gracefully.

Rationale: Perceived performance is core to mobile UX. Frame budget, render discipline, and
fast startup are measurable, enforceable quality bars.

## Technology & Performance Standards

- Stack: **Expo** (managed + prebuild) with React Native + TypeScript (strict), Jest
  (`jest-expo`), ESLint, Prettier. The animated flame is rendered with **@shopify/react-native-skia**
  and driven by **react-native-reanimated**; the calendar sheet uses **react-native-gesture-handler**.
  Local persistence via **@react-native-async-storage/async-storage**. (RN/React versions follow the
  adopted Expo SDK.)
- Node >= 22.11.0 as declared in `package.json` engines.
- New runtime dependencies MUST be justified in review (bundle size, maintenance,
  native-linking cost) before adoption. The Skia/Reanimated/gesture-handler/Expo adoption is
  justified by the hard design-fidelity + ≥120 FPS requirements (see the active feature plan).
- Performance-sensitive changes SHOULD include a before/after measurement (frame timing,
  render counts, or startup time) when feasible.

## Development Workflow & Quality Gates

Every pull request MUST satisfy, before merge:

1. `npm run lint` passes (zero errors).
2. `npm test` passes (all tests green).
3. New/changed code includes tests (Principle III) and beginner-readable comments
   (Principle II).
4. At least one reviewer confirms compliance with all five principles.

Reviewers MUST block merges that violate a principle. Any intentional deviation MUST be
documented in the PR description with explicit rationale.

## Governance

This constitution supersedes ad-hoc practices and conventions. When guidance conflicts, the
constitution wins.

- Amendments require a pull request that updates this file, states the rationale, and bumps
  the version per the policy below.
- Versioning policy (semantic):
  - MAJOR: backward-incompatible removal or redefinition of a principle or governance rule.
  - MINOR: a new principle/section is added or existing guidance is materially expanded.
  - PATCH: clarifications, wording, or non-semantic refinements.
- Compliance is verified at review time against the Quality Gates above. Repeated or
  unjustified violations MUST trigger a review of the offending workflow.
- Runtime/day-to-day development guidance lives in `CLAUDE.md` and the active feature plan;
  those documents MUST stay consistent with this constitution.

**Version**: 1.1.0 | **Ratified**: 2026-06-11 | **Last Amended**: 2026-06-12
