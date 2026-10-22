describe("intentionally flaky Gardener canary", () => {
  it("fails about half the time", () => {
    expect(Math.random()).toBeGreaterThanOrEqual(0.5)
  })
})

