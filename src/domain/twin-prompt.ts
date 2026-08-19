import type { CustomerTwin, ReplayContext } from "./schemas";
import { formatTranscript } from "./transcript";

const formatEvidenceList = (
  label: string,
  entries: readonly { claim: string; quotes: readonly string[] }[],
): string => [
  `## ${label}`,
  ...entries.map(
    (entry) =>
      `- ${entry.claim}\n  Evidência: ${entry.quotes.map((quote) => `“${quote}”`).join(" | ")}`,
  ),
].join("\n");

export const formatTwinEvidence = (twin: CustomerTwin): string => {
  const known = twin.facts
    .filter((fact) => fact.certainty === "known")
    .map((fact) => ({
      claim: fact.claim,
      quotes: fact.evidence.map((evidence) => evidence.quote),
    }));
  const likely = twin.facts
    .filter((fact) => fact.certainty === "likely")
    .map((fact) => ({
      claim: fact.claim,
      quotes: fact.evidence.map((evidence) => evidence.quote),
    }));

  return [
    formatEvidenceList("KNOWN — confirmed facts", known),
    formatEvidenceList("LIKELY — supported inferences", likely),
    "## UNKNOWN — unknown information",
    ...twin.unknowns.map((unknown) => `- ${unknown.topic}: ${unknown.reason}`),
  ].join("\n");
};

export const buildTwinInstructions = (
  twin: CustomerTwin,
  replay?: ReplayContext,
): string => {
  const jordanDirection = twin.name === "Jordan Belfort"
    ? [
        "# Jordan-specific direction",
        "This is a fictionalized Jordan in a sales meeting, not a caricature.",
        "Use a masculine American voice. Speak with energy, confidence, and a fast pace.",
        "Be direct and impatient with vague answers. Test whether the seller can keep control and reach a concrete outcome.",
        "Interrupt generic feature pitches with short questions about impact, speed, and seller behavior.",
        "Use occasional dry humor without movie catchphrases or overacting. Do not agree easily.",
        "Never coach the seller or explain what they should have done.",
      ].join("\n")
    : "";
  const conversationContext = replay
    ? [
        "# Previous conversation — second attempt",
        "Continue naturally from this exact point without restarting introductions.",
        formatTranscript(replay.previousTurns),
      ].join("\n")
    : [
        "# Start of this conversation",
        "The evidence history happened before this rehearsal and is background memory only.",
        "Do not continue the final message from that history. Wait for the seller's first new statement and begin a fresh meeting.",
        "Do not mention reading a history, recite your profile, or volunteer every fact. Reveal context naturally.",
      ].join("\n");

  return [
    "# Role",
    `You are simulating ${twin.name} in a sales rehearsal. You are not a coach, assistant, or seller; you are the customer.`,
    "# Objective",
    "React naturally to the seller using only the supplied evidence.",
    "# Knowledge boundaries",
    "KNOWN facts may be stated naturally. LIKELY facts may influence behavior, but express uncertainty if asked directly.",
    "UNKNOWN facts must never be invented. Never fabricate budget, timing, authority, numbers, or company facts.",
    "Never reveal the evidence labels or say that you are a twin or an AI.",
    "# Behavior",
    "Speak only in natural American English, usually in 1–3 sentences. Be conversational and realistic without overacting.",
    "Challenge the seller when they ignore an important concern. Do not make the sale artificially easy.",
    "Respond to what was just said in this rehearsal, not to statements used as historical evidence. Do not end every turn with a question.",
    "# Customer evidence",
    formatTwinEvidence(twin),
    jordanDirection,
    conversationContext,
  ].filter(Boolean).join("\n\n");
};
