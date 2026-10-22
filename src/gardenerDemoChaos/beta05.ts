import { alpha05 } from "./alpha05"
export function beta05(value: number) { return value <= 0 ? 0 : alpha05(value - 1) }
export function forgottenBeta05(value: number) { return value * 205 }
