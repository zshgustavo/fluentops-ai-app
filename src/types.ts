/**
 * Types & Interfaces for Business English & Professional Communication Coach
 */

export interface UserProfile {
  name: string;
  industry: string;
  focusArea: string;
  dailyGoalMinutes: number;
}

export interface MetricTrendPoint {
  date: string;
  pronunciation: number;
  fluency: number;
  grammar: number;
  diplomacy: number;
}

export interface PerformanceStats {
  lessonsCompleted: number;
  vocabularyAcquired: number;
  speakingTimeMinutes: number;
  streakDays: number;
  pronunciationScore: number;
  fluencyScore: number;
  diplomacyScore: number;
  grammarScore: number;
  metricTrend: MetricTrendPoint[];
}

export interface WordOfTheDay {
  word: string;
  partOfSpeech: string;
  corporateDefinition: string;
  sampleSentence: string;
  businessContextTip: string;
}

export interface MiniLesson {
  title: string;
  explanation: string;
  goodAlternative: string;
  poorAlternative: string;
  explanationAlternative: string;
}

export interface WritingTask {
  title: string;
  scenario: string;
  context: string;
  templateText: string;
  keywordsExpected: string[];
}

export interface SpeakingKeyPhrase {
  phrase: string;
  situation: string;
  toneExplanation: string;
}

export interface VideoCallScenario {
  partnerName: string;
  partnerRole: string;
  scenarioTitle: string;
  situationDescription: string;
  firstLine: string;
}

export interface LessonPlan {
  id: string;
  date: string;
  wordOfDay: WordOfTheDay;
  miniLesson: MiniLesson;
  writingTask: WritingTask;
  speakingKeyPhrases: SpeakingKeyPhrase[];
  videoCallScenario: VideoCallScenario;
}

export interface CompletedLesson {
  id: string;
  date: string;
  type: "vocabulary" | "writing" | "speaking" | "videocall";
  title: string;
  score: number;
}

export interface CallMessage {
  id: string;
  speaker: "partner" | "user";
  text: string;
  emote?: string;
  suggestedPhrases?: string[];
  feedback?: {
    rating: string;
    toneObserved: string;
    grammarCorrection?: string;
    vocabularyUpgrade?: string;
  };
}

export interface WritingFeedback {
  clarityScore: number;
  diplomacyScore: number;
  persuasivenessScore: number;
  redundancies: {
    original: string;
    replacement: string;
    why: string;
  }[];
  suggestedRewrite: string;
  coachingCommentary: string;
  commonGrammarErrors?: {
    errorType: string;
    description: string;
    example: string;
    correction: string;
  }[];
}

export interface OralFeedback {
  overallScore: number;
  pronScore?: number;
  pronunciationIssues: {
    word: string;
    issue: string;
    correctionTip: string;
  }[];
  grammarFeedback: {
    flaws: string[];
    improvedVersion: string;
    grammarExplanation: string;
  };
  toneAnalysis: {
    primaryTone: string;
    confidenceScore: number;
    diplomacyScore: number;
    vocabularyRichness: string;
    clutterWordsUsage: string[];
    feedbackText: string;
  };
  coachingInsight: string;
}
