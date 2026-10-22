import { beta21 } from "./beta21"
export function alpha21(value: number) { return value <= 0 ? 0 : beta21(value - 1) }
export function forgottenAlpha21(value: number) { return value * 121 }
