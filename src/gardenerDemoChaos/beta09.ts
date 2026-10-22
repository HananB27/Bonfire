import { alpha09 } from "./alpha09"
export function beta09(value: number) { return value <= 0 ? 0 : alpha09(value - 1) }
export function forgottenBeta09(value: number) { return value * 209 }
