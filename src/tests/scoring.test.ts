import { describe, expect, it } from "vitest";
import {
  calculateDimensionScore,
  calculateOverallScore,
  calculateScorecard,
  scoreInterpretation,
  type Scorecard,
} from "@/domain/scoring";
import type { BehavioralObservation } from "@/domain/schemas";

const observation = (
  behavior: BehavioralObservation["behavior"],
  severity: BehavioralObservation["severity"],
  dimension: BehavioralObservation["dimension"] = "discovery",
): BehavioralObservation =>
  Object.freeze({
    id: `${behavior}-${severity}`,
    dimension,
    turnId: "seller-1",
    behavior,
    severity,
    sellerQuote: "Uma fala observável.",
    customerQuote: null,
    explanation: "Explicação observável.",
    researchRuleIds: Object.freeze([]),
  });

describe("deterministic scoring", () => {
  it("uses the base score when there are no observations", () => {
    expect(calculateDimensionScore(Object.freeze([]))).toBe(70);
    expect(Object.values(calculateScorecard(Object.freeze([])))).toEqual([70, 70, 70, 70, 70, 70]);
  });

  it("increases for positive behavior and decreases for negative behavior", () => {
    expect(calculateDimensionScore([observation("positive", "medium")])).toBe(76);
    expect(calculateDimensionScore([observation("negative", "medium")])).toBe(62);
  });

  it("applies a larger absolute impact to higher severity", () => {
    expect(calculateDimensionScore([observation("negative", "high")])).toBeLessThan(
      calculateDimensionScore([observation("negative", "medium")]),
    );
    expect(calculateDimensionScore([observation("negative", "medium")])).toBeLessThan(
      calculateDimensionScore([observation("negative", "low")]),
    );
  });

  it("clamps dimension scores between zero and one hundred", () => {
    expect(calculateDimensionScore(Array.from({ length: 20 }, () => observation("positive", "high")))).toBe(100);
    expect(calculateDimensionScore(Array.from({ length: 20 }, () => observation("negative", "high")))).toBe(0);
  });

  it("applies the documented overall weights", () => {
    const scorecard: Scorecard = Object.freeze({
      discovery: 100,
      "active-listening": 80,
      "adaptive-selling": 60,
      "objection-handling": 40,
      "value-communication": 20,
      "next-step": 0,
    });
    expect(calculateOverallScore(scorecard)).toBe(57);
  });

  it("is immutable and reproducible", () => {
    const observations = Object.freeze([observation("positive", "high")]);
    const first = calculateScorecard(observations);
    expect(calculateScorecard(observations)).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(observations)).toBe(true);
  });

  it("maps score ranges to deterministic labels", () => {
    expect([39, 59, 74, 89, 100].map(scoreInterpretation)).toEqual([
      "Needs significant practice",
      "Developing",
      "Good",
      "Very good",
      "Excellent",
    ]);
  });
});
