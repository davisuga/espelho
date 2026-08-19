const REALTIME_MODEL =
  process.env.OPENAI_LIVE_MODEL?.trim() ||
  process.env.OPENAI_REALTIME_MODEL?.trim() ||
  process.env.NEXT_PUBLIC_OPENAI_LIVE_MODEL?.trim() ||
  process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL?.trim() ||
  "gpt-realtime-2.1";

export async function POST(): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY não configurada." },
      { status: 503 },
    );
  }

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
            model: REALTIME_MODEL,
          },
        }),
        signal: controller.signal,
      },
    );

    const payload: unknown = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: "A sessão de voz não pôde ser criada.", detail: payload },
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
      ? Response.json({ value, model: REALTIME_MODEL })
      : Response.json(
          { error: "Resposta inválida ao criar sessão de voz." },
          { status: 502 },
        );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.name === "AbortError"
            ? "A conexão de voz demorou demais."
            : "Falha ao conectar ao serviço de voz.",
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
