import { beta11 } from "./beta11"
export function alpha11(value: number) { return value <= 0 ? 0 : beta11(value - 1) }
