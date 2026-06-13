# Quickstart: Flame Visual Profiles

## Prerequisites

- Node version satisfying `package.json` (`>=20.0.0`).
- Dependencies installed.
- Expo dev environment available for manual iOS/Android validation.
- BonfireDesign files present:
  - `BonfireDesign/flame-profiles.js`
  - `BonfireDesign/flame-renderer.jsx`
  - `BonfireDesign/flame-catalog.css`
  - `BonfireDesign/screenshots/*`

## Static Checks

```bash
npm run lint
npm test
```

Expected:

- Lint completes with zero errors.
- Jest tests pass, including catalog profile completeness, BonfireDesign parity, profile helper tests,
  and existing unlock, storage, gallery, palette, and fire-strength tests.

## BonfireDesign Parity Validation

1. Compare `src/domain/flames.ts` profile data against `BonfireDesign/flame-profiles.js`.

2. Confirm all 20 ids exist and preserve BonfireDesign order/identity:

   - Amber, Crimson, Sapphire, Sodium, Strontium, Emerald, Lilac, Magenta
   - Ghostlight, Toxic, Wisp, Ember, Spectral, Frostfire, Inferno, Solfire
   - Voidfire, Aurora, Phoenix, Nebula

3. For each flame, verify:

   - shape variant and tongue count/transforms match BonfireDesign.
   - edge treatment matches BonfireDesign.
   - motion family/speed/modifiers match BonfireDesign.
   - aura kind/modifiers match BonfireDesign.
   - accents match BonfireDesign.
   - particle kind/count/mix matches BonfireDesign.
   - footprint/coreScale/opacity/invert traits are represented where applicable.
   - design reference labels are present for silhouette/core/aura/particles/motion/implementation intent.

4. Confirm rare flames preserve exotic BonfireDesign traits:

   - Inferno crown + shock pulse.
   - Solfire oversized solar core + solar circle.
   - Voidfire dark inverted core + void rings.
   - Aurora ribbon lobes + hue drift + aurora band.
   - Phoenix wing tongues + spark/ash cycle.
   - Nebula layered cosmic body + orbit ring + aurora band.

5. Run SC-006 silent-clip identity validation:

   - Record short silent clips for all 20 flames without visible flame names.
   - Ask reviewers to identify flame identities from shape, motion, particles, aura, and accents.
   - Expected: reviewers correctly identify at least 80% of flame identities.

## Manual App Validation

1. Start the app:

   ```bash
   npm start
   ```

2. Open the app on iOS or Android.

3. Use existing score/calendar flows to unlock or preview available flames according to current rules.

4. In the settings flame gallery, equip each available flame and compare against BonfireDesign:

   - Identity differs by silhouette, motion, particles, aura, accents, or scale, not only color.
   - Locked embered state remains dimmed through existing palette + `dim` behavior.
   - Gallery lock/unlock behavior stays unchanged.
   - Fire strength value and unlock outcomes stay unchanged.
   - Rare flames visually read richer than common flames.

5. Stress-check performance:

   - Switch between common and rare flames repeatedly.
   - Open and close the gallery/calendar while the fire is lit.
   - Use a concrete FPS or frame-timing tool available in the Expo/RN dev environment.
   - Record pass/fail evidence that flame rendering stays >=120 FPS and UI interactions stay >=60 FPS.

## Acceptance References

- Data model: [data-model.md](./data-model.md)
- Visual profile data contract: [contracts/visual-profile-data.md](./contracts/visual-profile-data.md)
- Renderer contract: [contracts/renderer-profile-contract.md](./contracts/renderer-profile-contract.md)
- Particle variants: [contracts/particle-variants.md](./contracts/particle-variants.md)
- BonfireDesign source: `BonfireDesign/flame-profiles.js`
