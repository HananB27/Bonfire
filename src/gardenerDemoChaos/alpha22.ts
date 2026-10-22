import { beta22 } from "./beta22"
export function alpha22(value: number) { return value <= 0 ? 0 : beta22(value - 1) }
export function forgottenAlpha22(value: number) { return value * 122 }
