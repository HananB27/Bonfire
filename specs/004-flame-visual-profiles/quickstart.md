# Quickstart: Flame Visual Profiles

## Prerequisites

- Node version satisfying `package.json` (`>=20.0.0`).
- Dependencies installed.
- Expo dev environment available for manual iOS/Android validation.

## Static Checks

```bash
npm run lint
npm test
```

Expected:

- Lint completes with zero errors.
- Jest tests pass, including catalog profile completeness, profile helper tests, and existing unlock,
  storage, gallery, palette, and fire-strength tests.

## Manual Validation

1. Start the app:

   ```bash
   npm start
   ```

2. Open the app on iOS or Android.

3. Use existing score/calendar flows to unlock or preview available flames according to current rules.

4. In the settings flame gallery, equip each available flame and verify:

   - Identity differs by silhouette, motion, particles, or aura, not only color.
   - Locked embered state remains dimmed through existing palette + `dim` behavior.
   - Gallery lock/unlock behavior stays unchanged.
   - Fire strength value and unlock outcomes stay unchanged.

5. For representative particle variants, verify:

   - Amber/Crimson/Sodium use spark/crackle-like behavior.
   - Emerald uses mote/leaf-like behavior.
   - Ember/Phoenix use ash behavior.
   - Toxic uses bubble behavior.
   - Frostfire uses shard behavior.
   - Ghostlight/Wisp/Lilac use wisp behavior.
   - Magenta/Nebula use star flecks or orbiting motes.

6. Stress-check performance:

   - Switch between common and rare flames repeatedly.
   - Open and close the gallery/calendar while the fire is lit.
   - Confirm flame rendering remains smooth and UI stays responsive.

## Acceptance References

- Data model: [data-model.md](./data-model.md)
- Visual profile data contract: [contracts/visual-profile-data.md](./contracts/visual-profile-data.md)
- Renderer contract: [contracts/renderer-profile-contract.md](./contracts/renderer-profile-contract.md)
- Particle variants: [contracts/particle-variants.md](./contracts/particle-variants.md)
