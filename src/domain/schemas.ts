import { z } from "zod";

export const EvidenceSchema = z.object({
  quote: z.string().trim().min(1),
  sourceIndex: z.number().int().positive(),
  explanation: z.string().trim().min(1),
});

export const CustomerFactSchema = z.object({
  id: z.string().trim().min(1),
  claim: z.string().trim().min(1),
  certainty: z.enum(["known", "likely"]),
  evidence: z.array(EvidenceSchema).min(1),
});

export const UnknownSchema = z.object({
  topic: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});

const EvidenceTopicSchema = z.object({
  topic: z.string().trim().min(1),
  evidence: z.array(EvidenceSchema).min(1),
});

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

export const ConversationTurnSchema = z.object({
  id: z.string().trim().min(1),
  speaker: z.enum(["seller", "customer"]),
  text: z.string().trim().min(1),
  createdAt: z.number().finite(),
});

export const ScoreDimensionSchema = z.enum([
  "discovery",
  "active-listening",
  "adaptive-selling",
  "objection-handling",
  "value-communication",
  "next-step",
]);

export const ResearchRuleIdSchema = z.enum([
  "adaptive-selling",
  "follow-up-questions",
  "active-listening",
  "customer-oriented-selling",
  "objection-exploration",
]);

export const ObservationBehaviorSchema = z.enum([
  "positive",
  "negative",
  "missed-opportunity",
]);

export const SeveritySchema = z.enum(["low", "medium", "high"]);

export const BehavioralObservationSchema = z.object({
  id: z.string().trim().min(1),
  dimension: ScoreDimensionSchema,
  turnId: z.string().trim().min(1),
  behavior: ObservationBehaviorSchema,
  severity: SeveritySchema,
  sellerQuote: z.string().trim().min(1).nullable(),
  customerQuote: z.string().trim().min(1).nullable(),
  explanation: z.string().trim().min(1),
  researchRuleIds: z.array(ResearchRuleIdSchema),
});

export const CoachingStrengthSchema = z.object({
  id: z.string().trim().min(1),
  dimension: ScoreDimensionSchema,
  turnId: z.string().trim().min(1),
  sellerQuote: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
  researchRuleIds: z.array(ResearchRuleIdSchema),
});

export const CustomerEvidenceReferenceSchema = z.object({
  claimId: z.string().trim().min(1),
  quote: z.string().trim().min(1),
});

export const CoachingMomentSchema = z.object({
  id: z.string().trim().min(1),
  turnId: z.string().trim().min(1),
  sellerQuote: z.string().trim().min(1),
  customerQuote: z.string().trim().min(1).nullable(),
  issue: z.string().trim().min(1),
  whyItMatters: z.string().trim().min(1),
  betterApproach: z.string().trim().min(1),
  exampleResponse: z.string().trim().min(1),
  customerEvidence: z.array(CustomerEvidenceReferenceSchema),
  researchRuleIds: z.array(ResearchRuleIdSchema),
  dimension: ScoreDimensionSchema,
  severity: SeveritySchema,
});

export const CallAnalysisSchema = z.object({
  summary: z.string().trim().min(1),
  observations: z.array(BehavioralObservationSchema),
  strengths: z.array(CoachingStrengthSchema).max(3),
  moments: z.array(CoachingMomentSchema).max(3),
});

export const ReplayContextSchema = z.object({
  previousTurns: z.array(ConversationTurnSchema),
  selectedTurnId: z.string().trim().min(1),
  summary: z.string(),
});

export type Evidence = Readonly<z.infer<typeof EvidenceSchema>>;
export type CustomerFact = Readonly<z.infer<typeof CustomerFactSchema>>;
export type Unknown = Readonly<z.infer<typeof UnknownSchema>>;
export type CustomerTwin = Readonly<z.infer<typeof CustomerTwinSchema>>;
export type ConversationTurn = Readonly<z.infer<typeof ConversationTurnSchema>>;
export type ScoreDimension = z.infer<typeof ScoreDimensionSchema>;
export type ResearchRuleId = z.infer<typeof ResearchRuleIdSchema>;
export type ObservationBehavior = z.infer<typeof ObservationBehaviorSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type BehavioralObservation = Readonly<
  Omit<z.infer<typeof BehavioralObservationSchema>, "researchRuleIds"> & {
    researchRuleIds: readonly ResearchRuleId[];
  }
>;
export type CoachingStrength = Readonly<
  Omit<z.infer<typeof CoachingStrengthSchema>, "researchRuleIds"> & {
    researchRuleIds: readonly ResearchRuleId[];
  }
>;
export type CustomerEvidenceReference = Readonly<z.infer<typeof CustomerEvidenceReferenceSchema>>;
export type CoachingMoment = Readonly<
  Omit<z.infer<typeof CoachingMomentSchema>, "customerEvidence" | "researchRuleIds"> & {
    customerEvidence: readonly CustomerEvidenceReference[];
    researchRuleIds: readonly ResearchRuleId[];
  }
>;
export type CallAnalysis = Readonly<{
  summary: string;
  observations: readonly BehavioralObservation[];
  strengths: readonly CoachingStrength[];
  moments: readonly CoachingMoment[];
}>;
export type ReplayContext = Readonly<z.infer<typeof ReplayContextSchema>>;

export const TwinRequestSchema = z.object({
  sourceText: z.string().trim().min(1).max(50_000),
});

export const AnalyzeRequestSchema = z.object({
  twin: CustomerTwinSchema,
  transcript: z.array(ConversationTurnSchema).min(1),
});

export const TextTurnRequestSchema = z.object({
  twin: CustomerTwinSchema,
  transcript: z.array(ConversationTurnSchema),
  sellerMessage: z.string().trim().min(1).max(4_000),
  replayContext: ReplayContextSchema.optional(),
});

export type ApiError = Readonly<{
  error: Readonly<{ code: string; message: string }>;
}>;
