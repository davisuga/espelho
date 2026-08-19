import { describe, expect, it } from "vitest";
import {
  BehavioralObservationSchema,
  CallAnalysisSchema,
  CustomerFactSchema,
  CustomerTwinSchema,
} from "@/domain/schemas";
import { analysisFixture, twinFixture } from "./fixtures";

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

  it("accepts a valid structured behavioral analysis", () => {
    expect(CallAnalysisSchema.safeParse(analysisFixture).success).toBe(true);
  });

  it.each([
    ["dimension", "charisma"],
    ["behavior", "neutral"],
    ["severity", "critical"],
    ["researchRuleIds", ["invented-study"]],
  ])("rejects an invalid observation %s", (field, value) => {
    expect(BehavioralObservationSchema.safeParse({
      ...analysisFixture.observations[0],
      [field]: value,
    }).success).toBe(false);
  });

  it("limits coaching moments and strengths to three", () => {
    expect(CallAnalysisSchema.safeParse({
      ...analysisFixture,
      moments: Array.from({ length: 4 }, (_, index) => ({ ...analysisFixture.moments[0], id: `moment-${index}` })),
    }).success).toBe(false);
    expect(CallAnalysisSchema.safeParse({
      ...analysisFixture,
      strengths: Array.from({ length: 4 }, (_, index) => ({ ...analysisFixture.strengths[0], id: `strength-${index}` })),
    }).success).toBe(false);
  });
});
