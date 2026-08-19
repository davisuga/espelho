import { describe, expect, it } from "vitest";

import {
  INITIAL_APP_STATE,
  reduceAppState,
  type AppState,
} from "@/domain/app-state";
import { deterministicAnalysis, MARIANA_TWIN } from "@/fixtures/mariana";

const turn = Object.freeze({
  id: "turn-1",
  speaker: "seller" as const,
  text: "Como funciona sua rotina?",
  createdAt: 1,
});

describe("reduceAppState", () => {
  it("moves source to extracting without mutation", () => {
    const state = Object.freeze({
      ...INITIAL_APP_STATE,
      sourceText: "Histórico",
    });
    const result = reduceAppState(state, { type: "EXTRACTION_STARTED" });

    expect(result.phase).toBe("extracting");
    expect(state.phase).toBe("source");
    expect(result).not.toBe(state);
  });

  it("moves extracting to twin", () => {
    const state: AppState = { ...INITIAL_APP_STATE, phase: "extracting" };
    const result = reduceAppState(state, {
      type: "EXTRACTION_SUCCEEDED",
      twin: MARIANA_TWIN,
    });

    expect(result.phase).toBe("twin");
    expect(result.twin?.name).toBe("Mariana");
  });

  it("moves twin through connecting to practice", () => {
    const state: AppState = {
      ...INITIAL_APP_STATE,
      phase: "twin",
      twin: MARIANA_TWIN,
    };
    const connecting = reduceAppState(state, { type: "PRACTICE_STARTED" });
    const practice = reduceAppState(connecting, {
      type: "PRACTICE_CONNECTED",
      mode: "voice",
    });

    expect(connecting.phase).toBe("connecting");
    expect(practice.phase).toBe("practice");
    expect(practice.practiceMode).toBe("voice");
  });

  it("immutably appends a turn", () => {
    const transcript = Object.freeze([]);
    const state = Object.freeze({
      ...INITIAL_APP_STATE,
      phase: "practice" as const,
      transcript,
    });
    const result = reduceAppState(state, { type: "TURN_ADDED", turn });

    expect(result.transcript).toEqual([turn]);
    expect(state.transcript).toHaveLength(0);
    expect(result.transcript).not.toBe(transcript);
  });

  it("reconciles a complete live transcript without sharing the input array", () => {
    const transcript = Object.freeze([turn]);
    const result = reduceAppState(INITIAL_APP_STATE, {
      type: "TRANSCRIPT_SYNCED",
      transcript,
    });

    expect(result.transcript).toEqual(transcript);
    expect(result.transcript).not.toBe(transcript);
  });

  it("moves practice to analyzing", () => {
    const state: AppState = { ...INITIAL_APP_STATE, phase: "practice" };
    expect(reduceAppState(state, { type: "PRACTICE_ENDED" }).phase).toBe(
      "analyzing",
    );
  });

  it("moves analyzing to review", () => {
    const analysis = deterministicAnalysis(turn.id, turn.text);
    const state: AppState = { ...INITIAL_APP_STATE, phase: "analyzing" };
    const result = reduceAppState(state, {
      type: "ANALYSIS_SUCCEEDED",
      analysis,
    });

    expect(result.phase).toBe("review");
    expect(result.analysis).toBe(analysis);
  });

  it("creates an immutable replay branch", () => {
    const analysis = deterministicAnalysis(turn.id, turn.text);
    const transcript = Object.freeze([
      Object.freeze({
        id: "customer-0",
        speaker: "customer" as const,
        text: "Olá",
        createdAt: 0,
      }),
      turn,
    ]);
    const state: AppState = {
      ...INITIAL_APP_STATE,
      phase: "review",
      transcript,
      analysis,
    };
    const result = reduceAppState(state, {
      type: "REPLAY_SELECTED",
      momentId: "moment-adoption",
    });

    expect(result.phase).toBe("connecting");
    expect(result.attempt).toBe(2);
    expect(result.transcript).toEqual([]);
    expect(result.originalTranscript).toBe(transcript);
    expect(result.replayFrom?.previousTurns).toEqual([transcript[0]]);
    expect(state.transcript).toBe(transcript);
  });

  it("resets to the exact initial state", () => {
    const dirty: AppState = {
      ...INITIAL_APP_STATE,
      phase: "review",
      sourceText: "anything",
    };

    expect(reduceAppState(dirty, { type: "RESET" })).toBe(INITIAL_APP_STATE);
  });
});
