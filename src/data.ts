import { LessonPlan, WritingTask, VideoCallScenario } from "./types";

// Elementos de lições offline categorizados por área de atuação (em português para falantes de português)
export const OFFLINE_LESSONS: Record<string, LessonPlan> = {
  Technology: {
    id: "offline_tech_1",
    date: "Hoje (Aulas Offline)",
    wordOfDay: {
      word: "Leverage",
      partOfSpeech: "verbo",
      corporateDefinition: "Utilizar recursos, ferramentas ou pontos fortes existentes para alcançar um resultado estratégico desproporcionalmente maior (potencializar ou alavancar).",
      sampleSentence: "We need to leverage our microservices architecture to speed up the rollout of the analytics portal.",
      businessContextTip: "Termo corporativo muito frequente. Combine com métricas concretas (ex: 'leverage X in order to Y') para manter sua comunicação elegante e precisa."
    },
    miniLesson: {
      title: "Como recusar prazos absurdos de forma elegante",
      explanation: "Profissionais brasileiros em nível intermediário frequentemente dizem de forma direta: 'This is impossible' ou 'I don't have time'. No ambiente corporativo internacional, reestruture sua resposta com foco na alocação de recursos, mitigação de riscos e prioridades.",
      goodAlternative: "In order to maintain our rigorous QA standards, we would need to scale the team or adjust the delivery scope.",
      poorAlternative: "I cannot do this by Friday. It is too much work for one engineer.",
      explanationAlternative: "A alternativa recomendada apresenta as variáveis do projeto (QA, tamanho do time, escopo) de forma objetiva, em vez de soar defensiva ou reclamar da carga de trabalho."
    },
    writingTask: {
      title: "Redigindo aviso de desativação de API (Deprecation)",
      scenario: "Notificar clientes corporativos sobre a descontinuação de uma versão antiga do SDK com segurança, sem gerar atritos ou pânico.",
      context: "Escreva um e-mail para clientes corporativos anunciando a descontinuação da API legado v2, fornecendo um prazo claro de migração e garantia de suporte dedicado.",
      templateText: "Subject: [Action Required] Migration Plan for Legacy API v2\n\nDear Partner,\n\nAs we continue to optimize our cloud performance, we are writing to inform you that our legacy API v2 will be officially retired on October 31.\n\nTo ensure uninterrupted service, we highly recommend migrating to v3. [Add details about developer documentation and direct engineering support here...]\n\nSincerely,\n[Your Name]",
      keywordsExpected: ["migration window", "uninterrupted", "retire", "seamless transition", "robust features"]
    },
    speakingKeyPhrases: [
      {
        phrase: "That timeframe is quite aggressive; let's discuss which features to prioritize.",
        situation: "Quando um gestor ou cliente propõe um ciclo de entrega com prazo curtíssimo.",
        toneExplanation: "Assertivo, profissional e focado em soluções práticas."
      },
      {
        phrase: "I'd like to align on the technical requirements before drafting the architecture document.",
        situation: "Para dar início a discussões técnicas e alinhamento entre equipes.",
        toneExplanation: "Colaborativo, demonstrando estrutura e liderança organizada."
      }
    ],
    videoCallScenario: {
      partnerName: "Nadia Malik",
      partnerRole: "Gerente de Produto Prênior (Lead PM)",
      scenarioTitle: "Planejamento de Sprint & Negociação de Escopo",
      situationDescription: "Negociação amigável para decidir quais funcionalidades realmente cabem no próximo ciclo de desenvolvimento técnico sem sobrecarregar a equipe de engenharia.",
      firstLine: "Hi there! Thanks for jumping on the call. I know we are tight on engineering resources, but the client is asking for the whole invoicing system by the end of next week. What is your realistic take?"
    }
  },
  Finance: {
    id: "offline_fin_1",
    date: "Hoje (Aulas Offline)",
    wordOfDay: {
      word: "Synergistic",
      partOfSpeech: "adjetivo",
      corporateDefinition: "Refere-se à interação ou cooperação de agentes onde o resultado combinado total supera a soma simples de seus componentes individuais (sinérgico).",
      sampleSentence: "The merger presents synergistic cost-savings in back-office operations.",
      businessContextTip: "Muito apropriado em apresentações de fusões e aquisições (M&A) ou estratégias de negócios interdepartamentais para justificar iniciativas conjuntas."
    },
    miniLesson: {
      title: "Como reportar resultados trimestrais negativos",
      explanation: "Evite palavras que sugiram pânico ou fracasso passivo. Reestruture deficits e quedas focando em 'desafios temporários (headwinds)', investimentos em infraestrutura de longo prazo ou realocação dinâmica de ativos.",
      goodAlternative: "While our short-term revenues experienced headwinds due to supply constraints, our customer retention rate remains high as we transition to our recurring subscription model.",
      poorAlternative: "We lost a lot of money this quarter because our supply chain is broken.",
      explanationAlternative: "A versão estratégica destaca uma métrica de retenção saudável e o plano de transição de negócios, em vez de relatar a falha na cadeia de suprimentos de forma simples."
    },
    writingTask: {
      title: "Explicação de desvio orçamentário para diretoria",
      scenario: "Explicar por que a equipe de marketing excedeu o orçamento aprovado em 22% durante o primeiro trimestre.",
      context: "Escreva um memorando justificando de forma técnica o retorno do investimento em captação de clientes precoces (CAC) e ganhos de LTV.",
      templateText: "To: Executive Committee\nSubject: Marketing Budget Variance Report - Q1\n\nThis memo outlines the rationale behind the 22% budget variance in our customer acquisition division.\n\nDuring Q1, we observed a unique market entry window which we intentionally capitalized on. [Explain how this budget reallocation increased subscription run-rate...]\n\nBest regards,\n[Your Name]",
      keywordsExpected: ["capitalized", "market entry window", "reallocation", "customer acquisition cost", "amortize"]
    },
    speakingKeyPhrases: [
      {
        phrase: "Let's closely monitor our runway before committing to this secondary expansion.",
        situation: "Aconselhando prudência financeira durante reuniões de escala corporativa.",
        toneExplanation: "Analítico, financeiramente prudente e protetor da saúde do fluxo de caixa."
      },
      {
        phrase: "We are currently forecasting headwinds in Q3 due to macroeconomic variables.",
        situation: "Divulgando ajustes ou quedas temporárias de receitas projetadas para stakeholders.",
        toneExplanation: "Transparente, corporativo e sutilmente neutro."
      }
    ],
    videoCallScenario: {
      partnerName: "Robert Vanderbilt",
      partnerRole: "Diretor Financeiro (CFO)",
      scenarioTitle: "Revisão Orçamentária Trimestral",
      situationDescription: "Defesa técnica da verba operacional estimada para a infraestrutura de sua equipe diante de severos cortes e contenções propostos pela holding.",
      firstLine: "Good morning. I'm reviewing the operational spreadsheet and notice your travel and training requests are up by 40%. Given our consolidation year, why should we authorize this?"
    }
  },
  "General Management": {
    id: "offline_gen_1",
    date: "Hoje (Aulas Offline)",
    wordOfDay: {
      word: "Incentivize",
      partOfSpeech: "verbo",
      corporateDefinition: "Oferecer um estímulo, recompensa ou motivo desencadeador para induzir, alinhar ou acelerar metas de desempenho específicas (incentivar).",
      sampleSentence: "We should restructure our key account bonuses to incentivize multi-year contract renewals.",
      businessContextTip: "Extremamente prático em revisões de performance, discussões de escopo de salários, metas comerciais ou incentivos internos."
    },
    miniLesson: {
      title: "Como entregar feedbacks construtivos à sua equipe",
      explanation: "Para manter liderados engajados, apresente o feedback de forma situacional usando o framework SBI (Situação - Comportamento - Impacto), abstendo-se de termos vagos ou críticas ao caráter pessoal.",
      goodAlternative: "In yesterday's client pitch, when you spoke over the client's question, it made them hesitate on our timeline. Moving forward, let's allow them to complete their sentences.",
      poorAlternative: "You are too aggressive in meetings and never listen to our clients.",
      explanationAlternative: "A alternativa estratégica delimita o acontecimento exato (pitch de ontem), a atitude específica e o impacto produzido, permitindo melhoria imediata em vez de apenas ofender o liderado."
    },
    writingTask: {
      title: "Anúncio corporativo de reestruturação organizacional",
      scenario: "Explicar a mudança da empresa para uma estrutura celular de esquadras verticais.",
      context: "Escreva uma carta de comunicação interna tranquilizando os colaboradores que a mudança visa descentralização e agilidade, sem demissões.",
      templateText: "Subject: Streamlining Our Operations: Moving to Vertical Squads\n\nDear Team,\n\nTo ensure we remain deeply aligned with our customers' needs, we are introducing a new organizational structure focused on key vertical markets.\n\nThis evolutionary step allows every employee to have clearer ownership. [Elaborate on how squads will collaborate, reassuring them headcount remains stable...]\n\nWarmly,\n[Your Name]",
      keywordsExpected: ["organizational restructure", "cross-functional collaboration", "evolutionary step", "ownership", "agility"]
    },
    speakingKeyPhrases: [
      {
        phrase: "Let's establish clear channels of ownership to prevent overlaps during execution.",
        situation: "Divisão clara de papéis e responsabilidades na criação de uma nova iniciativa.",
        toneExplanation: "Organizado, dinâmico e focado em controle operacional."
      },
      {
        phrase: "I'd love to schedule a follow-up once you've had a chance to digest these objectives.",
        situation: "Dando espaço amigável para que assessores processem novos objetivos estratégicos de grande peso.",
        toneExplanation: "Empático, paciente e focado na entrega qualificada."
      }
    ],
    videoCallScenario: {
      partnerName: "Elena Rostova",
      partnerRole: "Diretora Superintendente (Managing Director)",
      scenarioTitle: "Resolução de Conflitos Departamentais",
      situationDescription: "Mediação qualificada de desavenças entre gerência de vendas e engenharia que disputam a propriedade e o controle do funil de atendimento e entrega ao cliente.",
      firstLine: "Thanks for meeting on short notice. Our engineering and sales departments are currently locked in a turf war over who owns the client integration delivery. How do you propose we mediate this?"
    }
  }
};

// Respostas offline em português para simulação de chamada
export function getOfflineVideoCallResponse(
  scenario: VideoCallScenario,
  history: { speaker: string; text: string }[],
  userTranscript: string
) {
  const norm = userTranscript.toLowerCase();
  let reply = "";
  let toneObserved = "Claro e Profissional";
  let rating = "Excelente";
  let grammarCorrection = "";
  let vocabularyUpgrade = "";
  let partnerEmote = "nodding";
  let suggestedPhrases: string[] = [];

  if (scenario.scenarioTitle.includes("Sprint")) {
    suggestedPhrases = [
      "I understand your constraints, but could we perhaps execute modular delivery?",
      "Let's look at a staggered release path to optimize resources."
    ];
    if (norm.includes("yes") || norm.includes("agreed") || norm.includes("ok")) {
      reply = "Excellent. If we scope down the core dashboard first, we can secure validation and deliver incremental builds. This is high performance.";
      partnerEmote = "typing";
      toneObserved = "Colaborativo e Alinhado";
    } else if (norm.includes("impossible") || norm.includes("cannot") || norm.includes("no way")) {
      reply = "I understand the friction, but let's look at options. Can we defer the advanced report sub-module to sprint 6? That would reduce strain.";
      partnerEmote = "looking thoughtful";
      toneObserved = "Direto e Firme";
      grammarCorrection = "Em vez de dizer 'impossible' (muito direto/agressivo), use: 'that presents operational constraints'.";
      vocabularyUpgrade = "Use 'staggered delivery' em vez de 'doing it in parts' para soar mais executivo.";
    } else {
      reply = "That makes sense. If we prioritize API stability, we can ship the front-end dashboard on a staggered path. What are the key bottlenecks?";
      partnerEmote = "listening";
      toneObserved = "Diplomático";
    }
  } else if (scenario.scenarioTitle.includes("Budget") || scenario.scenarioTitle.includes("Orçamentária")) {
    suggestedPhrases = [
      "This initiative directly influences our retention runway, offsetting minor costs.",
      "The projected return on investment far outweighs this upfront expenditure."
    ];
    if (norm.includes("important") || norm.includes("value") || norm.includes("roi") || norm.includes("need")) {
      reply = "I see. If you link this operational training to our retention KPI, I might find a middle ground. Can we defer 20% of the travel?";
      partnerEmote = "looking thoughtful";
      toneObserved = "Presença Executiva";
    } else {
      reply = "Let's be realistic. We need to watch our runway. If we optimize this spend, how soon can we expect a measurable impact on client delivery?";
      partnerEmote = "nodding";
      toneObserved = "Defensivo, mas educado";
      vocabularyUpgrade = "Diga 'allocate resources' em vez de simplesmente 'spend money'.";
    }
  } else {
    suggestedPhrases = [
      "We should codify a shared responsibility agreement representing both sides.",
      "A cross-functional committee will solve this pipeline bottleneck."
    ];
    reply = "I absolutely agree. Designing standard handoffs is our biggest opportunity. Let's draft a RACI chart tomorrow.";
    partnerEmote = "smiling";
    toneObserved = "Harmônico";
  }

  return {
    responseText: reply,
    partnerEmote,
    suggestedPhrases,
    feedbackOnUserTurn: {
      rating,
      toneObserved,
      grammarCorrection,
      vocabularyUpgrade
    }
  };
}

// Relatório offline em português para os exercícios de redação (Writing)
export function analyzeWritingOffline(draftText: string, keywordsExpected: string[]) {
  const norm = draftText.toLowerCase();
  const matched = keywordsExpected.filter(k => norm.includes(k.toLowerCase()));
  const clarityScore = Math.min(65 + matched.length * 10, 95);
  const diplomacyScore = norm.includes("sorry") || norm.includes("bad") ? 72 : 88;
  const persuasivenessScore = Math.min(60 + matched.length * 12, 92);

  const redundancies = [
    {
      original: "just writing to let you know",
      replacement: "writing to confirm / announce",
      why: "Evite palavras de preenchimento passivas como 'just'. Seja direto e demonstre maior responsabilidade executiva."
    }
  ];

  return {
    clarityScore,
    diplomacyScore,
    persuasivenessScore,
    redundancies: draftText.length < 50 ? redundancies : [],
    suggestedRewrite: draftText ? `Dear Partner,\n\nFollowing our system evaluation, we are implementing our structural API transition. We assure a 6-month support matrix to secure an uninterrupted service runway for your engineers.\n\nBest regards,\nExecutive Team` : "Escreva seu e-mail de treino primeiro para receber uma sugestão profissional de redação executiva otimizada!",
    coachingCommentary: draftText.length < 50 
      ? "Seu rascunho está muito breve. Tente adicionar jargões corporativos estratégicos para demonstrar maior segurança operacional aos parceiros externos."
      : "Excelente escolha de vocabulário comercial. Você demonstrou grande cortesia profissional mantendo limites rígidos de suporte."
  };
}

// Análise offline em português para o treino de falas (Pronunciation)
export function analyzePronunciationOffline(original: string, spoken: string) {
  const wordsOriginal = original.toLowerCase().replaceAll(/[,.?!]/g, "").split(/\s+/);
  const wordsSpoken = spoken.toLowerCase().replaceAll(/[,.?!]/g, "").split(/\s+/);

  const issues: { word: string; issue: string; correctionTip: string }[] = [];

  for (const word of wordsOriginal) {
    if (word && !wordsSpoken.includes(word)) {
      issues.push({
        word,
        issue: "Palavra omitida foneticamente ou substituída durante a captação do áudio.",
        correctionTip: "Foque em transições nítidas de consoantes. Garanta que o som das vogais seja enfatizado adequadamente."
      });
    }
  }

  const score = Math.max(50, Math.round(100 - (issues.length / Math.max(1, wordsOriginal.length)) * 40));

  return {
    overallScore: Math.round(score * 0.95),
    pronunScore: score,
    pronunciationIssues: issues.slice(0, 3),
    grammarFeedback: {
      flaws: spoken.length < 15 ? ["O texto pronunciado é muito curto para uma avaliação gramatical executiva completa."] : [],
      improvedVersion: original,
      grammarExplanation: "Alinhamento gramatical impecável garante que suas interações com clientes soem articuladas e polidas."
    },
    toneAnalysis: {
      primaryTone: "Seguro & Estratégico",
      confidenceScore: Math.round(score * 0.98),
      diplomacyScore: 85,
      vocabularyRichness: "Nível corporativo moderado",
      clutterWordsUsage: spoken.match(/(um|like|er)/gi) || [],
      feedbackText: "Sua pronúncia e ritmo estão claros. Tente usar marcadores gramaticais de transição mais avançados como 'additionally' ou 'consequently' para elevar a fluidez."
    },
    coachingInsight: "Ótima clareza acústica básica. Lembre-se de pronunciar bem as consoantes finais plosivas (-t, -k, -d) para excelente presença ao telefone."
  };
}
