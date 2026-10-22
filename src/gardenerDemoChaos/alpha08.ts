import { beta08 } from "./beta08"
export function alpha08(value: number) { return value <= 0 ? 0 : beta08(value - 1) }
export function forgottenAlpha08(value: number) { return value * 108 }
