import { Check } from "lucide-react";
import type { CoachingStrength } from "@/domain/schemas";
import { SCORE_LABELS } from "@/domain/scoring";
import { ResearchEvidence } from "./ResearchEvidence";

type Props = Readonly<{ strength: CoachingStrength }>;

export function StrengthCard({ strength }: Props) {
  return (
    <article className="strength-card">
      <div className="strength-label"><Check size={15} /> {SCORE_LABELS[strength.dimension]}</div>
      <p>{strength.explanation}</p>
      <blockquote>“{strength.sellerQuote}”</blockquote>
      <ResearchEvidence ruleIds={strength.researchRuleIds} context={strength.explanation} />
    </article>
  );
}
