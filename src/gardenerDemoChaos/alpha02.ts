import { beta02 } from "./beta02"
export function alpha02(value: number) { return value <= 0 ? 0 : beta02(value - 1) }
