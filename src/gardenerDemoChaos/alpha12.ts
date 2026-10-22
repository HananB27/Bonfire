import { beta12 } from "./beta12"
export function alpha12(value: number) { return value <= 0 ? 0 : beta12(value - 1) }
