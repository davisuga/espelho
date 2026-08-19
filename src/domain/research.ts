import type { ResearchRuleId } from "./schemas";

export type ResearchRule = Readonly<{
  id: ResearchRuleId;
  behavior: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
}>;

export const RESEARCH_RULES: readonly ResearchRule[] = Object.freeze([
  Object.freeze({
    id: "adaptive-selling" as const,
    behavior:
      "Adapta a conversa às informações e preocupações expressas pelo cliente.",
    title:
      "Salesperson Adaptive Selling Behavior and Customer Orientation: A Meta-Analysis",
    authors: "George R. Franke & Jeong-Eun Park",
    year: 2006,
    journal: "Journal of Marketing Research",
    doi: "10.1509/jmkr.43.4.693",
  }),
  Object.freeze({
    id: "follow-up-questions" as const,
    behavior:
      "Usa perguntas de acompanhamento relevantes para compreender o que o cliente acabou de dizer.",
    title: "It Doesn't Hurt to Ask: Question-Asking Increases Liking",
    authors:
      "Karen Huang, Michael Yeomans, Alison Wood Brooks, Julia Minson & Francesca Gino",
    year: 2017,
    journal: "Journal of Personality and Social Psychology",
    doi: "10.1037/pspi0000097",
  }),
]);

export const researchRuleById = (id: ResearchRuleId | string): ResearchRule | null =>
  RESEARCH_RULES.find((rule) => rule.id === id) ?? null;
