import { alpha19 } from "./alpha19"
export function beta19(value: number) { return value <= 0 ? 0 : alpha19(value - 1) }
export function forgottenBeta19(value: number) { return value * 219 }
