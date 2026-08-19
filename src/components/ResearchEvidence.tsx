import { BookOpen, ExternalLink } from "lucide-react";
import { researchRuleById } from "@/domain/research";
import type { ResearchRuleId } from "@/domain/schemas";

type Props = Readonly<{ ruleIds: readonly ResearchRuleId[]; context: string }>;

export function ResearchEvidence({ ruleIds, context }: Props) {
  const rules = ruleIds.map(researchRuleById).filter((rule) => rule !== null);
  if (!rules.length) return null;
  return (
    <div className="research-stack">
      {rules.map((rule) => (
        <details className="research-evidence" key={rule.id}>
          <summary>
            <span><BookOpen size={14} /> RESEARCH BASIS</span>
            <strong>{rule.behavior}</strong>
            <small>{rule.authors} · {rule.year}</small>
          </summary>
          <div>
            <span>THE PRINCIPLE</span><p>{rule.coachingPrinciple}</p>
            <span>HOW IT APPEARS HERE</span><p>{context}</p>
            <footer>
              {rule.title}<br />{rule.journal}
              {rule.doi ? <a href={`https://doi.org/${rule.doi}`} target="_blank" rel="noreferrer">View publication <ExternalLink size={12} /></a> : null}
            </footer>
          </div>
        </details>
      ))}
    </div>
  );
}
