import { Info } from "lucide-react";
import { SCORE_LABELS, scoreExtremes, scoreInterpretation, type Scorecard } from "@/domain/scoring";

type Props = Readonly<{ score: number; scorecard: Scorecard; summary: string }>;

export function ScoreHero({ score, scorecard, summary }: Props) {
  const { strongest, opportunity } = scoreExtremes(scorecard);
  return (
    <section className="score-hero" aria-labelledby="score-title">
      <div className="score-hero-copy">
        <span className="section-kicker">REHEARSAL RESULT</span>
        <h1 id="score-title">How did the conversation go?</h1>
        <p>{summary}</p>
        <details className="score-method">
          <summary><Info size={15} /> How is this calculated?</summary>
          <div>
            <ol>
              <li>AI identifies observable behavior in the conversation.</li>
              <li>Each observation is linked to the relevant excerpt.</li>
              <li>A deterministic function converts observations into scores.</li>
              <li>Recommendations use a fixed, curated research rubric.</li>
            </ol>
            <strong>AI does not estimate personality or purchase probability.</strong>
          </div>
        </details>
      </div>
      <div className="score-result">
        <div className="score-number"><strong>{score}</strong><span>/ 100</span></div>
        <p>{scoreInterpretation(score)}</p>
        <dl>
          <div><dt>Your strongest behavior</dt><dd>{SCORE_LABELS[strongest]} · {scorecard[strongest]}</dd></div>
          <div><dt>Biggest opportunity</dt><dd>{SCORE_LABELS[opportunity]} · {scorecard[opportunity]}</dd></div>
        </dl>
        <small>Performance on the behaviors evaluated in this rehearsal. It does not predict whether the customer will buy.</small>
      </div>
    </section>
  );
}
