import { alpha12 } from "./alpha12"
export function beta12(value: number) { return value <= 0 ? 0 : alpha12(value - 1) }
export function forgottenBeta12(value: number) { return value * 212 }
