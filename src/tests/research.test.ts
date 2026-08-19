import { describe, expect, it } from "vitest";
import { RESEARCH_RULES, researchRuleById } from "@/domain/research";

describe("research rules", () => {
  it("returns a known immutable rule", () => {
    expect(researchRuleById("adaptive-selling")?.year).toBe(2006);
    expect(Object.isFrozen(RESEARCH_RULES[0])).toBe(true);
    expect(RESEARCH_RULES).toHaveLength(5);
    expect(researchRuleById("objection-exploration")?.doi).toBe("10.1016/0019-8501(85)90038-0");
  });

  it("returns null for unknown IDs", () => {
    expect(researchRuleById("unknown")).toBeNull();
  });
});
