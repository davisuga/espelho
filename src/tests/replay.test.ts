import { describe, expect, it } from "vitest";

import { buildReplayContext } from "@/domain/replay";
import { conversationPrefix } from "@/domain/transcript";
import type { ConversationTurn } from "@/domain/schemas";

const turns: readonly ConversationTurn[] = Object.freeze(
  [
    ["1", "customer", "Olá"],
    ["2", "seller", "Tudo bem?"],
    ["3", "customer", "Tudo"],
    ["4", "seller", "Vou apresentar recursos"],
    ["5", "customer", "Certo"],
  ].map(([id, speaker, text], index) =>
    Object.freeze({
      id,
      speaker: speaker as ConversationTurn["speaker"],
      text,
      createdAt: index,
    }),
  ),
);

describe("replay transforms", () => {
  it("returns the conversation before the selected seller turn", () => {
    const result = buildReplayContext(turns, "4");

    expect(result.previousTurns.map((turn) => turn.id)).toEqual(["1", "2", "3"]);
    expect(turns).toHaveLength(5);
    expect(result.previousTurns).not.toBe(turns);
  });

  it("returns an empty prefix for a missing turn", () => {
    expect(buildReplayContext(turns, "missing").previousTurns).toEqual([]);
  });

  it("includes the selected turn in conversationPrefix", () => {
    expect(conversationPrefix(turns, "3").map((turn) => turn.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("returns no prefix for an unknown id", () => {
    expect(conversationPrefix(turns, "missing")).toEqual([]);
  });
});
