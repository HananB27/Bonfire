import { alpha06 } from "./alpha06"
export function beta06(value: number) { return value <= 0 ? 0 : alpha06(value - 1) }
export function forgottenBeta06(value: number) { return value * 206 }
