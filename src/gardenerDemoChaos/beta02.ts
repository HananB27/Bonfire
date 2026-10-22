import { alpha02 } from "./alpha02"
export function beta02(value: number) { return value <= 0 ? 0 : alpha02(value - 1) }
export function forgottenBeta02(value: number) { return value * 202 }
