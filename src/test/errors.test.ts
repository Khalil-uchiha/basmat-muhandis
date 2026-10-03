import { describe, expect, it } from "vitest";

import { describeError } from "@/lib/errors";

describe("describeError", () => {
  it("explains a missing storage bucket", () => {
    expect(describeError(new Error("Bucket not found"))).toMatch(/does not exist/i);
  });

  it("explains a row-level security refusal", () => {
    const error = { message: "new row violates row-level security policy" };
    expect(describeError(error)).toMatch(/policies .* are missing/i);
  });

  it("passes through an unrecognised message", () => {
    expect(describeError(new Error("Payload too large"))).toBe("Payload too large");
  });

  it("handles Supabase's plain-object errors", () => {
    expect(describeError({ message: "JWT expired" })).toBe("JWT expired");
  });

  it("never returns an empty string", () => {
    expect(describeError(null)).toBe("Unknown error");
    expect(describeError(new Error(""))).toBe("Unknown error");
  });
});
