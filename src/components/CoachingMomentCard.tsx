import { ChevronRight, RotateCcw } from "lucide-react";
import type { CoachingMoment, ConversationTurn } from "@/domain/schemas";
import { SCORE_LABELS } from "@/domain/scoring";
import { elapsedLabel } from "@/domain/transcript";
import { ResearchEvidence } from "./ResearchEvidence";

type Props = Readonly<{ moment: CoachingMoment; index: number; transcript: readonly ConversationTurn[]; canReplay: boolean; onReplay: (moment: CoachingMoment) => void }>;

export function CoachingMomentCard({ moment, index, transcript, canReplay, onReplay }: Props) {
  return (
    <details className="moment-card upgraded" open={index === 0}>
      <summary>
        <span className="moment-time">{elapsedLabel(transcript, moment.turnId)}</span>
        <span><small>{SCORE_LABELS[moment.dimension]} · IMPACTO {moment.severity.toUpperCase()}</small><strong>{moment.issue}</strong></span>
        <ChevronRight size={20} />
      </summary>
      <div className="moment-content">
        <div className="conversation-evidence">
          {moment.customerQuote ? <section><span>CLIENTE</span><blockquote>“{moment.customerQuote}”</blockquote></section> : null}
          <section><span>VOCÊ</span><blockquote>“{moment.sellerQuote}”</blockquote></section>
        </div>
        <div className="coaching-explanation">
          <section><span>O QUE ACONTECEU</span><p>{moment.whyItMatters}</p></section>
          <section><span>MELHOR OBJETIVO</span><p>{moment.betterApproach}</p></section>
          <section className="try-this"><span>TENTE ALGO COMO</span><blockquote>“{moment.exampleResponse}”</blockquote></section>
        </div>
        {moment.customerEvidence.length ? (
          <section className="known-evidence">
            <span>EVIDÊNCIA CONHECIDA DA CLIENTE</span>
            {moment.customerEvidence.map((evidence) => <blockquote key={`${moment.id}-${evidence.claimId}`}>“{evidence.quote}”</blockquote>)}
          </section>
        ) : null}
        <ResearchEvidence ruleIds={moment.researchRuleIds} context={moment.whyItMatters} />
        {canReplay ? <button className="button rewind" type="button" onClick={() => onReplay(moment)}><RotateCcw size={18} /> Refazer deste momento</button> : null}
      </div>
    </details>
  );
}
