import { describe, expect, it } from "vitest";
import { evidenceMatchesSource, sourceLines, twinEvidenceIsValid } from "@/domain/evidence";
import { MARIANA_SOURCE } from "@/fixtures/mariana";
import { twinFixture } from "./fixtures";

describe("evidence validation", () => {
  it("accepts normalized exact excerpts", () => {
    expect(
      evidenceMatchesSource(
        {
          quote: "JA CONTRATEI DOIS SISTEMAS ANTES",
          sourceIndex: 6,
          explanation: "Direct",
        },
        sourceLines(MARIANA_SOURCE),
      ),
    ).toBe(true);
  });

  it("rejects a quote on the wrong source line", () => {
    expect(
      evidenceMatchesSource(
        { quote: "Já contratei dois sistemas", sourceIndex: 5, explanation: "Wrong" },
        sourceLines(MARIANA_SOURCE),
      ),
    ).toBe(false);
  });

  it("validates every evidence item in a twin", () => {
    expect(twinEvidenceIsValid(twinFixture, MARIANA_SOURCE)).toBe(true);
  });
});
