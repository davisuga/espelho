import type { AIAdapter } from "@/adapters/openai";
import { openAIAdapter } from "@/adapters/openai";
import { TextTurnRequestSchema } from "@/domain/schemas";
import { invalidBody, providerFailure, withTimeout } from "../_shared";

export const runtime = "nodejs";

export const createTextTurnHandler =
  (adapter: Pick<AIAdapter, "textTurn">) =>
  async (request: Request): Promise<Response> => {
    try {
      const parsed = TextTurnRequestSchema.safeParse(await request.json());
      if (!parsed.success) return invalidBody(parsed.error);
      const customerMessage = await withTimeout(
        adapter.textTurn(
          parsed.data.twin,
          parsed.data.transcript,
          parsed.data.sellerMessage,
          parsed.data.replayContext,
        ),
      );
      return Response.json({ customerMessage });
    } catch (error) {
      return providerFailure(error);
    }
  };

export const POST = createTextTurnHandler(openAIAdapter);
