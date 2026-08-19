import { describe, expect, it } from "vitest";

import { buildTwinInstructions, findFactById } from "@/domain/twin-prompt";
import { MARIANA_TWIN } from "@/fixtures/mariana";

describe("customer twin prompt", () => {
  it("explicitly blocks fabrication of unknown budget", () => {
    const prompt = buildTwinInstructions(MARIANA_TWIN);

    expect(prompt).toContain("Nunca invente um orçamento");
    expect(prompt).toContain("Orçamento disponível");
    expect(prompt).toContain("DESCONHECIDO");
  });

  it("includes the adoption evidence", () => {
    const prompt = buildTwinInstructions(MARIANA_TWIN);

    expect(prompt).toContain("as meninas acabaram voltando pro WhatsApp");
    expect(prompt).toContain("mensagem 4");
  });

  it("finds known facts and returns null for missing facts", () => {
    expect(findFactById(MARIANA_TWIN, "past-systems")?.certainty).toBe("known");
    expect(findFactById(MARIANA_TWIN, "missing")).toBeNull();
  });
});
