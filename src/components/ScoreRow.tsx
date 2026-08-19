import type { ScoreDimension } from "@/domain/schemas";
import { SCORE_LABELS } from "@/domain/scoring";

type Props = Readonly<{ dimension: ScoreDimension; score: number }>;

export function ScoreRow({ dimension, score }: Props) {
  return (
    <div className="score-row">
      <span>{SCORE_LABELS[dimension]}</span>
      <div className="score-track" aria-hidden="true"><span style={{ width: `${score}%` }} /></div>
      <strong>{score}</strong>
    </div>
  );
}
