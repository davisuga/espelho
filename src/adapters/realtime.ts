import {
  RealtimeAgent,
  RealtimeSession,
  type RealtimeItem,
} from "@openai/agents/realtime";

import type { ConversationTurn } from "@/domain/schemas";

export type VoiceState = "listening" | "speaking";

export type RealtimeConnection = Readonly<{
  close: () => void;
  mute: (muted: boolean) => void;
  sendMessage: (message: string) => void;
  updateHistory: (turns: readonly ConversationTurn[]) => void;
}>;

type ConnectRealtimeOptions = Readonly<{
  name: string;
  instructions: string;
  initialHistory?: readonly ConversationTurn[];
  onHistory: (turns: readonly ConversationTurn[]) => void;
  onVoiceState: (state: VoiceState) => void;
  onError: (message: string) => void;
}>;

const LIVE_MODEL =
  process.env.NEXT_PUBLIC_OPENAI_LIVE_MODEL?.trim() ||
  process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL?.trim() ||
  "gpt-realtime-2.1";

const textFromItem = (item: RealtimeItem): string => {
  if (item.type !== "message") return "";

  return item.content
    .map((content) => {
      if (content.type === "input_text" || content.type === "output_text") {
        return content.text;
      }
      if (content.type === "input_audio" || content.type === "output_audio") {
        return content.transcript ?? "";
      }
      return "";
    })
    .join(" ")
    .trim();
};

export const conversationTurnsFromHistory = (
  history: readonly RealtimeItem[],
  now = Date.now(),
): readonly ConversationTurn[] =>
  history.flatMap((item, index) => {
    if (item.type !== "message" || item.role === "system") {
      return [];
    }

    const text = textFromItem(item);
    return text
      ? [
          {
            id: item.itemId,
            speaker: item.role === "user" ? ("seller" as const) : ("customer" as const),
            text,
            createdAt: now + index,
          },
        ]
      : [];
  });

export const realtimeHistoryFromConversationTurns = (
  turns: readonly ConversationTurn[],
): RealtimeItem[] =>
  turns.map((turn, index) => {
    const base = {
      itemId: turn.id,
      previousItemId: index === 0 ? null : turns[index - 1]?.id,
      type: "message" as const,
      status: "completed" as const,
    };

    return turn.speaker === "seller"
      ? {
          ...base,
          role: "user" as const,
          content: [{ type: "input_text" as const, text: turn.text }],
        }
      : {
          ...base,
          role: "assistant" as const,
          content: [{ type: "output_text" as const, text: turn.text }],
        };
  });

const fetchEphemeralSession = async (): Promise<
  Readonly<{ apiKey: string; model: string }>
> => {
  const response = await fetch("/api/realtime", { method: "POST" });
  const payload: unknown = await response.json();

  if (
    !response.ok ||
    typeof payload !== "object" ||
    payload === null ||
    !("value" in payload) ||
    typeof payload.value !== "string"
  ) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Não foi possível criar a sessão de voz.";
    throw new Error(message);
  }

  return {
    apiKey: payload.value,
    model:
      "model" in payload && typeof payload.model === "string"
        ? payload.model
        : LIVE_MODEL,
  };
};

export const connectRealtimeTwin = async (
  options: ConnectRealtimeOptions,
): Promise<RealtimeConnection> => {
  const ephemeralSession = await fetchEphemeralSession();
  const historyStartedAt = Date.now();
  const agent = new RealtimeAgent({
    name: options.name,
    instructions: options.instructions,
    voice: "marin",
  });
  const session = new RealtimeSession(agent, {
    model: ephemeralSession.model,
    config: {
      outputModalities: ["audio"],
      reasoning: { effort: "low" },
      audio: {
        input: {
          transcription: {
            model: "gpt-4o-mini-transcribe",
            language: "pt",
          },
          turnDetection: {
            type: "semantic_vad",
            eagerness: "medium",
            createResponse: true,
            interruptResponse: true,
          },
        },
        output: { voice: "marin" },
      },
    },
  });

  session.on("history_updated", (history) => {
    options.onHistory(
      conversationTurnsFromHistory(history, historyStartedAt),
    );
  });
  session.on("audio_start", () => options.onVoiceState("speaking"));
  session.on("audio_stopped", () => options.onVoiceState("listening"));
  session.on("audio_interrupted", () => options.onVoiceState("listening"));
  session.on("error", (event) => {
    const message =
      event.error instanceof Error
        ? event.error.message
        : "A sessão de voz encontrou um erro.";
    options.onError(message);
  });

  await session.connect({ apiKey: ephemeralSession.apiKey });
  if (options.initialHistory?.length) {
    session.updateHistory(
      realtimeHistoryFromConversationTurns(options.initialHistory),
    );
  }
  options.onVoiceState("listening");

  return {
    close: () => session.close(),
    mute: (muted) => session.mute(muted),
    sendMessage: (message) => session.sendMessage(message),
    updateHistory: (turns) =>
      session.updateHistory(realtimeHistoryFromConversationTurns(turns)),
  };
};
