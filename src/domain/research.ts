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
      "Adapta a conversa às informações e preocupações expressas pelo cliente.",
    coachingPrinciple:
      "Modifique a abordagem à medida que o cliente revela necessidades, restrições e preocupações.",
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
      "Usa perguntas de acompanhamento relevantes para compreender o que o cliente acabou de dizer.",
    coachingPrinciple:
      "Faça perguntas de acompanhamento relevantes antes de voltar à apresentação.",
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
    behavior: "Demonstra entendimento do que o cliente acabou de dizer antes de avançar.",
    coachingPrinciple:
      "Reformule ou confirme a mensagem do cliente para tornar a escuta observável.",
    title: "Effective Interpersonal Listening and Personal Selling",
    authors: "Stephen B. Castleberry & C. David Shepherd",
    year: 1993,
    journal: "Journal of Personal Selling & Sales Management",
    doi: "10.1080/08853134.1993.10753935",
  }),
  Object.freeze({
    id: "customer-oriented-selling" as const,
    dimension: "value-communication" as const,
    behavior: "Prioriza compreender e resolver o problema do cliente em vez de maximizar o pitch.",
    coachingPrinciple:
      "Conecte a solução ao problema expresso pelo cliente e evite listar recursos sem relevância demonstrada.",
    title: "The SOCO Scale: A Measure of the Customer Orientation of Salespeople",
    authors: "Robert Saxe & Barton A. Weitz",
    year: 1982,
    journal: "Journal of Marketing Research",
    doi: "10.1177/002224378201900307",
  }),
  Object.freeze({
    id: "objection-exploration" as const,
    dimension: "objection-handling" as const,
    behavior: "Reconhece e investiga a objeção antes de tentar respondê-la.",
    coachingPrinciple:
      "Busque compreender a indecisão e a preocupação específica antes de oferecer uma resposta.",
    title: "Effective Selling Approaches to Buyers' Objections",
    authors: "Paul H. Schurr, Lois H. Stone & Lee Ann Beller",
    year: 1985,
    journal: "Industrial Marketing Management",
    doi: "10.1016/0019-8501(85)90038-0",
  }),
]);

export const researchRuleById = (id: ResearchRuleId | string): ResearchRule | null =>
  RESEARCH_RULES.find((rule) => rule.id === id) ?? null;
