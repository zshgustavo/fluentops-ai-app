import React, { useState } from "react";
import { UserProfile } from "../types";
import { Briefcase, ArrowRight, Sun, Moon, Sparkles, ShieldCheck, Globe, Star } from "lucide-react";

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
    return (localStorage.getItem("fluentops_theme") as "light" | "dark") || "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("fluentops_theme", nextTheme);
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
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 font-sans ${
      isDark ? "bg-[#0A0D14]" : "bg-[#f8fafc]"
    }`}>
      {/* Visual / Landing Side */}
      <div className={`flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-20 relative overflow-hidden border-b md:border-b-0 md:border-r transition-colors duration-500 z-10 ${
        isDark ? "bg-[#10141d] border-[#1e2330]" : "bg-white border-neutral-200"
      }`}>
        {/* Decorations */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[30rem] h-[30rem] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[30rem] h-[30rem] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        {/* Logo/Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <span className={`font-display font-bold text-xl tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
              FluentOps
            </span>
          </div>
          
          <button
            type="button"
            onClick={toggleTheme}
            className={`md:hidden p-2.5 rounded-xl border transition-all ${
              isDark 
                ? "border-[#242936] text-amber-400 focus:bg-[#1f2433] bg-[#161a24]" 
                : "border-neutral-200 text-neutral-500 focus:bg-neutral-50 bg-white"
            }`}
            title={isDark ? "Mudar para Minimalismo Limpo" : "Mudar para Estudo Noturno"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative z-10 mt-12 mb-12 md:my-auto max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acesso Antecipado Gratuito</span>
          </div>
          
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight leading-[1.1] mb-6 ${isDark ? "text-white" : "text-neutral-900"}`}>
            Somos o inglês que <br className="hidden md:block"/>
            roda em produção.
          </h1>
          
          <p className={`text-base md:text-lg leading-relaxed max-w-md mb-10 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            O APP de aprendizado feito para mentes técnicas. O inglês que funciona, idealizado em alto nível para profissionais de alto nível. Deploy your English.
          </p>

          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-full ${isDark ? "bg-[#1a2130]" : "bg-neutral-100"}`}>
                 <ShieldCheck className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
               </div>
               <span className={`font-medium text-sm md:text-base ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>Pratique em ambiente seguro, zero julgamento</span>
             </div>
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-full ${isDark ? "bg-[#1a2130]" : "bg-neutral-100"}`}>
                 <Star className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-amber-500"}`} />
               </div>
               <span className={`font-medium text-sm md:text-base ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>Metodologia direcionada de alto impacto</span>
             </div>
          </div>
        </div>

        <div className={`relative z-10 p-5 md:p-6 rounded-2xl border backdrop-blur-md mt-auto hidden md:block ${
          isDark ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200"
        }`}>
           <p className={`text-sm italic leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
             "As simulações de Pitch do FluentOps ajudaram a criar e refinar minha argumentação perante a diretoria global em Nova York."
           </p>
           <div className="mt-4 flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">MR</div>
             <div>
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-neutral-900"}`}>Mariana Ribeiro</p>
                <p className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Head de Produto Corporativo</p>
             </div>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-16 lg:p-20 relative z-0">
        
        {/* Desktop Theme Setting */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`absolute top-8 right-8 hidden md:block p-2.5 rounded-xl border transition-all ${
            isDark 
              ? "border-[#242936] text-amber-400 hover:bg-[#1f2433] bg-[#161a24]" 
              : "border-neutral-200 text-neutral-500 hover:bg-white bg-neutral-50"
          }`}
          title={isDark ? "Mudar para Minimalismo Limpo" : "Mudar para Estudo Noturno"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-10 text-center md:text-left">
            <h2 className={`text-2.5xl md:text-3xl font-display font-semibold tracking-tight mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
              Crie seu Pefil Inicial
            </h2>
            <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Leva apenas 30 segundos e não requer cartão de crédito.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}>
                Nome de exibição
              </label>
              <input
                type="text"
                required
                placeholder="Exemplo: Lucas Costa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-neutral-500 focus:outline-none transition-all font-sans ${
                  isDark 
                    ? "bg-[#11151f] border-[#242936] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    : "bg-white border-neutral-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-neutral-900 shadow-sm"
                }`}
                id="user-name-input"
              />
            </div>

            {/* Foco de Atuação */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}>
                Área de Atuação
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "Technology", label: "Tecnologia" },
                  { id: "Finance", label: "Finanças" },
                  { id: "General Management", label: "Gestão Geral" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndustry(item.id)}
                    className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 justify-center ${
                      industry === item.id
                        ? isDark 
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-blue-600 bg-blue-50 text-blue-700"
                        : isDark
                          ? "border-[#242936] bg-[#11151f] text-neutral-400 hover:bg-[#1a2130]"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm"
                    }`}
                    id={`industry-btn-${item.id.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Área de Prática */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${
                 isDark ? "text-neutral-300" : "text-neutral-700"
              }`}>
                Habilidade Foco
              </label>
              <div className="relative">
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none font-sans appearance-none pr-10 ${
                    isDark 
                      ? "bg-[#11151f] border-[#242936] text-white focus:border-blue-500" 
                      : "bg-white border-neutral-300 focus:border-blue-600 text-neutral-900 shadow-sm"
                  }`}
                  id="focus-area-select"
                >
                  <option value="Negotiation & Assertiveness">Negociação e Fechamentos</option>
                  <option value="Executive Pitching">Pitching de Projetos</option>
                  <option value="Diplomatic Conflict Resolution">Resolução de Conflitos</option>
                  <option value="Corporate Emailing & Technical Writing">Escrita e Comunicação Técnica</option>
                </select>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Meta Diária */}
            <div>
              <label className={`block text-xs font-semibold mb-2 flex items-center justify-between ${
                 isDark ? "text-neutral-300" : "text-neutral-700"
              }`}>
                <span>Compromisso Diário</span>
                <span className="font-normal text-[10px] text-neutral-500">Média ideal: 20 min</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "10 min", val: "10" },
                  { label: "20 min", val: "20" },
                  { label: "40 min", val: "40" },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setGoal(item.val)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      goal === item.val
                        ? isDark
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-blue-600 bg-blue-50 text-blue-700"
                        : isDark
                          ? "border-[#242936] bg-[#11151f] text-neutral-400 hover:bg-[#1a2130]"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm"
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
              className="w-full mt-8 flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer shadow-md"
              id="start-onboarding-btn"
            >
              Começar Grátis Agora
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center mt-4 text-neutral-500">
              Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
