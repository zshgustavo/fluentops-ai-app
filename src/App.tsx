import { useState, useEffect, useRef } from "react";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import { UserProfile, PerformanceStats, LessonPlan, CallMessage, CompletedLesson, OralFeedback, WritingFeedback } from "./types";
import { OFFLINE_LESSONS, getOfflineVideoCallResponse, analyzeWritingOffline, analyzePronunciationOffline } from "./data";
import { initAuth, googleSignIn, logout } from "./auth";
import { createGoogleTask } from "./tasks";
import {
  Award,
  Zap,
  BookOpen,
  Clock,
  MessageSquare,
  FileText,
  Video,
  Play,
  Mic,
  MicOff,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronRight,
  ChevronDown,
  Volume2,
  Sun,
  Moon,
  LogOut
} from "lucide-react";

export default function App() {
  // Theme state: 'light' ou 'dark' (para estudo noturno em baixa luminosidade)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("eloquent_theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    localStorage.setItem("eloquent_theme", theme);
  }, [theme]);

  // 1. Profile & Session states
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("eloquent_profile");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [offlineMode, setOfflineMode] = useState(false);
  const [isServerHealthy, setIsServerHealthy] = useState(true);

  // Google Auth & Tasks States
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      () => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await googleSignIn();
      setNeedsAuth(false);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setNeedsAuth(true);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleCreateMissedTask = async (taskName: string) => {
    if (needsAuth) {
      alert("Por favor, faça login com o Google primeiro.");
      return;
    }
    const confirmed = window.confirm(`Você deseja agendar uma revisão para '${taskName}' no Google Tasks?`);
    if (!confirmed) return;

    setIsCreatingTask(true);
    try {
      await createGoogleTask(
        `[Eloquent Speak] Revisar: ${taskName}`,
        `Lembrete de estudo.\nTópico original: ${taskName}`
      );
      alert("Anotação adicionada com sucesso ao Google Tasks!");
    } catch (err) {
      console.error("Failed to create task", err);
      alert("Erro ao criar anotação no Google Tasks. Certifique-se de ter concedido a permissão.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  // 2. Statistics & Tracking (Persisted locally)
  const [stats, setStats] = useState<PerformanceStats>(() => {
    const saved = localStorage.getItem("eloquent_stats");
    if (saved) return JSON.parse(saved);
    return {
      lessonsCompleted: 3,
      vocabularyAcquired: 14,
      speakingTimeMinutes: 44,
      streakDays: 4,
      pronunciationScore: 82,
      fluencyScore: 78,
      diplomacyScore: 85,
      grammarScore: 80,
      metricTrend: [
        { date: "25 de mai", pronunciation: 70, fluency: 65, grammar: 72, diplomacy: 75 },
        { date: "26 de mai", pronunciation: 75, fluency: 70, grammar: 74, diplomacy: 80 },
        { date: "27 de mai", pronunciation: 79, fluency: 72, grammar: 78, diplomacy: 82 },
        { date: "28 de mai", pronunciation: 82, fluency: 78, grammar: 80, diplomacy: 85 },
      ]
    };
  });

  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>(() => {
    const saved = localStorage.getItem("eloquent_lessons");
    if (saved) return JSON.parse(saved);
    return [
      { id: "pre_1", date: "25 de mai", type: "vocabulary", title: "Treino de Termos de Alavancagem", score: 85 },
      { id: "pre_2", date: "26 de mai", type: "writing", title: "Rascunho de E-mails Coerentes", score: 78 },
      { id: "pre_3", date: "28 de mai", type: "videocall", title: "Nadia Malik (Simulador)", score: 82 },
    ];
  });

  // Save states helper
  useEffect(() => {
    if (profile) localStorage.setItem("eloquent_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("eloquent_stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("eloquent_lessons", JSON.stringify(completedLessons));
  }, [completedLessons]);

  // Check backend server status
  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        setIsServerHealthy(data.status === "ok");
      })
      .catch(() => {
        setIsServerHealthy(false);
      });
  }, []);

  // 3. Active Lesson state (Dynamic or cached fallback indexable by industry)
  const [currentLesson, setCurrentLesson] = useState<LessonPlan>(() => {
    const ind = profile ? profile.industry : "Technology";
    return OFFLINE_LESSONS[ind] || OFFLINE_LESSONS["Technology"];
  });

  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  // Re-generate or pull personalized lesson plan from Gemini client
  const loadDailyLessonPlan = async (userProfile: UserProfile) => {
    setIsGeneratingLesson(true);
    if (offlineMode || !isServerHealthy) {
      // Pull immediately from our client-side cache
      const cached = OFFLINE_LESSONS[userProfile.industry] || OFFLINE_LESSONS["Technology"];
      setCurrentLesson(cached);
      setIsGeneratingLesson(false);
      return;
    }

    try {
      const response = await fetch("/api/lesson-plan/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: userProfile,
          completedLessons,
          performanceStats: stats
        })
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentLesson({
          ...data,
          id: `gen_${Date.now()}`,
          date: "Today (AI Live Plan)"
        });
      } else {
        if (response.status === 429) {
          setOfflineMode(true);
          console.warn("Quota exceeded. Forcing offline mode.");
        }
        throw new Error("API call failed");
      }
    } catch (err) {
      console.warn("Could not generate plan with LLM, using fallback cache", err);
      const cached = OFFLINE_LESSONS[userProfile.industry] || OFFLINE_LESSONS["Technology"];
      setCurrentLesson(cached);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadDailyLessonPlan(profile);
    }
  }, [profile, offlineMode]);

  // 4. Voice Speaking Practice State (Word/Phrase rehearsal)
  const [speakingText, setSpeakingText] = useState("");
  const [targetSpeakPhrase, setTargetSpeakPhrase] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzingPronunciation, setIsAnalyzingPronunciation] = useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<OralFeedback | null>(null);
  
  // Audio recognition refs
  const recognitionRef = useRef<any>(null);

  // Text-To-Speech Pronunciation Voice Synthesizer
  const handleHearPremiumPronunciation = (phraseToSpeak: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(phraseToSpeak);
      utterance.lang = "en-US";
      // Pick higher fidelity corporate/executive speech rate
      utterance.rate = 0.9; 
      window.speechSynthesis.speak(utterance);
    } else {
      alert("A síntese de voz (TTS) não é suportada por este navegador.");
    }
  };

  // Browser speech capture hook
  const startRecordingToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Unsupported speech API on iframe, fallback gracefully allowing typing rehearsal
      setIsRecording(true);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        setSpeakingText("");
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setSpeakingText(resultText);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsRecording(true);
    }
  };

  // Analyze the spoken utterance using either our server logic or fallback heuristics
  const handleAnalyzeOralPractice = async (customText?: string) => {
    const textToAnalyze = customText || speakingText;
    if (!textToAnalyze.trim()) return;

    setIsAnalyzingPronunciation(true);
    const original = targetSpeakPhrase || currentLesson.wordOfDay.word;

    if (offlineMode || !isServerHealthy) {
      // Trigger offline analyzer immediately
      setTimeout(() => {
        const feedback = analyzePronunciationOffline(original, textToAnalyze);
        setPronunciationFeedback(feedback);
        setIsAnalyzingPronunciation(false);
        // Save progress metric point to current state
        recordMetricActivity("speaking", original, feedback.overallScore, {
          pronunciation: feedback.pronunScore || 85,
          fluency: feedback.toneAnalysis.confidenceScore || 80,
          grammar: feedback.grammarFeedback.flaws.length === 0 ? 90 : 75,
          diplomacy: feedback.toneAnalysis.diplomacyScore || 85
        });
      }, 1000);
      return;
    }

    try {
      const response = await fetch("/api/analyze/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: original,
          transcribedText: textToAnalyze,
          context: `Rehearsing specialized vocabulary: ${original}`
        })
      });
      if (response.ok) {
        const feedback = await response.json();
        setPronunciationFeedback(feedback);
        recordMetricActivity("speaking", original, feedback.overallScore, {
          pronunciation: feedback.pronunScore || 85,
          fluency: feedback.toneAnalysis?.confidenceScore || 80,
          grammar: feedback.grammarFeedback?.flaws?.length === 0 ? 90 : 75,
          diplomacy: feedback.toneAnalysis?.diplomacyScore || 85
        });
      } else {
        if (response.status === 429) setOfflineMode(true);
        throw new Error("Analysis failed");
      }
    } catch (e) {
      console.warn("Production API failing, switching seamlessly to offline model");
      const feedback = analyzePronunciationOffline(original, textToAnalyze);
      setPronunciationFeedback(feedback);
      recordMetricActivity("speaking", original, feedback.overallScore, {
        pronunciation: feedback.pronunScore || 85,
        fluency: feedback.toneAnalysis.confidenceScore || 80,
        grammar: feedback.grammarFeedback.flaws.length === 0 ? 90 : 75,
        diplomacy: feedback.toneAnalysis.diplomacyScore || 85
      });
    } finally {
      setIsAnalyzingPronunciation(false);
    }
  };

  // 5. Simulated Video Call State
  const [callActive, setCallActive] = useState(false);
  const [callHistory, setCallHistory] = useState<CallMessage[]>([]);
  const [userInputTranscript, setUserInputTranscript] = useState("");
  const [currentEmote, setCurrentEmote] = useState("smiling");
  const [isCallReponding, setIsCallResponding] = useState(false);
  const [expectedSpeakingHints, setExpectedSpeakingHints] = useState<string[]>([]);
  const [recentTurnAnalysis, setRecentTurnAnalysis] = useState<CallMessage["feedback"] | null>(null);

  // Web Speak Synthesis for Interactive Video Call Partners for realistic audio playback!
  const speakPartnerLine = (txt: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(txt);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartSimulatedCall = () => {
    setCallActive(true);
    const scen = currentLesson.videoCallScenario;
    const initialMessage: CallMessage = {
      id: "init",
      speaker: "partner",
      text: scen.firstLine,
      emote: "smiling"
    };
    setCallHistory([initialMessage]);
    setCurrentEmote("smiling");
    setExpectedSpeakingHints(currentLesson.speakingKeyPhrases.map(s => s.phrase));
    setRecentTurnAnalysis(null);
    setUserInputTranscript("");
    // Synthesize voice sound
    speakPartnerLine(scen.firstLine);
  };

  const handleSendCallResponse = async (customReply?: string) => {
    const textToSend = customReply || userInputTranscript;
    if (!textToSend.trim()) return;

    // Put user's transcript onto the call record
    const userMsg: CallMessage = {
      id: `usr_${Date.now()}`,
      speaker: "user",
      text: textToSend
    };

    const newHistory = [...callHistory, userMsg];
    setCallHistory(newHistory);
    setUserInputTranscript("");
    setIsCallResponding(true);

    if (offlineMode || !isServerHealthy) {
      setTimeout(() => {
        const scenario = currentLesson.videoCallScenario;
        const offlineReply = getOfflineVideoCallResponse(scenario, newHistory, textToSend);

        const responseMsg: CallMessage = {
          id: `rpy_${Date.now()}`,
          speaker: "partner",
          text: offlineReply.responseText,
          emote: offlineReply.partnerEmote,
          suggestedPhrases: offlineReply.suggestedPhrases,
          feedback: offlineReply.feedbackOnUserTurn
        };

        setCallHistory(prev => [...prev, responseMsg]);
        setCurrentEmote(offlineReply.partnerEmote);
        setRecentTurnAnalysis(offlineReply.feedbackOnUserTurn);
        setIsCallResponding(false);
        speakPartnerLine(offlineReply.responseText);
      }, 1500);
      return;
    }

    try {
      const response = await fetch("/api/video-call/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: currentLesson.videoCallScenario,
          history: newHistory,
          userTranscript: textToSend
        })
      });
      if (response.ok) {
        const data = await response.json();
        const responseMsg: CallMessage = {
          id: `rpy_${Date.now()}`,
          speaker: "partner",
          text: data.responseText,
          emote: data.partnerEmote,
          suggestedPhrases: data.suggestedPhrases,
          feedback: data.feedbackOnUserTurn
        };
        setCallHistory(prev => [...prev, responseMsg]);
        setCurrentEmote(data.partnerEmote);
        setRecentTurnAnalysis(data.feedbackOnUserTurn);
        speakPartnerLine(data.responseText);
      } else {
        if (response.status === 429) setOfflineMode(true);
        throw new Error("Failed");
      }
    } catch {
      // Dynamic failover to offline simulated response
      const scenario = currentLesson.videoCallScenario;
      const offlineReply = getOfflineVideoCallResponse(scenario, newHistory, textToSend);
      const responseMsg: CallMessage = {
        id: `rpy_${Date.now()}`,
        speaker: "partner",
        text: offlineReply.responseText,
        emote: offlineReply.partnerEmote,
        suggestedPhrases: offlineReply.suggestedPhrases,
        feedback: offlineReply.feedbackOnUserTurn
      };
      setCallHistory(prev => [...prev, responseMsg]);
      setCurrentEmote(offlineReply.partnerEmote);
      setRecentTurnAnalysis(offlineReply.feedbackOnUserTurn);
      speakPartnerLine(offlineReply.responseText);
    } finally {
      setIsCallResponding(false);
    }
  };

  const handleFinishCall = () => {
    setCallActive(false);
    const avgScore = recentTurnAnalysis?.rating === "Excellent" ? 92 :
                     recentTurnAnalysis?.rating === "Professional" ? 86 : 74;
    
    recordMetricActivity(
      "videocall",
      `Call with ${currentLesson.videoCallScenario.partnerName}`,
      avgScore,
      {
        pronunciation: avgScore,
        fluency: avgScore + 4,
        grammar: avgScore - 2,
        diplomacy: avgScore + 5
      }
    );
  };

  // 6. Professional Proposal / Email Writing Practice State
  const [draftText, setDraftText] = useState("");
  const [isAnalyzingWriting, setIsAnalyzingWriting] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null);

  const handleAnalyzeWritingDraft = async () => {
    if (!draftText.trim()) return;
    setIsAnalyzingWriting(true);

    if (offlineMode || !isServerHealthy) {
      setTimeout(() => {
        const feedback = analyzeWritingOffline(draftText, currentLesson.writingTask.keywordsExpected);
        setWritingFeedback(feedback);
        setIsAnalyzingWriting(false);
        recordMetricActivity(
          "writing",
          currentLesson.writingTask.title,
          Math.round((feedback.clarityScore + feedback.diplomacyScore + feedback.persuasivenessScore) / 3),
          {
            pronunciation: stats.pronunciationScore, // untouched
            fluency: feedback.clarityScore,
            grammar: Math.round((feedback.clarityScore + feedback.diplomacyScore) / 2),
            diplomacy: feedback.diplomacyScore
          }
        );
      }, 1500);
      return;
    }

    try {
      const response = await fetch("/api/analyze/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: currentLesson.writingTask,
          draftText
        })
      });
      if (response.ok) {
        const feedback = await response.json();
        setWritingFeedback(feedback);
        recordMetricActivity(
          "writing",
          currentLesson.writingTask.title,
          Math.round((feedback.clarityScore + feedback.diplomacyScore + feedback.persuasivenessScore) / 3),
          {
            pronunciation: stats.pronunciationScore,
            fluency: feedback.clarityScore,
            grammar: Math.round((feedback.clarityScore + feedback.diplomacyScore) / 2),
            diplomacy: feedback.diplomacyScore
          }
        );
      } else {
        if (response.status === 429) setOfflineMode(true);
        throw new Error("Draft analysis failed");
      }
    } catch {
      const feedback = analyzeWritingOffline(draftText, currentLesson.writingTask.keywordsExpected);
      setWritingFeedback(feedback);
      recordMetricActivity(
        "writing",
        currentLesson.writingTask.title,
        Math.round((feedback.clarityScore + feedback.diplomacyScore + feedback.persuasivenessScore) / 3),
        {
          pronunciation: stats.pronunciationScore,
          fluency: feedback.clarityScore,
          grammar: Math.round((feedback.clarityScore + feedback.diplomacyScore) / 2),
          diplomacy: feedback.diplomacyScore
        }
      );
    } finally {
      setIsAnalyzingWriting(false);
    }
  };

  // Helper helper: Record score progress to localized timeline tracking points
  const recordMetricActivity = (
    type: "vocabulary" | "writing" | "speaking" | "videocall",
    title: string,
    score: number,
    incrementalSubmetrics: { pronunciation: number; fluency: number; grammar: number; diplomacy: number }
  ) => {
    // 1. Add new completed card activity logs
    const newLesson: CompletedLesson = {
      id: `act_${Date.now()}`,
      date: new Date().toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
      type,
      title,
      score
    };

    const nextLessons = [...completedLessons, newLesson];
    setCompletedLessons(nextLessons);

    // 2. Compute smooth progressive averages
    setStats(prev => {
      const scaleAvg = (currVal: number, incomingNew: number) => {
        return Math.min(100, Math.round(currVal * 0.75 + incomingNew * 0.25));
      };

      const newVocabularyCount = type === "vocabulary" ? prev.vocabularyAcquired + 1 : prev.vocabularyAcquired;
      const additionalTime = type === "videocall" ? 15 : type === "speaking" ? 5 : type === "writing" ? 10 : 3;

      const updatedPronun = scaleAvg(prev.pronunciationScore, incrementalSubmetrics.pronunciation);
      const updatedFluency = scaleAvg(prev.fluencyScore, incrementalSubmetrics.fluency);
      const updatedGrammar = scaleAvg(prev.grammarScore, incrementalSubmetrics.grammar);
      const updatedDiplomacy = scaleAvg(prev.diplomacyScore, incrementalSubmetrics.diplomacy);

      const todayStr = new Date().toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
      const trendList = [...prev.metricTrend];
      
      // Update today's coordinate if exists or push
      if (trendList.length > 0 && trendList[trendList.length - 1].date === todayStr) {
        trendList[trendList.length - 1] = {
          date: todayStr,
          pronunciation: updatedPronun,
          fluency: updatedFluency,
          grammar: updatedGrammar,
          diplomacy: updatedDiplomacy
        };
      } else {
        trendList.push({
          date: todayStr,
          pronunciation: updatedPronun,
          fluency: updatedFluency,
          grammar: updatedGrammar,
          diplomacy: updatedDiplomacy
        });
      }

      return {
        ...prev,
        lessonsCompleted: prev.lessonsCompleted + 1,
        vocabularyAcquired: newVocabularyCount,
        speakingTimeMinutes: prev.speakingTimeMinutes + additionalTime,
        pronunciationScore: updatedPronun,
        fluencyScore: updatedFluency,
        grammarScore: updatedGrammar,
        diplomacyScore: updatedDiplomacy,
        metricTrend: trendList.slice(-6) // Keep last 6 coordinate checkpoints
      };
    });
  };

  const handleResetProgress = () => {
    if (confirm("Tem certeza de que deseja apagar todo o seu progresso de estudo e notas?")) {
      localStorage.removeItem("eloquent_stats");
      localStorage.removeItem("eloquent_lessons");
      setStats({
        lessonsCompleted: 0,
        vocabularyAcquired: 0,
        speakingTimeMinutes: 0,
        streakDays: 1,
        pronunciationScore: 80,
        fluencyScore: 75,
        diplomacyScore: 80,
        grammarScore: 75,
        metricTrend: [
          { date: new Date().toLocaleDateString("pt-BR", { month: "short", day: "numeric" }), pronunciation: 80, fluency: 75, grammar: 75, diplomacy: 80 }
        ]
      });
      setCompletedLessons([]);
    }
  };

  // If user hasn't finished onboarding, display onboarding workflow
  if (!profile) {
    return <Onboarding onComplete={(newProfile) => {
      setProfile(newProfile);
      setTheme((localStorage.getItem("eloquent_theme") as "light" | "dark") || "light");
    }} />;
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-300 ${theme === 'dark' ? "bg-[#0f111a] text-[#f1f5f9]" : "bg-[#fcfcfc] text-neutral-900"}`}>
      
      {/* minimalist navigation sidebar - eloquent style focus */}
      <aside className={`w-64 h-full flex flex-col p-6 shrink-0 shadow-xs border-r transition-all duration-300 ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-200"}`} id="nav-sidebar">
        
        {/* elegant logo branding component */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${theme === 'dark' ? "bg-white text-neutral-950" : "bg-neutral-950 text-white"}`}>
            <span className="font-semibold text-sm">EQ</span>
          </div>
          <div>
            <h1 className={`text-base font-display font-semibold tracking-tight ${theme === 'dark' ? "text-white" : "text-neutral-950"}`}>
              Eloquent Speak
            </h1>
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest leading-none">
              Business Coach
            </p>
          </div>
        </div>

        {/* minimal clean tab indicators list */}
        <nav className="space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? (theme === 'dark' ? "bg-white text-neutral-950 shadow-xs" : "bg-neutral-950 text-white shadow-xs")
                : (theme === 'dark' ? "text-neutral-400 hover:bg-[#1e2332] hover:text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950")
            }`}
            id="tab-btn-dashboard"
          >
            <Sliders className="w-4 h-4" />
            Painel de Controle
          </button>

          <button
            onClick={() => setActiveTab("lessons")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              activeTab === "lessons"
                ? (theme === 'dark' ? "bg-white text-neutral-950 shadow-xs" : "bg-neutral-950 text-white shadow-xs")
                : (theme === 'dark' ? "text-neutral-400 hover:bg-[#1e2332] hover:text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950")
            }`}
            id="tab-btn-lessons"
          >
            <BookOpen className="w-4 h-4" />
            Lições Diárias
          </button>

          <button
            onClick={() => setActiveTab("calls")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              activeTab === "calls"
                ? (theme === 'dark' ? "bg-white text-neutral-950 shadow-xs" : "bg-neutral-950 text-white shadow-xs")
                : (theme === 'dark' ? "text-neutral-400 hover:bg-[#1e2332] hover:text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950")
            }`}
            id="tab-btn-calls"
          >
            <Video className="w-4 h-4" />
            Sala de Reunião
          </button>

          <button
            onClick={() => setActiveTab("writing")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              activeTab === "writing"
                ? (theme === 'dark' ? "bg-white text-neutral-950 shadow-xs" : "bg-neutral-950 text-white shadow-xs")
                : (theme === 'dark' ? "text-neutral-400 hover:bg-[#1e2332] hover:text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950")
            }`}
            id="tab-btn-writing"
          >
            <FileText className="w-4 h-4" />
            Redação Corporativa
          </button>
        </nav>

        {/* offline status widgets footer */}
        <div className="mt-auto pt-6 border-t border-neutral-100 flex flex-col gap-3">
          
          {/* Aesthetic Study Mode Toggle */}
          <div className={`rounded-xl p-3 border transition-colors ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50 border-neutral-150"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${theme === 'dark' ? "text-neutral-400" : "text-neutral-500"}`}>
                Modo de Estudo
              </span>
              <button
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                  theme === 'dark' 
                    ? "bg-[#161a24] border-[#242936] text-white hover:bg-[#1d2230]" 
                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                }`}
                id="theme-toggle-sidebar"
              >
                {theme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                {theme === 'light' ? 'Limpo' : 'Noite'}
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              {theme === 'light' ? 'Visual limpo e minimalista.' : 'Modo escuro para estudo noturno.'}
            </p>
          </div>

          {/* Interactive offline switch element */}
          <div className={`rounded-xl p-3 border transition-colors ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50 border-neutral-150"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${theme === 'dark' ? "text-[#9ca3af]" : "text-neutral-500"}`}>
                Modo Offline Ativo
              </span>
              <input
                type="checkbox"
                checked={offlineMode}
                onChange={(e) => setOfflineMode(e.target.checked)}
                className="w-8 h-4 rounded-full bg-neutral-300 accent-neutral-950 cursor-pointer text-xs"
                id="offline-toggle-input"
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              {offlineMode 
                ? "Usando cache local. Economiza dados e bateria." 
                : isServerHealthy 
                  ? "Análise do Gemini ativa em tempo real." 
                  : "Servidor offline - análise local ativa."}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold uppercase ${theme === 'dark' ? "bg-white text-neutral-900" : "bg-neutral-900 text-white"}`}>
              {profile.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${theme === 'dark' ? "text-white" : "text-neutral-950"}`}>{profile.name}</p>
              <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium uppercase tracking-wider">
                {profile.industry === 'Technology' ? 'Tecnologia' : profile.industry === 'Finance' ? 'Finanças' : 'Gestão Geral'}
              </p>
            </div>
            {!needsAuth && (
              <button
                onClick={handleGoogleLogout}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${theme === 'dark' ? "hover:bg-[#1e2332] text-neutral-500 hover:text-white" : "hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900"}`}
                title="Desconectar do Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main viewport area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* minimalist clean header panel */}
        <header className={`h-16 border-b px-8 flex items-center justify-between shrink-0 transition-colors duration-300 ${theme === 'dark' ? "bg-[#161a25] border-[#242936]" : "bg-white border-neutral-200"}`}>
          <div>
            <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest animate-fade-in">
              Espaço Executivo / {activeTab === "dashboard" ? "Visualização Geral" : activeTab === "lessons" ? "Planejamento Lírico" : activeTab === "calls" ? "Videochamada Simulada" : "Redação Analítica"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Estudo Realizado Hoje</p>
              <p className={`text-xs font-semibold mt-0.5 ${theme === 'dark' ? "text-white" : "text-neutral-900"}`}>{stats.speakingTimeMinutes} / {profile.dailyGoalMinutes} min</p>
            </div>
            <div className={`w-32 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? "bg-[#1d2230]" : "bg-neutral-100"}`}>
              <div 
                className={`h-full transition-all duration-300 ${theme === 'dark' ? "bg-white" : "bg-neutral-950"}`}
                style={{ width: `${Math.min(100, (stats.speakingTimeMinutes / profile.dailyGoalMinutes) * 100)}%` }}
              />
            </div>
          </div>
        </header>

        {/* scrollable panel content */}
        <div className="flex-1 overflow-y-auto p-8" id="viewport-scrollable-content">
          
          {/* TAB 1: CORE CONTROL DASHBOARD */}
          {activeTab === "dashboard" && (
            <Dashboard
              profile={profile}
              stats={stats}
              completedLessons={completedLessons}
              onResetProgress={handleResetProgress}
              setActiveTab={setActiveTab}
              theme={theme}
              needsAuth={needsAuth}
              isLoggingIn={isLoggingIn}
              isCreatingTask={isCreatingTask}
              onGoogleLogin={handleGoogleLogin}
              onCreateTask={handleCreateMissedTask}
            />
          )}

          {/* TAB 2: DAILY LESSON PLANS (AI OR CACHED) */}
          {activeTab === "lessons" && (
            <div className="space-y-8 max-w-4xl mx-auto my-1 animate-fade-in text-sans">
              
              {/* Header card info */}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl border transition-colors ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-100 shadow-xs"}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${theme === 'dark' ? "bg-white text-neutral-950" : "bg-neutral-900 text-white"}`}>
                      {currentLesson.date === "Today (AI Live Plan)" ? "Hoje (Plano de IA ao Vivo)" : currentLesson.date}
                    </span>
                    {isServerHealthy && !offlineMode && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50/10 px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3" /> Personalização Diária Ativa
                      </span>
                    )}
                  </div>
                  <h1 className={`text-2xl font-display font-medium mt-1.5 ${theme === 'dark' ? "text-white" : "text-neutral-950"}`}>
                    Currículo Curado para Hoje
                  </h1>
                  <p className={`text-sm mt-0.5 ${theme === 'dark' ? "text-neutral-400" : "text-neutral-500"}`}>
                    Sob medida para jargões corporativos e fluxos reais da área de {profile.industry === 'Technology' ? 'Tecnologia' : profile.industry === 'Finance' ? 'Finanças' : 'Gestão Geral'}.
                  </p>
                </div>

                <button
                  onClick={() => loadDailyLessonPlan(profile)}
                  disabled={isGeneratingLesson}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                    theme === 'dark' 
                      ? "border-[#242936] hover:bg-[#1a1f2b] text-neutral-300" 
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                  }`}
                  id="rebuild-lessons-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingLesson ? "animate-spin" : ""}`} />
                  Recriar Grade de Estudo
                </button>
              </div>

              {isGeneratingLesson ? (
                <div className={`text-center py-24 rounded-2xl border p-8 flex flex-col items-center justify-center ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-100"}`}>
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mb-3" />
                  <p className={`text-sm font-semibold ${theme === 'dark' ? "text-neutral-200" : "text-neutral-700"}`}>Gerando matriz de vocabulário personalizado...</p>
                  <p className="text-xs text-neutral-400 mt-1">Analisando gaps específicos de fala corporativa em tempo real</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Word of the Day */}
                  <div className={`md:col-span-1 p-6 rounded-2xl border flex flex-col justify-between ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-100"}`} id="word-day-widget">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vocábulo Corporativo</span>
                        <span className={`text-xs font-mono lowercase ${theme === 'dark' ? "text-blue-400" : "text-[#0066cc]"}`}>{currentLesson.wordOfDay.partOfSpeech}</span>
                      </div>
                      
                      <div className="flex items-baseline gap-2">
                        <h2 className={`text-3xl font-display font-semibold tracking-tight ${theme === 'dark' ? "text-white" : "text-neutral-950"}`}>
                          {currentLesson.wordOfDay.word}
                        </h2>
                        <button
                          onClick={() => handleHearPremiumPronunciation(currentLesson.wordOfDay.word)}
                          className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? "hover:bg-[#1a1f2b] text-neutral-400 hover:text-white" : "hover:bg-neutral-50 text-neutral-500 hover:text-neutral-950"}`}
                          title="Listen to Executive Pronunciation"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-4 text-sm">
                        <div>
                          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Definição Corporativa</h4>
                          <p className={`font-sans leading-relaxed ${theme === 'dark' ? "text-neutral-250" : "text-neutral-700"}`}>
                            {currentLesson.wordOfDay.corporateDefinition}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Dica de Contexto Profissional</h4>
                          <p className={`italic text-xs leading-relaxed ${theme === 'dark' ? "text-neutral-400" : "text-neutral-500"}`}>
                            {currentLesson.wordOfDay.businessContextTip}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`pt-6 border-t mt-6 md:mt-0 ${theme === 'dark' ? "border-[#242936]" : "border-neutral-150"}`}>
                      <button
                        onClick={() => {
                          setTargetSpeakPhrase(currentLesson.wordOfDay.sampleSentence);
                          setSpeakingText("");
                          setPronunciationFeedback(null);
                        }}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl border transition-all cursor-pointer group ${
                          theme === 'dark'
                            ? "bg-[#0e1117] border-[#242936] hover:bg-[#161a25]"
                            : "bg-neutral-50 border-neutral-100 hover:bg-neutral-100/50"
                        }`}
                      >
                        <div>
                          <p className="text-[9px] font-semibold text-neutral-400 uppercase">Treinar Esta Frase</p>
                          <p className={`text-xs font-semibold truncate max-w-[180px] ${theme === 'dark' ? "text-neutral-200" : "text-neutral-850"}`}>{currentLesson.wordOfDay.sampleSentence}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  </div>

                  {/* Mini-lesson + Enunciation Practice Area */}
                  <div className={`md:col-span-2 p-6 rounded-2xl border transition-all ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-100 shadow-xs"} space-y-6`}>
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Reestruturação de Registro</span>
                      <h3 className={`text-xl font-display font-semibold mt-1 ${theme === 'dark' ? "text-white" : "text-neutral-950"}`}>
                        {currentLesson.miniLesson.title}
                      </h3>
                      <p className={`text-sm mt-2 leading-relaxed ${theme === 'dark' ? "text-neutral-300" : "text-neutral-600"}`}>
                        {currentLesson.miniLesson.explanation}
                      </p>
                    </div>

                    {/* Comparison Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Do Not Say (Passive / Blunt) */}
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? "bg-orange-950/15 border-orange-900/30" : "bg-orange-50/50 border-orange-100"}`}>
                        <span className="text-[9px] uppercase font-bold text-orange-600 tracking-wider">Inadequado / Muito Rígido</span>
                        <p className={`text-xs font-medium mt-1 font-mono ${theme === 'dark' ? "text-orange-250" : "text-neutral-700"}`}>
                          "{currentLesson.miniLesson.poorAlternative}"
                        </p>
                      </div>

                      {/* Professional Executive Version */}
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? "bg-emerald-950/15 border-emerald-950/30" : "bg-emerald-50/50 border-emerald-100"}`}>
                        <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Estratégico & Diplomático</span>
                        <p className={`text-xs font-medium mt-1 ${theme === 'dark' ? "text-emerald-300" : "text-neutral-900"}`}>
                          "{currentLesson.miniLesson.goodAlternative}"
                        </p>
                        <p className={`text-[10px] font-mono mt-1.5 italic ${theme === 'dark' ? "text-neutral-400" : "text-neutral-400"}`}>
                          {currentLesson.miniLesson.explanationAlternative}
                        </p>
                      </div>
                    </div>

                    <div className={`pt-4 border-t text-center ${theme === 'dark' ? "border-[#242936]" : "border-neutral-100"}`}>
                      <button
                        onClick={() => {
                          setTargetSpeakPhrase(currentLesson.miniLesson.goodAlternative);
                          setSpeakingText("");
                          setPronunciationFeedback(null);
                        }}
                        className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          theme === 'dark'
                            ? "border-white text-white hover:bg-white hover:text-black"
                            : "border-neutral-900 text-neutral-900 hover:bg-neutral-950 hover:text-white"
                        }`}
                      >
                        Praticar Esta Alternativa (Treino de Fala)
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Dynamic Interactive Speech-To-Text Practice Workspace */}
              <div className={`p-6 rounded-2xl border space-y-6 transition-all ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-100"}`} id="vocal-practice-workspace">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Laboratório de Ritmo e Pronúncia</h3>
                    <p className={`text-xs mt-0.5 ${theme === 'dark' ? "text-neutral-400" : "text-neutral-500"}`}>Foque no ritmo de fala, entonação correta de palavras-chave e uso de jargão corporativo.</p>
                  </div>
                  {targetSpeakPhrase && (
                    <button
                      onClick={() => setTargetSpeakPhrase("")}
                      className="text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      Limpar Alvo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Recording pane */}
                  <div className={`rounded-2xl p-5 border flex flex-col justify-between ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50 border-neutral-150"}`}>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-neutral-400">Frase Selecionada</span>
                      <p className={`text-sm font-semibold mt-1 italic ${theme === 'dark' ? "text-neutral-200" : "text-neutral-800"}`}>
                        {targetSpeakPhrase ? `"${targetSpeakPhrase}"` : `"Selecione uma frase acima como alvo ou treine qualquer fala em inglês livremente."`}
                      </p>

                      {targetSpeakPhrase && (
                        <button
                          onClick={() => handleHearPremiumPronunciation(targetSpeakPhrase)}
                          className={`flex items-center gap-1.5 text-xs font-medium mt-2.5 hover:underline cursor-pointer ${theme === 'dark' ? "text-blue-400" : "text-[#0066cc]"}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Ouvir áudio modelo profissional
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 mt-6">
                      <div className="flex justify-center items-center py-4">
                        <button
                          onClick={startRecordingToggle}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isRecording 
                              ? "bg-red-500 text-white animate-pulse" 
                              : (theme === 'dark' ? "bg-white text-neutral-900" : "bg-neutral-950 text-white hover:scale-105 active:scale-95")
                          }`}
                          id="oral-record-circle"
                        >
                          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                      </div>

                      <p className="text-[10px] text-center text-neutral-400 leading-normal">
                        {isRecording 
                          ? "Gravando... Fale diretamente em inglês no seu microfone. Toque novamente para encerrar." 
                          : "Toque no botão de microfone para falar."}
                      </p>
                    </div>
                  </div>

                  {/* Transcripts pane and AI analysis */}
                  <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                        Conteúdo Pronunciado Capturado
                      </label>
                      <textarea
                        value={speakingText}
                        onChange={(e) => setSpeakingText(e.target.value)}
                        placeholder="Suas palavras faladas aparecerão aqui em tempo real. Você também pode digitar ou editar o texto manualmente para testar gramática, diplomacia verbal e conferir notas de pronúncia simuladas..."
                        className={`w-full text-sm p-4 rounded-xl border focus:outline-none min-h-[140px] transition-all ${
                          theme === 'dark' 
                            ? "bg-[#0e1117] border-[#242936] text-white focus:border-white focus:bg-[#0e1117]" 
                            : "bg-white border-neutral-200 focus:border-neutral-900 text-neutral-900"
                        }`}
                        id="oral-transcript-textarea"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAnalyzeOralPractice()}
                        disabled={isAnalyzingPronunciation || !speakingText.trim()}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-40 select-none cursor-pointer ${
                          theme === 'dark'
                            ? "bg-white text-[#0e1117] hover:bg-neutral-200"
                            : "bg-neutral-950 text-white hover:bg-[#1a1f2b]"
                        }`}
                        id="submit-vocal-analysis"
                      >
                        {isAnalyzingPronunciation ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Avaliando fonética, gramática e diplomacia...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Avaliar Pronúncia & Tom
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          // Allow quick testing by filling template mock transcription
                          setSpeakingText(targetSpeakPhrase || currentLesson.wordOfDay.sampleSentence);
                        }}
                        className={`px-4 py-3 border rounded-xl text-xs font-semibold cursor-pointer ${
                          theme === 'dark'
                            ? "border-[#242936] text-neutral-300 hover:bg-[#0e1117]"
                            : "border-neutral-250 hover:bg-neutral-50 text-neutral-600"
                        }`}
                        title="Simulate Speech Capture"
                      >
                        Simular Entrada
                      </button>
                    </div>
                  </div>

                </div>

                {/* Oral analysis output representation */}
                {pronunciationFeedback && (
                  <div className={`pt-6 space-y-6 border-t ${theme === 'dark' ? "border-[#242936]" : "border-neutral-100"}`} id="vocal-feedback-display">
                    
                    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50 border-neutral-150"}`}>
                      <div>
                        <div className={`text-2xl font-display font-semibold ${theme === 'dark' ? "text-white" : "text-[#0e1117]"}`}>
                          {pronunciationFeedback.overallScore}% <span className="text-xs text-neutral-400 font-normal">Pontuação Geral (Auditoria)</span>
                        </div>
                        <p className={`text-xs mt-1 italic ${theme === 'dark' ? "text-neutral-300" : "text-neutral-600"}`}>"{pronunciationFeedback.coachingInsight}"</p>
                      </div>

                      {/* Mini pill stats indicators */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-3 py-1 rounded-lg border ${theme === 'dark' ? "bg-[#161a24] border-[#242936] text-neutral-300" : "bg-white border-neutral-200 text-neutral-700"}`}>
                          Tom: <strong className={theme === 'dark' ? "text-white" : "text-neutral-950"}>{pronunciationFeedback.toneAnalysis.primaryTone}</strong>
                        </span>
                        <span className={`px-3 py-1 rounded-lg border ${theme === 'dark' ? "bg-[#161a24] border-[#242936] text-neutral-300" : "bg-white border-neutral-200 text-neutral-700"}`}>
                          Confiança: <strong className={theme === 'dark' ? "text-white" : "text-neutral-950"}>{pronunciationFeedback.toneAnalysis.confidenceScore}%</strong>
                        </span>
                        <span className={`px-3 py-1 rounded-lg border ${theme === 'dark' ? "bg-[#161a24] border-[#242936] text-neutral-300" : "bg-white border-neutral-200 text-neutral-700"}`}>
                          Diplomacia: <strong className={theme === 'dark' ? "text-white" : "text-neutral-950"}>{pronunciationFeedback.toneAnalysis.diplomacyScore}%</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Phonetics Issues checklist */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Erros de Pronúncia e Fluidez</h4>
                        
                        {pronunciationFeedback.pronunciationIssues.length === 0 ? (
                          <div className={`flex items-center gap-2.5 text-xs px-4 py-3 rounded-xl border ${theme === 'dark' ? "text-emerald-300 bg-emerald-950/15 border-emerald-955/30" : "text-emerald-700 bg-emerald-50/50 border-emerald-100"}`}>
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                            Articulação impecável! Não foram detectados desvios fonéticos ou omissões de sílabas relevantes neste ensaio.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {pronunciationFeedback.pronunciationIssues.map((issue, i) => (
                              <div key={i} className={`p-3.5 border rounded-xl space-y-1 ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-white border-neutral-150"}`}>
                                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? "text-white" : "text-neutral-800"}`}>{issue.word}</p>
                                <p className={`text-xs ${theme === 'dark' ? "text-neutral-300" : "text-neutral-800"} font-medium`}>{issue.issue}</p>
                                <p className="text-[11px] text-neutral-400 font-mono italic">Dica: {issue.correctionTip}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Grammar corrections */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Aprimoramento Gramatical & Léxico</h4>
                        <div className={`border rounded-xl p-4 space-y-3 ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-white border-neutral-150"}`}>
                          
                          {pronunciationFeedback.grammarFeedback.flaws.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase font-bold text-neutral-400">Pontos a Ajustar</p>
                              <ul className="list-disc pl-4 text-xs text-neutral-400 space-y-1 mt-1">
                                {pronunciationFeedback.grammarFeedback.flaws.map((flaw, idx) => (
                                  <li key={idx}>{flaw}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <p className="text-[10px] uppercase font-bold text-neutral-400">Versão Executiva Mais Polida</p>
                            <p className={`text-xs font-medium p-2.5 rounded border mt-1 italic ${theme === 'dark' ? "bg-[#161a24] border-[#242936] text-white" : "bg-neutral-50 border-neutral-100 text-neutral-900"}`}>
                              "{pronunciationFeedback.grammarFeedback.improvedVersion}"
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase font-bold text-neutral-400">Explicação Teórica</p>
                            <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                              {pronunciationFeedback.grammarFeedback.grammarExplanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATED VIDEO CALL INTERACTIVE ROOM */}
          {activeTab === "calls" && (
            <div className="max-w-5xl mx-auto my-1 space-y-8 animate-fade-in text-sans">
              
              {!callActive ? (
                <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-100 shadow-xs"} space-y-6`}>
                  <div className="max-w-2xl">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? "text-blue-400" : "text-[#0066cc]"}`}>Simulações de Reunião Interativas</span>
                    <h1 className={`text-2xl font-display font-medium mt-1 ${theme === 'dark' ? "text-white" : "text-neutral-950"}`}>
                      {currentLesson.videoCallScenario.scenarioTitle}
                    </h1>
                    <p className={`text-sm mt-2 leading-relaxed ${theme === 'dark' ? "text-neutral-350" : "text-neutral-500"}`}>
                      {currentLesson.videoCallScenario.situationDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    
                    {/* Partner Card info */}
                    <div className={`rounded-2xl p-5 border flex items-center gap-4 ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50/50 border-neutral-150"}`}>
                      <div className={`w-16 h-16 rounded-full border-2 shadow-xs flex items-center justify-center text-xl font-bold font-logo uppercase ${theme === 'dark' ? "bg-[#161a24] border-[#242936] text-white" : "bg-neutral-900 border-white text-white"}`}>
                        {currentLesson.videoCallScenario.partnerName.slice(0, 2)}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-neutral-400">Facilitador da Reunião</span>
                        <h3 className={`text-base font-semibold ${theme === 'dark' ? "text-white" : "text-neutral-900"}`}>{currentLesson.videoCallScenario.partnerName}</h3>
                        <p className={`text-xs ${theme === 'dark' ? "text-neutral-400" : "text-neutral-500"}`}>{currentLesson.videoCallScenario.partnerRole}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Regras Ativas do Exercício:</h4>
                      <ul className={`text-xs space-y-1 list-disc pl-4 ${theme === 'dark' ? "text-neutral-300" : "text-neutral-600"}`}>
                        <li>Escute atentamente o contexto da fala do parceiro.</li>
                        <li>Siga as regras de tom diplomático corporativo na resposta.</li>
                        <li>Trabalhe para incluir as expressões recomendadas do dia se possível.</li>
                      </ul>
                    </div>

                  </div>

                  <div className={`pt-6 border-t flex justify-end ${theme === 'dark' ? "border-[#242936]" : "border-neutral-100"}`}>
                    <button
                      onClick={handleStartSimulatedCall}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        theme === 'dark'
                          ? "bg-white text-[#0e1117] hover:bg-neutral-250"
                          : "bg-neutral-950 text-white hover:bg-neutral-800"
                      }`}
                      id="launch-call-btn"
                    >
                      <Video className="w-4 h-4" /> Iniciar Videoconferência Simulada com {currentLesson.videoCallScenario.partnerName}
                    </button>
                  </div>
                </div>
              ) : (
                
                // Active video call conference workspace styling
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px]">
                  
                  {/* Left Column: Avatars & dialogue (lg:col-span-8) */}
                  <div className={`lg:col-span-8 flex flex-col h-full rounded-2xl border overflow-hidden shadow-xs transition-colors ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-200"}`}>
                    
                    {/* Header bar */}
                    <div className="bg-neutral-900 text-white px-5 py-3 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-semibold uppercase tracking-wider">Sala de Reunião Simulada Ativa</span>
                      </div>
                      <button
                        onClick={handleFinishCall}
                        className="px-3 py-1 bg-red-600/35 border border-red-505 text-red-100 hover:bg-red-600 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                        id="abort-call-btn"
                      >
                        Sair da Chamada
                      </button>
                    </div>

                    {/* Interactive Video Stream Box mockup */}
                    <div className="flex-1 bg-neutral-950 relative flex items-center justify-center p-6 select-none overflow-hidden" id="video-stream-box">
                      
                      {/* background ambient canvas circles */}
                      <div className="absolute inset-0 bg-radial from-neutral-800/10 to-neutral-950 pointer-events-none" />

                      {/* Simulated Partner Stream */}
                      <div className="text-center flex flex-col items-center justify-center space-y-3 z-10 transition-all">
                        <div className="relative">
                          {/* Emote animation indicator borders */}
                          <div className={`absolute -inset-1.5 rounded-full border-1.5 border-dashed ${
                            isCallReponding ? "border-sky-500 animate-spin" : "border-neutral-700"
                          }`} />
                          
                          <div className={`w-32 h-32 rounded-full border-4 border-neutral-800 bg-neutral-900 flex items-center justify-center shadow-2xl transition-all ${
                            currentEmote === "smiling" ? "scale-105 border-neutral-600" : "scale-100"
                          }`}>
                            <span className="text-white text-3xl font-display font-semibold uppercase">{currentLesson.videoCallScenario.partnerName.slice(0, 2)}</span>
                          </div>

                          {/* Minimal Badge detailing gesture */}
                          <span className="absolute bottom-0 right-1 px-2.5 py-0.5 bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-full text-[9px] font-mono capitalize">
                            Gesto: {currentEmote === 'smiling' ? 'Sorrindo' : currentEmote === 'thinking' ? 'Analisando' : 'Sério'}
                          </span>
                        </div>

                        <div className="text-center">
                          <h4 className="text-white text-sm font-semibold">{currentLesson.videoCallScenario.partnerName}</h4>
                          <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-widest">{currentLesson.videoCallScenario.partnerRole}</p>
                        </div>
                      </div>

                      {/* Small floating webcam layout of user inside corner */}
                      <div className="absolute bottom-4 right-4 w-28 h-20 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl hidden sm:flex items-center justify-center text-center">
                        <div className="p-2">
                          <p className="text-[10px] text-neutral-205 font-semibold truncate max-w-[90px]">{profile.name}</p>
                          <p className="text-[8px] text-neutral-500 uppercase">Sua WebCam</p>
                        </div>
                      </div>
                    </div>

                    {/* Dialog / Chat log below stream */}
                    <div className={`border-t h-[150px] overflow-y-auto px-6 py-4 space-y-3 ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50/25 border-neutral-100"}`}>
                      {callHistory.map((m) => (
                        <div key={m.id} className="text-xs font-sans">
                          <span className={`font-semibold uppercase tracking-wider text-[10px] inline-block mr-2 ${
                            m.speaker === "partner" ? "text-[#0066cc]" : "text-neutral-900"
                          }`}>
                            {m.speaker === "partner" ? currentLesson.videoCallScenario.partnerName : "Você"}:
                          </span>
                          <span className={`font-medium italic ${theme === 'dark' ? "text-neutral-250" : "text-neutral-800"}`}>"{m.text}"</span>
                        </div>
                      ))}

                      {isCallReponding && (
                        <div className="text-xs text-neutral-400 italic animate-pulse">
                          {currentLesson.videoCallScenario.partnerName} está formulando resposta...
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Interaction Input and hints (lg:col-span-4) */}
                  <div className={`lg:col-span-4 flex flex-col h-full rounded-2xl border p-5 space-y-5 shadow-xs transition-colors ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-200"}`}>
                    
                    {/* Prompt input field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Sua Resposta Falada / Rascunho
                      </label>
                      <textarea
                        value={userInputTranscript}
                        onChange={(e) => setUserInputTranscript(e.target.value)}
                        placeholder="Escreva sua resposta ou grave com voz... Toque no botão de microfone para ditar!"
                        className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition-all min-h-[90px] font-sans ${
                          theme === 'dark'
                            ? "bg-[#0e1117] border-[#242936] text-white focus:border-white focus:bg-[#0e1117]"
                            : "bg-neutral-50 hover:bg-neutral-100/50 border border-neutral-200 focus:border-neutral-900 text-neutral-900"
                        }`}
                        id="videocall-response-input"
                      />
                    </div>

                    {/* Mic toggler and templates controls */}
                    <div className="flex gap-2">
                      <button
                        onClick={startRecordingToggle}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border rounded-xl transition-all ${
                          isRecording 
                            ? "bg-red-50 text-red-600 border-red-200 font-bold" 
                            : (theme === 'dark' ? "border-[#242936] text-neutral-300 hover:bg-[#0e1117]" : "border-neutral-200 hover:bg-neutral-50 text-neutral-600")
                        }`}
                        id="videocall-mic-trigger"
                      >
                        <Mic className="w-3.5 h-3.5" /> Ditar
                      </button>

                      <button
                        onClick={() => handleSendCallResponse()}
                        disabled={isCallReponding || !userInputTranscript.trim()}
                        className={`flex-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                          theme === 'dark'
                            ? "bg-white text-[#0e1117] hover:bg-neutral-200"
                            : "bg-neutral-950 text-white hover:bg-neutral-800"
                        }`}
                        id="videocall-send-btn"
                      >
                        <Send className="w-3 h-3" /> Transmitir
                      </button>
                    </div>

                    {/* Strategic Key Phrases to include */}
                    <div className={`space-y-2 border-t pt-3 ${theme === 'dark' ? "border-[#242936]" : "border-neutral-100"}`}>
                      <span className={`text-[9px] uppercase font-bold ${theme === 'dark' ? "text-blue-400" : "text-[#0066cc]"}`}>Expressões Alvo (Toque para Injetar)</span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {currentLesson.speakingKeyPhrases.map((target, idx) => (
                          <button
                            key={idx}
                            onClick={() => setUserInputTranscript(target.phrase)}
                            className={`w-full text-left p-2.5 border rounded-lg text-[11px] leading-relaxed block transition-all cursor-pointer ${
                              theme === 'dark' 
                                ? "bg-[#0e1117] hover:bg-[#161a25] border-[#242936]" 
                                : "bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-150"
                            }`}
                          >
                            <span className="font-semibold block text-neutral-800">"{target.phrase}"</span>
                            <span className="text-[10px] text-neutral-400 font-mono italic mt-0.5 block">{target.situation} ({target.toneExplanation})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Turn specific micro AI Feedback on last utterance */}
                    {recentTurnAnalysis && (
                      <div className={`pt-3 p-3 rounded-xl border space-y-1 ${theme === 'dark' ? "bg-blue-950/20 border-blue-900/30 text-blue-300" : "bg-blue-50/30 border-blue-100/50"}`} id="videocall-turn-feedback">
                        <span className="text-[9px] uppercase font-bold text-blue-600">Auditoria de Tom da Frase</span>
                        
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className={theme === 'dark' ? "text-neutral-250" : "text-neutral-850"}>Tom Observado: {recentTurnAnalysis.toneObserved}</span>
                          <span className="px-1.5 bg-sky-100 text-sky-800 rounded font-bold uppercase text-[9px]">{recentTurnAnalysis.rating}</span>
                        </div>

                        {recentTurnAnalysis.grammarCorrection && (
                          <p className="text-[10px] text-neutral-400 italic mt-1 leading-normal">
                            Ajuste Gramatical: <strong className={theme === 'dark' ? "text-neutral-200" : "text-neutral-800"}>"{recentTurnAnalysis.grammarCorrection}"</strong>
                          </p>
                        )}

                        {recentTurnAnalysis.vocabularyUpgrade && (
                          <p className={`text-[10px] italic border-t pt-1 mt-1 font-sans ${theme === 'dark' ? "border-blue-950/40 text-emerald-300" : "border-blue-100/50 text-emerald-700"}`}>
                            Vocabulário Sugerido: <strong>"{recentTurnAnalysis.vocabularyUpgrade}"</strong>
                          </p>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 4: REAL-WORLD WRITING EXERCISES & TEMPLATES */}
          {activeTab === "writing" && (
            <div className="max-w-4xl mx-auto my-1 space-y-8 animate-fade-in text-sans">
              
              <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? "bg-[#161a24] border-[#242936]" : "bg-white border-neutral-100 shadow-xs"} space-y-6`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? "text-blue-400" : "text-[#0066cc]"}`}>Rascunho Executivo</span>
                  <h1 className={`text-2xl font-display font-medium mt-1 ${theme === 'dark' ? "text-white" : "text-neutral-900"}`}>
                    {currentLesson.writingTask.title}
                  </h1>
                  <p className={`text-sm mt-1 mb-4 leading-relaxed ${theme === 'dark' ? "text-neutral-350" : "text-neutral-600"}`}>
                    {currentLesson.writingTask.scenario}
                  </p>

                  <div className={`p-4 rounded-xl border text-xs w-full ${theme === 'dark' ? "bg-[#0e1117] border-[#242936] text-neutral-300" : "bg-neutral-50 border-neutral-150 text-neutral-500"}`}>
                    <strong>Escopo do Desafio:</strong> {currentLesson.writingTask.context}
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
                  
                  {/* Left block options: load templates, target keywords */}
                  <div className="lg:col-span-5 space-y-5">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Vocabulário Corporativo Obrigatório</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentLesson.writingTask.keywordsExpected.map((word) => {
                          const included = draftText.toLowerCase().includes(word.toLowerCase());
                          return (
                            <span
                              key={word}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                                included 
                                  ? "bg-green-500/10 border-green-500/30 text-green-500 font-bold" 
                                  : (theme === 'dark' ? "bg-[#0e1117] border-[#242936] text-neutral-400" : "bg-neutral-50 border-neutral-200 text-neutral-500")
                              }`}
                            >
                              {included ? "✓" : "○"} {word}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Esqueleto de Modelo Corporativo</h4>
                      <button
                        onClick={() => setDraftText(currentLesson.writingTask.templateText)}
                        className={`w-full text-left p-3.5 border rounded-xl transition-all block cursor-pointer group ${
                          theme === 'dark' 
                            ? "bg-[#0e1117] border-[#242936] hover:bg-[#161a25]" 
                            : "bg-neutral-50 hover:bg-neutral-100 border-neutral-150"
                        }`}
                      >
                        <p className={`text-xs font-semibold ${theme === 'dark' ? "text-white" : "text-neutral-800"}`}>Carregar Modelo Estruturado</p>
                        <p className="text-[10px] text-neutral-400 leading-normal mt-1 italic">Clique aqui para carregar o modelo de e-mail corporativo padrão deste desafio.</p>
                      </button>
                    </div>
                  </div>

                  {/* Right block workspace text area */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                        Correspondência de Negócios (Em Inglês)
                      </label>
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder="Carregue o modelo sugerido à esquerda ou comece a rascunhar sua mensagem executiva em inglês aqui..."
                        className={`w-full text-xs p-4 rounded-xl border focus:outline-none transition-all min-h-[220px] font-mono leading-relaxed ${
                          theme === 'dark'
                            ? "bg-[#0e1117] border-[#242936] text-white focus:border-white focus:bg-[#0e1117]"
                            : "bg-white border-neutral-200 focus:border-neutral-900 text-neutral-900"
                        }`}
                        id="writing-draft-textarea"
                      />
                    </div>

                    <button
                      onClick={handleAnalyzeWritingDraft}
                      disabled={isAnalyzingWriting || !draftText.trim()}
                      className={`w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 ${
                        theme === 'dark'
                          ? "bg-white text-[#0e1117] hover:bg-neutral-200"
                          : "bg-neutral-950 text-white hover:bg-neutral-800"
                      }`}
                      id="submit-writing-btn"
                    >
                      {isAnalyzingWriting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Avaliando Tom e Estrutura Linguística...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analisar Tom e Vocabulário
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* Analysis results */}
                {writingFeedback && (
                  <div className={`border-t pt-6 space-y-6 ${theme === 'dark' ? "border-[#242936]" : "border-neutral-100"}`} id="writing-feedback-display">
                    
                    {/* Key Score Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50 border-neutral-150"}`}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Clareza e Fluidez</span>
                          <span className={`font-semibold font-mono text-sm ${theme === 'dark' ? "text-white" : "text-neutral-900"}`}>{writingFeedback.clarityScore}%</span>
                        </div>
                        <div className={`w-full h-1 rounded-full overflow-hidden ${theme === 'dark' ? "bg-neutral-800" : "bg-neutral-200"}`}>
                          <div className={`h-full ${theme === 'dark' ? "bg-white" : "bg-neutral-900"}`} style={{ width: `${writingFeedback.clarityScore}%` }} />
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50 border-neutral-150"}`}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Diplomacia Corporativa</span>
                          <span className={`font-semibold font-mono text-sm ${theme === 'dark' ? "text-white" : "text-neutral-900"}`}>{writingFeedback.diplomacyScore}%</span>
                        </div>
                        <div className={`w-full h-1 rounded-full overflow-hidden ${theme === 'dark' ? "bg-neutral-800" : "bg-neutral-200"}`}>
                          <div className="bg-blue-600 h-full" style={{ width: `${writingFeedback.diplomacyScore}%` }} />
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-neutral-50 border-neutral-150"}`}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Poder de Persuasão</span>
                          <span className={`font-semibold font-mono text-sm ${theme === 'dark' ? "text-white" : "text-neutral-900"}`}>{writingFeedback.persuasivenessScore}%</span>
                        </div>
                        <div className={`w-full h-1 rounded-full overflow-hidden ${theme === 'dark' ? "bg-neutral-800" : "bg-neutral-200"}`}>
                          <div className="bg-emerald-600 h-full" style={{ width: `${writingFeedback.persuasivenessScore}%` }} />
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Redundancy replacements lists */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Otimização de Termos e Concisão</h4>
                        {writingFeedback.redundancies.length === 0 ? (
                          <div className={`flex items-center gap-2.5 text-xs p-4 rounded-xl border ${theme === 'dark' ? "bg-green-950/20 border-green-900/30 text-green-350" : "bg-green-50/50 border-green-100 text-green-700"}`}>
                            <CheckCircle2 className="w-4.5 h-4.5 text-green-600 text-sm" />
                            Excelente! Prosa altamente executiva e sem redundâncias desnecessárias detectadas.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {writingFeedback.redundancies.map((red, i) => (
                              <div key={i} className={`p-3.5 border rounded-xl space-y-1 text-xs ${
                                theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-white border-neutral-150"
                              }`}>
                                <p className="text-neutral-400 font-semibold font-mono line-through">"{red.original}"</p>
                                <p className="text-emerald-500 font-bold">→ "{red.replacement}"</p>
                                <p className={`font-sans italic mt-1 leading-relaxed ${theme === 'dark' ? "text-neutral-300" : "text-neutral-500"}`}>Dica: {red.why}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className={`p-4 rounded-xl border text-xs leading-relaxed font-sans ${
                          theme === 'dark' ? "bg-[#0e1117] border-[#242936] text-neutral-300" : "bg-neutral-50 border-neutral-150 text-neutral-500"
                        }`}>
                          <strong>Avaliação do Professor de Negócios:</strong> {writingFeedback.coachingCommentary}
                        </div>
                      </div>

                      {/* Power rewrite representation skeleton */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Versão Sugerida Polida por IA</h4>
                        <div className={`border rounded-xl p-4 space-y-2 text-xs ${theme === 'dark' ? "bg-[#0e1117] border-[#242936]" : "bg-white border-neutral-150"}`}>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Documento Fluido Proposto</p>
                          <textarea
                            readOnly
                            value={writingFeedback.suggestedRewrite}
                            className={`w-full text-xs p-3 rounded-lg border min-h-[170px] font-mono leading-relaxed focus:outline-none ${
                              theme === 'dark' ? "bg-[#161a24] border-[#242936] text-neutral-250" : "bg-neutral-50 border-neutral-100 text-neutral-700"
                            }`}
                          />
                          <p className="text-[10px] text-neutral-400 font-sans italic pt-1 leading-normal">
                            Esta versão otimizada com engenharia verbal melhora o engajamento e a clareza da mensagem corporativa.
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
