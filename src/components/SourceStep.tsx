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
        <a className="brand" href="#top" aria-label="Espelho — início">
          <span className="brand-mark">E</span>
          Espelho
        </a>
        <span className="step-indicator">01 / 03 &nbsp; COLAR</span>
      </header>

      <section className="source-hero" id="top">
        <div className="eyebrow"><Sparkles size={14} /> ENSAIO COM EVIDÊNCIA</div>
        <h1>Treine com seu cliente<br />antes de falar com ele.</h1>
        <p>
          Transforme o histórico real da conversa em um espelho da cliente —
          limitado ao que ela realmente disse.
        </p>
      </section>

      <section className="source-card" aria-labelledby="source-title">
        <div className="source-card-heading">
          <div>
            <span className="section-number">01</span>
            <h2 id="source-title">Cole o histórico da cliente</h2>
          </div>
          <FileText size={22} aria-hidden="true" />
        </div>
        <textarea
          value={sourceText}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Cole mensagens do WhatsApp, emails, notas do CRM ou transcrições..."
          aria-label="Histórico da cliente"
          disabled={isLoading}
        />
        <div className="source-actions">
          <button className="button secondary" type="button" onClick={onSample} disabled={isLoading}>
            Usar exemplo
          </button>
          <button
            className="button primary"
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !sourceText.trim()}
          >
            {isLoading ? <span className="spinner" aria-hidden="true" /> : null}
            {isLoading ? "Criando espelho..." : "Criar espelho"}
            {!isLoading ? <ArrowRight size={18} /> : null}
          </button>
        </div>
      </section>
      <p className="privacy-note">Nada será enviado à cliente.</p>
    </main>
  );
}
