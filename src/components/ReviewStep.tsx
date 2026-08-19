import type { CallAnalysis, CoachingMoment, ConversationTurn } from "@/domain/schemas";
import { calculateOverallScore, calculateScorecard } from "@/domain/scoring";
import { CoachingMomentCard } from "./CoachingMomentCard";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { ScoreHero } from "./ScoreHero";
import { StrengthCard } from "./StrengthCard";

type Props = Readonly<{
  analysis: CallAnalysis;
  transcript: readonly ConversationTurn[];
  canReplay: boolean;
  onReplay: (moment: CoachingMoment) => void;
  onReset: () => void;
}>;

export function ReviewStep({ analysis, transcript, canReplay, onReplay, onReset }: Props) {
  const scorecard = calculateScorecard(analysis.observations);
  const overallScore = calculateOverallScore(scorecard);
  return (
    <main className="coaching-shell">
      <header className="brand-header compact">
        <a className="brand" href="#review"><span className="brand-mark">E</span> Espelho</a>
        <span className="step-indicator">FINAL REVIEW · RETRY</span>
      </header>
      <div id="review">
        <ScoreHero score={overallScore} scorecard={scorecard} summary={analysis.summary} />
        <ScoreBreakdown scorecard={scorecard} />
      </div>
      <section className="qualitative-section" aria-labelledby="strengths-title">
        <span className="section-kicker">KEEP DOING THIS</span>
        <h2 id="strengths-title">What you did well</h2>
        {analysis.strengths.length ? (
          <div className="strength-grid">{analysis.strengths.map((strength) => <StrengthCard key={strength.id} strength={strength} />)}</div>
        ) : <p className="empty-analysis">There was not enough evidence to highlight a specific strength yet.</p>}
      </section>
      <section className="qualitative-section improvement-section" aria-labelledby="moments-title">
        <span className="section-kicker">CHANGE THE CONVERSATION</span>
        <h2 id="moments-title">{analysis.moments.length} {analysis.moments.length === 1 ? "moment worth" : "moments worth"} retrying</h2>
        <div className="moments-list">
          {analysis.moments.map((moment, index) => (
            <CoachingMomentCard key={moment.id} moment={moment} index={index} transcript={transcript} canReplay={canReplay} onReplay={onReplay} />
          ))}
        </div>
      </section>
      <footer className="review-footer">
        <p>Simulate → measure → explain → retry → improve.</p>
        <button className="text-button restart" type="button" onClick={onReset}>Start with another customer</button>
      </footer>
    </main>
  );
}
