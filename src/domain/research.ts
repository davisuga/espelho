import type { ResearchRuleId, ScoreDimension } from "./schemas";

export type ResearchRule = Readonly<{
  id: ResearchRuleId;
  dimension: ScoreDimension;
  behavior: string;
  coachingPrinciple: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi?: string;
}>;

export const RESEARCH_RULES: readonly ResearchRule[] = Object.freeze([
  Object.freeze({
    id: "adaptive-selling" as const,
    dimension: "adaptive-selling" as const,
    behavior:
      "Adapts the conversation to information and concerns expressed by the customer.",
    coachingPrinciple:
      "Adjust the approach as the customer reveals needs, constraints, and concerns.",
    title:
      "Salesperson Adaptive Selling Behavior and Customer Orientation: A Meta-Analysis",
    authors: "George R. Franke & Jeong-Eun Park",
    year: 2006,
    journal: "Journal of Marketing Research",
    doi: "10.1509/jmkr.43.4.693",
  }),
  Object.freeze({
    id: "follow-up-questions" as const,
    dimension: "discovery" as const,
    behavior:
      "Uses relevant follow-up questions to understand what the customer just said.",
    coachingPrinciple:
      "Ask relevant follow-up questions before returning to the presentation.",
    title: "It Doesn't Hurt to Ask: Question-Asking Increases Liking",
    authors:
      "Karen Huang, Michael Yeomans, Alison Wood Brooks, Julia Minson & Francesca Gino",
    year: 2017,
    journal: "Journal of Personality and Social Psychology",
    doi: "10.1037/pspi0000097",
  }),
  Object.freeze({
    id: "active-listening" as const,
    dimension: "active-listening" as const,
    behavior: "Demonstrates understanding of what the customer just said before moving on.",
    coachingPrinciple:
      "Restate or confirm the customer's message to make listening observable.",
    title: "Effective Interpersonal Listening and Personal Selling",
    authors: "Stephen B. Castleberry & C. David Shepherd",
    year: 1993,
    journal: "Journal of Personal Selling & Sales Management",
    doi: "10.1080/08853134.1993.10753935",
  }),
  Object.freeze({
    id: "customer-oriented-selling" as const,
    dimension: "value-communication" as const,
    behavior: "Prioritizes understanding and solving the customer problem over maximizing the pitch.",
    coachingPrinciple:
      "Connect the solution to the customer's stated problem and avoid listing irrelevant features.",
    title: "The SOCO Scale: A Measure of the Customer Orientation of Salespeople",
    authors: "Robert Saxe & Barton A. Weitz",
    year: 1982,
    journal: "Journal of Marketing Research",
    doi: "10.1177/002224378201900307",
  }),
  Object.freeze({
    id: "objection-exploration" as const,
    dimension: "objection-handling" as const,
    behavior: "Acknowledges and investigates an objection before trying to answer it.",
    coachingPrinciple:
      "Understand the specific concern before offering a response.",
    title: "Effective Selling Approaches to Buyers' Objections",
    authors: "Paul H. Schurr, Lois H. Stone & Lee Ann Beller",
    year: 1985,
    journal: "Industrial Marketing Management",
    doi: "10.1016/0019-8501(85)90038-0",
  }),
]);

export const researchRuleById = (id: ResearchRuleId | string): ResearchRule | null =>
  RESEARCH_RULES.find((rule) => rule.id === id) ?? null;
