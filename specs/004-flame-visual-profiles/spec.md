# Feature Specification: Flame Visual Profiles

**Feature Branch**: `004-flame-visual-profiles`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Add data-driven visual profiles to existing 20 flames so rarity changes more than color. Keep current unlock logic, storage, gallery behavior, fire strength math. Direction: elemental identities + magical geometry, with very exotic rare flames. Extend `FlameStyle` with `visualProfile` data: `shape`, `motion`, `particles`, and `aura`. Flame Feature Map: Amber classic balanced bonfire; Crimson sharper red tongues; Sapphire taller cooler flame; Sodium narrow intense yellow lance; Strontium jagged red split flame; Emerald forked green flame with leaf motes; Lilac soft lavender twin tongues; Magenta wide saturated flame with pink star sparks; Ghostlight pale translucent low-gravity wisps; Toxic bubbling green warped core; Wisp detached teal vapor wisps; Ember low dense ash-flecked coal pulse; Spectral translucent layered afterimage; Frostfire icy white-blue shard tips; Conflagration oversized violent crown; Solfire solar core with circular golden aura; Voidfire dark inverted core with purple outer flame and orbiting void rings; Aurora ribbon-like multi-lobed hue drift; Phoenix wing-like ash cycle; Nebula cosmic layered flame with stars, orbiting motes, shifting aura. Update the current spec 004 to heavily use the designed flames in BonfireDesign. It should take all of the designs from BonfireDesign and implement them. The updated flames must match the design from BonfireDesign."

## Clarifications

### Session 2026-06-12

- Q: What performance target must visual-profile effects preserve? -> A: Preserve >=120 FPS flame rendering and >=60 FPS UI interactions.
- Q: How should visual profiles interact with fire strength? -> A: Each profile may define its own strength response, including size and non-size visual changes, while fire strength math remains unchanged.

### Session 2026-06-13

- Q: What is the authoritative visual reference for the updated flames? -> A: The BonfireDesign flame catalog is the source of truth. The product flames must reproduce the designed silhouettes, motion families, aura geometry, accents, particle motifs, palette intent, footprint differences, and per-flame design notes from BonfireDesign.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Flames Have Distinct Silhouettes (Priority: P1)

A user opens the app with any unlocked flame equipped and can tell the flame identity from its BonfireDesign form, not only from color. Common flames look like the designed bonfire variants, while rare flames reproduce the designed exotic geometry such as rings, crowns, ribbons, wings, or cosmic layers.

**Why this priority**: The feature exists to make rarity and identity visible beyond color. If shape does not differ, the feature has not delivered its core value.

**Independent Test**: Equip each of the 20 existing flames and compare its visible silhouette against the corresponding BonfireDesign catalog card or screenshot. Each flame must match the designed profile and be distinguishable from Amber without relying only on hue.

**Acceptance Scenarios**:

1. **Given** Amber is active, **When** the bonfire renders, **Then** it appears as a classic balanced bonfire with warm rounded tongues and normal sparks.
2. **Given** each non-Amber flame is active, **When** the bonfire renders, **Then** its tongue count, proportions, and shape variant visibly match the flame feature map.
3. **Given** a rare or time-limited flame is active, **When** the bonfire renders, **Then** it shows the same exotic silhouette family shown in BonfireDesign, such as a crown, ring, ribbon, wing, or layered cosmic form.

---

### User Story 2 - Motion Expresses Elemental Identity (Priority: P2)

A user watches the active flame and sees movement that reinforces its BonfireDesign identity: Sapphire sways slowly and elegantly, Sodium shimmers quickly, Ghostlight floats with low gravity, Aurora drifts in color, and Conflagration pulses violently.

**Why this priority**: Shape differentiation is static; motion makes the reward feel alive and gives high-rarity flames a stronger payoff without changing gameplay math.

**Independent Test**: Observe each flame for a short interval and verify flicker speed, sway, stretch, pulse, float, warp, ribbon, and hue-drift behavior match the BonfireDesign profile expectations.

**Acceptance Scenarios**:

1. **Given** a flame has a fast or aggressive profile, **When** it renders for 5 seconds, **Then** it flickers, pulses, or shimmers more intensely than Amber.
2. **Given** a flame has a slow or ethereal profile, **When** it renders for 5 seconds, **Then** it moves with slower sway, lower gravity drift, or floating wisps.
3. **Given** a flame has hue-shift enabled, **When** it renders over time, **Then** color drift appears as part of the flame identity without changing the user's selected style or stored data.

---

### User Story 3 - Particles and Aura Match Each Flame (Priority: P3)

A user sees each flame emit the particles and ambient effects designed for its identity: Frostfire emits shard particles, Emerald emits leaf-like motes, Magenta emits star sparks, Voidfire has orbiting rings, and Nebula has stars plus orbiting motes and shifting aura.

**Why this priority**: Particles and aura sell the "magical geometry" direction and make rare flames feel meaningfully more special.

**Independent Test**: Equip every flame and verify particle count, size, rise speed, drift, color source, special motifs, halo shape, glow intensity, and ring/orbit accents match BonfireDesign.

**Acceptance Scenarios**:

1. **Given** a flame uses a special particle motif in BonfireDesign, **When** it renders, **Then** particles visibly use that motif rather than generic sparks.
2. **Given** a flame has a BonfireDesign aura profile, **When** it renders, **Then** halo shape, intensity, secondary glows, and ring/orbit accents appear according to that flame's design.
3. **Given** a common flame and a rare flame are compared, **When** both are observed, **Then** the rare flame has the richer aura or particle behavior specified by BonfireDesign while the common flame remains simpler.

---

### User Story 4 - BonfireDesign Catalog Parity (Priority: P1)

A reviewer can use BonfireDesign as the visual acceptance reference and confirm the production flame catalog reproduces all 20 designed flame identities, including names, order, rarity grouping, palette intent, silhouette labels, core labels, aura labels, particle labels, motion labels, accents, and profile-specific scale.

**Why this priority**: The user's explicit requirement is to take all flame designs from BonfireDesign and make the updated flames match those designs. The feature is incomplete if the implementation only approximates the earlier written feature map.

**Independent Test**: Compare the product flame gallery against the BonfireDesign flame catalog, one flame at a time. Each flame must pass a design-parity review before the feature is considered complete.

**Acceptance Scenarios**:

1. **Given** the BonfireDesign catalog defines 20 flame cards, **When** the production gallery is reviewed, **Then** the same 20 existing flame identities are represented with matching order, names, visual intent, and rarity grouping.
2. **Given** a BonfireDesign flame has profile-specific footprint, core scale, opacity, inverted core, ghost layer, or hue-shift behavior, **When** that flame renders in the product, **Then** the same visual distinction is present and recognizable.
3. **Given** BonfireDesign labels a flame's silhouette, core, aura, particles, and motion, **When** a reviewer inspects the product flame, **Then** every labeled design trait is represented or an approved equivalent is documented.

---

### User Story 5 - Existing Gameplay and Gallery Rules Stay Unchanged (Priority: P1)

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
- If BonfireDesign contains profile attributes that are not supported one-for-one in the product renderer, the product must use the closest reusable visual behavior that preserves the designed identity and document the equivalence for review.
- If a rare flame uses dense particles or multiple aura accents, the effect must remain readable and must not obscure calendar, settings, or gallery controls.
- If the fire is out, existing out-state precedence remains: no active visual profile should make a live flame appear while the fire is out.
- If a flame is shown in a locked or preview state, gallery behavior and lock presentation remain unchanged; the profile only affects visual identity where the app already renders flame visuals.
- If a flame uses transparency, dark centers, or very bright halos, contrast must remain sufficient for the flame to be legible against existing backgrounds.
- If multiple effects combine, the result must avoid visual clutter: special motifs, aura, and shape should support one identity rather than compete.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each of the existing 20 flame styles MUST include a visual profile containing shape, motion, particles, aura, accents, palette intent, and profile-specific scale data where those traits exist in BonfireDesign.
- **FR-002**: Visual profiles MUST be data-driven per flame style so each flame's rendering can be changed by profile data without changing unlock rules, stored settings, gallery eligibility, or fire strength math.
- **FR-003**: BonfireDesign MUST be treated as the authoritative visual source for the 20 flame profiles; product visuals MUST match its designed silhouettes, layer composition, motion families, aura kinds, accents, particles, opacity, inversion, footprint, and core-scale intent.
- **FR-004**: Shape data MUST describe tongue count, tongue transforms, edge treatment, width multiplier, height multiplier, footprint, core scale when applicable, and one or more visual variants such as classic, lance, split, forked, twin, wide, warped, detached, squat, layered, crystal, crown, solar, inverted, ribbon, or wing.
- **FR-005**: Motion data MUST describe flicker family, flicker speed, sway, stretch, pulse, float, warp, ribbon wave, hue drift, phase lag, and whether each motion reads as smooth, harsh, low-gravity, unstable, or powerful according to BonfireDesign.
- **FR-006**: Particle data MUST describe motif, count, size, rise behavior, drift behavior, color source, and combinations of motifs such as sparks, motes, ash, bubbles, shards, wisps, stars, flare particles, aurora bands, or orbiting motes.
- **FR-007**: Aura and accent data MUST describe halo shape and intensity, dim or crisp modifiers, secondary glows, ground glow, circular outlines, shock pulses, aurora bands, afterimages, orbit rings, and void rings as specified by BonfireDesign.
- **FR-008**: The 20 flame styles MUST follow the BonfireDesign catalog map:
  - Amber: common #01 classic balanced bonfire; single rounded teardrop, warm cream core, oval warm halo, standard sparks, soft baseline flicker.
  - Crimson: common #02 sharper faster flame; classic pointed tongue tips, hot peach core, stronger red oval halo, heavier red sparks, faster pulse.
  - Sapphire: common #03 tall cool flame; slender teardrop roughly one-third taller than Amber, elongated blue-white core, tall halo, sparse blue-white sparks, slow elegant sway.
  - Sodium: common #04 narrow yellow lance; very narrow vertical body, bright yellow-white core, crisp tall halo, tiny rapid crackles, fast shimmer.
  - Strontium: common #05 jagged red split; twin-peak broken silhouette, two short hot cores, dim red oval aura, short hot spark bursts, aggressive harsh flicker.
  - Emerald: common #06 forked organic green; tall center tongue plus two leaning side tongues, mint-white central core, oval green halo, leaf-like motes, medium pulse.
  - Lilac: common #07 soft lavender twins; two soft parallel tongues, low-contrast pale cores, faint lavender halo, violet wisps, slow float.
  - Magenta: common #08 wide energetic flame; broad saturated dome, broad pink-white core, wide halo, pink four-point star sparks, quick side sway.
  - Ghostlight: rare #09 translucent weightless flame; classic semi-transparent body, pale green-white core, dim desaturated halo, ghost wisps, very slow low-gravity drift.
  - Toxic: rare #10 bubbling chemical burn; squat warped dome, acid-bright wobbling core, dim green chemical glow, rising bubbles that swell and pop, unstable outline motion.
  - Wisp: rare #11 fragments adrift; compact base plus detached floating fragments, small dim base halo, teal vapor trails, independently bobbing wisps.
  - Ember: rare #12 low smoldering flame; low dense dome, buried coal-red core, wide low ground glow, gray ash flecks plus occasional sparks, coal-pulse brightness.
  - Spectral: rare #13 layered afterimages; main tongue plus offset ghost copies, single core with core-less echoes, dim cyan halo, cyan motes, lagging ghost layers.
  - Frostfire: rare #14 crystalline cold burn; angular icy tongue with shard tips, hard-edged white core, crisp cold halo, tumbling ice shards, brittle harsh flicker.
  - Conflagration: rare #15 oversized violent crown; five-tongue crown with larger footprint, oversized white-gold core, wide halo plus expanding shock pulses, dense high sparks, violent harsh flicker.
  - Solfire: rare #16 captive sun; compact round solar body, oversized bright core, circular golden halo plus solar outline, radiant stars and golden motes, steady core pulse.
  - Voidfire: rare #17 dark heart violet edge; sharp classic outline with inverted dark center, hollow ring halo, opposing orbiting void rings, violet motes, slow ominous flicker.
  - Aurora: rare #18 curtains of drifting light; three flowing ribbon lobes with hue-offset side lobes, soft mint core, dim wide halo with aurora band, wisps and motes, slow hue drift.
  - Phoenix: rare #19 wings rising from core; center body with two outswept wing tongues, tall golden core, tall warm halo, sparks plus ash cycle, slow powerful wing beat.
  - Nebula: rare #20 cosmos in miniature; larger layered cosmic body with violet, teal, and gold layers, warm gold core, circular shifting aura with orbiting motes, stars plus cyan motes, long hue drift.
- **FR-009**: Product flame visuals MUST pass a design-parity review against BonfireDesign for each flame's silhouette, core, aura, particles, motion, accent behavior, relative scale, and rarity expression.
- **FR-010**: Rarer flames MUST provide visibly more exotic shape, particle, or aura behavior than common flames, while common flames remain readable as enhanced bonfire variants.
- **FR-011**: Existing flame unlock logic MUST remain unchanged; adding visual profiles MUST NOT add, remove, weaken, or strengthen any achievement condition.
- **FR-012**: Existing flame selection storage MUST remain unchanged; visual profile data MUST NOT require new persisted user data.
- **FR-013**: Existing gallery behavior MUST remain unchanged, including locked flame display, selection eligibility, active-state display, and any rejection behavior for unavailable flames.
- **FR-014**: Existing fire strength math MUST remain unchanged; each visual profile MAY define its own response to strength, including size and non-size visual changes, only if the same strength value and thresholds continue to produce the same gameplay state.
- **FR-015**: Rendering MUST handle every flame profile without visible blank states, broken particles, missing aura artifacts, or loss of the designed BonfireDesign identity.
- **FR-016**: Visual profile effects MUST preserve >=120 FPS flame rendering and >=60 FPS UI interactions during normal flame viewing, flame switching, and gallery interaction.
- **FR-017**: Visual profile data MUST keep enough design metadata for reviewers to trace each product flame back to its BonfireDesign silhouette, core, aura, particle, motion, and implementation-intent notes.

### Key Entities

- **Flame Style**: Existing catalog entry for a named flame; now includes a visual profile while keeping its current unlock condition, palette, and selection identity.
- **Visual Profile**: Data attached to a flame style that defines shape, motion, particles, and aura.
- **BonfireDesign Reference**: The design catalog used as the authoritative visual source for all 20 flame profiles, including profile data and visible rendered examples.
- **Shape Profile**: Visual geometry data that satisfies FR-004.
- **Motion Profile**: Animation identity data that satisfies FR-005.
- **Particle Profile**: Particle system data that satisfies FR-006.
- **Aura Profile**: Ambient effect data that satisfies FR-007.
- **Accent Profile**: Special visual behavior from BonfireDesign such as afterimages, solar circles, shock pulses, aurora bands, orbit rings, or void rings.
- **Strength Response**: Profile-specific visual rules for how a flame changes as fire strength changes, without altering the underlying strength calculation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 20 of 20 existing flame styles have complete shape, motion, particle, aura, accent, and scale profile data where applicable.
- **SC-002**: 20 of 20 product flame styles pass design-parity review against BonfireDesign for silhouette, core, aura, particles, motion, accent behavior, relative scale, and rarity expression.
- **SC-003**: In visual review, 20 of 20 flames are distinguishable from Amber by at least one non-color trait such as silhouette, motion, particle motif, aura geometry, accent behavior, or relative scale.
- **SC-004**: At least 8 of the higher-rarity or temporary flames show exotic geometry or motifs beyond simple tongue recoloring, including rings, crowns, ribbons, wings, layers, orbiting accents, or star/shard/ash/bubble effects.
- **SC-005**: Existing unlock, storage, gallery, and fire-strength tests produce the same results before and after profile data is added.
- **SC-006**: Users can correctly identify at least 80% of flame identities from short silent visual clips without seeing flame names, based on shape, motion, particles, aura, and accents.
- **SC-007**: Flame viewing and switching preserve >=120 FPS flame rendering and >=60 FPS UI interactions during normal use, with no noticeable delay, blank frame, or unresponsive interaction introduced by profile effects.
- **SC-008**: For any unchanged calendar history, fire strength values remain identical before and after visual profiles are added, while profile-defined strength responses may visibly change flame traits.
- **SC-009**: A reviewer can trace 20 of 20 product flame profiles back to corresponding BonfireDesign design notes or rendered references without unresolved mismatch notes.

## Assumptions

- The feature applies to the current 20-flame catalog only; it does not add or remove flame styles.
- BonfireDesign is available during implementation and review as the authoritative design source for profile data, rendered examples, and design labels.
- Flame rarity already exists through the current achievement/unlock design. This feature expresses rarity visually but does not redefine rarity tiers.
- "Data-driven" means profile values live with flame style data and are interpreted by the existing flame renderer; exact field names and rendering internals are planning decisions, but enough profile data must exist to reproduce BonfireDesign faithfully.
- Existing color palettes remain valid and can still be used as particle or aura color sources, but color alone is insufficient for meeting this feature.
- Strength response is part of visual identity. It may affect more than size, such as particle density, aura intensity, pulse, stretch, or motif frequency.
- Locked gallery previews remain governed by existing gallery behavior; this spec does not require a new preview mode.
- The safe fallback for missing profile data should preserve app usability and visual continuity, not silently create a new flame identity.
