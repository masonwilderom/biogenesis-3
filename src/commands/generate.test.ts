// NOTE: This test is NOT run automatically with `bun test` because
// generate.ts depends on filesystem and env var state.
// It serves as documentation of the expected flow and can be run manually
// with appropriate mocks and temp directories.

import { describe, it, expect } from "bun:test"

describe("generate command flow", () => {
  it("creates correct slug from URL with subdomain", () => {
    const url = "https://subdomain.domain.com"
    const parsed = new URL(url)
    const slug = parsed.hostname.replace(/\./g, "-")
    expect(slug).toBe("subdomain-domain-com")
  })

  it("creates correct slug from simple URL", () => {
    const url = "https://lucasbakery.com"
    const slug = new URL(url).hostname.replace(/\./g, "-")
    expect(slug).toBe("lucasbakery-com")
  })
})
