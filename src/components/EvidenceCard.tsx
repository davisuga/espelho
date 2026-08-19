import type { CustomerFact } from "@/domain/schemas";

export function EvidenceCard({ fact }: Readonly<{ fact: CustomerFact }>) {
  const evidence = fact.evidence[0];
  return (
    <article className={`evidence-card ${fact.certainty}`}>
      <span className="evidence-type">
        {fact.certainty === "known" ? "CONFIRMED FACT" : "INFERENCE"}
      </span>
      <h3>{fact.claim}</h3>
      <blockquote>“{evidence.quote}”</blockquote>
      <footer>History · message {evidence.sourceIndex}</footer>
    </article>
  );
}
