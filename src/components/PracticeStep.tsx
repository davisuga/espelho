import { ArrowLeft, CornerDownLeft, Keyboard, MicOff, RotateCcw } from "lucide-react";
import type { VoiceStatus } from "@/adapters/realtime";
import type { ConversationTurn, CustomerTwin } from "@/domain/schemas";
import type { Phase, PracticeMode } from "@/domain/app-state";
import { VoiceOrb } from "./VoiceOrb";

type Props = Readonly<{
  twin: CustomerTwin;
  phase: Phase;
  mode: PracticeMode | null;
  status: VoiceStatus;
  transcript: readonly ConversationTurn[];
  isReplay: boolean;
  rewindLabel: string | null;
  voiceError: string | null;
  isSendingText: boolean;
  onBack: () => void;
  onTextMode: () => void;
  onSendText: (message: string) => void;
  onEnd: () => void;
}>;

const statusCopy = (status: VoiceStatus, name: string): string =>
  status === "speaking" ? `${name} is speaking...` : status === "listening" ? "Listening" : "Connecting";

export function PracticeStep({
  twin,
  phase,
  mode,
  status,
  transcript,
  isReplay,
  rewindLabel,
  voiceError,
  isSendingText,
  onBack,
  onTextMode,
  onSendText,
  onEnd,
}: Props) {
  const latest = transcript.slice(-3);
  const isBusy = phase === "connecting" || phase === "analyzing";

  return (
    <main className="practice-screen">
      <header className="practice-header">
        <button className="practice-back" type="button" onClick={onBack} disabled={isBusy}>
          <ArrowLeft size={17} /> End
        </button>
        {isReplay ? (
          <div className="replay-badge"><RotateCcw size={14} /> Second attempt</div>
        ) : <span className="practice-label">LIVE REHEARSAL</span>}
        <span className="secure-label"><span /> PRIVATE SESSION</span>
      </header>

      <section className="practice-center">
        {isReplay && rewindLabel ? <p className="rewind-copy">Back to {rewindLabel}</p> : null}
        <VoiceOrb status={isBusy ? "idle" : status} />
        <div className="customer-identity">
          <h1>{twin.name}</h1>
          <p>{twin.company ?? twin.role ?? "Customer"}</p>
        </div>
        <div className={`live-status ${status}`}>
          <span /> {phase === "analyzing" ? "Analyzing the conversation..." : phase === "connecting" ? "Connecting..." : mode === "text" ? "Text mode" : statusCopy(status, twin.name)}
        </div>
      </section>

      <section className="live-transcript" aria-label="Live transcript">
        {latest.length ? latest.map((turn) => (
          <p key={turn.id} className={turn.speaker}>
            <strong>{turn.speaker === "seller" ? "You" : twin.name}</strong>
            {turn.text}
          </p>
        )) : <p className="transcript-placeholder">The conversation will appear here, turn by turn.</p>}
      </section>

      {voiceError && !mode ? (
        <section className="audio-fallback">
          <MicOff size={22} />
          <div><strong>We could not start audio.</strong><p>{voiceError}</p></div>
          <button type="button" onClick={onTextMode}><Keyboard size={17} /> Continue in text mode</button>
        </section>
      ) : null}

      {mode === "text" && phase === "practice" ? (
        <form
          className="text-composer"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const message = String(data.get("message") ?? "").trim();
            if (!message) return;
            onSendText(message);
            form.reset();
          }}
        >
          <input name="message" aria-label="Your line" placeholder={`Talk to ${twin.name}...`} autoComplete="off" disabled={isSendingText} />
          <button type="submit" aria-label="Send line" disabled={isSendingText}>
            {isSendingText ? <span className="spinner dark" /> : <CornerDownLeft size={19} />}
          </button>
        </form>
      ) : null}

      <button className="end-practice" type="button" onClick={onEnd} disabled={isBusy || transcript.length === 0}>
        <span /> {phase === "analyzing" ? "Analyzing..." : "End rehearsal"}
      </button>
    </main>
  );
}
