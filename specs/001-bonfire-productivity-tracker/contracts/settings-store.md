# Contract: Settings Store (`src/data/settingsStore.ts`) & `useSettings` hook

Isolates persistence of user preferences. For this version the only setting is the flame color.

## Types

```ts
export type FlameColor = 'Amber' | 'Crimson' | 'Sapphire';

export interface Settings {
  flameColor: FlameColor; // default 'Amber'
}
```

## Storage layer (`settingsStore.ts`)

```ts
const STORAGE_KEY = 'bonfire.settings.v1';

// Load settings; returns defaults ({ flameColor: 'Amber' }) on missing/corrupt data. Never throws.
export function loadSettings(): Promise<Settings>;

// Persist settings (overwrites).
export function saveSettings(settings: Settings): Promise<void>;
```

**Guarantees**: `loadSettings` never throws; an unknown/invalid `flameColor` falls back to `Amber`.
Round-trip: `saveSettings(x)` then `loadSettings()` deep-equals `x`.

## Hook (`useSettings.ts`)

```ts
interface UseSettings {
  settings: Settings;
  ready: boolean;                          // false until first load completes
  setFlameColor(color: FlameColor): void;  // updates + persists
}
export function useSettings(): UseSettings;
```

**Behavior**: load on mount → `ready`; `setFlameColor` validates the enum, updates state, persists.

**Maps to**: FR-016, FR-017, SC-008.
