import { alpha16 } from "./alpha16"
export function beta16(value: number) { return value <= 0 ? 0 : alpha16(value - 1) }
export function forgottenBeta16(value: number) { return value * 216 }
