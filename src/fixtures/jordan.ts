import type {
  CallAnalysis,
  ConversationTurn,
  CustomerTwin,
} from "@/domain/schemas";

export const JORDAN_SOURCE_LINES = Object.freeze([
  "Seller: Jordan, I want to show you an AI platform for sales rehearsals.",
  "Jordan: My team sells on the phone. Speed and reacting under pressure matter more than theory.",
  "Seller: We have dashboards, metrics, and performance reports.",
  "Jordan: I don't need another dashboard. I need to know whether a seller can control the conversation when the buyer pushes back.",
  "Seller: The platform also gives every call an automatic score.",
  "Jordan: A generic score means nothing to me. Show me the exact moment they lost control of the conversation.",
  "Seller: We can roll it out to the whole operation at once.",
  "Jordan: If setup slows my sellers down, they won't use it. I've seen too many tools become distractions.",
  "Seller: We also offer several CRM integrations.",
  "Jordan: Integrations are secondary. First, show me a seller practicing a hard objection and improving on the second attempt.",
  "Seller: Could we start with a pilot?",
  "Jordan: I would test it with a small group before putting it across the entire company.",
  "Seller: What budget do you have available?",
  "Jordan: I'm not discussing a number before I see a concrete result.",
  "Seller: Who would participate in the final decision?",
  "Jordan: Bring me something concrete. Then I'll decide who else needs to be in the room.",
]);

export const JORDAN_SOURCE = JORDAN_SOURCE_LINES.join("\n");

export const JORDAN_TWIN: CustomerTwin = Object.freeze({
  name: "Jordan Belfort",
  role: "Founder and sales trainer",
  company: "Stratton Oakmont",
  summary:
    "Jordan evaluates tools by whether they improve seller behavior under pressure without slowing the team down.",
  facts: Object.freeze([
    {
      id: "phone-speed",
      claim: "His team sells on the phone and prioritizes speed under pressure.",
      certainty: "known" as const,
      evidence: [{
        quote: "My team sells on the phone. Speed and reacting under pressure matter more than theory.",
        sourceIndex: 2,
        explanation: "Jordan directly describes the channel and performance standard.",
      }],
    },
    {
      id: "not-dashboard",
      claim: "He does not want another dashboard; he wants observable behavior in the conversation.",
      certainty: "known" as const,
      evidence: [{
        quote: "I don't need another dashboard. I need to know whether a seller can control the conversation when the buyer pushes back.",
        sourceIndex: 4,
        explanation: "Jordan explicitly rejects dashboards as the core value proposition.",
      }],
    },
    {
      id: "exact-moment",
      claim: "He wants the exact moment where the seller loses control of the conversation.",
      certainty: "known" as const,
      evidence: [{
        quote: "A generic score means nothing to me. Show me the exact moment they lost control of the conversation.",
        sourceIndex: 6,
        explanation: "Jordan asks for a specific moment instead of a generic score.",
      }],
    },
    {
      id: "adoption-speed",
      claim: "The tool cannot make his sellers slower.",
      certainty: "known" as const,
      evidence: [{
        quote: "If setup slows my sellers down, they won't use it.",
        sourceIndex: 8,
        explanation: "He directly connects adoption to speed of use.",
      }],
    },
    {
      id: "small-pilot",
      claim: "He prefers a small pilot before a company-wide rollout.",
      certainty: "known" as const,
      evidence: [{
        quote: "I would test it with a small group before putting it across the entire company.",
        sourceIndex: 12,
        explanation: "Jordan explicitly states his preference for a limited pilot.",
      }],
    },
    {
      id: "behavior-first",
      claim: "He likely prioritizes observable behavior change over technical features.",
      certainty: "likely" as const,
      evidence: [{
        quote: "First, show me a seller practicing a hard objection and improving on the second attempt.",
        sourceIndex: 10,
        explanation: "Jordan's stated order suggests his main evaluation criterion.",
      }],
    },
  ]),
  concerns: Object.freeze([
    {
      topic: "Slowing the sales team down",
      evidence: [{
        quote: "If setup slows my sellers down, they won't use it.",
        sourceIndex: 8,
        explanation: "He explicitly states this adoption risk.",
      }],
    },
    {
      topic: "Generic feedback without a concrete action",
      evidence: [{
        quote: "A generic score means nothing to me.",
        sourceIndex: 6,
        explanation: "Jordan rejects evaluations that do not identify a specific moment.",
      }],
    },
  ]),
  goals: Object.freeze([
    {
      topic: "Improve how sellers respond to hard objections",
      evidence: [{
        quote: "Show me a seller practicing a hard objection and improving on the second attempt.",
        sourceIndex: 10,
        explanation: "He describes the outcome he wants to observe.",
      }],
    },
  ]),
  unknowns: Object.freeze([
    { topic: "Available budget", reason: "Jordan refuses to provide a number before seeing a concrete result." },
    { topic: "Decision timeline", reason: "The history contains no concrete date or urgency." },
    { topic: "Decision participants", reason: "He has not decided who else needs to participate." },
  ]),
});

export const JORDAN_BAD_CALL_TRANSCRIPT: readonly ConversationTurn[] = Object.freeze([
  Object.freeze({ id: "jordan-seller-1", speaker: "seller" as const, text: "Jordan, our platform has dashboards, advanced metrics, and several integrations.", createdAt: 0 }),
  Object.freeze({ id: "jordan-customer-1", speaker: "customer" as const, text: "You're not listening. I want to know whether this changes seller behavior under pressure.", createdAt: 1 }),
  Object.freeze({ id: "jordan-seller-2", speaker: "seller" as const, text: "We can also generate an automatic score after every conversation.", createdAt: 2 }),
  Object.freeze({ id: "jordan-customer-2", speaker: "customer" as const, text: "Scores don't close deals. Show me the moment they failed and let them try again.", createdAt: 3 }),
]);

export const deterministicJordanAnalysis = (
  sellerTurnId: string,
  sellerQuote: string,
): CallAnalysis => ({
  summary: "The pitch focused on technical features after Jordan made it clear that he evaluates observable sales behavior.",
  strengths: ["You presented concrete platform capabilities."],
  moments: [{
    id: "moment-behavior-first",
    turnId: sellerTurnId,
    sellerQuote,
    issue: "You lost Jordan here",
    whyItMatters: "You continued discussing dashboards and scores after Jordan asked for evidence that sellers improve under pressure.",
    customerEvidence: [{
      claimId: "not-dashboard",
      quote: "I don't need another dashboard. I need to know whether a seller can control the conversation when the buyer pushes back.",
    }],
    researchRuleIds: ["adaptive-selling", "follow-up-questions"],
    suggestedGoal: "Ask which difficult objection hurts his team most, then demonstrate a rehearsal with a second attempt.",
  }],
});
