import type { VoiceStatus } from "@/adapters/realtime";

export function VoiceOrb({ status }: Readonly<{ status: VoiceStatus }>) {
  return (
    <div className={`orb-stage ${status}`} aria-hidden="true">
      <div className="orb-ring ring-one" />
      <div className="orb-ring ring-two" />
      <div className="voice-orb"><span /></div>
    </div>
  );
}
