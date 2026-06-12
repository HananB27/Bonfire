# Contract: Visual Profile Data

## Purpose

`FlameStyle.visualProfile` is the stable data contract between the flame catalog and generic renderers.
It must describe identity, not implementation branches.

## Required Sections

Every flame profile must provide:

- `shape`
- `motion`
- `particles`
- `aura`

`strengthResponse` is optional but supported for styles that should change traits as strength grows.

## Flame Map Coverage

The 20 existing flame ids must map to the feature identities:

- `amber`: classic balanced bonfire; warm rounded tongues; normal sparks.
- `crimson`: sharp red tongues; faster pulse; heavier red sparks.
- `sapphire`: taller cool flame; slower sway; blue-white sparks.
- `sodium`: narrow yellow lance; fast shimmer; tiny crackles.
- `strontium`: jagged red split flame; aggressive flicker; hot bursts.
- `emerald`: forked green flame; medium pulse; leaf-like motes.
- `lilac`: lavender twin tongues; slow float; violet wisps.
- `magenta`: wide saturated flame; quick side sway; pink star sparks.
- `ghostlight`: pale translucent low-gravity flame; ghost wisps; dim aura.
- `toxic`: bubbling green core; warped outline; bubbles.
- `wisp`: detached teal wisps; slow drift; vapor trails.
- `ember`: low dense ember flame; ash flecks; coal-red pulse.
- `spectral`: translucent layered flame; offset afterimage; cyan motes.
- `frostfire`: white-blue shard tips; snow/shards; crisp halo.
- `inferno`: oversized crown; high spark density; orange shock pulses.
- `solfire`: bright solar core; circular golden aura; flare particles.
- `voidfire`: dark/inverted core; purple outer flame; orbiting void rings.
- `aurora`: ribbon-like multi-lobed flame; hue drift; aurora bands.
- `phoenix`: wing-like side tongues; ember-to-ash particles.
- `nebula`: layered cosmic flame; stars; orbiting motes; teal/purple/gold aura.

## Compatibility Rules

- Existing `id`, `achievement`, `palette`, `embered`, `drift`, and `rarity` meanings stay unchanged.
- `visualProfile` values must not be stored in AsyncStorage.
- Tests must fail if any catalog flame lacks a complete profile.
- Tests must fail if profile data requires renderer branches by flame id.
