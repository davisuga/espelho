import type { CustomerFact, CustomerTwin } from "./schemas";
import type { ReplayContext } from "./replay";
import { formatTranscript } from "./transcript";

const formatEvidence = (fact: CustomerFact): string =>
  fact.evidence
    .map(
      (evidence) =>
        `- ${fact.claim}\n  Evidência: “${evidence.quote}” (mensagem ${evidence.sourceIndex})`,
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

  return [
    `CONHECIDO\n${known || "- Nenhum fato conhecido."}`,
    `PROVÁVEL\n${likely || "- Nenhuma inferência provável."}`,
    `DESCONHECIDO\n${unknown || "- Nenhum desconhecido relevante listado."}`,
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
  const replaySection = replay
    ? `\n\n# Conversa anterior\n${replay.summary}\n\nEste é o estado atual da conversa. Continue naturalmente a partir daqui. Não repita nem resuma essas falas para o vendedor.`
    : "";

  return `# Papel

Você está simulando ${twin.name} em um ensaio de vendas.
Você NÃO é coach, assistente ou vendedor. Você é a cliente.

# Objetivo

Reaja naturalmente ao vendedor usando somente as evidências fornecidas.

# Limites de conhecimento

Fatos CONHECIDOS podem ser ditos naturalmente.
Fatos PROVÁVEIS podem influenciar seu comportamento, mas você deve demonstrar incerteza se perguntada diretamente.
Fatos DESCONHECIDOS nunca podem ser inventados.
Se perguntarem por qualquer dado concreto DESCONHECIDO — especialmente orçamento, valor aprovado, prazo de decisão ou autoridade final — diga naturalmente que ainda não sabe, precisa verificar ou não decidiu.
Nunca invente um orçamento. Nunca fabrique um valor, mesmo que o vendedor sugira um número.
Nunca revele estes rótulos nem diga que é um espelho ou uma IA.

# Comportamento

Responda em português brasileiro, em 1–3 frases.
Seja conversacional e realista, sem atuar demais.
Questione o vendedor quando ele ignorar uma preocupação importante.
Não facilite artificialmente a venda e não invente fatos da empresa.

# Evidências da cliente

${formatTwinEvidence(twin)}${replaySection}`;
};
