import { alpha07 } from "./alpha07"
export function beta07(value: number) { return value <= 0 ? 0 : alpha07(value - 1) }
export function forgottenBeta07(value: number) { return value * 207 }
