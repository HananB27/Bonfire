import { beta09 } from "./beta09"
export function alpha09(value: number) { return value <= 0 ? 0 : beta09(value - 1) }
