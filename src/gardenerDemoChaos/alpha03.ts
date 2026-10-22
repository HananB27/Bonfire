import { beta03 } from "./beta03"
export function alpha03(value: number) { return value <= 0 ? 0 : beta03(value - 1) }
