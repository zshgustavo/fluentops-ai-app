import React from "react";
import { UserProfile, PerformanceStats, CompletedLesson } from "../types";
import { Award, Zap, BookOpen, Clock, BarChart3, RotateCcw, CalendarPlus, Loader2, Lightbulb, Target, Sparkles } from "lucide-react";

interface DashboardProps {
  profile: UserProfile;
  stats: PerformanceStats;
  completedLessons: CompletedLesson[];
  onResetProgress: () => void;
  setActiveTab: (tab: string) => void;
  theme: "light" | "dark";
}

export default function Dashboard({
  profile,
  stats,
  completedLessons,
  onResetProgress,
  setActiveTab,
  theme,
}: DashboardProps) {
  const isDark = theme === "dark";

  // Gerador de coordenadas para o gráfico SVG de tendências
  const trend = stats.metricTrend;
  const padding = 40;
  const width = 500;
  const height = 180;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const pointsCount = trend.length;
  const getCoordinates = (value: number, index: number) => {
    const x = padding + (index / Math.max(1, pointsCount - 1)) * graphWidth;
    // Mapeia valor de 50 a 100 para a altura do gráfico
    const minVal = 50;
    const maxVal = 100;
    const ratio = (value - minVal) / (maxVal - minVal);
    const y = height - padding - ratio * graphHeight;
    return `${x},${y}`;
  };

  const getPathLine = (key: "pronunciation" | "fluency" | "grammar" | "diplomacy") => {
    return trend.map((t, idx) => getCoordinates(t[key], idx)).join(" ");
  };

  // Mapeamento estilizado das áreas de foco corporativo em português
  const translatedIndustry = 
    profile.industry === "Technology" ? "Tecnologia" :
    profile.industry === "Finance" ? "Finanças" : "Gestão Geral";

  const translatedFocus =
    profile.focusArea.includes("Negotiation") ? "Negociação Salarial & Escopos" :
    profile.focusArea.includes("Pitching") ? "Apresentação & Oratória" :
    profile.focusArea.includes("Conflict") ? "Mediação de Conflitos & Posicionamento" :
    "E-mails de Alto Impacto & Escrita Técnica";

  const goalReachedPercentage = stats.speakingTimeMinutes / profile.dailyGoalMinutes;
  const hasReachedGoalAlert = goalReachedPercentage >= 0.8;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {hasReachedGoalAlert && (
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
          isDark ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
               <Award className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
             </div>
             <div>
               <p className="text-sm font-bold">Incrível! Meta Diária Quase Atingida</p>
               <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Você já concluiu {Math.round(goalReachedPercentage * 100)}% do seu tempo de estudo. Faltam poucos minutos!</p>
             </div>
          </div>
        </div>
      )}

      {/* Welcome Board */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl border transition-all duration-300 ${
        isDark 
          ? "bg-[#151422] border-[#282A3E] shadow-2xl" 
          : "bg-white border-neutral-100 shadow-xs"
      }`}>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${
            isDark ? "text-amber-400" : "text-[#0066cc]"
          }`}>
            Programa Executivo · {translatedIndustry}
          </span>
          <h1 className={`text-2xl font-display font-semibold mt-1.5 ${
            isDark ? "text-white" : "text-neutral-950"
          }`}>
            Bem-vindo(a) de volta, {profile.name}
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Nível: <strong className={isDark ? "text-white" : "text-neutral-700"}>Intermediário-Avançado</strong> · Alvo de Prática: {translatedFocus}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("lessons")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer ${
                isDark 
                  ? "bg-white text-neutral-950 hover:bg-neutral-100" 
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
              id="start-today-lesson-btn"
            >
              Praticar Lição de Hoje
            </button>
            <button
              onClick={onResetProgress}
              className={`p-2 border rounded-xl transition-all flex items-center justify-center ${
                isDark 
                  ? "border-[#242936] text-neutral-500 hover:text-neutral-300 hover:bg-[#1e2332]" 
                  : "border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              }`}
              title="Zerar meu progresso"
              id="reset-stats-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EXPERIMENTAL DASHBOARD IDEAS */}
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 -mb-4 mt-8 ml-2">
        Novidades / Acesso Rápido
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Frase Executiva do Dia */}
        <div className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all duration-300 relative overflow-hidden ${
          isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-indigo-100"
        }`}>
          <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl ${
            isDark ? "bg-indigo-600/10" : "bg-indigo-600/5"
          }`} />
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Frase Executiva do Dia
            </h3>
          </div>
          <div className="z-10">
            <p className={`text-base font-display font-semibold ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
              "To circle back"
            </p>
            <p className={`text-[11px] leading-relaxed mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Use para retomar um assunto em andamento posteriormente de forma elegante. Ex: <i>"Let's circle back to this offline."</i>
            </p>
          </div>
        </div>

        {/* 2. Próximo Passo Recomendado (Baseado em IA) */}
        <div className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all duration-300 relative overflow-hidden ${
          isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-rose-100"
        }`}>
          <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl ${
            isDark ? "bg-rose-600/10" : "bg-rose-600/5"
          }`} />
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Foco de Hoje
            </h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
              isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-600"
            }`}>
              Fluência
            </span>
          </div>
          <div className="z-10">
            <p className={`text-sm font-semibold ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
              Sua Fluência está em {stats.fluencyScore}%
            </p>
            <p className={`text-[11px] leading-relaxed mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Baseado nos seus últimos treinos, que tal focarmos em ritmo e conectores na fala hoje?
            </p>
          </div>
        </div>

        {/* 3. Acesso Rápido - Simulação Rápida */}
        <div className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all duration-300 relative overflow-hidden ${
          isDark ? "bg-gradient-to-br from-[#151422] to-indigo-900/20 border-[#282A3E] hover:border-[#5542F6]/50" : "bg-gradient-to-br from-white to-blue-50 border-blue-100 hover:border-blue-300"
        } cursor-pointer group`} onClick={() => setActiveTab("lessons")}>
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Quick Start
            </h3>
          </div>
          <div className="mt-1 z-10">
            <p className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
              Início Imediato ⚡
            </p>
            <p className={`text-[11px] leading-relaxed mt-1 group-hover:text-blue-500 transition-colors ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Realize uma simulação prática de {translatedFocus.toLowerCase()} focada em fluência verbal.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${
          isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-neutral-100"
        }`} id="stat-card-streak">
          <div className={`p-3.5 rounded-xl ${
            isDark ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-50 text-amber-600"
          }`}>
            <Zap className={`w-5 h-5 ${isDark ? "stroke-amber-400" : "fill-amber-500 stroke-amber-600"}`} />
          </div>
          <div>
            <div className={`text-2xl font-display font-semibold ${isDark ? "text-white" : "text-neutral-950"}`}>
              {stats.streakDays} <span className="text-xs text-neutral-400 font-normal">dias</span>
            </div>
            <p className="text-neutral-400 text-[10px] mt-0.5 font-bold uppercase tracking-wider">Ofensiva (Streak)</p>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${
          isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-neutral-100"
        }`} id="stat-card-lessons">
          <div className={`p-3.5 rounded-xl ${
            isDark ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-600"
          }`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-2xl font-display font-semibold ${isDark ? "text-white" : "text-neutral-950"}`}>
              {stats.lessonsCompleted} <span className="text-xs text-neutral-400 font-normal">total</span>
            </div>
            <p className="text-neutral-400 text-[10px] mt-0.5 font-bold uppercase tracking-wider">Aulas Concluídas</p>
          </div>
        </div>

        {/* Focus Practice Time */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${
          isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-neutral-100"
        }`} id="stat-card-time">
          <div className={`p-3.5 rounded-xl ${
            isDark ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-green-50 text-green-600"
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-2xl font-display font-semibold ${isDark ? "text-white" : "text-neutral-950"}`}>
              {stats.speakingTimeMinutes} <span className="text-xs text-neutral-400 font-normal">min</span>
            </div>
            <p className="text-neutral-400 text-[10px] mt-0.5 font-bold uppercase tracking-wider">Tempo de Treino</p>
          </div>
        </div>

        {/* Vocabulary Vault */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${
          isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-neutral-100"
        }`} id="stat-card-vocab">
          <div className={`p-3.5 rounded-xl ${
            isDark ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600"
          }`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-2xl font-display font-semibold ${isDark ? "text-white" : "text-neutral-950"}`}>
              {stats.vocabularyAcquired} <span className="text-xs text-neutral-400 font-normal">termos</span>
            </div>
            <p className="text-neutral-400 text-[10px] mt-0.5 font-bold uppercase tracking-wider">Vocabulário Executivo</p>
          </div>
        </div>
      </div>

      {/* Sub-skills Metrics Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Auditoria Vocal & Estilo */}
        <div className={`p-6 rounded-2xl border space-y-5 transition-all duration-300 ${
          isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-neutral-100"
        }`}>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-neutral-400" />
            Auditoria Vocal & Estilo
          </h3>

          <div className="space-y-4">
            {/* Pronunciation */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className={isDark ? "text-neutral-300" : "text-neutral-600"}>Articulação & Entonação</span>
                <span className={isDark ? "text-white" : "text-neutral-950"}>{stats.pronunciationScore}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#0f111a]" : "bg-neutral-100"}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isDark ? "bg-white" : "bg-neutral-900"}`}
                  style={{ width: `${stats.pronunciationScore}%` }}
                />
              </div>
            </div>

            {/* Speaking/Writing Fluency */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className={isDark ? "text-neutral-300" : "text-neutral-600"}>Ritmo & Fluência Léxica</span>
                <span className={isDark ? "text-white" : "text-neutral-950"}>{stats.fluencyScore}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#0f111a]" : "bg-neutral-100"}`}>
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.fluencyScore}%` }}
                />
              </div>
            </div>

            {/* Diplomacy & Register */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className={isDark ? "text-neutral-300" : "text-neutral-600"}>Diplomacia & Cortesia Corporativa</span>
                <span className={isDark ? "text-white" : "text-neutral-950"}>{stats.diplomacyScore}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#0f111a]" : "bg-neutral-100"}`}>
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.diplomacyScore}%` }}
                />
              </div>
            </div>

            {/* Executive Grammar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className={isDark ? "text-neutral-300" : "text-neutral-600"}>Estilo Executivo & Sintaxe Gramatical</span>
                <span className={isDark ? "text-white" : "text-neutral-950"}>{stats.grammarScore}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#0f111a]" : "bg-neutral-100"}`}>
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.grammarScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl text-xs leading-relaxed border mt-4 ${
            isDark 
              ? "bg-[#1B192A] border-[#282A3E] text-neutral-400" 
              : "bg-neutral-50 border-neutral-100 text-neutral-500"
          }`}>
            <strong>Conselho Estratégico:</strong> Sua diplomacia escrita está excelente. Para reuniões virtuais, tente reduzir palavras de hesitação ('like', 'sort of') para projetar maior autoridade executiva.
          </div>
        </div>

        {/* Gráfico de Evolução SVG */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
          isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-neutral-100"
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-neutral-300" : "text-neutral-400"}`}>
                Evolução da Qualidade de Comunicação
              </h3>
              <p className="text-neutral-500 text-[10px] mt-0.5">Visão do progresso geral nos treinos realizados</p>
            </div>
            
            {/* Legenda do Gráfico */}
            <div className="flex flex-wrap justify-end gap-x-2 gap-y-1 text-[9px] font-bold">
              <span className={`flex items-center gap-1.5 ${isDark ? "text-white" : "text-neutral-800"}`}>
                <span className={`w-2 h-2 rounded-xs inline-block ${isDark ? "bg-white" : "bg-neutral-900"}`} /> Entonação
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2 h-2 bg-blue-600 rounded-xs inline-block" /> Fluência
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-600 rounded-xs inline-block" /> Diplomacia
              </span>
              <span className="flex items-center gap-1.5 text-purple-600">
                <span className="w-2 h-2 bg-purple-600 rounded-xs inline-block" /> Gramática
              </span>
            </div>
          </div>

          {/* Gráfico propriamente dito */}
          <div className="relative w-full overflow-hidden flex justify-center py-2" id="trend-graph-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[500px]">
              {/* Linhas de auxílio do eixo Y */}
              {[50, 75, 100].map((v) => {
                const ratio = (v - 50) / 50;
                const y = height - padding - ratio * graphHeight;
                return (
                  <g key={v}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      className={isDark ? "stroke-[#282A3E] stroke-1" : "stroke-neutral-100 stroke-1"}
                      strokeDasharray="4,4"
                    />
                    <text
                      x={padding - 10}
                      y={y + 3}
                      className="text-[9px] fill-neutral-400 font-mono text-right"
                      textAnchor="end"
                    >
                      {v}%
                    </text>
                  </g>
                );
              })}

              {/* Rótulos das datas no eixo X */}
              {trend.map((t, idx) => {
                const x = padding + (idx / Math.max(1, pointsCount - 1)) * graphWidth;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={height - padding + 15}
                    className="text-[8px] fill-neutral-400 font-mono"
                    textAnchor="middle"
                  >
                    {t.date}
                  </text>
                );
              })}

              {/* Linhas de dados */}
              <polyline
                fill="none"
                stroke={isDark ? "#ffffff" : "#171717"}
                strokeWidth="2.5"
                points={getPathLine("pronunciation")}
                className="transition-all duration-300"
              />
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                points={getPathLine("fluency")}
                className="transition-all duration-300"
              />
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                points={getPathLine("diplomacy")}
                className="transition-all duration-300"
              />
              <polyline
                fill="none"
                stroke="#9333ea"
                strokeWidth="2.5"
                points={getPathLine("grammar")}
                className="transition-all duration-300"
              />

              {/* Bolinhas acentuando os últimos valores inseridos */}
              {trend.length > 0 && (() => {
                const len = trend.length - 1;
                const coordsPron = getCoordinates(trend[len].pronunciation, len).split(",");
                const coordsFlu = getCoordinates(trend[len].fluency, len).split(",");
                const coordsDip = getCoordinates(trend[len].diplomacy, len).split(",");
                const coordsGram = getCoordinates(trend[len].grammar, len).split(",");

                const strokeColor = isDark ? "#151422" : "#ffffff";

                return (
                  <g>
                    <circle cx={coordsPron[0]} cy={coordsPron[1]} r="4" className={isDark ? "fill-white" : "fill-neutral-900"} stroke={strokeColor} strokeWidth="2" />
                    <circle cx={coordsFlu[0]} cy={coordsFlu[1]} r="4" className="fill-blue-600" stroke={strokeColor} strokeWidth="2" />
                    <circle cx={coordsDip[0]} cy={coordsDip[1]} r="4" className="fill-emerald-600" stroke={strokeColor} strokeWidth="2" />
                    <circle cx={coordsGram[0]} cy={coordsGram[1]} r="4" className="fill-purple-600" stroke={strokeColor} strokeWidth="2" />
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between border-t border-neutral-100/10 pt-3 text-[10px] text-neutral-400">
            <span className="flex items-center gap-1">
              <span className={`inline-block w-2.5 h-1.5 rounded-xs ${isDark ? "bg-white" : "bg-neutral-900"}`} /> Pronúncia: +{trend[trend.length - 1]?.pronunciation - trend[0]?.pronunciation || 0}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-1.5 bg-blue-600 rounded-xs" /> Fluência: +{trend[trend.length - 1]?.fluency - trend[0]?.fluency || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Histórico/Journal de Práticas */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDark ? "bg-[#151422] border-[#282A3E]" : "bg-white border-neutral-100"
      }`}>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
          Histórico de Práticas Realizadas ({completedLessons.length})
        </h3>
        {completedLessons.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm">
            Nenhuma atividade concluída hoje. Visite a aba "Lições Diárias" para iniciar!
          </div>
        ) : (
          <div className="divide-y divide-neutral-100/10 max-h-[250px] overflow-y-auto pr-2">
            {[...completedLessons].reverse().map((lesson, index) => (
              <div key={index} className="py-3 flex justify-between items-center text-sm font-sans">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    lesson.type === 'videocall' ? 'bg-indigo-500' :
                    lesson.type === 'speaking' ? 'bg-rose-500' :
                    lesson.type === 'writing' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <span className={`font-semibold ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>{lesson.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ml-2 font-mono uppercase tracking-wider ${
                      isDark ? "bg-[#1B192A] text-neutral-400" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {lesson.type === "videocall" ? "Conversação" :
                       lesson.type === "speaking" ? "Pronúncia" :
                       lesson.type === "writing" ? "Escrita" : "Vocabulário"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-neutral-400 text-xs font-mono">{lesson.date}</span>
                  <span className={`font-mono font-semibold px-2.5 py-1 text-xs rounded-full ${
                    lesson.score >= 85 
                      ? isDark 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-green-50 text-green-700 border border-green-200' 
                      : lesson.score >= 70 
                        ? isDark
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                        : isDark
                          ? 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                          : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
                  }`}>
                    Nota: {lesson.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
