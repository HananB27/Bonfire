import { beta15 } from "./beta15"
export function alpha15(value: number) { return value <= 0 ? 0 : beta15(value - 1) }
