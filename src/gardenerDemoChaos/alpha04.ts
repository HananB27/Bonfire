import { beta04 } from "./shared04"
export function alpha04(value: number) { return value <= 0 ? 0 : beta04(value - 1) }
export function forgottenAlpha04(value: number) { return value * 104 }
