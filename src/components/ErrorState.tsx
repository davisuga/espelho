import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";

export function ErrorState({ message, onRetry, onReset }: Readonly<{ message: string; onRetry: () => void; onReset: () => void }>) {
  return (
    <main className="error-shell">
      <div className="error-icon"><TriangleAlert size={26} /></div>
      <span>THAT WENT OFF SCRIPT</span>
      <h1>We could not complete this step.</h1>
      <p>{message}</p>
      <div><button className="button primary" type="button" onClick={onRetry}><RotateCcw size={17} /> Try again</button><button className="button secondary" type="button" onClick={onReset}><ArrowLeft size={17} /> Back to start</button></div>
    </main>
  );
}
