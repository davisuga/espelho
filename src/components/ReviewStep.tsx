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
        <span className="step-indicator">TREINO FINAL · REFAZER</span>
      </header>
      <div id="review">
        <ScoreHero score={overallScore} scorecard={scorecard} summary={analysis.summary} />
        <ScoreBreakdown scorecard={scorecard} />
      </div>
      <section className="qualitative-section" aria-labelledby="strengths-title">
        <span className="section-kicker">MANTENHA ISSO</span>
        <h2 id="strengths-title">O que você fez bem</h2>
        {analysis.strengths.length ? (
          <div className="strength-grid">{analysis.strengths.map((strength) => <StrengthCard key={strength.id} strength={strength} />)}</div>
        ) : <p className="empty-analysis">Ainda não houve evidência suficiente para destacar uma força específica.</p>}
      </section>
      <section className="qualitative-section improvement-section" aria-labelledby="moments-title">
        <span className="section-kicker">MUDE A CONVERSA</span>
        <h2 id="moments-title">{analysis.moments.length} {analysis.moments.length === 1 ? "momento que vale" : "momentos que valem"} refazer</h2>
        <div className="moments-list">
          {analysis.moments.map((moment, index) => (
            <CoachingMomentCard key={moment.id} moment={moment} index={index} transcript={transcript} canReplay={canReplay} onReplay={onReplay} />
          ))}
        </div>
      </section>
      <footer className="review-footer">
        <p>Simular → medir → explicar → refazer → melhorar.</p>
        <button className="text-button restart" type="button" onClick={onReset}>Começar com outra cliente</button>
      </footer>
    </main>
  );
}
