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
        ? "A conversa será retomada do início."
        : `Conversa anterior até o ponto de retomada:\n${formatTranscript(previousTurns)}`,
  };
};
