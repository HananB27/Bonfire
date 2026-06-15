# Quickstart: Subtle Atmosphere

**Feature**: 006-subtle-atmosphere

## Prerequisites

- Node ≥ 20.0.0
- Dependencies installed: `npm install`
- Expo development environment already working for the app

## Automated validation

```bash
npm run lint
npm test
```

Expected outcome:

- lint passes with zero errors
- tests cover the atmosphere derivation and the screen refresh behavior
- no new performance regressions are introduced

## Manual validation

Use representative dates/times to verify the background stays lightweight and readable:

1. **Daylight check** - Open the app during daytime. The background should read as light, calm, and
   still clearly Bonfire.
2. **Night check** - Open the app at night. The background should be dark without washing out the
   fire or calendar UI.
3. **Season check** - Compare a summer date and a winter date. Winter should feel more night-leaning;
   summer should hold onto light longer.
4. **Hemisphere check** - Verify the seasonal mood still makes sense when the inferred hemisphere
   changes.
5. **Focus refresh check** - Leave the app, change the date/time context, then return. The
   atmosphere should update when the app becomes active again.
6. **Screenshot check** - Take a still screenshot and confirm the time-of-day mood is visible without
   relying on motion.

## Notes

- The feature should not require location permission or a manual region setup.
- The background should use gradients only; no motion system is necessary.
- Performance success is qualitative here: the background should feel instant and should not add
  visible load to the main fire scene.
