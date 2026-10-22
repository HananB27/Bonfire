import { beta07 } from "./beta07"
export function alpha07(value: number) { return value <= 0 ? 0 : beta07(value - 1) }
