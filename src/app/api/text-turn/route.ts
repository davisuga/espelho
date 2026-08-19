import { generateTextTurn } from "@/adapters/openai";
import { TextTurnRequestSchema } from "@/domain/schemas";
import { MARIANA_TWIN } from "@/fixtures/mariana";
import { JORDAN_TWIN } from "@/fixtures/jordan";

const jsonError = (message: string, status: number): Response =>
  Response.json({ error: message }, { status });

const fallbackCustomerMessage = (sellerMessage: string): string => {
  const normalized = sellerMessage.toLocaleLowerCase("pt-BR");

  if (/budget|investment|price|cost/.test(normalized)) {
    return "I do not have a defined budget yet. I need to understand whether this actually simplifies the workflow and discuss it with my partner.";
  }

  if (/whatsapp|team|adoption|implementation/.test(normalized)) {
    return "I want to see a simple workflow for the team. How do you prevent implementation from creating more work?";
  }

  return "I understand, but I am still concerned about adding another tool and watching the team return to WhatsApp. How does this simplify the real workflow?";
};

const fallbackJordanMessage = (sellerMessage: string): string => {
  const normalized = sellerMessage.toLocaleLowerCase("pt-BR");
  if (/dashboard|relatório|integraç/.test(normalized)) {
    return "You're selling me features. I want to see whether the seller improves when the buyer applies pressure.";
  }
  if (/objeção|segunda tentativa|pratic/.test(normalized)) {
    return "Now we're talking. Show me a hard objection, the moment of failure, and how they respond on the second attempt.";
  }
  if (/budget|price|cost|number/.test(normalized)) {
    return "I'm not discussing a number before I see a concrete result.";
  }
  return "If this makes my team slower, it is useless. What behavior change can I see in practice?";
};

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = TextTurnRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Provide a valid message and customer context.", 400);
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return [MARIANA_TWIN.name, JORDAN_TWIN.name].includes(parsed.data.twin.name)
      ? Response.json({
          customerMessage:
            parsed.data.twin.name === JORDAN_TWIN.name
              ? fallbackJordanMessage(parsed.data.sellerMessage)
              : fallbackCustomerMessage(parsed.data.sellerMessage),
        })
      : jsonError("OPENAI_API_KEY is not configured.", 503);
  }

  try {
    return Response.json(await generateTextTurn(parsed.data));
  } catch (error) {
    console.error("Text rehearsal turn failed", error);
    return jsonError("The customer response could not be generated.", 502);
  }
}
