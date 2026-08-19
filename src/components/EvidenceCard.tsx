import type { CustomerFact } from "@/domain/schemas";

export function EvidenceCard({ fact }: Readonly<{ fact: CustomerFact }>) {
  const evidence = fact.evidence[0];
  return (
    <article className={`evidence-card ${fact.certainty}`}>
      <span className="evidence-type">
        {fact.certainty === "known" ? "FATO CONFIRMADO" : "INFERÊNCIA"}
      </span>
      <h3>{fact.claim}</h3>
      <blockquote>“{evidence.quote}”</blockquote>
      <footer>Histórico · mensagem {evidence.sourceIndex}</footer>
    </article>
  );
}
