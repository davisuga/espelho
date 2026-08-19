import { ArrowRight, BookOpen, Check, RotateCcw, Sparkles } from "lucide-react";
import type { CallAnalysis, CoachingMoment, ConversationTurn } from "@/domain/schemas";
import { elapsedLabel } from "@/domain/transcript";
import { researchRuleById } from "@/domain/research";

type Props = Readonly<{
  analysis: CallAnalysis;
  transcript: readonly ConversationTurn[];
  canReplay: boolean;
  onReplay: (moment: CoachingMoment) => void;
  onReset: () => void;
}>;

export function ReviewStep({ analysis, transcript, canReplay, onReplay, onReset }: Props) {
  return (
    <main className="coaching-shell">
      <header className="brand-header compact">
        <a className="brand" href="#review"><span className="brand-mark">E</span> Espelho</a>
        <span className="step-indicator">03 / 03 &nbsp; REFAZER</span>
      </header>

      <section className="coaching-heading" id="review">
        <div className="eyebrow"><Sparkles size={14} /> ANÁLISE CONCLUÍDA</div>
        <h1>{analysis.moments.length} {analysis.moments.length === 1 ? "momento que vale" : "momentos que valem"} refazer</h1>
        <p>Sem notas inventadas. Só comportamento, contexto e evidência.</p>
      </section>

      {analysis.strengths.length ? (
        <section className="strength-strip"><Check size={18} /><strong>O que funcionou</strong><span>{analysis.strengths.join(" · ")}</span></section>
      ) : null}

      <section className="moments-list">
        {analysis.moments.map((moment, index) => {
          const rules = moment.researchRuleIds.map(researchRuleById).filter(Boolean);
          return (
            <details className="moment-card" key={moment.id} open={index === 0}>
              <summary>
                <span className="moment-time">{elapsedLabel(transcript, moment.turnId)}</span>
                <span><small>MOMENTO {String(index + 1).padStart(2, "0")}</small><strong>{moment.issue}</strong></span>
                <ArrowRight size={20} />
              </summary>
              <div className="moment-content">
                <section className="seller-moment">
                  <span>VOCÊ DISSE</span>
                  <blockquote>“{moment.sellerQuote}”</blockquote>
                  <p>{moment.whyItMatters}</p>
                </section>
                <div className="proof-grid">
                  <section className="customer-proof">
                    <span>CLIENTE</span>
                    {moment.customerEvidence.map((evidence) => <blockquote key={`${moment.id}-${evidence.claimId}`}>“{evidence.quote}”</blockquote>)}
                  </section>
                  <section className="research-proof">
                    <span><BookOpen size={14} /> PESQUISA</span>
                    {rules.map((rule) => rule ? (
                      <div key={rule.id}>
                        <strong>{rule.id === "adaptive-selling" ? "Adaptive selling" : "Follow-up questions"}</strong>
                        <p>{rule.authors} · {rule.year}<br />{rule.journal}</p>
                        <a href={`https://doi.org/${rule.doi}`} target="_blank" rel="noreferrer">DOI {rule.doi}</a>
                      </div>
                    ) : null)}
                  </section>
                </div>
                <div className="suggested-goal"><span>NOVO OBJETIVO</span><p>{moment.suggestedGoal}</p></div>
                {canReplay ? (
                  <button className="button rewind" type="button" onClick={() => onReplay(moment)}>
                    <RotateCcw size={18} /> Refazer deste momento
                  </button>
                ) : null}
              </div>
            </details>
          );
        })}
      </section>
      <button className="text-button restart" type="button" onClick={onReset}>Começar com outra cliente</button>
    </main>
  );
}
