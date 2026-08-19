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

const extractionInstructions = `Extract an evidence-bounded simulation profile from customer conversation history.

Use only claims supported by the supplied text. Classify direct evidence as "known". Use "likely" only for a reasonable inference supported by evidence. List relevant missing information under "unknowns".

Every "known" or "likely" fact, concern, and goal must include a faithful quote and its numbered sourceIndex. sourceIndex starts at 1. Create short, stable fact IDs.

Do not diagnose personality, infer protected traits, or invent budget, authority, company details, goals, objections, or preferences. Return concise natural English.`;

const analysisInstructions = `Evaluate the seller only on observable conversational behavior.

Use the customer evidence and supplied research rubric. Do not make psychological diagnoses, estimate closing probability, or score charisma, personality, or confidence.

Select at most three real seller turns where changing one behavior could improve the conversation. turnId and sellerQuote must copy a supplied seller turn. Every criticism based on customer context must point to an existing claimId and quote. Every research recommendation must use only a supplied rule ID. Prefer precise, actionable observations. Return concise natural English.`;

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
    `Extract a profile from this history. The lines are already numbered:\n\n${numberedLines(sourceText)}`,
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
      `CUSTOMER EVIDENCE\n${JSON.stringify(twin, null, 2)}`,
      `RESEARCH RUBRIC\n${JSON.stringify(RESEARCH_RULES, null, 2)}`,
      `TRANSCRIPT\n${formatTranscript(transcript)}`,
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
    : `\nSeller: ${validated.sellerMessage}`;
  const agent = new Agent({
    name: "Espelho customer twin",
    instructions,
    model: TEXT_MODEL,
    modelSettings: LOW_LATENCY_MODEL_SETTINGS,
    outputType: TextTurnOutputSchema,
  });
  const result = await run(
    agent,
    `Conversation so far:\n${transcript || "(start of conversation)"}${sellerLine}\n\nRespond now as the customer in English.`,
  );

  return TextTurnOutputSchema.parse(result.finalOutput);
};
