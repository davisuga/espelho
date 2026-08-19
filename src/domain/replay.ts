import type {
  CoachingMoment,
  ConversationTurn,
  ReplayContext,
} from "./schemas";
import { formatTranscript } from "./transcript";

export const buildReplayContext = (
  transcript: readonly ConversationTurn[],
  selected: CoachingMoment | string,
): ReplayContext => {
  const selectedTurnId = typeof selected === "string" ? selected : selected.turnId;
  const selectedIndex = transcript.findIndex((turn) => turn.id === selectedTurnId);
  const previousTurns = selectedIndex < 0 ? [] : transcript.slice(0, selectedIndex);

  return {
    previousTurns,
    selectedTurnId,
    summary: formatTranscript(previousTurns.slice(-6)),
  };
};
