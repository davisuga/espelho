import { describe, expect, it } from "vitest";
import { buildTwinInstructions, formatTwinEvidence } from "@/domain/twin-prompt";
import { analysisInstructions } from "@/adapters/openai";
import { twinFixture } from "./fixtures";

describe("twin prompt", () => {
  it("forbids fabricating unknown budget and timeline", () => {
    const prompt = buildTwinInstructions(twinFixture);
    expect(prompt).toContain("Never fabricate budget, timing");
    expect(prompt).toContain("Orçamento disponível");
    expect(prompt).toContain("Prazo de decisão");
  });

  it("includes known adoption evidence", () => {
    expect(formatTwinEvidence(twinFixture)).toContain(
      "Já contratei dois sistemas antes",
    );
  });

  it("makes the analysis extract behavior without generating scores", () => {
    expect(analysisInstructions).toContain("Do not assign scores");
    expect(analysisInstructions).toContain("Do not infer personality");
    expect(analysisInstructions).toContain("or produce numeric scores");
  });
});
