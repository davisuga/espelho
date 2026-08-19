import type { CoachingMoment, ConversationTurn } from "./schemas";
import { formatTranscript } from "./transcript";

export type ReplayContext = Readonly<{
  selectedTurnId: string;
  previousTurns: readonly ConversationTurn[];
  summary: string;
}>;

export const buildReplayContext = (
  transcript: readonly ConversationTurn[],
  selected: CoachingMoment | string,
): ReplayContext => {
  const selectedTurnId =
    typeof selected === "string" ? selected : selected.turnId;
  const selectedIndex = transcript.findIndex(
    (turn) => turn.id === selectedTurnId,
  );
  const previousTurns =
    selectedIndex < 0 ? [] : transcript.slice(0, selectedIndex);

  return {
    selectedTurnId,
    previousTurns,
    summary:
      previousTurns.length === 0
        ? "The conversation will restart from the beginning."
        : `Previous conversation up to the retry point:\n${formatTranscript(previousTurns)}`,
  };
};
