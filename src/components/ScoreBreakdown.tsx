import { SCORE_DIMENSIONS, type Scorecard } from "@/domain/scoring";
import { ScoreRow } from "./ScoreRow";

type Props = Readonly<{ scorecard: Scorecard }>;

export function ScoreBreakdown({ scorecard }: Props) {
  return (
    <section className="score-breakdown" aria-labelledby="score-breakdown-title">
      <div className="section-kicker">COMPORTAMENTOS AVALIADOS</div>
      <h2 id="score-breakdown-title">Seu desempenho, dimensão por dimensão</h2>
      <div className="score-rows">
        {SCORE_DIMENSIONS.map((dimension) => <ScoreRow key={dimension} dimension={dimension} score={scorecard[dimension]} />)}
      </div>
    </section>
  );
}
