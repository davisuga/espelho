import { extractCustomerTwin } from "@/adapters/openai";
import { TwinRequestSchema, CustomerTwinSchema } from "@/domain/schemas";
import {
  MARIANA_TWIN,
} from "@/fixtures/mariana";
import { JORDAN_TWIN } from "@/fixtures/jordan";

const jsonError = (message: string, status: number): Response =>
  Response.json({ error: message }, { status });

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = TwinRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Provide valid conversation history.", 400);
  }

  const isJordanDemo =
    parsed.data.sourceText.includes("My team sells on the phone") &&
    parsed.data.sourceText.includes("I don't need another dashboard");
  if (isJordanDemo) {
    return Response.json(CustomerTwinSchema.parse(JORDAN_TWIN));
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    const isMarianaDemo =
      parsed.data.sourceText.includes("Já contratei dois sistemas antes") &&
      parsed.data.sourceText.includes("dar mais trabalho para a equipe");
    return isMarianaDemo
      ? Response.json(CustomerTwinSchema.parse(MARIANA_TWIN))
      : jsonError("OPENAI_API_KEY is not configured.", 503);
  }

  try {
    const twin = CustomerTwinSchema.parse(
      await extractCustomerTwin(parsed.data.sourceText),
    );
    return Response.json(twin);
  } catch (error) {
    console.error("Customer twin extraction failed", error);
    return jsonError("The customer profile could not be extracted.", 502);
  }
}
