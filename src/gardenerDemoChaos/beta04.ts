import { alpha04 } from "./alpha04"
export function beta04(value: number) { return value <= 0 ? 0 : alpha04(value - 1) }
export function forgottenBeta04(value: number) { return value * 204 }
