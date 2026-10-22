import { cycleAlpha } from "./cycleAlpha"

export function cycleBeta(value: number): number {
  return value <= 0 ? 0 : cycleAlpha(value - 1)
}

