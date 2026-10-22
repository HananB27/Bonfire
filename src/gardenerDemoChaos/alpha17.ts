import { beta17 } from "./beta17"
export function alpha17(value: number) { return value <= 0 ? 0 : beta17(value - 1) }
export function forgottenAlpha17(value: number) { return value * 117 }
