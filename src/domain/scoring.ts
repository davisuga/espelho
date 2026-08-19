import type {
  BehavioralObservation,
  ObservationBehavior,
  ScoreDimension,
  Severity,
} from "./schemas";

export const SCORE_DIMENSIONS: readonly ScoreDimension[] = Object.freeze([
  "discovery",
  "active-listening",
  "adaptive-selling",
  "objection-handling",
  "value-communication",
  "next-step",
]);

export const SCORE_LABELS: Readonly<Record<ScoreDimension, string>> = Object.freeze({
  discovery: "Discovery",
  "active-listening": "Active listening",
  "adaptive-selling": "Adaptive selling",
  "objection-handling": "Objection handling",
  "value-communication": "Value communication",
  "next-step": "Next step",
});

export const SCORE_WEIGHTS: Readonly<Record<ScoreDimension, number>> = Object.freeze({
  discovery: 0.2,
  "active-listening": 0.2,
  "adaptive-selling": 0.2,
  "objection-handling": 0.15,
  "value-communication": 0.15,
  "next-step": 0.1,
});

export type Scorecard = Readonly<Record<ScoreDimension, number>>;

const BASE_SCORE = 70;
const IMPACT: Readonly<Record<ObservationBehavior, Readonly<Record<Severity, number>>>> =
  Object.freeze({
    positive: Object.freeze({ low: 3, medium: 6, high: 10 }),
    negative: Object.freeze({ low: -4, medium: -8, high: -14 }),
    "missed-opportunity": Object.freeze({ low: -3, medium: -6, high: -10 }),
  });

const clamp = (score: number): number => Math.min(100, Math.max(0, score));

export const calculateDimensionScore = (
  observations: readonly BehavioralObservation[],
): number =>
  clamp(
    BASE_SCORE +
      observations.reduce(
        (total, observation) => total + IMPACT[observation.behavior][observation.severity],
        0,
      ),
  );

export const calculateScorecard = (
  observations: readonly BehavioralObservation[],
): Scorecard =>
  Object.freeze(
    Object.fromEntries(
      SCORE_DIMENSIONS.map((dimension) => [
        dimension,
        calculateDimensionScore(
          observations.filter((observation) => observation.dimension === dimension),
        ),
      ]),
    ) as Record<ScoreDimension, number>,
  );

export const calculateOverallScore = (scorecard: Scorecard): number =>
  Math.round(
    SCORE_DIMENSIONS.reduce(
      (total, dimension) => total + scorecard[dimension] * SCORE_WEIGHTS[dimension],
      0,
    ),
  );

export const scoreInterpretation = (score: number): string => {
  if (score < 40) return "Needs significant practice";
  if (score < 60) return "Developing";
  if (score < 75) return "Good";
  if (score < 90) return "Very good";
  return "Excellent";
};

export const scoreExtremes = (
  scorecard: Scorecard,
): Readonly<{ strongest: ScoreDimension; opportunity: ScoreDimension }> => {
  const ranked = [...SCORE_DIMENSIONS].sort((a, b) => scorecard[b] - scorecard[a]);
  return { strongest: ranked[0], opportunity: ranked[ranked.length - 1] };
};
