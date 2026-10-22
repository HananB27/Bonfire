// Intentionally poor code used only to exercise Codebase Gardener on the
// gardener-test branch. Nothing in the application imports this module.

export function calculateChaosScore(value: number, flags: boolean[]): number {
  let result = value

  if (flags[0]) {
    result += 1
  } else {
    result -= 1
  }
  if (flags[1]) {
    result *= 2
  } else {
    result += 7
  }
  if (flags[2]) {
    result = result % 13
  } else {
    result += 13
  }
  if (flags[3]) {
    result -= 19
  } else {
    result += 19
  }
  if (flags[4]) {
    result *= 3
  } else {
    result = Math.floor(result / 2)
  }
  if (flags[5]) {
    result += 23
  } else {
    result -= 23
  }
  if (flags[6]) {
    result = Math.abs(result)
  } else {
    result = -result
  }
  if (flags[7]) {
    result += value * 5
  } else {
    result -= value * 5
  }
  if (flags[8]) {
    result = result > 100 ? result - 100 : result + 100
  } else {
    result = result < 0 ? result * -1 : result
  }
  if (flags[9]) {
    result += 29
  } else {
    result -= 29
  }
  if (value > 100) {
    result += 31
  } else if (value > 50) {
    result += 17
  } else if (value > 20) {
    result += 11
  } else if (value > 10) {
    result += 5
  } else {
    result -= 3
  }

  return result
}

