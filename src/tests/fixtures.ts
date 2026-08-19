import type { CallAnalysis, CustomerTwin } from "@/domain/schemas";

export const twinFixture: CustomerTwin = {
  name: "Mariana",
  role: "Proprietária",
  company: "Clínica Aurora",
  summary: "Mariana quer simplificar a rotina sem aumentar o trabalho da equipe.",
  facts: [
    {
      id: "adoption",
      claim: "A adoção pela equipe é uma preocupação central.",
      certainty: "known",
      evidence: [
        {
          quote: "Já contratei dois sistemas antes e as meninas acabaram voltando pro WhatsApp.",
          sourceIndex: 6,
          explanation: "Relato direto de duas tentativas anteriores.",
        },
      ],
    },
    {
      id: "simplicity",
      claim: "Provavelmente valoriza uma implantação curta.",
      certainty: "likely",
      evidence: [
        {
          quote: "eu preciso ver algo bem simples e que as meninas consigam usar rápido.",
          sourceIndex: 15,
          explanation: "A preferência por simplicidade sugere baixa tolerância a implantação longa.",
        },
      ],
    },
  ],
  concerns: [
    {
      topic: "Mais trabalho para a equipe",
      evidence: [
        {
          quote: "Meu medo é colocar mais uma ferramenta e dar mais trabalho para a equipe.",
          sourceIndex: 9,
          explanation: "Preocupação declarada.",
        },
      ],
    },
  ],
  goals: [
    {
      topic: "Simplificar confirmações",
      evidence: [
        {
          quote: "Automatizar as confirmações ajudaria",
          sourceIndex: 11,
          explanation: "Benefício reconhecido pela cliente.",
        },
      ],
    },
  ],
  unknowns: [
    { topic: "Orçamento disponível", reason: "Não foi mencionado." },
    { topic: "Prazo de decisão", reason: "Não foi mencionado." },
  ],
};

export const analysisFixture: CallAnalysis = {
  summary: "A conversa apresentou a solução antes de aprofundar a principal preocupação.",
  strengths: ["Tom direto e cordial."],
  moments: [
    {
      id: "moment-1",
      turnId: "seller-1",
      sellerQuote: "Nossa plataforma tem automações, dashboard e integrações.",
      issue: "Você perdeu Mariana aqui",
      whyItMatters: "A apresentação ignorou o histórico de baixa adoção da equipe.",
      customerEvidence: [
        {
          claimId: "adoption",
          quote: "Já contratei dois sistemas antes e as meninas acabaram voltando pro WhatsApp.",
        },
      ],
      researchRuleIds: ["adaptive-selling"],
      suggestedGoal: "Investigar por que os sistemas anteriores foram abandonados.",
    },
  ],
};
