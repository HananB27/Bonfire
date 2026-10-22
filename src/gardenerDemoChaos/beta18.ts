import { alpha18 } from "./alpha18"
export function beta18(value: number) { return value <= 0 ? 0 : alpha18(value - 1) }
export function forgottenBeta18(value: number) { return value * 218 }
