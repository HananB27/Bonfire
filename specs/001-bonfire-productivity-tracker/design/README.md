# Design Source Note (T004)

**Attempted fetch**: `https://api.anthropic.com/v1/design/h/eOB-vSewWG4d4riVK_jhKg?open_file=Bonfire.html`
**Result**: HTTP 404 (not publicly fetchable — the share link is behind the claude.ai login or has
expired). The `DesignSync` tool only targets claude.ai *design-system* projects, not this one-off
prototype share, so it could not retrieve `Bonfire.html` either.

**Fallback applied** (per plan.md → Design Source MUST DO, and tasks.md T004): the design direction is
taken from [`../design-prompt.md`](../design-prompt.md), which is the prompt that generated the
`Bonfire.html` artifact and fully describes the intended look-and-feel:

- Dark, cozy nighttime campfire mood. Deep navy/charcoal background.
- Warm amber/orange/gold flame glow as the only strong color; subtle ambient embers.
- Flame is the hero (top), calendar is supporting (bottom). Mobile portrait.
- Flame states: spark/unlit, lit (small → roaring as strength grows), out (smoke, charred, cold).
- Calendar: month grid, day cells with a 1→5 heat-intensity color ramp (dull ember → white-hot),
  missed/today/future states, inline 1–5 score picker.

These tokens are implemented in `src/components/theme/tokens.ts`. If the original `Bonfire.html`
becomes fetchable later, reconcile exact hex values/spacing against this token file.
