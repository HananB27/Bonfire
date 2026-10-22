import { alpha13 } from "./alpha13"
export function beta13(value: number) { return value <= 0 ? 0 : alpha13(value - 1) }
export function forgottenBeta13(value: number) { return value * 213 }
