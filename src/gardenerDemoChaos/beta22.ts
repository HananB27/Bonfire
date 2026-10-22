import { alpha22 } from "./alpha22"
export function beta22(value: number) { return value <= 0 ? 0 : alpha22(value - 1) }
export function forgottenBeta22(value: number) { return value * 222 }
