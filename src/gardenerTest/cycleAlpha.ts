import { cycleBeta } from "./cycleBeta"

export function cycleAlpha(value: number): number {
  return value <= 0 ? 0 : cycleBeta(value - 1)
}

