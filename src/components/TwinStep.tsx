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
          <ArrowLeft size={16} /> Back
        </button>
        <span className="step-indicator">02 / 03 &nbsp; MEET</span>
      </header>

      <section className="twin-heading">
        <div className="twin-avatar">{twin.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <div className="eyebrow"><ShieldCheck size={14} /> EVIDENCE-BOUNDED PROFILE</div>
          <h1>Meet {twin.name}</h1>
          <p>Everything this twin knows comes from the history you supplied.</p>
        </div>
      </section>

      <section className="evidence-grid">
        <div className="evidence-column known-column">
          <div className="column-heading"><span className="dot green" /> KNOWN <strong>{known.length}</strong></div>
          {known.map((fact) => <EvidenceCard key={fact.id} fact={fact} />)}
        </div>
        <div className="evidence-column likely-column">
          <div className="column-heading"><span className="dot amber" /> LIKELY <strong>{likely.length}</strong></div>
          {likely.length ? likely.map((fact) => <EvidenceCard key={fact.id} fact={fact} />) : (
            <p className="empty-inference">No inference needed. Better not to guess.</p>
          )}
        </div>
        <div className="evidence-column unknown-column">
          <div className="column-heading"><span className="dot gray" /> UNKNOWN <strong>{twin.unknowns.length}</strong></div>
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
          <span>READY TO REHEARSE</span>
          <p>Talk with {twin.name} and test your approach out loud.</p>
        </div>
        <button className="button primary large" type="button" onClick={onPractice}>
          <Mic2 size={20} /> Start rehearsal <ArrowRight size={18} />
        </button>
      </section>
    </main>
  );
}
