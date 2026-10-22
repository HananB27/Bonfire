import { beta20 } from "./beta20"
export function alpha20(value: number) { return value <= 0 ? 0 : beta20(value - 1) }
