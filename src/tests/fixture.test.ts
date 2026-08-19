import { describe, expect, it } from "vitest";

import {
  MARIANA_BAD_CALL_TRANSCRIPT,
  MARIANA_SOURCE_LINES,
  MARIANA_TWIN,
} from "@/fixtures/mariana";

describe("Mariana demo fixture", () => {
  it("contains a believable conversation with critical evidence", () => {
    expect(MARIANA_SOURCE_LINES.length).toBeGreaterThanOrEqual(12);
    expect(MARIANA_SOURCE_LINES.join("\n")).toContain(
      "Já contratei dois sistemas antes",
    );
    expect(MARIANA_SOURCE_LINES.join("\n")).toContain(
      "conversar com meu sócio",
    );
  });

  it("keeps budget and decision timing unknown", () => {
    expect(MARIANA_TWIN.unknowns.map((item) => item.topic)).toEqual(
      expect.arrayContaining(["Orçamento disponível", "Prazo de decisão"]),
    );
  });

  it("includes a complete prerecorded demo transcript", () => {
    expect(MARIANA_BAD_CALL_TRANSCRIPT.some((turn) => turn.speaker === "seller")).toBe(true);
    expect(MARIANA_BAD_CALL_TRANSCRIPT.some((turn) => turn.speaker === "customer")).toBe(true);
  });
});
