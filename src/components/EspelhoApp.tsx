"use client";

import { useEffect, useReducer, useRef } from "react";
import { connectRealtime, type RealtimeSession } from "@/adapters/realtime";
import { activeTranscript, initialAppState, reduceAppState, type Attempt } from "@/domain/app-state";
import { buildReplayContext } from "@/domain/replay";
import { CallAnalysisSchema, CustomerTwinSchema, type CoachingMoment, type ConversationTurn, type ReplayContext } from "@/domain/schemas";
import { buildTwinInstructions } from "@/domain/twin-prompt";
import { elapsedLabel } from "@/domain/transcript";
import { JORDAN_SOURCE } from "@/fixtures/jordan";
import { ErrorState } from "./ErrorState";
import { PracticeStep } from "./PracticeStep";
import { ReviewStep } from "./ReviewStep";
import { SourceStep } from "./SourceStep";
import { TwinStep } from "./TwinStep";

const postJson = async <T,>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(32_000),
  });
  const payload = (await response.json()) as T & { error?: Readonly<{ message?: string }> };
  if (!response.ok) throw new Error(payload.error?.message ?? "The request could not be completed.");
  return payload;
};

const makeTurn = (speaker: ConversationTurn["speaker"], text: string): ConversationTurn => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${speaker}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  speaker,
  text,
  createdAt: Date.now(),
});

export function EspelhoApp() {
  const [state, dispatch] = useReducer(reduceAppState, initialAppState);
  const stateRef = useRef(state);
  const realtimeRef = useRef<RealtimeSession | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => () => realtimeRef.current?.close(), []);

  const extractTwin = async (): Promise<void> => {
    const sourceText = stateRef.current.sourceText;
    if (!sourceText.trim()) return;
    dispatch({ type: "EXTRACTION_STARTED" });
    try {
      const twin = CustomerTwinSchema.parse(await postJson("/api/twin", { sourceText }));
      dispatch({ type: "EXTRACTION_SUCCEEDED", twin });
    } catch (error) {
      dispatch({ type: "FAILED", message: error instanceof Error ? error.message : "The customer twin could not be created.", recoverPhase: "source" });
    }
  };

  const startVoice = async (attempt: Attempt, replayContext?: ReplayContext): Promise<void> => {
    const twin = stateRef.current.twin;
    if (!twin) return;
    realtimeRef.current?.close();
    realtimeRef.current = null;
    dispatch({ type: "PRACTICE_CONNECTING", attempt });

    const connectWithRetry = async (retries: number): Promise<RealtimeSession> => {
      try {
        return await connectRealtime({
          instructions: buildTwinInstructions(twin, replayContext),
          onTurn: (turn) => dispatch({ type: "TURN_ADDED", turn }),
          onStatus: (status) => dispatch({ type: "VOICE_STATUS_CHANGED", status }),
          onFailure: (message) => dispatch({ type: "VOICE_FAILED", message }),
        });
      } catch (error) {
        if (retries > 0) return connectWithRetry(retries - 1);
        throw error;
      }
    };

    try {
      realtimeRef.current = await connectWithRetry(1);
      dispatch({ type: "PRACTICE_STARTED", mode: "voice" });
    } catch (error) {
      dispatch({ type: "VOICE_FAILED", message: error instanceof Error ? error.message : "Audio could not be started." });
    }
  };

  const startTextMode = (): void => {
    realtimeRef.current?.close();
    realtimeRef.current = null;
    dispatch({ type: "PRACTICE_STARTED", mode: "text" });
  };

  const sendTextTurn = async (sellerMessage: string): Promise<void> => {
    const snapshot = stateRef.current;
    if (!snapshot.twin || snapshot.isSendingText) return;
    dispatch({ type: "TURN_ADDED", turn: makeTurn("seller", sellerMessage) });
    dispatch({ type: "TEXT_SENDING", value: true });
    try {
      const result = await postJson<{ customerMessage: string }>("/api/text-turn", {
        twin: snapshot.twin,
        transcript: activeTranscript(snapshot),
        sellerMessage,
        replayContext: snapshot.replayContext ?? undefined,
      });
      dispatch({ type: "TURN_ADDED", turn: makeTurn("customer", result.customerMessage) });
    } catch (error) {
      dispatch({ type: "FAILED", message: error instanceof Error ? error.message : "The customer did not respond.", recoverPhase: "practice" });
    } finally {
      dispatch({ type: "TEXT_SENDING", value: false });
    }
  };

  const analyze = async (): Promise<void> => {
    const snapshot = stateRef.current;
    if (!snapshot.twin) return;
    const current = activeTranscript(snapshot);
    const transcript = snapshot.attempt === "replay" && snapshot.replayContext
      ? [...snapshot.replayContext.previousTurns, ...current]
      : current;
    if (!transcript.length) return;
    dispatch({ type: "PRACTICE_ENDED" });
    try {
      const analysis = CallAnalysisSchema.parse(await postJson("/api/analyze", { twin: snapshot.twin, transcript }));
      dispatch({ type: "ANALYSIS_SUCCEEDED", analysis });
    } catch (error) {
      dispatch({ type: "FAILED", message: error instanceof Error ? error.message : "The rehearsal could not be analyzed.", recoverPhase: "practice" });
    }
  };

  const endPractice = (): void => {
    realtimeRef.current?.close();
    realtimeRef.current = null;
    void analyze();
  };

  const replay = (moment: CoachingMoment): void => {
    const context = buildReplayContext(stateRef.current.originalTranscript, moment);
    dispatch({ type: "REPLAY_SELECTED", moment, replayContext: context });
    void startVoice("replay", context);
  };

  const reset = (): void => {
    realtimeRef.current?.close();
    realtimeRef.current = null;
    dispatch({ type: "RESET" });
  };

  if (state.phase === "error") {
    return <ErrorState message={state.error ?? "Unknown error."} onRetry={() => {
      const recover = state.recoverPhase;
      dispatch({ type: "ERROR_DISMISSED" });
      if (recover === "source") void extractTwin();
      if (recover === "practice") void analyze();
    }} onReset={reset} />;
  }

  if (state.phase === "source" || state.phase === "extracting") {
    return <SourceStep sourceText={state.sourceText} isLoading={state.phase === "extracting"} onChange={(value) => dispatch({ type: "SOURCE_CHANGED", value })} onSample={() => dispatch({ type: "SOURCE_CHANGED", value: JORDAN_SOURCE })} onSubmit={() => void extractTwin()} />;
  }

  if (state.phase === "twin" && state.twin) {
    return <TwinStep twin={state.twin} onBack={reset} onPractice={() => void startVoice("original")} />;
  }

  if (["connecting", "practice", "analyzing"].includes(state.phase) && state.twin) {
    const transcript = activeTranscript(state);
    return <PracticeStep twin={state.twin} phase={state.phase} mode={state.mode} status={state.voiceStatus} transcript={transcript} isReplay={state.attempt === "replay"} rewindLabel={state.selectedMoment ? elapsedLabel(state.originalTranscript, state.selectedMoment.turnId) : null} voiceError={state.voiceError} isSendingText={state.isSendingText} onBack={reset} onTextMode={startTextMode} onSendText={(message) => void sendTextTurn(message)} onEnd={endPractice} />;
  }

  if (state.phase === "review" && state.analysis) {
    const reviewTranscript = state.attempt === "replay" && state.replayContext
      ? [...state.replayContext.previousTurns, ...state.replayTranscript]
      : state.originalTranscript;
    return <ReviewStep analysis={state.analysis} transcript={reviewTranscript} canReplay={state.attempt === "original"} onReplay={replay} onReset={reset} />;
  }

  return null;
}
