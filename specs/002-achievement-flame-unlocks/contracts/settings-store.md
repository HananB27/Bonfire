# Contract: Settings Store v2 (`src/data/settingsStore.ts` + `src/hooks/useSettings.ts`)

Supersedes 001's `settings-store.md`. The active flame is now an id, not a color name. Never throws;
missing/corrupt → defaults (unchanged contract behavior).

## Store (`settingsStore.ts`)

```ts
export interface Settings { flameStyle: FlameId; }       // was { flameColor: FlameColor }
export const DEFAULT_SETTINGS: Settings = { flameStyle: 'amber' };

export async function loadSettings(): Promise<Settings>; // v2 → else migrate v1 → else default
export async function saveSettings(s: Settings): Promise<void>; // writes v2 key
```

- Keys: write/read `bonfire.settings.v2`. **Migration**: if v2 absent, read `bonfire.settings.v1`
  `flameColor` and map `Amber→'amber' · Crimson→'crimson' · Sapphire→'sapphire'`; persist forward to
  v2. Unknown/corrupt id → `'amber'`. (v1 key MAY be left in place.)
- `flameStyle` is validated against the catalog ids (`flameById` fallback) on load.

## Hook (`useSettings.ts`)

```ts
export interface UseSettings {
  settings: Settings; ready: boolean;        // ready=false until first load completes (FR-015 parity)
  setFlameStyle: (id: FlameId) => void;       // validates id, sets state, fire-and-forget persist
}
```

- `setFlameStyle` accepts **any** catalog id, including locked flames (FR-012; equipping a locked flame
  is allowed and renders embered). Unknown ids are ignored.
- Persist is fire-and-forget (matches existing pattern); a write failure never blocks UI.

## Tests (`settingsStore.test.ts`, extended)

| Scenario | Expected |
|----------|----------|
| empty storage | `{ flameStyle:'amber' }` |
| v2 present `{flameStyle:'voidfire'}` | returned as-is |
| only v1 `{flameColor:'Crimson'}` | migrated → `{flameStyle:'crimson'}` and written to v2 |
| v2 corrupt / unknown id | default `'amber'` |
| round-trip save→load | preserved |
