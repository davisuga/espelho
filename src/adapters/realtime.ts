import type { ConversationTurn } from "@/domain/schemas";

export type VoiceStatus = "idle" | "listening" | "speaking";

export type RealtimeSession = Readonly<{
  close: () => void;
}>;

type RealtimeOptions = Readonly<{
  instructions: string;
  onTurn: (turn: ConversationTurn) => void;
  onStatus: (status: VoiceStatus) => void;
  onFailure: (message: string) => void;
}>;

type RealtimeEvent = Readonly<{
  type?: string;
  item_id?: string;
  transcript?: string;
  part?: Readonly<{ transcript?: string }>;
  item?: Readonly<{ id?: string; role?: string }>;
}>;

const turnFromTranscript = (
  itemId: string,
  speaker: ConversationTurn["speaker"],
  text: string,
): ConversationTurn => ({
  id: itemId,
  speaker,
  text: text.trim(),
  createdAt: Date.now(),
});

export const connectRealtime = async (
  options: RealtimeOptions,
): Promise<RealtimeSession> => {
  if (!globalThis.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support voice rehearsal.");
  }

  const peer = new RTCPeerConnection();
  const audio = document.createElement("audio");
  const channel = peer.createDataChannel("oai-events");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const itemOrder: string[] = [];
  const pending = new Map<string, ConversationTurn>();
  const emitted = new Set<string>();
  const closed = { value: false };

  audio.autoplay = true;
  audio.hidden = true;
  document.body.append(audio);
  stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));

  const close = (): void => {
    if (closed.value) return;
    closed.value = true;
    channel.close();
    peer.close();
    stream.getTracks().forEach((track) => track.stop());
    audio.srcObject = null;
    audio.remove();
  };

  const flushTurns = (): void => {
    const ready = itemOrder.filter((id) => !emitted.has(id));
    ready.every((id) => {
      const turn = pending.get(id);
      if (!turn) return false;
      emitted.add(id);
      options.onTurn(turn);
      return true;
    });
  };

  const registerTurn = (turn: ConversationTurn): void => {
    if (!itemOrder.includes(turn.id)) itemOrder.push(turn.id);
    pending.set(turn.id, turn);
    flushTurns();
  };

  peer.ontrack = (event) => {
    audio.srcObject = event.streams[0] ?? null;
    void audio.play().catch(() => undefined);
  };
  peer.onconnectionstatechange = () => {
    if (["failed", "disconnected"].includes(peer.connectionState) && !closed.value) {
      options.onFailure("The audio connection was interrupted.");
      close();
    }
  };

  channel.onmessage = (message) => {
    const event = JSON.parse(String(message.data)) as RealtimeEvent;
    if (
      ["conversation.item.added", "conversation.item.created"].includes(
        event.type ?? "",
      ) &&
      event.item?.id &&
      ["user", "assistant"].includes(event.item.role ?? "") &&
      !itemOrder.includes(event.item.id)
    ) {
      itemOrder.push(event.item.id);
    }
    if (
      event.type === "conversation.item.input_audio_transcription.completed" &&
      event.item_id &&
      event.transcript?.trim()
    ) {
      registerTurn(turnFromTranscript(event.item_id, "seller", event.transcript));
    }
    if (
      [
        "response.output_audio_transcript.done",
        "response.output_audio_transcript.completed",
      ].includes(event.type ?? "") &&
      event.item_id &&
      event.transcript?.trim()
    ) {
      registerTurn(turnFromTranscript(event.item_id, "customer", event.transcript));
    }
    if (
      event.type === "response.content_part.done" &&
      event.item_id &&
      event.part?.transcript?.trim()
    ) {
      registerTurn(turnFromTranscript(event.item_id, "customer", event.part.transcript));
    }
    if (event.type === "input_audio_buffer.speech_started") options.onStatus("listening");
    if (
      ["response.created", "response.output_audio.delta"].includes(event.type ?? "")
    ) {
      options.onStatus("speaking");
    }
    if (event.type === "response.done") options.onStatus("listening");
  };

  const channelReady = new Promise<void>((resolve, reject) => {
    const timer = globalThis.setTimeout(
      () => reject(new Error("The audio connection took too long to open.")),
      12_000,
    );
    channel.onopen = () => {
      globalThis.clearTimeout(timer);
      channel.send(
        JSON.stringify({
          type: "session.update",
          session: {
            type: "realtime",
            instructions: options.instructions,
            reasoning: { effort: "low" },
            audio: {
              input: {
                transcription: { model: "gpt-live-transcribe", language: "en" },
              },
              output: { voice: "cedar" },
            },
          },
        }),
      );
      options.onStatus("listening");
      resolve();
    };
    channel.onerror = () => {
      globalThis.clearTimeout(timer);
      reject(new Error("The audio event channel failed."));
    };
  });

  try {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const response = await fetch("/api/realtime", {
      method: "POST",
      headers: { "Content-Type": "application/sdp" },
      body: offer.sdp,
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error("The voice session could not be opened.");
    await peer.setRemoteDescription({ type: "answer", sdp: await response.text() });
    await channelReady;
    return { close };
  } catch (error) {
    close();
    throw error;
  }
};
