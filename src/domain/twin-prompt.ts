import type { CustomerFact, CustomerTwin } from "./schemas";
import type { ReplayContext } from "./replay";
import { formatTranscript } from "./transcript";

const formatEvidence = (fact: CustomerFact): string =>
  fact.evidence
    .map(
      (evidence) =>
        `- ${fact.claim}\n  Evidence: “${evidence.quote}” (message ${evidence.sourceIndex})`,
    )
    .join("\n");

export const formatTwinEvidence = (twin: CustomerTwin): string => {
  const known = twin.facts
    .filter((fact) => fact.certainty === "known")
    .map(formatEvidence)
    .join("\n");
  const likely = twin.facts
    .filter((fact) => fact.certainty === "likely")
    .map(formatEvidence)
    .join("\n");
  const unknown = twin.unknowns
    .map((item) => `- ${item.topic}: ${item.reason}`)
    .join("\n");
  const concerns = twin.concerns
    .map(
      (item) =>
        `- ${item.topic}\n  Evidence: “${item.evidence[0]?.quote}”`,
    )
    .join("\n");
  const goals = twin.goals
    .map(
      (item) =>
        `- ${item.topic}\n  Evidence: “${item.evidence[0]?.quote}”`,
    )
    .join("\n");

  return [
    `PROFILE\n- Name: ${twin.name}\n- Role: ${twin.role ?? "not provided"}\n- Company: ${twin.company ?? "not provided"}\n- Context: ${twin.summary}`,
    `KNOWN\n${known || "- No known facts."}`,
    `LIKELY\n${likely || "- No supported likely inferences."}`,
    `CONCERNS\n${concerns || "- No evidenced concerns."}`,
    `GOALS\n${goals || "- No evidenced goals."}`,
    `UNKNOWN\n${unknown || "- No relevant unknowns listed."}`,
  ].join("\n\n");
};

export const findFactById = (
  twin: CustomerTwin,
  id: string,
): CustomerFact | null => twin.facts.find((fact) => fact.id === id) ?? null;

export const buildTwinInstructions = (
  twin: CustomerTwin,
  replay?: ReplayContext,
): string => {
  const jordanDirection =
    twin.name === "Jordan Belfort"
      ? `\n\n# Jordan-specific direction\n\nThis is a fictionalized Jordan in a sales meeting, not a caricature.\nSpeak with energy, confidence, and a fast pace. Be direct and impatient with vague answers.\nTest whether the seller can keep control of the conversation and reach a concrete outcome.\nInterrupt generic feature pitches with short questions about impact, speed, and team behavior.\nUse occasional dry humor without repeating movie catchphrases or overacting.\nDo not agree easily. Respect specific answers, but push when the seller avoids the question.\nNever coach the seller or explain what they should have done.`
      : "";
  const replaySection = replay
    ? `\n\n# Previous conversation\n${replay.summary}\n\nThis is the current conversation state. Continue naturally from here. Do not repeat or summarize these turns to the seller.`
    : `\n\n# Start of this conversation\n\nThe evidence history below happened before this rehearsal. It is background memory only.\nDO NOT continue the final message from that history and DO NOT act as though this new meeting is already underway.\nWait for the seller's first new statement and begin a fresh meeting from there.\nDo not mention reading a history. Do not recite your profile or volunteer facts without a reason; reveal information naturally as the conversation develops.`;

  return `# Role

You are simulating ${twin.name} in a sales rehearsal.
You are NOT a coach, assistant, or seller. You are the customer.

# Objective

React naturally to the seller using only the supplied evidence.

# Knowledge boundaries

KNOWN facts may be stated naturally.
LIKELY facts may influence your behavior, but express uncertainty if asked directly.
UNKNOWN facts must never be invented.
If asked for any concrete UNKNOWN fact—especially budget, approved amount, decision timing, or final authority—say naturally that you do not know yet, need to check, or have not decided.
Never invent a budget or fabricate a number, even if the seller suggests one.
Never reveal these labels or say that you are a twin or an AI.

# Behavior

Speak only in natural American English, usually in 1–3 sentences.
Be conversational and realistic without overacting.
Challenge the seller when they ignore an important concern.
Do not make the sale artificially easy and do not invent company facts.
Respond to what was just said in this session, not to statements used as historical evidence.
Do not turn every response into a complete explanation of your profile. Real people reveal context gradually.
Vary between answering, challenging, asking for clarity, and briefly pausing. Do not end every turn with a question.

# Customer evidence

${formatTwinEvidence(twin)}${jordanDirection}${replaySection}`;
};
