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
  const concerns = twin.concerns
    .map(
      (item) =>
        `- ${item.topic}\n  Evidência: “${item.evidence[0]?.quote}”`,
    )
    .join("\n");
  const goals = twin.goals
    .map(
      (item) =>
        `- ${item.topic}\n  Evidência: “${item.evidence[0]?.quote}”`,
    )
    .join("\n");

  return [
    `PERFIL\n- Nome: ${twin.name}\n- Papel: ${twin.role ?? "não informado"}\n- Empresa: ${twin.company ?? "não informada"}\n- Contexto: ${twin.summary}`,
    `CONHECIDO\n${known || "- Nenhum fato conhecido."}`,
    `PROVÁVEL\n${likely || "- Nenhuma inferência provável."}`,
    `PREOCUPAÇÕES\n${concerns || "- Nenhuma preocupação evidenciada."}`,
    `OBJETIVOS\n${goals || "- Nenhum objetivo evidenciado."}`,
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
  const jordanDirection =
    twin.name === "Jordan Belfort"
      ? `\n\n# Direção específica para Jordan\n\nEsta é uma versão ficcional de Jordan em uma reunião comercial, não uma caricatura.\nFale com energia, confiança e ritmo rápido. Seja direto e impaciente com respostas vagas.\nTeste se o vendedor consegue manter o controle da conversa e chegar a um resultado concreto.\nInterrompa apresentações genéricas de recursos com perguntas curtas sobre impacto, velocidade e comportamento da equipe.\nUse humor seco ocasionalmente, sem repetir bordões do filme e sem atuar de forma exagerada.\nNão concorde facilmente. Respeite respostas específicas, mas pressione quando o vendedor evitar a pergunta.\nNunca dê coaching ao vendedor nem explique o que ele deveria ter feito.`
      : "";
  const replaySection = replay
    ? `\n\n# Conversa anterior\n${replay.summary}\n\nEste é o estado atual da conversa. Continue naturalmente a partir daqui. Não repita nem resuma essas falas para o vendedor.`
    : `\n\n# Início desta conversa\n\nO histórico de evidências abaixo aconteceu antes deste ensaio. Ele serve somente como memória sobre a cliente.\nNÃO continue a última mensagem do histórico e NÃO aja como se esta conversa já estivesse em andamento.\nEspere a primeira fala nova do vendedor e comece uma nova reunião a partir dela.\nNão mencione que leu um histórico. Não recite seu perfil nem ofereça fatos sem motivo; revele informações naturalmente conforme a conversa.`;

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
Responda ao que acabou de ser dito nesta sessão, não às falas usadas como evidência histórica.
Não transforme toda resposta em uma explicação completa do seu perfil. Pessoas reais revelam contexto aos poucos.
Varie entre responder, desafiar, pedir clareza e fazer silêncio breve. Não termine toda fala com uma pergunta.

# Evidências da cliente

${formatTwinEvidence(twin)}${jordanDirection}${replaySection}`;
};
