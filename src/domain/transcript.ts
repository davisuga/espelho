import type { ConversationTurn } from "./schemas";

export const conversationPrefix = (
  turns: readonly ConversationTurn[],
  throughTurnId: string,
): readonly ConversationTurn[] => {
  const index = turns.findIndex((turn) => turn.id === throughTurnId);
  return index < 0 ? [] : turns.slice(0, index + 1);
};

export const formatTranscript = (turns: readonly ConversationTurn[]): string =>
  turns
    .map((turn) => `${turn.speaker === "seller" ? "Seller" : "Customer"}: ${turn.text}`)
    .join("\n");

export const elapsedLabel = (
  turns: readonly ConversationTurn[],
  turnId: string,
): string => {
  const first = turns.at(0)?.createdAt ?? 0;
  const selected = turns.find((turn) => turn.id === turnId)?.createdAt ?? first;
  const seconds = Math.max(0, Math.floor((selected - first) / 1_000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};
