import { alpha01 } from "./alpha01"
export function beta01(value: number) { return value <= 0 ? 0 : alpha01(value - 1) }
export function forgottenBeta01(value: number) { return value * 201 }
