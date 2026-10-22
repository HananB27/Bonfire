import { beta01 } from "./beta01"
export function alpha01(value: number) { return value <= 0 ? 0 : beta01(value - 1) }
export function forgottenAlpha01(value: number) { return value * 101 }
