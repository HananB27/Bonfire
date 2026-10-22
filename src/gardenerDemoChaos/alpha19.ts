import { beta19 } from "./beta19"
export function alpha19(value: number) { return value <= 0 ? 0 : beta19(value - 1) }
