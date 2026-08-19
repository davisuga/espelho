import type {
  CallAnalysis,
  ConversationTurn,
  CustomerTwin,
} from "@/domain/schemas";

export const JORDAN_SOURCE_LINES = Object.freeze([
  "Vendedor: Jordan, quero te mostrar uma plataforma de ensaio de vendas com IA.",
  "Jordan: Minha equipe vende por telefone. Velocidade e reação sob pressão importam mais do que teoria.",
  "Vendedor: Temos dashboards, métricas e relatórios de performance.",
  "Jordan: Eu não preciso de outro dashboard. Quero saber se o vendedor consegue conduzir a conversa quando o cliente resiste.",
  "Vendedor: A plataforma também gera notas automáticas para cada ligação.",
  "Jordan: Nota genérica não me interessa. Mostre o momento exato em que ele perdeu o controle da conversa.",
  "Vendedor: Podemos implantar para toda a operação de uma vez.",
  "Jordan: Se a configuração deixar os vendedores mais lentos, eles não vão usar. Já vi ferramenta demais virar distração.",
  "Vendedor: Também temos várias integrações com CRM.",
  "Jordan: Integração é secundária. Primeiro eu quero ver um vendedor praticar uma objeção difícil e melhorar na segunda tentativa.",
  "Vendedor: Podemos começar com um piloto?",
  "Jordan: Eu testaria com um grupo pequeno antes de colocar isso na empresa inteira.",
  "Vendedor: Qual orçamento você tem disponível?",
  "Jordan: Eu não vou discutir um número antes de ver resultado concreto.",
  "Vendedor: E quem participaria da decisão final?",
  "Jordan: Traga algo concreto. Depois eu decido quem mais precisa entrar na conversa.",
]);

export const JORDAN_SOURCE = JORDAN_SOURCE_LINES.join("\n");

export const JORDAN_TWIN: CustomerTwin = Object.freeze({
  name: "Jordan Belfort",
  role: "Fundador e treinador de vendas",
  company: "Stratton Oakmont",
  summary:
    "Jordan avalia ferramentas pela capacidade de melhorar o comportamento do vendedor sob pressão, sem reduzir a velocidade da equipe.",
  facts: Object.freeze([
    {
      id: "phone-speed",
      claim: "A equipe vende por telefone e prioriza velocidade sob pressão.",
      certainty: "known" as const,
      evidence: [{
        quote: "Minha equipe vende por telefone. Velocidade e reação sob pressão importam mais do que teoria.",
        sourceIndex: 2,
        explanation: "Jordan descreve diretamente o canal e o padrão esperado.",
      }],
    },
    {
      id: "not-dashboard",
      claim: "Não quer mais um dashboard; quer observar o comportamento na conversa.",
      certainty: "known" as const,
      evidence: [{
        quote: "Eu não preciso de outro dashboard. Quero saber se o vendedor consegue conduzir a conversa quando o cliente resiste.",
        sourceIndex: 4,
        explanation: "Jordan rejeita dashboards como proposta central.",
      }],
    },
    {
      id: "exact-moment",
      claim: "Quer identificar o momento exato em que o vendedor perde a conversa.",
      certainty: "known" as const,
      evidence: [{
        quote: "Nota genérica não me interessa. Mostre o momento exato em que ele perdeu o controle da conversa.",
        sourceIndex: 6,
        explanation: "Jordan pede feedback específico em vez de uma nota genérica.",
      }],
    },
    {
      id: "adoption-speed",
      claim: "A ferramenta não pode deixar os vendedores mais lentos.",
      certainty: "known" as const,
      evidence: [{
        quote: "Se a configuração deixar os vendedores mais lentos, eles não vão usar.",
        sourceIndex: 8,
        explanation: "Ele liga adoção diretamente à velocidade de uso.",
      }],
    },
    {
      id: "small-pilot",
      claim: "Prefere testar com um grupo pequeno antes de expandir.",
      certainty: "known" as const,
      evidence: [{
        quote: "Eu testaria com um grupo pequeno antes de colocar isso na empresa inteira.",
        sourceIndex: 12,
        explanation: "Jordan declara sua preferência por um piloto limitado.",
      }],
    },
    {
      id: "behavior-first",
      claim: "Provavelmente prioriza mudança observável de comportamento sobre recursos técnicos.",
      certainty: "likely" as const,
      evidence: [{
        quote: "Primeiro eu quero ver um vendedor praticar uma objeção difícil e melhorar na segunda tentativa.",
        sourceIndex: 10,
        explanation: "A ordem colocada por Jordan sugere o principal critério de avaliação.",
      }],
    },
  ]),
  concerns: Object.freeze([
    {
      topic: "Perda de velocidade da equipe",
      evidence: [{
        quote: "Se a configuração deixar os vendedores mais lentos, eles não vão usar.",
        sourceIndex: 8,
        explanation: "Risco de adoção explicitamente declarado.",
      }],
    },
    {
      topic: "Feedback genérico sem ação concreta",
      evidence: [{
        quote: "Nota genérica não me interessa.",
        sourceIndex: 6,
        explanation: "Jordan rejeita avaliações sem um momento específico.",
      }],
    },
  ]),
  goals: Object.freeze([
    {
      topic: "Melhorar a resposta do vendedor a objeções difíceis",
      evidence: [{
        quote: "Quero ver um vendedor praticar uma objeção difícil e melhorar na segunda tentativa.",
        sourceIndex: 10,
        explanation: "Ele descreve o resultado que quer observar.",
      }],
    },
  ]),
  unknowns: Object.freeze([
    { topic: "Orçamento disponível", reason: "Jordan se recusa a informar um número antes de ver resultados." },
    { topic: "Prazo de decisão", reason: "Nenhuma data ou urgência concreta aparece no histórico." },
    { topic: "Participantes da decisão", reason: "Ele ainda não decidiu quem mais precisa participar." },
  ]),
});

export const JORDAN_BAD_CALL_TRANSCRIPT: readonly ConversationTurn[] = Object.freeze([
  Object.freeze({ id: "jordan-seller-1", speaker: "seller" as const, text: "Jordan, nossa plataforma tem dashboards, métricas avançadas e muitas integrações.", createdAt: 0 }),
  Object.freeze({ id: "jordan-customer-1", speaker: "customer" as const, text: "Você não ouviu. Eu quero saber se isso muda o comportamento do vendedor sob pressão.", createdAt: 1 }),
  Object.freeze({ id: "jordan-seller-2", speaker: "seller" as const, text: "Também conseguimos gerar uma nota automática depois de cada conversa.", createdAt: 2 }),
  Object.freeze({ id: "jordan-customer-2", speaker: "customer" as const, text: "Nota não fecha venda. Mostre o momento que ele errou e deixe ele tentar de novo.", createdAt: 3 }),
]);

export const deterministicJordanAnalysis = (
  sellerTurnId: string,
  sellerQuote: string,
): CallAnalysis => ({
  summary: "A apresentação focou recursos técnicos depois que Jordan deixou claro que avalia mudança observável no comportamento de vendas.",
  strengths: ["Você apresentou capacidades concretas da plataforma."],
  moments: [{
    id: "moment-behavior-first",
    turnId: sellerTurnId,
    sellerQuote,
    issue: "Você perdeu Jordan aqui",
    whyItMatters: "Você continuou falando de dashboards e notas depois que Jordan pediu evidência de melhora do vendedor sob pressão.",
    customerEvidence: [{
      claimId: "not-dashboard",
      quote: "Eu não preciso de outro dashboard. Quero saber se o vendedor consegue conduzir a conversa quando o cliente resiste.",
    }],
    researchRuleIds: ["adaptive-selling", "follow-up-questions"],
    suggestedGoal: "Pergunte qual objeção difícil mais derruba a equipe e demonstre um ensaio com segunda tentativa.",
  }],
});
