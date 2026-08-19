import type {
  CallAnalysis,
  ConversationTurn,
  CustomerTwin,
} from "@/domain/schemas";

export const MARIANA_SOURCE_LINES = Object.freeze([
  "Vendedor: Oi, Mariana! Queria entender como vocês organizam os atendimentos hoje.",
  "Mariana: Oi! A clínica cresceu e a agenda começou a ficar meio confusa.",
  "Vendedor: Vocês usam algum sistema de gestão?",
  "Mariana: Já contratei dois sistemas antes e as meninas acabaram voltando pro WhatsApp.",
  "Vendedor: Entendi. O que fez a equipe desistir?",
  "Mariana: Tinha muita etapa para registrar um atendimento simples.",
  "Mariana: Hoje quase tudo passa pelo WhatsApp, até confirmação e reagendamento.",
  "Vendedor: Nossa solução centraliza agenda, cadastro e relatórios.",
  "Mariana: Meu medo é colocar mais uma ferramenta e dar mais trabalho para a equipe.",
  "Vendedor: Dá para configurar vários fluxos e automações.",
  "Mariana: Eu não quero um projeto enorme para começar.",
  "Vendedor: Você decide sozinha a contratação?",
  "Mariana: Isso eu teria que conversar com meu sócio também.",
  "Vendedor: Posso te mostrar uma demonstração esta semana?",
  "Mariana: Pode, mas quero ver uma rotina simples, do jeito que as meninas usam hoje.",
  "Mariana: Se eu entender que realmente simplifica a rotina, aí faz sentido continuar falando.",
]);

export const MARIANA_SOURCE = MARIANA_SOURCE_LINES.join("\n");

export const MARIANA_TWIN: CustomerTwin = Object.freeze({
  name: "Mariana",
  role: "Sócia de uma pequena clínica de estética",
  company: "Clínica Aurora",
  summary:
    "Mariana quer simplificar a rotina da clínica sem repetir tentativas de adoção que falharam.",
  facts: Object.freeze([
    {
      id: "past-systems",
      claim:
        "Já tentou dois sistemas, mas a equipe voltou a usar o WhatsApp.",
      certainty: "known" as const,
      evidence: [
        {
          quote:
            "Já contratei dois sistemas antes e as meninas acabaram voltando pro WhatsApp.",
          sourceIndex: 4,
          explanation: "Mariana descreve diretamente as duas tentativas anteriores.",
        },
      ],
    },
    {
      id: "whatsapp-routine",
      claim: "O WhatsApp concentra grande parte da rotina atual.",
      certainty: "known" as const,
      evidence: [
        {
          quote:
            "Hoje quase tudo passa pelo WhatsApp, até confirmação e reagendamento.",
          sourceIndex: 7,
          explanation: "Mariana descreve o canal usado na operação diária.",
        },
      ],
    },
    {
      id: "implementation-work",
      claim: "Tem receio de que a implementação aumente o trabalho da equipe.",
      certainty: "known" as const,
      evidence: [
        {
          quote:
            "Meu medo é colocar mais uma ferramenta e dar mais trabalho para a equipe.",
          sourceIndex: 9,
          explanation: "A preocupação é dita de forma explícita.",
        },
      ],
    },
    {
      id: "partner-involvement",
      claim: "Precisa envolver o sócio na conversa sobre contratação.",
      certainty: "known" as const,
      evidence: [
        {
          quote: "Isso eu teria que conversar com meu sócio também.",
          sourceIndex: 13,
          explanation: "Mariana diz diretamente que precisa falar com o sócio.",
        },
      ],
    },
    {
      id: "adoption-priority",
      claim: "A adoção pela equipe provavelmente é o critério central da avaliação.",
      certainty: "likely" as const,
      evidence: [
        {
          quote:
            "Pode, mas quero ver uma rotina simples, do jeito que as meninas usam hoje.",
          sourceIndex: 15,
          explanation:
            "A demonstração pedida por Mariana prioriza a rotina real da equipe.",
        },
      ],
    },
    {
      id: "continuation-condition",
      claim:
        "Mariana provavelmente só avançará se perceber simplificação concreta.",
      certainty: "likely" as const,
      evidence: [
        {
          quote:
            "Se eu entender que realmente simplifica a rotina, aí faz sentido continuar falando.",
          sourceIndex: 16,
          explanation: "Ela condiciona a continuidade à simplificação da rotina.",
        },
      ],
    },
  ]),
  concerns: Object.freeze([
    {
      topic: "Adoção pela equipe",
      evidence: [
        {
          quote:
            "Já contratei dois sistemas antes e as meninas acabaram voltando pro WhatsApp.",
          sourceIndex: 4,
          explanation: "Duas tentativas anteriores não foram adotadas.",
        },
      ],
    },
    {
      topic: "Mais trabalho na implementação",
      evidence: [
        {
          quote:
            "Meu medo é colocar mais uma ferramenta e dar mais trabalho para a equipe.",
          sourceIndex: 9,
          explanation: "Preocupação explicitamente declarada.",
        },
      ],
    },
  ]),
  goals: Object.freeze([
    {
      topic: "Simplificar a rotina da clínica",
      evidence: [
        {
          quote:
            "Se eu entender que realmente simplifica a rotina, aí faz sentido continuar falando.",
          sourceIndex: 16,
          explanation: "Simplificação é condição para continuar.",
        },
      ],
    },
  ]),
  unknowns: Object.freeze([
    {
      topic: "Orçamento disponível",
      reason: "Nenhum valor ou faixa de investimento aparece no histórico.",
    },
    {
      topic: "Prazo de decisão",
      reason: "Não há data ou urgência de contratação informada.",
    },
    {
      topic: "Poder final de aprovação",
      reason:
        "O sócio precisa participar, mas o histórico não diz quem aprova por último.",
    },
  ]),
});

export const MARIANA_BAD_CALL_TRANSCRIPT: readonly ConversationTurn[] =
  Object.freeze([
    Object.freeze({
      id: "demo-seller-1",
      speaker: "seller" as const,
      text: "Mariana, nossa plataforma tem automações, dashboard e várias integrações.",
      createdAt: 0,
    }),
    Object.freeze({
      id: "demo-customer-1",
      speaker: "customer" as const,
      text: "Mas como isso evita dar mais trabalho para a equipe?",
      createdAt: 1,
    }),
    Object.freeze({
      id: "demo-seller-2",
      speaker: "seller" as const,
      text: "A implantação é completa e dá acesso a muitos relatórios.",
      createdAt: 2,
    }),
    Object.freeze({
      id: "demo-customer-2",
      speaker: "customer" as const,
      text: "Foi justamente a complexidade que fez as meninas abandonarem os outros sistemas.",
      createdAt: 3,
    }),
  ]);

export const deterministicAnalysis = (
  sellerTurnId: string,
  sellerQuote: string,
): CallAnalysis => ({
  summary:
    "A conversa apresentou a solução, mas poderia se adaptar melhor ao receio de adoção já expresso por Mariana.",
  strengths: ["Você abriu espaço para conversar sobre a rotina da clínica."],
  moments: [
    {
      id: "moment-adoption",
      turnId: sellerTurnId,
      sellerQuote,
      issue: "Você perdeu Mariana aqui",
      whyItMatters:
        "Você apresentou funcionalidades antes de investigar por que as tentativas anteriores não foram adotadas pela equipe.",
      customerEvidence: [
        {
          claimId: "past-systems",
          quote:
            "Já contratei dois sistemas antes e as meninas acabaram voltando pro WhatsApp.",
        },
      ],
      researchRuleIds: ["adaptive-selling", "follow-up-questions"],
      suggestedGoal:
        "Pergunte o que fez a equipe abandonar os sistemas anteriores antes de apresentar a solução.",
    },
  ],
});
