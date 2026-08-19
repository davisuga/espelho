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

const customerExtractionInstructions = `Extract an evidence-bounded customer simulation profile from the supplied history.

Derive only claims supported by the text. Classify direct evidence as known. Use likely only for reasonable supported inferences. Explicitly identify relevant unknown information.

Every known or likely claim must include literal quotes and the exact supplied line index.

Do not diagnose personality, infer protected traits, or invent budget, authority, company facts, goals, objections, or preferences. Return concise American English.`;

export const analysisInstructions = `Evaluate a sales rehearsal.

Evaluate only observable conversational behavior. Do not assign scores; extract structured behavioral observations using only the transcript, customer evidence, and supplied research rubric.

For each relevant behavior, identify dimension, positive/negative/missed-opportunity behavior, severity, exact seller turnId, literal seller quote, customer quote when applicable, concise explanation, and applicable research IDs.

DISCOVERY: Did the seller investigate goals, problems, constraints, decision process, or objections?
ACTIVE LISTENING: Did the seller demonstrate understanding of what the customer just said?
ADAPTIVE SELLING: Did the seller adapt to revealed information?
OBJECTION HANDLING: Did the seller explore objections before rebutting them?
VALUE COMMUNICATION: Did the seller connect the solution to a customer problem instead of listing features?
NEXT STEP: Did the seller establish a relevant next action when appropriate?

Do not infer personality or score charisma, confidence, or personality. Do not estimate purchase probability, invent customer information, or produce numeric scores.

Every turnId must exist in the transcript. Quotes must be literal excerpts. Criticism involving customer context must cite real customerEvidence or explicit transcript behavior. Use only supplied rubric IDs.

Select at most three high-value coaching moments and three concrete strengths. For each moment, provide a better approach and example response. Return concise American English.`;

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
              "Conversation so far:",
              formatTranscript(transcript),
              `Seller's new statement: ${sellerMessage}`,
              "Respond now only as the customer.",
            ].join("\n"),
          },
        ],
        text: { verbosity: "low" },
      });
      const message = response.output_text.trim();
      if (!message) {
        throw new Error("The provider returned an empty response.");
      }
      return message;
    },
  };
};

export const openAIAdapter = createOpenAIAdapter();
