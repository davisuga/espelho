"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mic,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import {
  connectRealtimeTwin,
  type RealtimeConnection,
  type VoiceState,
} from "@/adapters/realtime";
import {
  INITIAL_APP_STATE,
  reduceAppState,
  type LiveModel,
} from "@/domain/app-state";
import { researchRuleById } from "@/domain/research";
import type {
  CallAnalysis,
  ConversationTurn,
  CustomerTwin,
} from "@/domain/schemas";
import { lastTurns } from "@/domain/transcript";
import { buildTwinInstructions } from "@/domain/twin-prompt";
import {
  JORDAN_BAD_CALL_TRANSCRIPT,
  JORDAN_SOURCE,
} from "@/fixtures/jordan";

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const buttonPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#6d45e8] px-5 font-semibold text-white shadow-[0_10px_28px_rgba(109,69,232,.25)] transition hover:-translate-y-0.5 hover:bg-[#5833d2] disabled:cursor-not-allowed disabled:opacity-50";
const buttonSecondary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dedbd7] bg-white px-5 font-semibold text-[#332f39] transition hover:border-[#c5c0c9] hover:bg-[#faf9f7]";

function Brand() {
  return (
    <div className="flex items-center gap-2.5 font-semibold">
      <span className="grid size-8 place-items-center rounded-[10px] bg-[#19171f] text-sm font-bold text-white">
        E
      </span>
      Espelho
    </div>
  );
}

function SourceScreen({
  sourceText,
  loading,
  onChange,
  onExample,
  onSubmit,
}: Readonly<{
  sourceText: string;
  loading: boolean;
  onChange: (value: string) => void;
  onExample: () => void;
  onSubmit: () => void;
}>) {
  return (
    <main className="mx-auto min-h-screen w-[min(1080px,calc(100%-32px))] py-7">
      <Brand />
      <section className="mx-auto mb-10 mt-16 max-w-3xl text-center md:mt-24">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[.15em] text-[#6d45e8]">
          <Sparkles size={14} /> EVIDENCE-BASED REHEARSAL
        </span>
        <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.055em] md:text-7xl">
          Rehearse with your customer<br />before talking to them.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#716d77] md:text-lg">
          Paste the real conversation history. Espelho learns only what it can
          prove—and becomes the customer for a live rehearsal.
        </p>
      </section>

      <section className="mx-auto max-w-[860px] rounded-3xl border border-[#e2dfdb] bg-white p-5 shadow-[0_22px_70px_rgba(32,26,43,.07)] md:p-7">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#6d45e8]">01</span>
            <h2 className="font-semibold">Paste the customer history</h2>
          </div>
          <span className="hidden text-xs text-[#97929b] sm:block">Nothing will be sent to the customer</span>
        </div>
        <textarea
          aria-label="Customer history"
          className="min-h-[220px] w-full resize-y rounded-2xl border border-[#e0dce3] bg-[#faf9f7] p-5 leading-6 outline-none transition placeholder:text-[#aaa6ae] focus:border-[#9d82ec] focus:ring-4 focus:ring-[#6d45e8]/10"
          value={sourceText}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste messages, emails, CRM notes, or transcripts..."
        />
        <div className="mt-4 flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <button className={buttonSecondary} type="button" onClick={onExample}>
            <Sparkles size={17} /> Use example
          </button>
          <button
            className={buttonPrimary}
            type="button"
            disabled={!sourceText.trim() || loading}
            onClick={onSubmit}
          >
            {loading ? "Creating twin..." : "Create twin"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </section>
      <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-3 font-mono text-[9px] tracking-[.16em] text-[#aaa6ae]">
        <strong className="text-[#6d45e8]">PASTE</strong><i className="h-px w-12 bg-[#d8d4d9]" />
        <span>PRACTICE</span><i className="h-px w-12 bg-[#d8d4d9]" /><span>REWIND</span>
      </div>
    </main>
  );
}

function TwinScreen({
  twin,
  liveModel,
  onBack,
  onLiveModelChange,
  onStart,
}: Readonly<{
  twin: CustomerTwin;
  liveModel: LiveModel;
  onBack: () => void;
  onLiveModelChange: (model: LiveModel) => void;
  onStart: () => void;
}>) {
  const known = twin.facts.filter((fact) => fact.certainty === "known");
  const likely = twin.facts.filter((fact) => fact.certainty === "likely");
  const evidenceCard = (fact: CustomerTwin["facts"][number]) => (
    <article className="rounded-2xl border border-[#e7e3df] bg-white p-4" key={fact.id}>
      <h3 className="text-sm font-semibold leading-5">{fact.claim}</h3>
      <blockquote className="my-3 font-serif text-sm leading-5 text-[#625d67]">
        “{fact.evidence[0]?.quote}”
      </blockquote>
      <span className="font-mono text-[10px] text-[#388761]">
        History · message {fact.evidence[0]?.sourceIndex}
      </span>
    </article>
  );

  return (
    <main className="mx-auto min-h-screen w-[min(1100px,calc(100%-32px))] py-7">
      <button className="inline-flex items-center gap-2 text-sm text-[#76717b]" type="button" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
      <header className="my-9 grid items-center gap-5 md:grid-cols-[72px_1fr_auto]">
        <span className="grid size-[70px] place-items-center rounded-full bg-gradient-to-br from-[#271d3d] to-[#7950e8] text-2xl font-semibold text-white shadow-inner">
          {twin.name[0]}
        </span>
        <div>
          <span className="font-mono text-[11px] font-bold tracking-[.14em] text-[#6d45e8]">TWIN CREATED</span>
          <h1 className="mt-1 text-4xl font-semibold tracking-[-.04em]">Meet {twin.name}</h1>
          <p className="mt-1 text-[#76717b]">Everything this twin knows comes from the history you supplied.</p>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-[#dedbd7] bg-white p-1.5 shadow-sm">
            <span className="mb-1.5 block px-2 pt-1 font-mono text-[9px] font-bold tracking-[.12em] text-[#8a858e]">
              VOICE MODEL
            </span>
            <div className="grid grid-cols-2 gap-1" role="group" aria-label="Voice model">
              {([
                ["gpt-realtime-2.1", "Realtime 2.1"],
                ["gpt-live-1", "GPT Live 1 · Preview"],
              ] as const).map(([model, label]) => (
                <button
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    liveModel === model
                      ? "bg-[#19171f] text-white"
                      : "text-[#716d77] hover:bg-[#f2f0ec]"
                  }`}
                  key={model}
                  type="button"
                  aria-pressed={liveModel === model}
                  onClick={() => onLiveModelChange(model)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button className={buttonPrimary} type="button" onClick={onStart}>
            <Mic size={18} /> Start rehearsal
          </button>
        </div>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_1fr_.9fr]">
        <section className="rounded-3xl border border-[#e2dfdb] bg-white/70 p-5">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.13em]">
            <i className="size-2 rounded-full bg-[#2f8f65]" /> KNOWN <span className="ml-auto text-[#aaa6ae]">{known.length}</span>
          </div>
          <div className="grid gap-3">{known.map(evidenceCard)}</div>
        </section>
        <section className="rounded-3xl border border-[#e2dfdb] bg-white/70 p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.13em]">
            <i className="size-2 rounded-full bg-[#bd7b1b]" /> LIKELY <span className="ml-auto text-[#aaa6ae]">{likely.length}</span>
          </div>
          <p className="mb-4 mt-2 text-xs text-[#96919a]">Inferences supported by the history</p>
          <div className="grid gap-3">{likely.slice(0, 2).map(evidenceCard)}</div>
        </section>
        <section className="rounded-3xl border border-[#e2dfdb] bg-white/70 p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.13em]">
            <i className="size-2 rounded-full bg-[#aaa6ae]" /> UNKNOWN <span className="ml-auto text-[#aaa6ae]">{twin.unknowns.length}</span>
          </div>
          <p className="mb-4 mt-2 text-xs text-[#96919a]">{twin.name} will not invent answers</p>
          <div className="grid gap-2.5">
            {twin.unknowns.map((item) => (
              <div className="flex gap-3 rounded-2xl bg-[#efede9] p-3" key={item.topic}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dcd8d3] text-xs font-bold text-[#7b767d]">?</span>
                <div><strong className="block text-sm">{item.topic}</strong><small className="mt-1 block leading-4 text-[#858088]">{item.reason}</small></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function LoadingScreen({ text, detail }: Readonly<{ text: string; detail: string }>) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#121017] text-white">
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="size-24 rounded-full bg-gradient-to-br from-[#c4a8ff] via-[#7548e6] to-[#2d174f] shadow-[0_0_80px_rgba(126,78,239,.55)]"
          animate={{ scale: [0.94, 1.08, 0.94] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        <strong className="mt-8 text-xl">{text}</strong><span className="mt-2 text-sm text-[#8f8998]">{detail}</span>
      </div>
    </main>
  );
}

function PracticeScreen({
  twin,
  transcript,
  voiceState,
  attempt,
  mode,
  liveModel,
  onEnd,
  onSend,
}: Readonly<{
  twin: CustomerTwin;
  transcript: readonly ConversationTurn[];
  voiceState: VoiceState;
  attempt: 1 | 2;
  mode: "voice" | "text";
  liveModel: LiveModel;
  onEnd: () => void;
  onSend: (message: string) => Promise<void>;
}>) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    const value = message.trim();
    if (!value || sending) return;
    setMessage(""); setSending(true); await onSend(value); setSending(false);
  };

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-[#121017] text-white">
      <header className="grid h-[70px] grid-cols-2 items-center border-b border-white/10 px-5 font-mono text-[10px] tracking-[.13em] text-[#918b99] md:grid-cols-3 md:px-8">
        <button className="flex w-fit items-center gap-2 text-[#bbb5c2]" type="button" onClick={onEnd}><ArrowLeft size={15} /> END</button>
        <span className="hidden justify-self-center md:block">{attempt === 2 ? "↩ SECOND ATTEMPT" : "LIVE REHEARSAL"}</span>
        <span className="justify-self-end"><i className="mr-2 inline-block size-2 rounded-full bg-[#66dca0] shadow-[0_0_10px_#66dca0]" />{liveModel === "gpt-live-1" ? "GPT LIVE 1" : "REALTIME 2.1"}</span>
      </header>
      <section className="flex min-h-[430px] flex-1 flex-col items-center justify-center">
        {attempt === 2 && <span className="mb-7 rounded-full border border-[#8f69ef]/40 bg-[#6d45e8]/15 px-4 py-2 text-xs text-[#bea8fb]">Back at the selected moment</span>}
        <div className="relative grid size-52 place-items-center">
          <motion.div className="absolute inset-3 rounded-full border border-[#9e75ff]/30" animate={{ scale: voiceState === "speaking" ? [0.9, 1.16, 0.9] : [0.96, 1.06, 0.96], opacity: [.3, 1, .3] }} transition={{ repeat: Infinity, duration: voiceState === "speaking" ? .8 : 2.4 }} />
          <motion.div className="absolute inset-0 rounded-full border border-[#9e75ff]/15" animate={{ scale: [0.92, 1.1, .92] }} transition={{ repeat: Infinity, duration: 2.8 }} />
          <div className="relative z-10 grid size-32 place-items-center rounded-full bg-gradient-to-br from-[#c2a5ff] via-[#7547e3] to-[#2a164b] text-4xl font-semibold shadow-[0_0_80px_rgba(126,78,239,.55)]">{twin.name[0]}</div>
        </div>
        <h1 className="mt-4 text-3xl font-semibold">{twin.name}</h1><p className="mt-1 text-[#8f8998]">{twin.company}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-[#a59eaa]">
          {voiceState === "speaking" ? <><Volume2 size={15} /> {twin.name} is speaking...</> : <><i className="size-2 animate-pulse rounded-full bg-[#63d59c]" /> Listening</>}
        </div>
      </section>
      <section className="grid min-h-[220px] gap-5 border-t border-white/10 bg-[#17141c] px-5 py-5 md:grid-cols-[1fr_auto] md:px-[max(28px,calc((100vw-850px)/2))]">
        <div className="flex flex-col justify-end gap-3">
          {lastTurns(transcript, 3).length === 0 ? <p className="text-[#6f6977]">Start speaking. {twin.name} is listening.</p> : lastTurns(transcript, 3).map((turn) => (
            <div className="grid grid-cols-[75px_1fr] gap-2" key={turn.id}><span className={`pt-1 font-mono text-[9px] tracking-[.1em] ${turn.speaker === "customer" ? "text-[#a98bff]" : "text-[#6f6977]"}`}>{turn.speaker === "seller" ? "YOU" : twin.name.toUpperCase()}</span><p className="text-sm leading-6 text-[#d5d0d9]">{turn.text}</p></div>
          ))}
        </div>
        <div className="flex min-w-[230px] flex-col justify-end gap-3">
          {mode === "text" && <form className="flex overflow-hidden rounded-xl bg-[#2a2630]" onSubmit={(event) => { event.preventDefault(); void send(); }}><input className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none" aria-label="Your message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your line..." /><button className="px-3 text-[#ad8cff]" type="submit" disabled={sending}><Send size={17} /></button></form>}
          <button className="h-12 rounded-xl border border-white/15 bg-[#2b2731] font-semibold text-[#e9e4ec] hover:bg-[#383240]" type="button" onClick={onEnd}>End rehearsal</button>
        </div>
      </section>
    </main>
  );
}

function ReviewScreen({ analysis, onReplay, onReset }: Readonly<{ analysis: CallAnalysis; onReplay: (id: string) => void; onReset: () => void }>) {
  const moment = analysis.moments[0];
  if (!moment) return <main className="grid min-h-screen place-items-center"><button className={buttonPrimary} onClick={onReset}>New rehearsal</button></main>;
  const rules = moment.researchRuleIds.map(researchRuleById).filter((rule) => rule !== null);
  return (
    <main className="mx-auto min-h-screen w-[min(1040px,calc(100%-32px))] py-10">
      <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><span className="font-mono text-[11px] font-bold tracking-[.14em] text-[#6d45e8]">REHEARSAL ANALYSIS</span><h1 className="mt-2 text-4xl font-semibold tracking-[-.045em] md:text-5xl">{analysis.moments.length} {analysis.moments.length === 1 ? "moment worth" : "moments worth"} retrying</h1><p className="mt-2 text-[#77717c]">No invented scores. Only behavior, context, and evidence.</p></div>
        <button className={buttonSecondary} type="button" onClick={onReset}>New customer</button>
      </header>
      <article className="rounded-3xl border border-[#e1ded9] bg-white p-5 shadow-[0_20px_60px_rgba(31,24,42,.07)] md:p-9">
        <span className="font-mono text-[10px] font-bold tracking-[.14em] text-[#a36a22]">KEY MOMENT</span><h2 className="mb-5 mt-2 text-3xl font-semibold">{moment.issue}</h2>
        <blockquote className="rounded-r-2xl border-l-4 border-[#6d45e8] bg-[#f7f5fb] p-5 font-serif text-xl leading-8 md:text-2xl">“{moment.sellerQuote}”</blockquote>
        <p className="my-6 leading-7 text-[#5f5964]">{moment.whyItMatters}</p>
        <div className="grid gap-3 md:grid-cols-[1.15fr_1fr]">
          <section className="rounded-2xl border border-[#dfeae4] bg-[#f4faf7] p-5"><span className="font-mono text-[10px] font-bold tracking-[.13em] text-[#2f8f65]">CUSTOMER</span><blockquote className="my-3 font-serif leading-6">“{moment.customerEvidence[0]?.quote}”</blockquote><small className="flex items-center gap-1 text-[#2f8f65]"><Check size={13} /> Evidence from history</small></section>
          <section className="rounded-2xl border border-[#e5dff2] bg-[#f8f6fc] p-5"><span className="font-mono text-[10px] font-bold tracking-[.13em] text-[#6d45e8]">RESEARCH</span>{rules.map((rule) => <div className="mt-3" key={rule.id}><strong className="text-sm">{rule.id === "adaptive-selling" ? "Adaptive selling" : "Follow-up questions"}</strong><p className="mt-1 text-xs text-[#77717c]">{rule.authors.split(" & ")[0]} et al., {rule.year}</p><small className="text-[#928d96]">{rule.journal}</small></div>)}</section>
        </div>
        <div className="mt-4 rounded-2xl bg-[#f2f0ec] p-4"><span className="font-mono text-[9px] font-bold tracking-[.13em] text-[#858088]">GOAL FOR THE SECOND ATTEMPT</span><p className="mt-2 text-sm">{moment.suggestedGoal}</p></div>
        <button className={`${buttonPrimary} mt-5 w-full`} type="button" onClick={() => onReplay(moment.id)}><RotateCcw size={18} /> Retry from this moment</button>
      </article>
    </main>
  );
}

export default function Home() {
  const [state, dispatch] = useReducer(reduceAppState, INITIAL_APP_STATE);
  const [voiceState, setVoiceState] = useState<VoiceState>("listening");
  const connectionRef = useRef<RealtimeConnection | null>(null);
  const connectionGeneration = useRef(0);
  const instructions = useMemo(() => state.twin ? buildTwinInstructions(state.twin, state.replayFrom ?? undefined) : "", [state.twin, state.replayFrom]);

  useEffect(() => () => connectionRef.current?.close(), []);
  useEffect(() => {
    if (state.phase !== "connecting" || !state.twin) return;
    const generation = ++connectionGeneration.current;
    connectionRef.current?.close(); connectionRef.current = null;
    const connect = async () => {
      let message = "We could not start the audio.";
      for (const attempt of [0, 1]) {
        try {
          const connection = await connectRealtimeTwin({
            name: state.twin?.name ?? "Customer",
            instructions,
            model: state.liveModel,
            initialHistory: state.replayFrom?.previousTurns,
            onHistory: (transcript) => dispatch({ type: "TRANSCRIPT_SYNCED", transcript }),
            onVoiceState: setVoiceState,
            onError: (error) => { message = error; },
          });
          if (generation !== connectionGeneration.current) { connection.close(); return; }
          connectionRef.current = connection;
          dispatch({ type: "PRACTICE_CONNECTED", mode: "voice" });
          return;
        } catch (error) {
          message = error instanceof Error ? error.message : message;
          if (attempt === 0) continue;
        }
      }
      if (generation === connectionGeneration.current) dispatch({ type: "PRACTICE_FAILED", message });
    };
    void connect();
  }, [state.phase, state.twin, state.replayFrom, state.liveModel, instructions]);

  useEffect(() => {
    if (state.phase !== "analyzing" || !state.twin) return;
    const analyze = async () => {
      try {
        const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ twin: state.twin, transcript: state.transcript }) });
        const payload: unknown = await response.json();
        if (!response.ok) throw new Error(typeof payload === "object" && payload && "error" in payload ? String(payload.error) : "Falha na análise.");
        dispatch({ type: "ANALYSIS_SUCCEEDED", analysis: payload as CallAnalysis });
      } catch (error) { dispatch({ type: "ANALYSIS_FAILED", message: error instanceof Error ? error.message : "Falha na análise." }); }
    };
    void analyze();
  }, [state.phase, state.twin, state.transcript]);

  const createTwin = async () => {
    dispatch({ type: "EXTRACTION_STARTED" });
    try {
      const response = await fetch("/api/twin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceText: state.sourceText }) });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(typeof payload === "object" && payload && "error" in payload ? String(payload.error) : "The customer twin could not be created.");
      dispatch({ type: "EXTRACTION_SUCCEEDED", twin: payload as CustomerTwin });
    } catch (error) { dispatch({ type: "EXTRACTION_FAILED", message: error instanceof Error ? error.message : "The customer twin could not be created." }); }
  };
  const endPractice = () => {
    connectionRef.current?.close(); connectionRef.current = null;
    if (state.transcript.length === 0) dispatch({ type: "TRANSCRIPT_SYNCED", transcript: JORDAN_BAD_CALL_TRANSCRIPT });
    dispatch({ type: "PRACTICE_ENDED" });
  };
  const useDemo = () => { dispatch({ type: "TRANSCRIPT_SYNCED", transcript: JORDAN_BAD_CALL_TRANSCRIPT }); dispatch({ type: "PRACTICE_ENDED" }); };
  const sendText = async (message: string) => {
    const seller: ConversationTurn = { id: newId(), speaker: "seller", text: message, createdAt: Date.now() };
    dispatch({ type: "TURN_ADDED", turn: seller });
    const response = await fetch("/api/text-turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ twin: state.twin, transcript: [...state.transcript, seller], sellerMessage: message, replayContext: state.replayFrom }) });
    const payload = await response.json();
    if (response.ok && payload.customerMessage) dispatch({ type: "TURN_ADDED", turn: { id: newId(), speaker: "customer", text: payload.customerMessage, createdAt: Date.now() } });
  };

  let screen: React.ReactNode;
  if (state.phase === "source" || state.phase === "extracting") screen = <SourceScreen sourceText={state.sourceText} loading={state.phase === "extracting"} onChange={(value) => dispatch({ type: "SOURCE_CHANGED", value })} onExample={() => dispatch({ type: "SOURCE_CHANGED", value: JORDAN_SOURCE })} onSubmit={() => void createTwin()} />;
  else if (state.phase === "twin" && state.twin) screen = <TwinScreen twin={state.twin} liveModel={state.liveModel} onBack={() => dispatch({ type: "RESET" })} onLiveModelChange={(model) => dispatch({ type: "LIVE_MODEL_SELECTED", model })} onStart={() => dispatch({ type: "PRACTICE_STARTED" })} />;
  else if (state.phase === "connecting") screen = <LoadingScreen text={`Connecting with ${state.twin?.name ?? "the customer"}...`} detail="Preparing microphone and GPT Live" />;
  else if (state.phase === "practice" && state.twin) screen = <PracticeScreen twin={state.twin} transcript={state.transcript} voiceState={voiceState} attempt={state.attempt} mode={state.practiceMode} liveModel={state.liveModel} onEnd={endPractice} onSend={sendText} />;
  else if (state.phase === "analyzing") screen = <LoadingScreen text="Analyzing the conversation..." detail="Connecting behavior, context, and evidence" />;
  else if (state.phase === "review" && state.analysis) screen = <ReviewScreen analysis={state.analysis} onReplay={(id) => dispatch({ type: "REPLAY_SELECTED", momentId: id })} onReset={() => dispatch({ type: "RESET" })} />;
  else screen = <main className="grid min-h-screen place-items-center px-5 text-center"><div className="max-w-lg"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[#f2dadd] text-xl font-bold text-[#a43f48]">!</span><h1 className="mt-5 text-3xl font-semibold">We could not continue.</h1><p className="mt-3 text-[#77717c]">{state.error}</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">{state.twin && <button className={buttonPrimary} type="button" onClick={() => dispatch({ type: "PRACTICE_STARTED" })}>Try again</button>}{state.canUseTextFallback && <button className={buttonSecondary} type="button" onClick={() => dispatch({ type: "TEXT_FALLBACK_STARTED" })}>Continue in text</button>}<button className={buttonSecondary} type="button" onClick={useDemo}>Use demo rehearsal <ArrowRight size={16} /></button></div><button className="mt-5 text-sm text-[#77717c]" type="button" onClick={() => dispatch({ type: "BACK_TO_TWIN" })}>Back</button></div></main>;

  return <AnimatePresence mode="wait"><motion.div key={state.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .2 }}>{screen}</motion.div></AnimatePresence>;
}
