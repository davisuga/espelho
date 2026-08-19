import { Info } from "lucide-react";
import { SCORE_LABELS, scoreExtremes, scoreInterpretation, type Scorecard } from "@/domain/scoring";

type Props = Readonly<{ score: number; scorecard: Scorecard; summary: string }>;

export function ScoreHero({ score, scorecard, summary }: Props) {
  const { strongest, opportunity } = scoreExtremes(scorecard);
  return (
    <section className="score-hero" aria-labelledby="score-title">
      <div className="score-hero-copy">
        <span className="section-kicker">RESULTADO DO TREINO</span>
        <h1 id="score-title">Como foi sua conversa?</h1>
        <p>{summary}</p>
        <details className="score-method">
          <summary><Info size={15} /> Como calculamos isso?</summary>
          <div>
            <ol>
              <li>A IA identifica comportamentos observáveis na conversa.</li>
              <li>Cada observação é vinculada ao trecho correspondente.</li>
              <li>Uma função determinística transforma as observações em scores.</li>
              <li>As recomendações usam uma rubrica científica estática e selecionada.</li>
            </ol>
            <strong>A IA não estima personalidade nem probabilidade de compra.</strong>
          </div>
        </details>
      </div>
      <div className="score-result">
        <div className="score-number"><strong>{score}</strong><span>/ 100</span></div>
        <p>{scoreInterpretation(score)}</p>
        <dl>
          <div><dt>Seu melhor comportamento</dt><dd>{SCORE_LABELS[strongest]} · {scorecard[strongest]}</dd></div>
          <div><dt>Maior oportunidade</dt><dd>{SCORE_LABELS[opportunity]} · {scorecard[opportunity]}</dd></div>
        </dl>
        <small>Desempenho nos comportamentos avaliados neste ensaio. Não prevê se a cliente comprará.</small>
      </div>
    </section>
  );
}
