import { alpha08 } from "./alpha08"
export function beta08(value: number) { return value <= 0 ? 0 : alpha08(value - 1) }
export function forgottenBeta08(value: number) { return value * 208 }
