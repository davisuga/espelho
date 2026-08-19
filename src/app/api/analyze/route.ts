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
import {
  JORDAN_TWIN,
  deterministicJordanAnalysis,
} from "@/fixtures/jordan";

const jsonError = (message: string, status: number): Response =>
  Response.json({ error: message }, { status });

const fallbackAnalysis = (
  customerName: string,
  transcript: readonly ConversationTurn[],
): CallAnalysis => {
  const sellerTurn = transcript.find((turn) => turn.speaker === "seller");

  return sellerTurn
    ? customerName === JORDAN_TWIN.name
      ? deterministicJordanAnalysis(sellerTurn.id, sellerTurn.text)
      : deterministicAnalysis(sellerTurn.id, sellerTurn.text)
    : {
        summary: "The conversation does not contain a seller turn to analyze yet.",
        strengths: [],
        moments: [],
      };
};

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = AnalysisRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Provide a valid profile and transcript.", 400);
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return [MARIANA_TWIN.name, JORDAN_TWIN.name].includes(parsed.data.twin.name)
      ? Response.json(
          CallAnalysisSchema.parse(fallbackAnalysis(parsed.data.twin.name, parsed.data.transcript)),
        )
      : jsonError("OPENAI_API_KEY is not configured.", 503);
  }

  try {
    const analysis = CallAnalysisSchema.parse(
      await analyzeCall(parsed.data.twin, parsed.data.transcript),
    );
    return Response.json(analysis);
  } catch (error) {
    console.error("Call analysis failed", error);
    return jsonError("The conversation could not be analyzed.", 502);
  }
}
