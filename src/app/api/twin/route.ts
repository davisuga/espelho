import type { AIAdapter } from "@/adapters/openai";
import { openAIAdapter } from "@/adapters/openai";
import { twinEvidenceIsValid } from "@/domain/evidence";
import { CustomerTwinSchema, TwinRequestSchema } from "@/domain/schemas";
import { apiError, invalidBody, providerFailure, withTimeout } from "../_shared";

export const runtime = "nodejs";

export const createTwinHandler =
  (adapter: Pick<AIAdapter, "extractTwin">) =>
  async (request: Request): Promise<Response> => {
    try {
      const parsed = TwinRequestSchema.safeParse(await request.json());
      if (!parsed.success) return invalidBody(parsed.error);

      const twin = CustomerTwinSchema.parse(
        await withTimeout(adapter.extractTwin(parsed.data.sourceText)),
      );
      if (!twinEvidenceIsValid(twin, parsed.data.sourceText)) {
        return apiError(
          "invalid_provider_evidence",
          "O modelo retornou uma evidência que não corresponde ao histórico.",
          502,
        );
      }
      return Response.json(twin);
    } catch (error) {
      return providerFailure(error);
    }
  };

export const POST = createTwinHandler(openAIAdapter);
