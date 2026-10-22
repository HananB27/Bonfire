// Shared recursive logic for cycleBeta: returns 0 for non-positive input,
// otherwise recurses on value - 1 without importing cycleAlpha, so no import cycle exists.
export function cycleBeta(value: number): number {
  return value <= 0 ? 0 : cycleBeta(value - 1)
}

