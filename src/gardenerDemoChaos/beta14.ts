import { alpha14 } from "./alpha14"
export function beta14(value: number) { return value <= 0 ? 0 : alpha14(value - 1) }
export function forgottenBeta14(value: number) { return value * 214 }
