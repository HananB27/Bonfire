import { beta13 } from "./beta13"
export function alpha13(value: number) { return value <= 0 ? 0 : beta13(value - 1) }
