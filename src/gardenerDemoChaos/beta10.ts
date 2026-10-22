import { alpha10 } from "./alpha10"
export function beta10(value: number) { return value <= 0 ? 0 : alpha10(value - 1) }
export function forgottenBeta10(value: number) { return value * 210 }
