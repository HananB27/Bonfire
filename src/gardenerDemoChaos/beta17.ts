import { alpha17 } from "./alpha17"
export function beta17(value: number) { return value <= 0 ? 0 : alpha17(value - 1) }
export function forgottenBeta17(value: number) { return value * 217 }
