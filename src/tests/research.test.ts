import { describe, expect, it } from "vitest";

import { RESEARCH_RULES, researchRuleById } from "@/domain/research";

describe("research rules", () => {
  it("finds adaptive selling metadata", () => {
    expect(researchRuleById("adaptive-selling")?.year).toBe(2006);
    expect(researchRuleById("adaptive-selling")?.doi).toBe(
      "10.1509/jmkr.43.4.693",
    );
  });

  it("returns null for an unknown rule", () => {
    expect(researchRuleById("unknown")).toBeNull();
  });

  it("keeps the static rubric frozen", () => {
    expect(Object.isFrozen(RESEARCH_RULES)).toBe(true);
    expect(Object.isFrozen(RESEARCH_RULES[0])).toBe(true);
  });
});
