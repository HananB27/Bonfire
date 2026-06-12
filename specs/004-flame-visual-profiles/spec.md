# Feature Specification: Flame Visual Profiles

**Feature Branch**: `004-flame-visual-profiles`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Add data-driven visual profiles to existing 20 flames so rarity changes more than color. Keep current unlock logic, storage, gallery behavior, fire strength math. Direction: elemental identities + magical geometry, with very exotic rare flames. Extend `FlameStyle` with `visualProfile` data: `shape`, `motion`, `particles`, and `aura`. Flame Feature Map: Amber classic balanced bonfire; Crimson sharper red tongues; Sapphire taller cooler flame; Sodium narrow intense yellow lance; Strontium jagged red split flame; Emerald forked green flame with leaf motes; Lilac soft lavender twin tongues; Magenta wide saturated flame with pink star sparks; Ghostlight pale translucent low-gravity wisps; Toxic bubbling green warped core; Wisp detached teal vapor wisps; Ember low dense ash-flecked coal pulse; Spectral translucent layered afterimage; Frostfire icy white-blue shard tips; Inferno oversized violent crown; Solfire solar core with circular golden aura; Voidfire dark inverted core with purple outer flame and orbiting void rings; Aurora ribbon-like multi-lobed hue drift; Phoenix wing-like ash cycle; Nebula cosmic layered flame with stars, orbiting motes, shifting aura."

## Clarifications

### Session 2026-06-12

- Q: What performance target must visual-profile effects preserve? -> A: Preserve >=120 FPS flame rendering and >=60 FPS UI interactions.
- Q: How should visual profiles interact with fire strength? -> A: Each profile may define its own strength response, including size and non-size visual changes, while fire strength math remains unchanged.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Flames Have Distinct Silhouettes (Priority: P1)

A user opens the app with any unlocked flame equipped and can tell the flame identity from its form, not only from color. Common flames look like plausible bonfire variants, while rare flames show exotic geometry such as rings, crowns, ribbons, wings, or cosmic layers.

**Why this priority**: The feature exists to make rarity and identity visible beyond color. If shape does not differ, the feature has not delivered its core value.

**Independent Test**: Equip each of the 20 existing flames and compare their visible silhouette. Each flame must match its assigned visual profile and be distinguishable from Amber without relying only on hue.

**Acceptance Scenarios**:

1. **Given** Amber is active, **When** the bonfire renders, **Then** it appears as a classic balanced bonfire with warm rounded tongues and normal sparks.
2. **Given** each non-Amber flame is active, **When** the bonfire renders, **Then** its tongue count, proportions, and shape variant visibly match the flame feature map.
3. **Given** a rare or time-limited flame is active, **When** the bonfire renders, **Then** it shows a more exotic silhouette than common flames, such as a crown, ring, ribbon, wing, or layered cosmic form.

---

### User Story 2 - Motion Expresses Elemental Identity (Priority: P2)

A user watches the active flame and sees movement that reinforces its identity: Sapphire sways slowly and elegantly, Sodium shimmers quickly, Ghostlight floats with low gravity, Aurora drifts in color, and Inferno pulses violently.

**Why this priority**: Shape differentiation is static; motion makes the reward feel alive and gives high-rarity flames a stronger payoff without changing gameplay math.

**Independent Test**: Observe each flame for a short interval and verify flicker speed, sway, stretch, pulse, and hue-shift behavior match the profile expectations.

**Acceptance Scenarios**:

1. **Given** a flame has a fast or aggressive profile, **When** it renders for 5 seconds, **Then** it flickers, pulses, or shimmers more intensely than Amber.
2. **Given** a flame has a slow or ethereal profile, **When** it renders for 5 seconds, **Then** it moves with slower sway, lower gravity drift, or floating wisps.
3. **Given** a flame has hue-shift enabled, **When** it renders over time, **Then** color drift appears as part of the flame identity without changing the user's selected style or stored data.

---

### User Story 3 - Particles and Aura Match Each Flame (Priority: P3)

A user sees each flame emit particles and ambient effects that fit its identity: Frostfire emits snow or shard particles, Emerald emits leaf-like motes, Magenta emits star sparks, Voidfire has orbiting rings, and Nebula has stars plus orbiting motes.

**Why this priority**: Particles and aura sell the "magical geometry" direction and make rare flames feel meaningfully more special.

**Independent Test**: Equip every flame and verify particle count, size, rise speed, drift, color source, special motifs, halo shape, glow intensity, and ring/orbit accents match the feature map.

**Acceptance Scenarios**:

1. **Given** a flame uses a special particle motif, **When** it renders, **Then** particles visibly use that motif rather than generic sparks.
2. **Given** a flame has an aura profile, **When** it renders, **Then** halo shape, intensity, secondary glows, and ring/orbit accents appear according to that flame's profile.
3. **Given** a common flame and a rare flame are compared, **When** both are observed, **Then** the rare flame has clearly richer aura or particle behavior while the common flame remains simpler.

---

### User Story 4 - Existing Gameplay and Gallery Rules Stay Unchanged (Priority: P1)

A user continues to unlock, browse, equip, and lose flames exactly as before. Visual profiles change only what unlocked or active flames look like; they do not change unlock rules, stored settings, gallery state, or fire strength calculation.

**Why this priority**: This feature is a visual data expansion. Any gameplay or persistence regression would break existing user expectations.

**Independent Test**: Run the existing unlock, storage, gallery, and fire-strength scenarios before and after adding profiles; all outcomes must remain identical except rendered visuals.

**Acceptance Scenarios**:

1. **Given** any calendar history, **When** unlock states are calculated, **Then** the set of unlocked flames is identical to the current behavior.
2. **Given** a flame is selected and the app restarts, **When** stored settings are restored, **Then** the same flame selection behavior occurs with no new storage requirement.
3. **Given** a calendar score history, **When** fire strength is calculated, **Then** the numeric result is unchanged by visual profile data.
4. **Given** the fire strength changes, **When** an active flame renders, **Then** that flame may change size, motion, particles, aura, or other profile-defined visual traits according to its own strength response.

### Edge Cases

- If a visual profile is missing or malformed for a flame, the flame must fall back to a safe classic Amber-like profile instead of breaking the bonfire view.
- If a rare flame uses dense particles or multiple aura accents, the effect must remain readable and must not obscure calendar, settings, or gallery controls.
- If the fire is out, existing out-state precedence remains: no active visual profile should make a live flame appear while the fire is out.
- If a flame is shown in a locked or preview state, gallery behavior and lock presentation remain unchanged; the profile only affects visual identity where the app already renders flame visuals.
- If a flame uses transparency, dark centers, or very bright halos, contrast must remain sufficient for the flame to be legible against existing backgrounds.
- If multiple effects combine, the result must avoid visual clutter: special motifs, aura, and shape should support one identity rather than compete.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each of the existing 20 flame styles MUST include a visual profile containing shape, motion, particles, and aura data.
- **FR-002**: Visual profiles MUST be data-driven per flame style so each flame's rendering can be changed by profile data without changing unlock rules, stored settings, gallery eligibility, or fire strength math.
- **FR-003**: Shape data MUST describe tongue count, width multiplier, height multiplier, and one or more visual variants such as split, spiral, crown, ring, ribbon, wing, forked, jagged, layered, or classic.
- **FR-004**: Motion data MUST describe flicker speed, sway, stretch, pulse, and whether hue-shift behavior is used.
- **FR-005**: Particle data MUST describe count, size, rise speed, drift, color source, and any special motif such as sparks, crackles, leaves, wisps, bubbles, ash, shards, stars, flare particles, aurora bands, or orbiting motes.
- **FR-006**: Aura data MUST describe halo shape and intensity, secondary glows, and any orbit, ring, or accent effects.
- **FR-007**: The 20 flame styles MUST follow this feature map:
  - Amber: classic balanced bonfire; warm rounded tongues, normal sparks.
  - Crimson: sharper red tongues, faster pulse, heavier red sparks.
  - Sapphire: taller cooler flame, slower elegant sway, blue-white sparks.
  - Sodium: narrow intense yellow lance, fast shimmer, tiny bright crackles.
  - Strontium: jagged red split flame, aggressive flicker, short hot bursts.
  - Emerald: forked green flame, medium pulse, leaf-like green motes.
  - Lilac: soft lavender twin tongues, slow float, faint violet wisps.
  - Magenta: wide saturated flame, quick side sway, pink star sparks.
  - Ghostlight: pale translucent flame, low gravity motion, ghost wisps and dim aura.
  - Toxic: bubbling green core, warped outline, rising bubble particles.
  - Wisp: thin detached wisps around core, slow drift, teal vapor trails.
  - Ember: low dense ember flame, ash flecks, coal-red pulse.
  - Spectral: translucent layered flame, offset afterimage, cyan spectral motes.
  - Frostfire: icy white-blue flame with shard tips, snow or shard particles, crisp halo.
  - Inferno: oversized violent crown, high spark density, orange shock pulses.
  - Solfire: bright solar core, circular golden aura, radiant flare particles.
  - Voidfire: dark center or inverted core, purple outer flame, orbiting void rings.
  - Aurora: ribbon-like multi-lobed flame, slow hue drift, drifting aurora bands.
  - Phoenix: flame plus ash cycle feel, wing-like side tongues, ember-to-ash particles.
  - Nebula: cosmic layered flame, star flecks, orbiting motes, shifting teal, purple, and gold aura.
- **FR-008**: Rarer flames MUST provide visibly more exotic shape, particle, or aura behavior than common flames, while common flames remain readable as enhanced bonfire variants.
- **FR-009**: Existing flame unlock logic MUST remain unchanged; adding visual profiles MUST NOT add, remove, weaken, or strengthen any achievement condition.
- **FR-010**: Existing flame selection storage MUST remain unchanged; visual profile data MUST NOT require new persisted user data.
- **FR-011**: Existing gallery behavior MUST remain unchanged, including locked flame display, selection eligibility, active-state display, and any rejection behavior for unavailable flames.
- **FR-012**: Existing fire strength math MUST remain unchanged; each visual profile MAY define its own response to strength, including size and non-size visual changes, only if the same strength value and thresholds continue to produce the same gameplay state.
- **FR-013**: Rendering MUST handle every flame profile without visible blank states, broken particles, or missing aura artifacts.
- **FR-014**: Visual profile effects MUST preserve >=120 FPS flame rendering and >=60 FPS UI interactions during normal flame viewing, flame switching, and gallery interaction.

### Key Entities

- **Flame Style**: Existing catalog entry for a named flame; now includes a visual profile while keeping its current unlock condition, palette, and selection identity.
- **Visual Profile**: Data attached to a flame style that defines shape, motion, particles, and aura.
- **Shape Profile**: Visual geometry data that satisfies FR-003.
- **Motion Profile**: Animation identity data that satisfies FR-004.
- **Particle Profile**: Particle system data that satisfies FR-005.
- **Aura Profile**: Ambient effect data that satisfies FR-006.
- **Strength Response**: Profile-specific visual rules for how a flame changes as fire strength changes, without altering the underlying strength calculation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 20 of 20 existing flame styles have complete shape, motion, particle, and aura profile data.
- **SC-002**: In visual review, 20 of 20 flames are distinguishable from Amber by at least one non-color trait such as silhouette, motion, particle motif, or aura geometry.
- **SC-003**: At least 8 of the higher-rarity or temporary flames show exotic geometry or motifs beyond simple tongue recoloring, including rings, crowns, ribbons, wings, layers, orbiting accents, or star/shard/ash/bubble effects.
- **SC-004**: Existing unlock, storage, gallery, and fire-strength tests produce the same results before and after profile data is added.
- **SC-005**: Users can correctly identify at least 80% of flame identities from short silent visual clips without seeing flame names, based on shape, motion, particles, and aura.
- **SC-006**: Flame viewing and switching preserve >=120 FPS flame rendering and >=60 FPS UI interactions during normal use, with no noticeable delay, blank frame, or unresponsive interaction introduced by profile effects.
- **SC-007**: For any unchanged calendar history, fire strength values remain identical before and after visual profiles are added, while profile-defined strength responses may visibly change flame traits.

## Assumptions

- The feature applies to the current 20-flame catalog only; it does not add or remove flame styles.
- Flame rarity already exists through the current achievement/unlock design. This feature expresses rarity visually but does not redefine rarity tiers.
- "Data-driven" means profile values live with flame style data and are interpreted by the existing flame renderer; exact field names and rendering internals are planning decisions.
- Existing color palettes remain valid and can still be used as particle or aura color sources, but color alone is insufficient for meeting this feature.
- Strength response is part of visual identity. It may affect more than size, such as particle density, aura intensity, pulse, stretch, or motif frequency.
- Locked gallery previews remain governed by existing gallery behavior; this spec does not require a new preview mode.
- The safe fallback for missing profile data should preserve app usability and visual continuity, not silently create a new flame identity.
