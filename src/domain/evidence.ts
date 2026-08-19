import type { CustomerFact, CustomerTwin, Evidence } from "./schemas";

export type SourceLine = Readonly<{ index: number; text: string }>;

export const sourceLines = (sourceText: string): readonly SourceLine[] =>
  sourceText
    .split(/\r?\n/u)
    .map((text, index) => ({ index: index + 1, text: text.trim() }))
    .filter((line) => line.text.length > 0);

export const numberedSource = (sourceText: string): string =>
  sourceLines(sourceText)
    .map((line) => `[${line.index}] ${line.text}`)
    .join("\n");

const normalized = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");

export const evidenceMatchesSource = (
  evidence: Evidence,
  lines: readonly SourceLine[],
): boolean => {
  const line = lines.find((candidate) => candidate.index === evidence.sourceIndex);
  const quote = normalized(evidence.quote);
  const source = normalized(line?.text ?? "");
  return quote.length >= 8 && source.includes(quote);
};

const allEvidence = (twin: CustomerTwin): readonly Evidence[] => [
  ...twin.facts.flatMap((fact) => fact.evidence),
  ...twin.concerns.flatMap((concern) => concern.evidence),
  ...twin.goals.flatMap((goal) => goal.evidence),
];

export const twinEvidenceIsValid = (
  twin: CustomerTwin,
  sourceText: string,
): boolean => {
  const lines = sourceLines(sourceText);
  return allEvidence(twin).every((evidence) => evidenceMatchesSource(evidence, lines));
};

export const findFactById = (
  twin: CustomerTwin,
  id: string,
): CustomerFact | null => twin.facts.find((fact) => fact.id === id) ?? null;
