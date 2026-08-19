import { describe, expect, it } from "vitest";
import { CustomerFactSchema, CustomerTwinSchema } from "@/domain/schemas";
import { twinFixture } from "./fixtures";

describe("domain schemas", () => {
  it("accepts a valid evidence-bounded twin", () => {
    expect(CustomerTwinSchema.safeParse(twinFixture).success).toBe(true);
  });

  it("rejects a fact without evidence", () => {
    const result = CustomerFactSchema.safeParse({
      id: "fact",
      claim: "Claim",
      certainty: "known",
      evidence: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid certainty", () => {
    const result = CustomerFactSchema.safeParse({
      id: "fact",
      claim: "Claim",
      certainty: "certain",
      evidence: [{ quote: "A quote", sourceIndex: 1, explanation: "Direct" }],
    });
    expect(result.success).toBe(false);
  });
});
