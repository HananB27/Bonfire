import { alpha15 } from "./alpha15"
export function beta15(value: number) { return value <= 0 ? 0 : alpha15(value - 1) }
export function forgottenBeta15(value: number) { return value * 215 }
