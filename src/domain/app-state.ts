import type {
  CallAnalysis,
  CoachingMoment,
  ConversationTurn,
  CustomerTwin,
  ReplayContext,
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
export type Attempt = "original" | "replay";

export type AppState = Readonly<{
  phase: Phase;
  sourceText: string;
  twin: CustomerTwin | null;
  originalTranscript: readonly ConversationTurn[];
  replayTranscript: readonly ConversationTurn[];
  analysis: CallAnalysis | null;
  replayContext: ReplayContext | null;
  selectedMoment: CoachingMoment | null;
  attempt: Attempt;
  mode: PracticeMode | null;
  voiceError: string | null;
  error: string | null;
  recoverPhase: Exclude<Phase, "error">;
  isSendingText: boolean;
  voiceStatus: "idle" | "listening" | "speaking";
}>;

export const initialAppState: AppState = {
  phase: "source",
  sourceText: "",
  twin: null,
  originalTranscript: [],
  replayTranscript: [],
  analysis: null,
  replayContext: null,
  selectedMoment: null,
  attempt: "original",
  mode: null,
  voiceError: null,
  error: null,
  recoverPhase: "source",
  isSendingText: false,
  voiceStatus: "idle",
};

export type AppEvent =
  | Readonly<{ type: "SOURCE_CHANGED"; value: string }>
  | Readonly<{ type: "EXTRACTION_STARTED" }>
  | Readonly<{ type: "EXTRACTION_SUCCEEDED"; twin: CustomerTwin }>
  | Readonly<{ type: "FAILED"; message: string; recoverPhase: Exclude<Phase, "error"> }>
  | Readonly<{ type: "PRACTICE_CONNECTING"; attempt: Attempt }>
  | Readonly<{ type: "PRACTICE_STARTED"; mode: PracticeMode }>
  | Readonly<{ type: "VOICE_FAILED"; message: string }>
  | Readonly<{
      type: "VOICE_STATUS_CHANGED";
      status: "idle" | "listening" | "speaking";
    }>
  | Readonly<{ type: "TURN_ADDED"; turn: ConversationTurn }>
  | Readonly<{ type: "TEXT_SENDING"; value: boolean }>
  | Readonly<{ type: "PRACTICE_ENDED" }>
  | Readonly<{ type: "ANALYSIS_SUCCEEDED"; analysis: CallAnalysis }>
  | Readonly<{
      type: "REPLAY_SELECTED";
      moment: CoachingMoment;
      replayContext: ReplayContext;
    }>
  | Readonly<{ type: "ERROR_DISMISSED" }>
  | Readonly<{ type: "RESET" }>;

export const activeTranscript = (state: AppState): readonly ConversationTurn[] =>
  state.attempt === "replay" ? state.replayTranscript : state.originalTranscript;

export const reduceAppState = (state: AppState, event: AppEvent): AppState => {
  switch (event.type) {
    case "SOURCE_CHANGED":
      return { ...state, sourceText: event.value };
    case "EXTRACTION_STARTED":
      return { ...state, phase: "extracting", error: null };
    case "EXTRACTION_SUCCEEDED":
      return { ...state, phase: "twin", twin: event.twin, error: null };
    case "FAILED":
      return {
        ...state,
        phase: "error",
        error: event.message,
        recoverPhase: event.recoverPhase,
      };
    case "PRACTICE_CONNECTING":
      return {
        ...state,
        phase: "connecting",
        attempt: event.attempt,
        mode: null,
        voiceError: null,
        voiceStatus: "idle",
      };
    case "PRACTICE_STARTED":
      return { ...state, phase: "practice", mode: event.mode, voiceError: null };
    case "VOICE_FAILED":
      return {
        ...state,
        phase: "practice",
        mode: null,
        voiceError: event.message,
        voiceStatus: "idle",
      };
    case "VOICE_STATUS_CHANGED":
      return { ...state, voiceStatus: event.status };
    case "TURN_ADDED":
      return state.attempt === "replay"
        ? { ...state, replayTranscript: [...state.replayTranscript, event.turn] }
        : { ...state, originalTranscript: [...state.originalTranscript, event.turn] };
    case "TEXT_SENDING":
      return { ...state, isSendingText: event.value };
    case "PRACTICE_ENDED":
      return { ...state, phase: "analyzing", isSendingText: false };
    case "ANALYSIS_SUCCEEDED":
      return { ...state, phase: "review", analysis: event.analysis, error: null };
    case "REPLAY_SELECTED":
      return {
        ...state,
        phase: "review",
        attempt: "replay",
        selectedMoment: event.moment,
        replayContext: event.replayContext,
        replayTranscript: [],
      };
    case "ERROR_DISMISSED":
      return { ...state, phase: state.recoverPhase, error: null };
    case "RESET":
      return initialAppState;
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
};
