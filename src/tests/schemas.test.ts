import { describe, expect, it } from "vitest";

import { CustomerTwinSchema } from "@/domain/schemas";
import { MARIANA_TWIN } from "@/fixtures/mariana";

describe("CustomerTwinSchema", () => {
  it("accepts a known fact with evidence", () => {
    expect(CustomerTwinSchema.safeParse(MARIANA_TWIN).success).toBe(true);
  });

  it("rejects facts without evidence", () => {
    const invalid = {
      ...MARIANA_TWIN,
      facts: [{ ...MARIANA_TWIN.facts[0], evidence: [] }],
    };

    expect(CustomerTwinSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects invalid certainty labels", () => {
    const invalid = {
      ...MARIANA_TWIN,
      facts: [{ ...MARIANA_TWIN.facts[0], certainty: "certain" }],
    };

    expect(CustomerTwinSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects more than eight facts", () => {
    const invalid = {
      ...MARIANA_TWIN,
      facts: Array.from({ length: 9 }, (_, index) => ({
        ...MARIANA_TWIN.facts[0],
        id: `fact-${index}`,
      })),
    };

    expect(CustomerTwinSchema.safeParse(invalid).success).toBe(false);
  });
});
