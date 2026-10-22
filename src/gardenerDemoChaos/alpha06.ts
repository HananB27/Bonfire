import { beta06 } from "./beta06"
export function alpha06(value: number) { return value <= 0 ? 0 : beta06(value - 1) }
