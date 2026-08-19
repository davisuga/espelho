import type { ConversationTurn } from "./schemas";

export const conversationPrefix = (
  turns: readonly ConversationTurn[],
  throughTurnId: string,
): readonly ConversationTurn[] => {
  const index = turns.findIndex((turn) => turn.id === throughTurnId);

  return index < 0 ? [] : turns.slice(0, index + 1);
};

export const lastTurns = (
  turns: readonly ConversationTurn[],
  count = 3,
): readonly ConversationTurn[] => turns.slice(-Math.max(0, count));

export const formatTranscript = (
  turns: readonly ConversationTurn[],
): string =>
  turns
    .map(
      (turn) =>
        `${turn.speaker === "seller" ? "Vendedor" : "Cliente"}: ${turn.text}`,
    )
    .join("\n");
