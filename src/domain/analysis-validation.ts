import type { CallAnalysis, ConversationTurn, CustomerTwin } from "./schemas";

const normalize = (value: string): string =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("pt-BR")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const containsQuote = (text: string, quote: string): boolean =>
  normalize(text).includes(normalize(quote));

export const validateAnalysisReferences = (
  analysis: CallAnalysis,
  twin: CustomerTwin,
  transcript: readonly ConversationTurn[],
): readonly string[] => {
  const errors: string[] = [];
  const sellerTurns = new Map(
    transcript.filter((turn) => turn.speaker === "seller").map((turn) => [turn.id, turn]),
  );
  const customerTurns = transcript.filter((turn) => turn.speaker === "customer");
  const knownEvidence = new Map(
    [
      ...twin.facts.flatMap((fact) => fact.evidence.map((evidence) => [fact.id, evidence.quote] as const)),
      ...twin.concerns.flatMap((concern) => concern.evidence.map((evidence) => [concern.topic, evidence.quote] as const)),
      ...twin.goals.flatMap((goal) => goal.evidence.map((evidence) => [goal.topic, evidence.quote] as const)),
    ],
  );

  const validateSellerReference = (
    kind: string,
    id: string,
    turnId: string,
    quote: string | null,
  ): void => {
    const turn = sellerTurns.get(turnId);
    if (!turn) errors.push(`${kind} ${id} aponta para um turno inexistente do vendedor.`);
    if (quote && turn && !containsQuote(turn.text, quote)) {
      errors.push(`${kind} ${id} contém uma citação que não pertence ao turno indicado.`);
    }
  };

  for (const observation of analysis.observations) {
    validateSellerReference("Observação", observation.id, observation.turnId, observation.sellerQuote);
    if (
      observation.customerQuote &&
      !customerTurns.some((turn) => containsQuote(turn.text, observation.customerQuote ?? ""))
    ) {
      errors.push(`Observação ${observation.id} contém uma fala inexistente da cliente.`);
    }
  }

  for (const strength of analysis.strengths) {
    validateSellerReference("Força", strength.id, strength.turnId, strength.sellerQuote);
  }

  for (const moment of analysis.moments) {
    validateSellerReference("Momento", moment.id, moment.turnId, moment.sellerQuote);
    if (
      moment.customerQuote &&
      !customerTurns.some((turn) => containsQuote(turn.text, moment.customerQuote ?? ""))
    ) {
      errors.push(`Momento ${moment.id} contém uma fala inexistente da cliente.`);
    }
    for (const evidence of moment.customerEvidence) {
      const quote = knownEvidence.get(evidence.claimId);
      if (!quote || !containsQuote(quote, evidence.quote)) {
        errors.push(`Momento ${moment.id} contém evidência da cliente não verificável.`);
      }
    }
  }

  return errors;
};
