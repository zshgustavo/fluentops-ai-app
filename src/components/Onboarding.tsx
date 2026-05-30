import React, { useState } from "react";
import { UserProfile } from "../types";
import { Target, Briefcase, Award, ArrowRight, Sun, Moon } from "lucide-react";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [focusArea, setFocusArea] = useState("Negotiation & Assertiveness");
  const [goal, setGoal] = useState("20");

  // Alinhado ao tema global ("light" ou "dark")
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("eloquent_theme") as "light" | "dark") || "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("eloquent_theme", nextTheme);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({
      name: name.trim(),
      industry,
      focusArea,
      dailyGoalMinutes: parseInt(goal, 10),
    });
  };

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 px-6 py-12 ${
      isDark ? "bg-[#0f111a]" : "bg-[#fafafa]"
    }`}>
      <div className={`w-full max-w-md rounded-2xl border transition-all duration-300 p-8 relative ${
        isDark 
          ? "bg-[#161a24] border-[#242936] text-[#f1f5f9] shadow-2xl" 
          : "bg-white border-neutral-100 shadow-sm text-neutral-900"
      }`} id="onboarding-card">
        
        {/* Sleek Theme Settings Toggler on Card Topright */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`absolute top-6 right-6 p-2 rounded-xl border transition-all ${
            isDark 
              ? "border-[#242936] text-amber-400 hover:bg-[#1f2433]" 
              : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
          }`}
          title={isDark ? "Mudar para Minimalismo Limpo" : "Mudar para Estudo Noturno"}
          id="onboarding-theme-toggle"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center p-3 rounded-xl mb-4 ${
            isDark ? "bg-white text-neutral-950" : "bg-neutral-950 text-white"
          }`}>
            <Award className="w-6 h-6" />
          </div>
          <h1 className="text-2.5xl font-display font-semibold tracking-tight">
            Aprimore Sua Comunicação
          </h1>
          <p className={`text-xs mt-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            Inglês executivo sob medida para profissionais de nível intermediário.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${
              isDark ? "text-neutral-400" : "text-neutral-400"
            }`}>
              Nome Completo
            </label>
            <input
              type="text"
              required
              placeholder="ex: Helena Souza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder:text-neutral-400 focus:outline-none transition-all font-sans ${
                isDark 
                  ? "bg-[#0e1117] border-[#242936] text-white focus:border-white focus:ring-1 focus:ring-white" 
                  : "bg-white border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900"
              }`}
              id="user-name-input"
            />
          </div>

          {/* Foco de Atuação */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Foco Setorial Corporativo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Technology", label: "Tecnologia" },
                { id: "Finance", label: "Finanças" },
                { id: "General Management", label: "Gestão Geral" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndustry(item.id)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1.5 justify-center ${
                    industry === item.id
                      ? isDark 
                        ? "border-white bg-white text-neutral-950"
                        : "border-neutral-900 bg-neutral-950 text-white"
                      : isDark
                        ? "border-[#242936] text-neutral-400 hover:bg-[#1e2330]"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                  id={`industry-btn-${item.id.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span className="text-center leading-tight whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Prática */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Foco de Prática em Comunicação
            </label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none font-sans ${
                isDark 
                  ? "bg-[#0e1117] border-[#242936] text-white focus:border-white" 
                  : "bg-white border-neutral-200 focus:border-neutral-900 text-neutral-900"
              }`}
              id="focus-area-select"
            >
              <option value="Negotiation & Assertiveness">Negociação Salarial & Definição de Escopos</option>
              <option value="Executive Pitching">Apresentações de Projetos (Pitch) & Oratória</option>
              <option value="Diplomatic Conflict Resolution">Mediação de Conflitos & Posicionamento Indireto</option>
              <option value="Corporate Emailing & Technical Writing">E-mails de Alto Impacto & Escrita Técnica</option>
            </select>
          </div>

          {/* Meta Diária */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Meta de Prática Diária
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "10 min / dia", val: "10" },
                { label: "20 min / dia", val: "20" },
                { label: "40 min / dia", val: "40" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setGoal(item.val)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    goal === item.val
                      ? isDark
                        ? "border-white bg-white text-neutral-950"
                        : "border-neutral-900 bg-neutral-900 text-white"
                      : isDark
                        ? "border-[#242936] text-neutral-400 hover:bg-[#1e2330]"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-500/10"
                  }`}
                  id={`goal-btn-${item.val}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer ${
              isDark 
                ? "bg-white text-neutral-950 hover:bg-neutral-100" 
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
            id="start-onboarding-btn"
          >
            Entrar no Workspace de Estudo
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
