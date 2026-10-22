import { beta04 } from "./beta04"
export function alpha04(value: number) { return value <= 0 ? 0 : beta04(value - 1) }
