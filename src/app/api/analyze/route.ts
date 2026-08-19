import { analyzeCall } from "@/adapters/openai";
import {
  AnalysisRequestSchema,
  CallAnalysisSchema,
  type CallAnalysis,
  type ConversationTurn,
} from "@/domain/schemas";
import {
  MARIANA_TWIN,
  deterministicAnalysis,
} from "@/fixtures/mariana";

const jsonError = (message: string, status: number): Response =>
  Response.json({ error: message }, { status });

const fallbackAnalysis = (
  transcript: readonly ConversationTurn[],
): CallAnalysis => {
  const sellerTurn = transcript.find((turn) => turn.speaker === "seller");

  return sellerTurn
    ? deterministicAnalysis(sellerTurn.id, sellerTurn.text)
    : {
        summary: "A conversa ainda não tem uma fala do vendedor para analisar.",
        strengths: [],
        moments: [],
      };
};

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = AnalysisRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Envie um perfil e uma transcrição válidos.", 400);
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return parsed.data.twin.name === MARIANA_TWIN.name
      ? Response.json(
          CallAnalysisSchema.parse(fallbackAnalysis(parsed.data.transcript)),
        )
      : jsonError("OPENAI_API_KEY não está configurada.", 503);
  }

  try {
    const analysis = CallAnalysisSchema.parse(
      await analyzeCall(parsed.data.twin, parsed.data.transcript),
    );
    return Response.json(analysis);
  } catch (error) {
    console.error("Call analysis failed", error);
    return jsonError("Não foi possível analisar a conversa.", 502);
  }
}
