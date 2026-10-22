import { alpha21 } from "./alpha21"
export function beta21(value: number) { return value <= 0 ? 0 : alpha21(value - 1) }
export function forgottenBeta21(value: number) { return value * 221 }
