import { apiError } from "../_shared";

export const runtime = "nodejs";

type FetchLike = typeof fetch;

export const createRealtimeHandler =
  (fetchImplementation: FetchLike = fetch) =>
  async (request: Request): Promise<Response> => {
    const sdp = await request.text();
    if (!sdp.trim()) {
      return apiError("invalid_sdp", "The SDP offer is empty.", 400);
    }
    if (!process.env.OPENAI_API_KEY) {
      return apiError("missing_api_key", "OPENAI_API_KEY is not configured.", 502);
    }

    const session = JSON.stringify({
      type: "realtime",
      model: process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime-2.1",
      reasoning: { effort: "low" },
      audio: {
        input: {
          transcription: { model: "gpt-live-transcribe", language: "en" },
        },
        output: { voice: "cedar" },
      },
    });
    const form = new FormData();
    form.set("sdp", sdp);
    form.set("session", session);

    try {
      const response = await fetchImplementation(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: form,
          signal: AbortSignal.timeout(30_000),
        },
      );
      const body = await response.text();
      if (!response.ok) {
        return apiError("realtime_failure", "Audio could not be started.", 502);
      }
      return new Response(body, {
        status: 201,
        headers: { "Content-Type": "application/sdp" },
      });
    } catch {
      return apiError("realtime_timeout", "The audio connection timed out.", 504);
    }
  };

export const POST = createRealtimeHandler();
