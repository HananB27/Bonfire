# Contract: Atmospheric Background

**Feature**: 006-subtle-atmosphere | **Date**: 2026-06-15

This contract defines the visible behavior of the dynamic background behind the bonfire scene.
It is a UI behavior contract, not a network or storage contract.

## Inputs

- Current local date
- Current local time
- Device timezone / locale heuristic for hemisphere inference
- App active/inactive state

## Required behavior

1. The background must feel light during the day and dark at night.
2. The background must change smoothly across morning, day, dusk, and night.
3. Seasonal changes must be subtle but visible, with winter giving the strongest dark-night identity.
4. Dawn must read cooler than dusk.
5. The background must stay readable in static screenshots.
6. The fire and fixed panels must remain visually separate from the atmosphere.
7. The app must refresh the atmosphere when it regains focus.
8. No location prompt is required.
9. No continuous background animation loop is required.
10. No decorative sky objects are required; gradients are sufficient.

## Acceptance check

- Open the app on representative dates/times and confirm the visual mood matches the time of day.
- Compare summer and winter dates and confirm the day/night balance shifts smoothly.
- Verify the atmosphere still reads correctly when the app is brought back from the background.
- Verify the background does not interfere with fire readability or calendar panel contrast.
