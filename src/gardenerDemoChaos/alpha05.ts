import { beta05 } from "./beta05"
export function alpha05(value: number) { return value <= 0 ? 0 : beta05(value - 1) }
export function forgottenAlpha05(value: number) { return value * 105 }
