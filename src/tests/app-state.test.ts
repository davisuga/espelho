import { describe, expect, it } from "vitest";
import { initialAppState, reduceAppState } from "@/domain/app-state";
import { analysisFixture, twinFixture } from "./fixtures";

describe("reduceAppState", () => {
  it("moves through extraction and twin review", () => {
    const source = Object.freeze({ ...initialAppState, sourceText: "history" });
    const extracting = reduceAppState(source, { type: "EXTRACTION_STARTED" });
    const reviewed = reduceAppState(extracting, {
      type: "EXTRACTION_SUCCEEDED",
      twin: twinFixture,
    });
    expect(extracting.phase).toBe("extracting");
    expect(reviewed.phase).toBe("twin");
    expect(source.phase).toBe("source");
  });

  it("appends a turn without mutating the frozen original state", () => {
    const transcript = Object.freeze([]);
    const state = Object.freeze({
      ...initialAppState,
      phase: "practice" as const,
      originalTranscript: transcript,
    });
    const next = reduceAppState(state, {
      type: "TURN_ADDED",
      turn: { id: "1", speaker: "seller", text: "Olá", createdAt: 1 },
    });
    expect(next.originalTranscript).toHaveLength(1);
    expect(state.originalTranscript).toHaveLength(0);
    expect(next.originalTranscript).not.toBe(state.originalTranscript);
  });

  it("keeps replay turns separate", () => {
    const state = {
      ...initialAppState,
      attempt: "replay" as const,
      originalTranscript: [
        { id: "old", speaker: "seller" as const, text: "Original", createdAt: 1 },
      ],
    };
    const next = reduceAppState(state, {
      type: "TURN_ADDED",
      turn: { id: "new", speaker: "seller", text: "Replay", createdAt: 2 },
    });
    expect(next.originalTranscript).toEqual(state.originalTranscript);
    expect(next.replayTranscript.map((turn) => turn.id)).toEqual(["new"]);
  });

  it("moves from practice to analysis and review", () => {
    const state = { ...initialAppState, phase: "practice" as const };
    const analyzing = reduceAppState(state, { type: "PRACTICE_ENDED" });
    const review = reduceAppState(analyzing, {
      type: "ANALYSIS_SUCCEEDED",
      analysis: analysisFixture,
    });
    expect(analyzing.phase).toBe("analyzing");
    expect(review.phase).toBe("review");
  });

  it("resets to the initial state", () => {
    const state = { ...initialAppState, phase: "review" as const, twin: twinFixture };
    expect(reduceAppState(state, { type: "RESET" })).toEqual(initialAppState);
  });
});
