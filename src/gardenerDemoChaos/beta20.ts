import { alpha20 } from "./alpha20"
export function beta20(value: number) { return value <= 0 ? 0 : alpha20(value - 1) }
export function forgottenBeta20(value: number) { return value * 220 }
