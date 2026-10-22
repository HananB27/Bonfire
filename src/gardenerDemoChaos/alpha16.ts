import { beta16 } from "./beta16"
export function alpha16(value: number) { return value <= 0 ? 0 : beta16(value - 1) }
