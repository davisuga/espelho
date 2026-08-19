import { ArrowRight, FileText, Sparkles } from "lucide-react";

type Props = Readonly<{
  sourceText: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSample: () => void;
  onSubmit: () => void;
}>;

export function SourceStep({
  sourceText,
  isLoading,
  onChange,
  onSample,
  onSubmit,
}: Props) {
  return (
    <main className="source-shell">
      <header className="brand-header">
        <a className="brand" href="#top" aria-label="Espelho — home">
          <span className="brand-mark">E</span>
          Espelho
        </a>
        <span className="step-indicator">01 / 03 &nbsp; PASTE</span>
      </header>

      <section className="source-hero" id="top">
        <div className="eyebrow"><Sparkles size={14} /> EVIDENCE-BASED REHEARSAL</div>
        <h1>Rehearse with your customer<br />before talking to them.</h1>
        <p>
          Turn the real conversation history into a customer twin—bounded by
          what they actually said.
        </p>
      </section>

      <section className="source-card" aria-labelledby="source-title">
        <div className="source-card-heading">
          <div>
            <span className="section-number">01</span>
            <h2 id="source-title">Paste the customer history</h2>
          </div>
          <FileText size={22} aria-hidden="true" />
        </div>
        <textarea
          value={sourceText}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste messages, emails, CRM notes, or transcripts..."
          aria-label="Customer history"
          disabled={isLoading}
        />
        <div className="source-actions">
          <button className="button secondary" type="button" onClick={onSample} disabled={isLoading}>
            Use Jordan example
          </button>
          <button
            className="button primary"
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !sourceText.trim()}
          >
            {isLoading ? <span className="spinner" aria-hidden="true" /> : null}
            {isLoading ? "Creating twin..." : "Create twin"}
            {!isLoading ? <ArrowRight size={18} /> : null}
          </button>
        </div>
      </section>
      <p className="privacy-note">Nothing will be sent to the customer.</p>
    </main>
  );
}
