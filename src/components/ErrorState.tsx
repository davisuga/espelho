import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";

export function ErrorState({ message, onRetry, onReset }: Readonly<{ message: string; onRetry: () => void; onReset: () => void }>) {
  return (
    <main className="error-shell">
      <div className="error-icon"><TriangleAlert size={26} /></div>
      <span>ALGO SAIU DO ROTEIRO</span>
      <h1>Não conseguimos concluir esta etapa.</h1>
      <p>{message}</p>
      <div><button className="button primary" type="button" onClick={onRetry}><RotateCcw size={17} /> Tentar novamente</button><button className="button secondary" type="button" onClick={onReset}><ArrowLeft size={17} /> Voltar ao início</button></div>
    </main>
  );
}
