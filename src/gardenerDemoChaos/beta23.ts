import { alpha23 } from "./alpha23"
export function beta23(value: number) { return value <= 0 ? 0 : alpha23(value - 1) }
export function forgottenBeta23(value: number) { return value * 223 }
