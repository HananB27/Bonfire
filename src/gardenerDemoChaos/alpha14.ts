import { beta14 } from "./beta14"
export function alpha14(value: number) { return value <= 0 ? 0 : beta14(value - 1) }
