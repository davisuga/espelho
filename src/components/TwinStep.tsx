import { ArrowLeft, ArrowRight, CircleHelp, Mic2, ShieldCheck } from "lucide-react";
import type { CustomerTwin } from "@/domain/schemas";
import { EvidenceCard } from "./EvidenceCard";

type Props = Readonly<{
  twin: CustomerTwin;
  onBack: () => void;
  onPractice: () => void;
}>;

export function TwinStep({ twin, onBack, onPractice }: Props) {
  const known = twin.facts.filter((fact) => fact.certainty === "known");
  const likely = twin.facts.filter((fact) => fact.certainty === "likely").slice(0, 2);

  return (
    <main className="review-shell">
      <header className="brand-header compact">
        <button className="text-button" type="button" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <span className="step-indicator">02 / 03 &nbsp; CONHECER</span>
      </header>

      <section className="twin-heading">
        <div className="twin-avatar">{twin.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <div className="eyebrow"><ShieldCheck size={14} /> PERFIL LIMITADO ÀS EVIDÊNCIAS</div>
          <h1>Conheça {twin.name}</h1>
          <p>Tudo que este espelho sabe vem do histórico que você forneceu.</p>
        </div>
      </section>

      <section className="evidence-grid">
        <div className="evidence-column known-column">
          <div className="column-heading"><span className="dot green" /> SABEMOS <strong>{known.length}</strong></div>
          {known.map((fact) => <EvidenceCard key={fact.id} fact={fact} />)}
        </div>
        <div className="evidence-column likely-column">
          <div className="column-heading"><span className="dot amber" /> PROVAVELMENTE <strong>{likely.length}</strong></div>
          {likely.length ? likely.map((fact) => <EvidenceCard key={fact.id} fact={fact} />) : (
            <p className="empty-inference">Nenhuma inferência necessária. Melhor não adivinhar.</p>
          )}
        </div>
        <div className="evidence-column unknown-column">
          <div className="column-heading"><span className="dot gray" /> NÃO SABEMOS <strong>{twin.unknowns.length}</strong></div>
          <div className="unknown-list">
            {twin.unknowns.map((unknown) => (
              <div className="unknown-chip" key={unknown.topic}>
                <CircleHelp size={16} />
                <span>{unknown.topic}<small>{unknown.reason}</small></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="practice-cta">
        <div>
          <span>PRONTO PARA O ENSAIO</span>
          <p>Converse com {twin.name} e teste sua abordagem em voz alta.</p>
        </div>
        <button className="button primary large" type="button" onClick={onPractice}>
          <Mic2 size={20} /> Ensaiar conversa <ArrowRight size={18} />
        </button>
      </section>
    </main>
  );
}
