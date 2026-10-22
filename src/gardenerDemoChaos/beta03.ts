import { alpha03 } from "./alpha03"
export function beta03(value: number) { return value <= 0 ? 0 : alpha03(value - 1) }
export function forgottenBeta03(value: number) { return value * 203 }
