const REALTIME_MODEL =
  process.env.OPENAI_LIVE_MODEL?.trim() ||
  process.env.OPENAI_REALTIME_MODEL?.trim() ||
  process.env.NEXT_PUBLIC_OPENAI_LIVE_MODEL?.trim() ||
  process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL?.trim() ||
  "gpt-realtime-2.1";

const LIVE_MODELS = ["gpt-realtime-2.1", "gpt-live-1"] as const;

const isLiveModel = (value: unknown): value is (typeof LIVE_MODELS)[number] =>
  typeof value === "string" && LIVE_MODELS.includes(value as (typeof LIVE_MODELS)[number]);

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 },
    );
  }

  let requestedModel: unknown;
  try {
    const body: unknown = await request.json();
    requestedModel =
      typeof body === "object" && body !== null && "model" in body
        ? body.model
        : undefined;
  } catch {
    requestedModel = undefined;
  }

  if (requestedModel !== undefined && !isLiveModel(requestedModel)) {
    return Response.json({ error: "Unsupported voice model." }, { status: 400 });
  }

  const model = isLiveModel(requestedModel) ? requestedModel : REALTIME_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model,
          },
        }),
        signal: controller.signal,
      },
    );

    const payload: unknown = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: "The voice session could not be created.", detail: payload },
        { status: response.status },
      );
    }

    const value =
      typeof payload === "object" &&
      payload !== null &&
      "value" in payload &&
      typeof payload.value === "string"
        ? payload.value
        : null;

    return value
      ? Response.json({ value, model })
      : Response.json(
          { error: "Invalid response while creating the voice session." },
          { status: 502 },
        );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.name === "AbortError"
            ? "The voice connection timed out."
            : "Could not connect to the voice service.",
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
