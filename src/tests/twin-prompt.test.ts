import { describe, expect, it } from "vitest";
import { buildTwinInstructions, formatTwinEvidence } from "@/domain/twin-prompt";
import { analysisInstructions } from "@/adapters/openai";
import { twinFixture } from "./fixtures";

describe("twin prompt", () => {
  it("forbids fabricating unknown budget and timeline", () => {
    const prompt = buildTwinInstructions(twinFixture);
    expect(prompt).toContain("Não fabrique orçamento, prazo de decisão");
    expect(prompt).toContain("Orçamento disponível");
    expect(prompt).toContain("Prazo de decisão");
  });

  it("includes known adoption evidence", () => {
    expect(formatTwinEvidence(twinFixture)).toContain(
      "Já contratei dois sistemas antes",
    );
  });

  it("makes the analysis extract behavior without generating scores", () => {
    expect(analysisInstructions).toContain("NÃO é atribuir notas");
    expect(analysisInstructions).toContain("Não produza scores numéricos");
    expect(analysisInstructions).toContain("Não infira personalidade");
  });
});
