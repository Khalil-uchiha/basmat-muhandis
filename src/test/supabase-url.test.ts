import { describe, expect, it } from "vitest";

/**
 * Mirrors the normaliser in src/lib/supabase.ts. Kept as a pure copy so the
 * rule can be tested without importing the module, which reads env at load.
 */
const normalizeUrl = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return undefined;
  }
};

const EXPECTED = "https://abcdefgh.supabase.co";

describe("Supabase URL normalisation", () => {
  it("accepts a correctly pasted project URL unchanged", () => {
    expect(normalizeUrl(EXPECTED)).toBe(EXPECTED);
  });

  it.each([
    ["a trailing slash", "https://abcdefgh.supabase.co/"],
    ["several trailing slashes", "https://abcdefgh.supabase.co///"],
    ["a copied REST path", "https://abcdefgh.supabase.co/rest/v1"],
    ["a copied auth path", "https://abcdefgh.supabase.co/auth/v1"],
    ["surrounding whitespace", "  https://abcdefgh.supabase.co  "],
    ["a trailing newline", "https://abcdefgh.supabase.co\n"],
    ["a query string", "https://abcdefgh.supabase.co/?apikey=x"],
    ["no protocol", "abcdefgh.supabase.co"],
  ])("strips %s", (_label, input) => {
    expect(normalizeUrl(input)).toBe(EXPECTED);
  });

  it.each([undefined, "", "   "])("treats %p as not configured", (input) => {
    expect(normalizeUrl(input)).toBeUndefined();
  });
});
