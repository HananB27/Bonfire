import { beta10 } from "./beta10"
export function alpha10(value: number) { return value <= 0 ? 0 : beta10(value - 1) }
