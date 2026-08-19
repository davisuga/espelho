import type { AIAdapter } from "@/adapters/openai";
import { openAIAdapter } from "@/adapters/openai";
import { AnalyzeRequestSchema, CallAnalysisSchema } from "@/domain/schemas";
import { validateAnalysisReferences } from "@/domain/analysis-validation";
import { invalidBody, providerFailure, withTimeout } from "../_shared";

export const runtime = "nodejs";

export const createAnalyzeHandler =
  (adapter: Pick<AIAdapter, "analyze">) =>
  async (request: Request): Promise<Response> => {
    try {
      const parsed = AnalyzeRequestSchema.safeParse(await request.json());
      if (!parsed.success) return invalidBody(parsed.error);
      const analysis = CallAnalysisSchema.parse(
        await withTimeout(adapter.analyze(parsed.data.twin, parsed.data.transcript)),
      );
      const referenceErrors = validateAnalysisReferences(
        analysis,
        parsed.data.twin,
        parsed.data.transcript,
      );
      if (referenceErrors.length) {
        throw new Error(`Analysis contains an unverifiable reference: ${referenceErrors[0]}`);
      }
      return Response.json(analysis);
    } catch (error) {
      return providerFailure(error);
    }
  };

export const POST = createAnalyzeHandler(openAIAdapter);
