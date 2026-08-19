import { buildReplayContext, type ReplayContext } from "./replay";
import type {
  CallAnalysis,
  ConversationTurn,
  CustomerTwin,
} from "./schemas";

export type Phase =
  | "source"
  | "extracting"
  | "twin"
  | "connecting"
  | "practice"
  | "analyzing"
  | "review"
  | "error";

export type PracticeMode = "voice" | "text";
export type LiveModel = "gpt-realtime-2.1" | "gpt-live-1";

export type AppState = Readonly<{
  phase: Phase;
  sourceText: string;
  sourceLines: readonly string[];
  twin: CustomerTwin | null;
  transcript: readonly ConversationTurn[];
  originalTranscript: readonly ConversationTurn[];
  analysis: CallAnalysis | null;
  replayFrom: ReplayContext | null;
  selectedMomentId: string | null;
  practiceMode: PracticeMode;
  liveModel: LiveModel;
  attempt: 1 | 2;
  error: string | null;
  canUseTextFallback: boolean;
}>;

export type AppEvent =
  | Readonly<{ type: "SOURCE_CHANGED"; value: string }>
  | Readonly<{ type: "EXTRACTION_STARTED" }>
  | Readonly<{ type: "EXTRACTION_SUCCEEDED"; twin: CustomerTwin }>
  | Readonly<{ type: "EXTRACTION_FAILED"; message: string }>
  | Readonly<{ type: "PRACTICE_STARTED" }>
  | Readonly<{ type: "LIVE_MODEL_SELECTED"; model: LiveModel }>
  | Readonly<{ type: "PRACTICE_CONNECTED"; mode: PracticeMode }>
  | Readonly<{ type: "PRACTICE_FAILED"; message: string }>
  | Readonly<{ type: "TEXT_FALLBACK_STARTED" }>
  | Readonly<{ type: "TURN_ADDED"; turn: ConversationTurn }>
  | Readonly<{
      type: "TRANSCRIPT_SYNCED";
      transcript: readonly ConversationTurn[];
    }>
  | Readonly<{ type: "PRACTICE_ENDED" }>
  | Readonly<{ type: "ANALYSIS_SUCCEEDED"; analysis: CallAnalysis }>
  | Readonly<{ type: "ANALYSIS_FAILED"; message: string }>
  | Readonly<{ type: "REPLAY_SELECTED"; momentId: string }>
  | Readonly<{ type: "BACK_TO_TWIN" }>
  | Readonly<{ type: "RESET" }>;

const sourceLines = (value: string): readonly string[] =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const INITIAL_APP_STATE: AppState = Object.freeze({
  phase: "source",
  sourceText: "",
  sourceLines: [],
  twin: null,
  transcript: [],
  originalTranscript: [],
  analysis: null,
  replayFrom: null,
  selectedMomentId: null,
  practiceMode: "voice",
  liveModel: "gpt-realtime-2.1",
  attempt: 1,
  error: null,
  canUseTextFallback: false,
});

export const reduceAppState = (
  state: AppState,
  event: AppEvent,
): AppState => {
  switch (event.type) {
    case "SOURCE_CHANGED":
      return {
        ...state,
        sourceText: event.value,
        sourceLines: sourceLines(event.value),
        error: null,
      };
    case "EXTRACTION_STARTED":
      return { ...state, phase: "extracting", error: null };
    case "EXTRACTION_SUCCEEDED":
      return { ...state, phase: "twin", twin: event.twin, error: null };
    case "EXTRACTION_FAILED":
      return {
        ...state,
        phase: "error",
        error: event.message,
        canUseTextFallback: false,
      };
    case "PRACTICE_STARTED":
      return {
        ...state,
        phase: "connecting",
        practiceMode: "voice",
        error: null,
        canUseTextFallback: false,
      };
    case "LIVE_MODEL_SELECTED":
      return { ...state, liveModel: event.model, error: null };
    case "PRACTICE_CONNECTED":
      return {
        ...state,
        phase: "practice",
        practiceMode: event.mode,
        error: null,
      };
    case "PRACTICE_FAILED":
      return {
        ...state,
        phase: "error",
        error: event.message,
        canUseTextFallback: true,
      };
    case "TEXT_FALLBACK_STARTED":
      return {
        ...state,
        phase: "practice",
        practiceMode: "text",
        error: null,
        canUseTextFallback: false,
      };
    case "TURN_ADDED":
      return {
        ...state,
        transcript: [...state.transcript, event.turn],
      };
    case "TRANSCRIPT_SYNCED":
      return {
        ...state,
        transcript: [...event.transcript],
      };
    case "PRACTICE_ENDED":
      return { ...state, phase: "analyzing", error: null };
    case "ANALYSIS_SUCCEEDED":
      return {
        ...state,
        phase: "review",
        analysis: event.analysis,
        error: null,
      };
    case "ANALYSIS_FAILED":
      return {
        ...state,
        phase: "error",
        error: event.message,
        canUseTextFallback: false,
      };
    case "REPLAY_SELECTED": {
      const moment = state.analysis?.moments.find(
        (candidate) => candidate.id === event.momentId,
      );
      if (!moment) return state;

      return {
        ...state,
        phase: "connecting",
        originalTranscript:
          state.originalTranscript.length > 0
            ? state.originalTranscript
            : state.transcript,
        transcript: [],
        analysis: null,
        replayFrom: buildReplayContext(state.transcript, moment),
        selectedMomentId: event.momentId,
        practiceMode: "voice",
        attempt: 2,
        error: null,
        canUseTextFallback: false,
      };
    }
    case "BACK_TO_TWIN":
      return {
        ...state,
        phase: state.twin ? "twin" : "source",
        error: null,
        canUseTextFallback: false,
      };
    case "RESET":
      return INITIAL_APP_STATE;
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
};
