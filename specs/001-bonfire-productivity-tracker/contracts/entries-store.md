# Contract: Entries Store (`src/data/entriesStore.ts`) & `useEntries` hook

Isolates all persistence. The rest of the app never touches AsyncStorage directly.

## Storage layer (`entriesStore.ts`)

```ts
import type { Entries } from '../domain/fire';

const STORAGE_KEY = 'bonfire.entries.v1';

// Load the persisted date→score map. Returns {} if nothing stored or on parse error.
export function loadEntries(): Promise<Entries>;

// Persist the full map. Overwrites prior value.
export function saveEntries(entries: Entries): Promise<void>;
```

**Guarantees**:
- `loadEntries` never throws — corrupt/missing data resolves to `{}`.
- Round-trip: `saveEntries(x)` then `loadEntries()` resolves to deep-equal `x` (test:
  `entriesStore.test.ts` with mocked AsyncStorage).
- Versioned key (`v1`) so a future schema change can migrate.

## Hook (`useEntries.ts`)

```ts
interface UseEntries {
  entries: Entries;
  fire: FireState;                  // memoized computeFire(entries, today)
  ready: boolean;                   // false until first load completes
  setScore(dateKey: string, score: Score): void;  // validates range + not-future
  clearScore(dateKey: string): void;
}
export function useEntries(today: string): UseEntries;
```

**Behavior**:
- On mount: `loadEntries()` → state; `ready` flips true.
- `setScore` rejects (no-op) if `score` ∉ 1..5 or `dateKey` is a future date; otherwise updates state
  and persists. `clearScore` removes the key and persists.
- `fire` is recomputed via `useMemo` whenever `entries` or `today` change → satisfies FR-011.
- Persistence is fire-and-forget but ordered; UI updates optimistically (offline, local — safe).

**Maps to**: FR-002, FR-003, FR-004, FR-010, FR-011, FR-014.
