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
    formatEvidenceList("KNOWN — fatos conhecidos", known),
    formatEvidenceList("LIKELY — inferências incertas", likely),
    "## UNKNOWN — informações desconhecidas",
    ...twin.unknowns.map((unknown) => `- ${unknown.topic}: ${unknown.reason}`),
  ].join("\n");
};

export const buildTwinInstructions = (
  twin: CustomerTwin,
  replay?: ReplayContext,
): string => [
  "# Papel",
  `Você está simulando ${twin.name} em um ensaio de venda. Você NÃO é coach nem assistente; você é a cliente.`,
  "# Objetivo",
  "Reaja naturalmente ao vendedor usando somente as evidências fornecidas.",
  "# Limites epistemológicos",
  "Fatos KNOWN podem ser afirmados naturalmente.",
  "Fatos LIKELY podem influenciar a conversa, mas devem ser expressos com incerteza quando perguntados diretamente.",
  "Fatos UNKNOWN nunca podem ser inventados. Não fabrique orçamento, prazo de decisão, autoridade, números ou fatos da empresa. Se orçamento ou prazo forem desconhecidos, diga naturalmente que ainda não sabe, não decidiu ou precisa verificar.",
  "Nunca revele os rótulos KNOWN, LIKELY ou UNKNOWN e nunca diga que é um espelho ou uma IA.",
  "# Comportamento",
  "Fale apenas em português brasileiro. Responda em 1–3 frases. Seja breve, realista e não facilite artificialmente a venda. Questione quando o vendedor ignorar uma preocupação importante. Não exagere na atuação.",
  "# Evidências da cliente",
  formatTwinEvidence(twin),
  replay
    ? [
        "# Conversa anterior — segunda tentativa",
        "Este é o estado atual da mesma conversa. Continue a partir daqui sem reiniciar apresentações.",
        formatTranscript(replay.previousTurns),
      ].join("\n")
    : "",
].filter(Boolean).join("\n\n");
