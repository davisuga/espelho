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
        <span><small>{SCORE_LABELS[moment.dimension]} · {moment.severity.toUpperCase()} IMPACT</small><strong>{moment.issue}</strong></span>
        <ChevronRight size={20} />
      </summary>
      <div className="moment-content">
        <div className="conversation-evidence">
          {moment.customerQuote ? <section><span>CUSTOMER</span><blockquote>“{moment.customerQuote}”</blockquote></section> : null}
          <section><span>YOU</span><blockquote>“{moment.sellerQuote}”</blockquote></section>
        </div>
        <div className="coaching-explanation">
          <section><span>WHAT HAPPENED</span><p>{moment.whyItMatters}</p></section>
          <section><span>BETTER GOAL</span><p>{moment.betterApproach}</p></section>
          <section className="try-this"><span>TRY SOMETHING LIKE</span><blockquote>“{moment.exampleResponse}”</blockquote></section>
        </div>
        {moment.customerEvidence.length ? (
          <section className="known-evidence">
            <span>KNOWN CUSTOMER EVIDENCE</span>
            {moment.customerEvidence.map((evidence) => <blockquote key={`${moment.id}-${evidence.claimId}`}>“{evidence.quote}”</blockquote>)}
          </section>
        ) : null}
        <ResearchEvidence ruleIds={moment.researchRuleIds} context={moment.whyItMatters} />
        {canReplay ? <button className="button rewind" type="button" onClick={() => onReplay(moment)}><RotateCcw size={18} /> Retry from this moment</button> : null}
      </div>
    </details>
  );
}
