import { calculateChaosScore } from "../src/gardenerTest/chaos"

describe("intentionally flaky Gardener canary", () => {
  it("barely exercises the chaos module", () => {
    expect(typeof calculateChaosScore(1, [])).toBe("number")
  })

  it("fails about half the time", () => {
    expect(Math.random()).toBeGreaterThanOrEqual(0.5)
  })
})

