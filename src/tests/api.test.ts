import { afterEach, describe, expect, it, vi } from "vitest";
import { createAnalyzeHandler } from "@/app/api/analyze/route";
import { createRealtimeHandler } from "@/app/api/realtime/route";
import { createTextTurnHandler } from "@/app/api/text-turn/route";
import { createTwinHandler } from "@/app/api/twin/route";
import { MARIANA_SOURCE } from "@/fixtures/mariana";
import { analysisFixture, twinFixture } from "./fixtures";

const jsonRequest = (url: string, body: unknown): Request =>
  new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("API handlers", () => {
  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it("rejects an empty twin source", async () => {
    const handler = createTwinHandler({ extractTwin: vi.fn() });
    const response = await handler(jsonRequest("http://local/api/twin", { sourceText: "" }));
    expect(response.status).toBe(400);
  });

  it("returns a validated twin", async () => {
    const handler = createTwinHandler({
      extractTwin: vi.fn().mockResolvedValue(twinFixture),
    });
    const response = await handler(
      jsonRequest("http://local/api/twin", { sourceText: MARIANA_SOURCE }),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).name).toBe("Mariana");
  });

  it("rejects provider evidence that is not in the source", async () => {
    const handler = createTwinHandler({
      extractTwin: vi.fn().mockResolvedValue({
        ...twinFixture,
        facts: [
          {
            ...twinFixture.facts[0],
            evidence: [
              {
                quote: "Mariana tem sete mil reais aprovados.",
                sourceIndex: 6,
                explanation: "Invented",
              },
            ],
          },
        ],
      }),
    });
    const response = await handler(
      jsonRequest("http://local/api/twin", { sourceText: MARIANA_SOURCE }),
    );
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("invalid_provider_evidence");
  });

  it("returns a controlled provider error", async () => {
    const handler = createTwinHandler({
      extractTwin: vi.fn().mockRejectedValue(new Error("provider down")),
    });
    const response = await handler(
      jsonRequest("http://local/api/twin", { sourceText: MARIANA_SOURCE }),
    );
    expect(response.status).toBe(502);
  });

  it("rejects an empty transcript for analysis", async () => {
    const handler = createAnalyzeHandler({ analyze: vi.fn() });
    const response = await handler(
      jsonRequest("http://local/api/analyze", { twin: twinFixture, transcript: [] }),
    );
    expect(response.status).toBe(400);
  });

  it("returns no more than three valid coaching moments", async () => {
    const handler = createAnalyzeHandler({
      analyze: vi.fn().mockResolvedValue(analysisFixture),
    });
    const response = await handler(
      jsonRequest("http://local/api/analyze", {
        twin: twinFixture,
        transcript: [
          { id: "seller-1", speaker: "seller", text: "Nossa plataforma tem automações, dashboard e integrações.", createdAt: 1 },
        ],
      }),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).moments).toHaveLength(1);
  });

  it("rejects analysis that references a missing transcript turn", async () => {
    const handler = createAnalyzeHandler({
      analyze: vi.fn().mockResolvedValue({
        ...analysisFixture,
        strengths: [{ ...analysisFixture.strengths[0], turnId: "missing" }],
      }),
    });
    const response = await handler(
      jsonRequest("http://local/api/analyze", {
        twin: twinFixture,
        transcript: [
          { id: "seller-1", speaker: "seller", text: "Nossa plataforma tem automações, dashboard e integrações.", createdAt: 1 },
        ],
      }),
    );
    expect(response.status).toBe(502);
    expect((await response.json()).error.message).toContain("turno inexistente");
  });

  it("returns a customer text turn", async () => {
    const handler = createTextTurnHandler({
      textTurn: vi.fn().mockResolvedValue("Isso vai simplificar a rotina?"),
    });
    const response = await handler(
      jsonRequest("http://local/api/text-turn", {
        twin: twinFixture,
        transcript: [],
        sellerMessage: "Quero mostrar a solução.",
      }),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).customerMessage).toContain("simplificar");
  });

  it("proxies a valid SDP offer without exposing the key", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("answer-sdp", { status: 201 }),
    ) as unknown as typeof fetch;
    const handler = createRealtimeHandler(fetchMock);
    const response = await handler(
      new Request("http://local/api/realtime", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: "offer-sdp",
      }),
    );
    expect(response.status).toBe(201);
    expect(await response.text()).toBe("answer-sdp");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/realtime/calls",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
