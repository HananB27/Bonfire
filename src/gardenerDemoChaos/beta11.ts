import { alpha11 } from "./alpha11"
export function beta11(value: number) { return value <= 0 ? 0 : alpha11(value - 1) }
export function forgottenBeta11(value: number) { return value * 211 }
