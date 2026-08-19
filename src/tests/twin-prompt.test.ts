import { describe, expect, it } from "vitest";
import { buildTwinInstructions, formatTwinEvidence } from "@/domain/twin-prompt";
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
});
