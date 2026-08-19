import { describe, expect, it } from "vitest";
import { buildReplayContext } from "@/domain/replay";
import { conversationPrefix } from "@/domain/transcript";
import type { ConversationTurn } from "@/domain/schemas";

const turns: readonly ConversationTurn[] = Object.freeze([
  { id: "1", speaker: "customer", text: "one", createdAt: 1 },
  { id: "2", speaker: "seller", text: "two", createdAt: 2 },
  { id: "3", speaker: "customer", text: "three", createdAt: 3 },
  { id: "4", speaker: "seller", text: "four", createdAt: 4 },
  { id: "5", speaker: "customer", text: "five", createdAt: 5 },
]);

describe("replay", () => {
  it("takes the prefix immediately before the selected seller turn", () => {
    const replay = buildReplayContext(turns, "4");
    expect(replay.previousTurns.map((turn) => turn.id)).toEqual(["1", "2", "3"]);
    expect(turns.map((turn) => turn.id)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("returns an inclusive conversation prefix", () => {
    expect(conversationPrefix(turns, "3").map((turn) => turn.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("returns an empty replay for an unknown turn", () => {
    expect(buildReplayContext(turns, "missing").previousTurns).toEqual([]);
  });
});
