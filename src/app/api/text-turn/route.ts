import { generateTextTurn } from "@/adapters/openai";
import { TextTurnRequestSchema } from "@/domain/schemas";
import { MARIANA_TWIN } from "@/fixtures/mariana";

const jsonError = (message: string, status: number): Response =>
  Response.json({ error: message }, { status });

const fallbackCustomerMessage = (sellerMessage: string): string => {
  const normalized = sellerMessage.toLocaleLowerCase("pt-BR");

  if (/orçamento|budget|investimento|valor|preço/.test(normalized)) {
    return "Ainda não tenho um orçamento definido. Preciso entender se isso realmente simplifica a rotina e conversar com meu sócio.";
  }

  if (/whatsapp|equipe|meninas|adoção|implanta/.test(normalized)) {
    return "O que eu quero ver é uma rotina simples para as meninas. Como vocês evitam que a implantação vire mais trabalho?";
  }

  return "Entendi, mas meu receio ainda é colocar mais uma ferramenta e a equipe voltar para o WhatsApp. Como isso simplifica a rotina na prática?";
};

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = TextTurnRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Envie uma mensagem e um contexto válidos.", 400);
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return parsed.data.twin.name === MARIANA_TWIN.name
      ? Response.json({
          customerMessage: fallbackCustomerMessage(parsed.data.sellerMessage),
        })
      : jsonError("OPENAI_API_KEY não está configurada.", 503);
  }

  try {
    return Response.json(await generateTextTurn(parsed.data));
  } catch (error) {
    console.error("Text rehearsal turn failed", error);
    return jsonError("Não foi possível responder como a cliente.", 502);
  }
}
