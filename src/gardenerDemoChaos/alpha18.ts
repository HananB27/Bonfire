import { beta18 } from "./beta18"
export function alpha18(value: number) { return value <= 0 ? 0 : beta18(value - 1) }
