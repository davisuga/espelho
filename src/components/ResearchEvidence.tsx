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
            <span><BookOpen size={14} /> BASE CIENTÍFICA</span>
            <strong>{rule.behavior}</strong>
            <small>{rule.authors} · {rule.year}</small>
          </summary>
          <div>
            <span>O PRINCÍPIO</span><p>{rule.coachingPrinciple}</p>
            <span>COMO ISSO APARECE AQUI</span><p>{context}</p>
            <footer>
              {rule.title}<br />{rule.journal}
              {rule.doi ? <a href={`https://doi.org/${rule.doi}`} target="_blank" rel="noreferrer">Ver publicação <ExternalLink size={12} /></a> : null}
            </footer>
          </div>
        </details>
      ))}
    </div>
  );
}
