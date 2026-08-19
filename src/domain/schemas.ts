import { z } from "zod";

export const EvidenceSchema = z.object({
  quote: z.string().trim().min(1),
  sourceIndex: z.number().int().nonnegative(),
  explanation: z.string().trim().min(1),
});

export type Evidence = Readonly<z.infer<typeof EvidenceSchema>>;

export const CustomerFactSchema = z.object({
  id: z.string().trim().min(1),
  claim: z.string().trim().min(1),
  certainty: z.enum(["known", "likely"]),
  evidence: z.array(EvidenceSchema).min(1),
});

export type CustomerFact = Readonly<
  Omit<z.infer<typeof CustomerFactSchema>, "evidence"> & {
    readonly evidence: readonly Evidence[];
  }
>;

export const UnknownSchema = z.object({
  topic: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});

export type Unknown = Readonly<z.infer<typeof UnknownSchema>>;

const EvidenceTopicSchema = z.object({
  topic: z.string().trim().min(1),
  evidence: z.array(EvidenceSchema).min(1),
});

export type EvidenceTopic = Readonly<
  Omit<z.infer<typeof EvidenceTopicSchema>, "evidence"> & {
    readonly evidence: readonly Evidence[];
  }
>;

export const CustomerTwinSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1).nullable(),
  company: z.string().trim().min(1).nullable(),
  summary: z.string().trim().min(1),
  facts: z.array(CustomerFactSchema).max(8),
  concerns: z.array(EvidenceTopicSchema).max(5),
  goals: z.array(EvidenceTopicSchema).max(5),
  unknowns: z.array(UnknownSchema).max(8),
});

export type CustomerTwin = Readonly<{
  name: string;
  role: string | null;
  company: string | null;
  summary: string;
  facts: readonly CustomerFact[];
  concerns: readonly EvidenceTopic[];
  goals: readonly EvidenceTopic[];
  unknowns: readonly Unknown[];
}>;

export const ConversationTurnSchema = z.object({
  id: z.string().trim().min(1),
  speaker: z.enum(["seller", "customer"]),
  text: z.string().trim().min(1),
  createdAt: z.number().nonnegative(),
});

export type ConversationTurn = Readonly<z.infer<typeof ConversationTurnSchema>>;

export const ResearchRuleIdSchema = z.enum([
  "adaptive-selling",
  "follow-up-questions",
]);

export type ResearchRuleId = z.infer<typeof ResearchRuleIdSchema>;

export const CoachingMomentSchema = z.object({
  id: z.string().trim().min(1),
  turnId: z.string().trim().min(1),
  sellerQuote: z.string().trim().min(1),
  issue: z.string().trim().min(1),
  whyItMatters: z.string().trim().min(1),
  customerEvidence: z.array(
    z.object({
      claimId: z.string().trim().min(1),
      quote: z.string().trim().min(1),
    }),
  ),
  researchRuleIds: z.array(ResearchRuleIdSchema),
  suggestedGoal: z.string().trim().min(1),
});

export type CoachingMoment = Readonly<{
  id: string;
  turnId: string;
  sellerQuote: string;
  issue: string;
  whyItMatters: string;
  customerEvidence: readonly Readonly<{ claimId: string; quote: string }>[];
  researchRuleIds: readonly ResearchRuleId[];
  suggestedGoal: string;
}>;

export const CallAnalysisSchema = z.object({
  summary: z.string().trim().min(1),
  strengths: z.array(z.string().trim().min(1)),
  moments: z.array(CoachingMomentSchema).max(3),
});

export type CallAnalysis = Readonly<{
  summary: string;
  strengths: readonly string[];
  moments: readonly CoachingMoment[];
}>;

export const TwinRequestSchema = z.object({
  sourceText: z.string().trim().min(1),
});

export const TextTurnRequestSchema = z.object({
  twin: CustomerTwinSchema,
  transcript: z.array(ConversationTurnSchema),
  sellerMessage: z.string().trim().min(1),
  replayContext: z
    .object({
      selectedTurnId: z.string(),
      previousTurns: z.array(ConversationTurnSchema),
      summary: z.string(),
    })
    .nullable()
    .optional(),
});

export const AnalysisRequestSchema = z.object({
  twin: CustomerTwinSchema,
  transcript: z.array(ConversationTurnSchema).min(1),
});

export type Result<T, E> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: E }>;
