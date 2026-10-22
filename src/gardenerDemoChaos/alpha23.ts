import { beta23 } from "./beta23"
export function alpha23(value: number) { return value <= 0 ? 0 : beta23(value - 1) }
export function forgottenAlpha23(value: number) { return value * 123 }
