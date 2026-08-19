import { Agent, run } from "@openai/agents";
import { z } from "zod";

import { RESEARCH_RULES } from "@/domain/research";
import {
  CallAnalysisSchema,
  CustomerTwinSchema,
  TextTurnRequestSchema,
  type CallAnalysis,
  type ConversationTurn,
  type CustomerTwin,
} from "@/domain/schemas";
import { formatTranscript } from "@/domain/transcript";
import { buildTwinInstructions } from "@/domain/twin-prompt";

const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-5.6";

const LOW_LATENCY_MODEL_SETTINGS = Object.freeze({
  reasoning: { effort: "low" as const },
  text: { verbosity: "low" as const },
});

const TextTurnOutputSchema = z.object({
  customerMessage: z.string().trim().min(1),
});

const numberedLines = (sourceText: string): string =>
  sourceText
    .split(/\r?\n/)
    .map((line, index) => `${index + 1}: ${line}`)
    .join("\n");

const extractionInstructions = `Você extrai um perfil de simulação limitado às evidências de um histórico de conversa com cliente.

Use somente alegações sustentadas pelo texto fornecido. Classifique evidência direta como "known". Use "likely" somente para uma inferência razoável apoiada por uma ou mais evidências. Liste informações relevantes ausentes em "unknowns".

Cada fato "known" ou "likely", preocupação e objetivo deve incluir uma citação fiel e o número da linha em sourceIndex. sourceIndex começa em 1. Crie IDs curtos e estáveis para os fatos.

Não diagnostique personalidade, não infira características protegidas e não invente orçamento, autoridade, empresa, metas, objeções ou preferências. Retorne texto curto em português brasileiro.`;

const analysisInstructions = `Avalie o vendedor somente por comportamentos observáveis na conversa.

Use as evidências do cliente e a rubrica de pesquisa fornecidas. Não faça diagnósticos psicológicos, não estime chance de fechamento e não dê notas para carisma, personalidade ou confiança.

Escolha no máximo três falas reais do vendedor em que mudar um comportamento poderia melhorar a conversa. turnId e sellerQuote devem copiar uma fala do vendedor fornecida. Toda crítica baseada no contexto do cliente deve apontar para um claimId e uma citação existentes. Toda recomendação de pesquisa deve usar apenas os IDs fornecidos. Prefira observações específicas e acionáveis. Retorne texto curto em português brasileiro.`;

export const extractCustomerTwin = async (
  sourceText: string,
): Promise<CustomerTwin> => {
  const agent = new Agent({
    name: "Espelho customer evidence extractor",
    instructions: extractionInstructions,
    model: TEXT_MODEL,
    modelSettings: LOW_LATENCY_MODEL_SETTINGS,
    outputType: CustomerTwinSchema,
  });
  const result = await run(
    agent,
    `Extraia o perfil deste histórico. As linhas já estão numeradas:\n\n${numberedLines(sourceText)}`,
  );

  return CustomerTwinSchema.parse(result.finalOutput);
};

export const analyzeCall = async (
  twin: CustomerTwin,
  transcript: readonly ConversationTurn[],
): Promise<CallAnalysis> => {
  const agent = new Agent({
    name: "Espelho sales conversation coach",
    instructions: analysisInstructions,
    model: TEXT_MODEL,
    modelSettings: LOW_LATENCY_MODEL_SETTINGS,
    outputType: CallAnalysisSchema,
  });
  const result = await run(
    agent,
    [
      `EVIDÊNCIAS DO CLIENTE\n${JSON.stringify(twin, null, 2)}`,
      `RUBRICA DE PESQUISA\n${JSON.stringify(RESEARCH_RULES, null, 2)}`,
      `TRANSCRIÇÃO\n${formatTranscript(transcript)}`,
      `TURN IDS\n${transcript.map((turn) => `${turn.id}: ${turn.speaker}`).join("\n")}`,
    ].join("\n\n"),
  );

  return CallAnalysisSchema.parse(result.finalOutput);
};

export const generateTextTurn = async (
  input: z.infer<typeof TextTurnRequestSchema>,
): Promise<z.infer<typeof TextTurnOutputSchema>> => {
  const validated = TextTurnRequestSchema.parse(input);
  const instructions = buildTwinInstructions(
    validated.twin,
    validated.replayContext ?? undefined,
  );
  const transcript = formatTranscript(validated.transcript);
  const latestTurn = validated.transcript.at(-1);
  const sellerLineAlreadyPresent =
    latestTurn?.speaker === "seller" &&
    latestTurn.text === validated.sellerMessage;
  const sellerLine = sellerLineAlreadyPresent
    ? ""
    : `\nVendedor: ${validated.sellerMessage}`;
  const agent = new Agent({
    name: "Espelho customer twin",
    instructions,
    model: TEXT_MODEL,
    modelSettings: LOW_LATENCY_MODEL_SETTINGS,
    outputType: TextTurnOutputSchema,
  });
  const result = await run(
    agent,
    `Conversa até agora:\n${transcript || "(início da conversa)"}${sellerLine}\n\nResponda agora como a cliente.`,
  );

  return TextTurnOutputSchema.parse(result.finalOutput);
};
