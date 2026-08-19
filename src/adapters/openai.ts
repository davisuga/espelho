import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { numberedSource } from "@/domain/evidence";
import { RESEARCH_RULES } from "@/domain/research";
import {
  CallAnalysisSchema,
  CustomerTwinSchema,
  type CallAnalysis,
  type ConversationTurn,
  type CustomerTwin,
  type ReplayContext,
} from "@/domain/schemas";
import { buildTwinInstructions } from "@/domain/twin-prompt";
import { formatTranscript } from "@/domain/transcript";

export type AIAdapter = Readonly<{
  extractTwin: (sourceText: string) => Promise<CustomerTwin>;
  analyze: (
    twin: CustomerTwin,
    transcript: readonly ConversationTurn[],
  ) => Promise<CallAnalysis>;
  textTurn: (
    twin: CustomerTwin,
    transcript: readonly ConversationTurn[],
    sellerMessage: string,
    replayContext?: ReplayContext,
  ) => Promise<string>;
}>;

const textModel = (): string => process.env.OPENAI_TEXT_MODEL ?? "gpt-5.6";

const customerExtractionInstructions = `Você extrai um perfil de simulação limitado às evidências do histórico de uma cliente.

Derive somente afirmações sustentadas pelo texto. Classifique evidência direta como known. Use likely apenas para inferências razoáveis sustentadas por evidência. Identifique explicitamente informações unknown relevantes.

Toda afirmação known ou likely deve conter uma ou mais citações do texto e o índice exato da linha fornecida. A citação deve ser um trecho literal da linha, sem paráfrase.

Não diagnostique personalidade, não infira traços protegidos e não invente orçamento, autoridade, empresa, metas, objeções ou preferências. Retorne conteúdo conciso em português brasileiro.`;

export const analysisInstructions = `Você está avaliando um ensaio de vendas.

Avalie SOMENTE comportamento conversacional observável. Sua tarefa NÃO é atribuir notas: extraia observações comportamentais estruturadas. Use apenas a transcrição, as evidências da cliente e a rubrica de pesquisa fornecida.

Para cada comportamento relevante, identifique dimensão, comportamento positivo/negativo/oportunidade perdida, severidade, turnId exato do vendedor, citação literal do vendedor, fala da cliente quando aplicável, explicação concisa e IDs de pesquisa aplicáveis.

DISCOVERY: o vendedor investigou objetivos, problemas, restrições, processo de decisão ou objeções?
ACTIVE LISTENING: demonstrou compreensão do que a cliente acabara de dizer?
ADAPTIVE SELLING: adaptou a abordagem às informações reveladas?
OBJECTION HANDLING: explorou objeções antes de tentar rebatê-las?
VALUE COMMUNICATION: conectou a solução a um problema da cliente em vez de apenas listar recursos?
NEXT STEP: estabeleceu uma próxima ação relevante quando apropriado?

Não infira personalidade. Não pontue carisma, confiança ou personalidade. Não estime probabilidade de venda. Não invente informações da cliente. Não produza scores numéricos.

Todo turnId deve existir na transcrição. sellerQuote e customerQuote devem ser trechos literais dos respectivos turnos. Toda crítica envolvendo contexto da cliente deve apontar para customerEvidence real ou comportamento explícito da transcrição. Use somente IDs da rubrica fornecida.

Selecione no máximo três momentos de coaching de alto valor e até três forças concretas. Para cada momento, dê uma abordagem melhor e uma resposta exemplo. Retorne conteúdo conciso em português brasileiro.`;

export const createOpenAIAdapter = (providedClient?: OpenAI): AIAdapter => {
  const client = (): OpenAI => providedClient ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return {
    extractTwin: async (sourceText) => {
      const response = await client().responses.parse({
        model: textModel(),
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: customerExtractionInstructions },
          { role: "user", content: numberedSource(sourceText) },
        ],
        text: {
          format: zodTextFormat(CustomerTwinSchema, "customer_twin"),
          verbosity: "low",
        },
      });
      return CustomerTwinSchema.parse(response.output_parsed);
    },

    analyze: async (twin, transcript) => {
      const response = await client().responses.parse({
        model: textModel(),
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: analysisInstructions },
          {
            role: "user",
            content: JSON.stringify({
              customerTwin: twin,
              transcript,
              researchRubric: RESEARCH_RULES,
            }),
          },
        ],
        text: {
          format: zodTextFormat(CallAnalysisSchema, "call_analysis"),
          verbosity: "low",
        },
      });
      return CallAnalysisSchema.parse(response.output_parsed);
    },

    textTurn: async (twin, transcript, sellerMessage, replayContext) => {
      const response = await client().responses.create({
        model: textModel(),
        reasoning: { effort: "low" },
        instructions: buildTwinInstructions(twin, replayContext),
        input: [
          {
            role: "user",
            content: [
              "Conversa até agora:",
              formatTranscript(transcript),
              `Nova fala do vendedor: ${sellerMessage}`,
              "Responda agora somente como a cliente.",
            ].join("\n"),
          },
        ],
        text: { verbosity: "low" },
      });
      const message = response.output_text.trim();
      if (!message) {
        throw new Error("O provedor retornou uma resposta vazia.");
      }
      return message;
    },
  };
};

export const openAIAdapter = createOpenAIAdapter();
