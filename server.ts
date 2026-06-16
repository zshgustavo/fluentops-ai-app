import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialization of Gemini API client to prevent startup crash if API key is missing
let aiInstance: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please load it in Settings > Secrets.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. LESSON PLAN GENERATION ENDPOINT
app.post("/api/lesson-plan/daily", async (req, res) => {
  try {
    const { profile, completedLessons, performanceStats } = req.body;
    
    const ai = getGemini();
    const systemPrompt = `You are an expert English language trainer specializing in business English and executive coaching.
Generate a highly targeted daily personalized lesson plan for an adult intermediate learner whose native language is Brazilian Portuguese.
Output your response strictly in JSON format as defined by the structural schema.
CRITICAL LOCALIZATION REQUIREMENT: All explanations, corporate definitions, context tips, title fields, situations, and descriptions MUST be generated in Portuguese (Brazilian Portuguese). However, the target English elements (such as the actual 'wordOfDay.word', 'wordOfDay.sampleSentence', 'miniLesson.goodAlternative', 'miniLesson.poorAlternative', 'writingTask.templateText', 'speakingKeyPhrases.[].phrase', 'videoCallScenario.firstLine') must remain in English so the user can study business English.`;

    const userPrompt = `Generate today's personalized business English lesson plan. 
User Professional Field: ${profile?.industry || "General Corporate/Business"}
Current Skill Gaps/Interests: ${profile?.focusArea || "Negotiation, Pitching, Email Writing"}
Completed Lessons so far: ${JSON.stringify(completedLessons || [])}
Current user performance metrics: ${JSON.stringify(performanceStats || {})}

Provide:
1. Word of the Day (high-level executive/idiomatic vocabulary).
2. Mini-lessons on structural professional communication (e.g. diplomatically disagreeing, polite pushback).
3. Email / Proposal template to study and modify.
4. Target key phrases to practice in oral/written exercise today.
5. Simulated video call escenario brief.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["wordOfDay", "miniLesson", "writingTask", "speakingKeyPhrases", "videoCallScenario"],
          properties: {
            wordOfDay: {
              type: Type.OBJECT,
              required: ["word", "partOfSpeech", "corporateDefinition", "sampleSentence", "businessContextTip"],
              properties: {
                word: { type: Type.STRING },
                partOfSpeech: { type: Type.STRING },
                corporateDefinition: { type: Type.STRING },
                sampleSentence: { type: Type.STRING },
                businessContextTip: { type: Type.STRING }
              }
            },
            miniLesson: {
              type: Type.OBJECT,
              required: ["title", "explanation", "goodAlternative", "poorAlternative", "explanationAlternative"],
              properties: {
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                goodAlternative: { type: Type.STRING },
                poorAlternative: { type: Type.STRING },
                explanationAlternative: { type: Type.STRING }
              }
            },
            writingTask: {
              type: Type.OBJECT,
              required: ["title", "scenario", "context", "templateText", "keywordsExpected"],
              properties: {
                title: { type: Type.STRING },
                scenario: { type: Type.STRING },
                context: { type: Type.STRING },
                templateText: { type: Type.STRING },
                keywordsExpected: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            },
            speakingKeyPhrases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["phrase", "situation", "toneExplanation"],
                properties: {
                  phrase: { type: Type.STRING },
                  situation: { type: Type.STRING },
                  toneExplanation: { type: Type.STRING }
                }
              }
            },
            videoCallScenario: {
              type: Type.OBJECT,
              required: ["partnerName", "partnerRole", "scenarioTitle", "situationDescription", "firstLine"],
              properties: {
                partnerName: { type: Type.STRING },
                partnerRole: { type: Type.STRING },
                scenarioTitle: { type: Type.STRING },
                situationDescription: { type: Type.STRING },
                firstLine: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota exceeded")) {
      console.warn("API Quota Exceeded during lesson generation. Returning 429 to trigger offline fallback.");
      return res.status(429).json({ error: "Gemini API Quota Exceeded." });
    }
    console.error("Lesson generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. PRONUNCIATION, GRAMMAR & TONE ANALYSIS ENDPOINT
app.post("/api/analyze/feedback", async (req, res) => {
  try {
    const { originalText, transcribedText, context } = req.body;
    
    const ai = getGemini();
    const systemPrompt = `You are an AI-driven professional speech and communication auditor for native Brazilian Portuguese speakers. 
You analyze spoken transcriptions against their original targets, evaluate pronunciation approximations, identify grammar flaws register issues, and perform comprehensive tone analysis.
Focus on corporate English appropriateness (diplomacy, confidence, clarity). Output strictly in JSON.
CRITICAL LOCALIZATION REQUIREMENT: To support learning, all feedback metrics descriptions, tone analysis feedbackText, grammar explanation, issues explanations, and direct coachingInsight MUST be written in Portuguese (Brazilian Portuguese). Any specific target phrase comparison to correct should refer to the English keywords but explain the reason or correction process in Portuguese.`;

    const userPrompt = `Analyze the following oral speaking practice:
Desired phrase/target (if any): "${originalText || ""}"
Transcribed text from speech-to-text: "${transcribedText}"
Exercise Context / Speaking situation: "${context || "General corporate communication"}"

Evaluate:
1. Pronunciation / phonetic accuracy: Find discrepancies between target and transcription. Let's see if there are missing particles or mispronounced words.
2. Grammar and register: Identify improvements for executive speech patterns.
3. Tone & Vibe metrics: Score on Confidence, Executive Presence, Diplomacy, Clutter Words.
4. Specific actionable tips to improve pronunciation flow and pacing.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["pronunScore", "pronunciationIssues", "grammarFeedback", "toneAnalysis", "overallScore", "coachingInsight"],
          properties: {
            overallScore: { type: Type.INTEGER, description: "Composite level 0 to 100" },
            pronunScore: { type: Type.INTEGER, description: "Phonetic matching rate 0 to 100" },
            pronunciationIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["word", "issue", "correctionTip"],
                properties: {
                  word: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  correctionTip: { type: Type.STRING }
                }
              }
            },
            grammarFeedback: {
              type: Type.OBJECT,
              required: ["flaws", "improvedVersion", "grammarExplanation"],
              properties: {
                flaws: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvedVersion: { type: Type.STRING },
                grammarExplanation: { type: Type.STRING }
              }
            },
            toneAnalysis: {
              type: Type.OBJECT,
              required: ["primaryTone", "confidenceScore", "diplomacyScore", "vocabularyRichness", "clutterWordsUsage", "feedbackText"],
              properties: {
                primaryTone: { type: Type.STRING, description: "e.g. Confident, Too Assertive, Hesitant, Diplomatic" },
                confidenceScore: { type: Type.INTEGER },
                diplomacyScore: { type: Type.INTEGER },
                vocabularyRichness: { type: Type.STRING },
                clutterWordsUsage: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. 'like', 'um', 'actually'" },
                feedbackText: { type: Type.STRING }
              }
            },
            coachingInsight: { type: Type.STRING }
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota exceeded")) {
      console.warn("API Quota Exceeded during feedback analysis. Returning 429 to trigger offline fallback.");
      return res.status(429).json({ error: "Gemini API Quota Exceeded." });
    }
    console.error("Feedback analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. SIMULATED VIDEO CALL INTERACTIVE ENDPOINT
app.post("/api/video-call/response", async (req, res) => {
  try {
    const { scenario, history, userTranscript } = req.body;
    
    const ai = getGemini();
    const systemPrompt = `You are simulating a real video call conversation in a business environment.
Roleplay as the specified partner role: ${scenario?.partnerRole || "Interviewer / Executive"}.
Name: ${scenario?.partnerName || "Sarah"}.
Scenario: ${scenario?.scenarioTitle || "Salary Negotiation"}.
Situation details: ${scenario?.situationDescription || "General business interview"}.

Keep the conversation fluid, conversational, and intermediate-to-advanced level.
Generate your roleplay reply, keep it short (max 3 sentences) to maintain real-world pace.
Also analyze the user's latest response for key vocabulary, grammar, and pronunciation hint.
Output strictly in JSON.
CRITICAL LOCALIZATION REQUIREMENT: The video partner's dialogue (responseText) and speaking recommendations (suggestedPhrases) must remain in professional English, but the coaching feedback fields (toneObserved, grammarCorrection, vocabularyUpgrade) must be written in Portuguese (Brazilian Portuguese) for a native speaker.`;

    const userPrompt = `Here is the conversation history:
${(history || []).map((h: any) => `${h.speaker}: ${h.text}`).join("\n")}

User just said: "${userTranscript}"

Respond to the user as your persona. Evaluate their reply silently to populate the feedback fields.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["responseText", "partnerEmote", "suggestedPhrases", "feedbackOnUserTurn"],
          properties: {
            responseText: { type: Type.STRING, description: "Your spoken response in the meeting" },
            partnerEmote: { type: Type.STRING, description: "Emote or gesture, e.g. smiling, nodding, looking thoughtful, listening, typing" },
            suggestedPhrases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 high-impact business phrases the user could have used here instead."
            },
            feedbackOnUserTurn: {
              type: Type.OBJECT,
              required: ["rating", "toneObserved", "grammarCorrection", "vocabularyUpgrade"],
              properties: {
                rating: { type: Type.STRING, description: "e.g. Excellent, Professional, Needs polish" },
                toneObserved: { type: Type.STRING, description: "e.g. Accommodating, Assertive, Hesitant" },
                grammarCorrection: { type: Type.STRING, description: "Optional quick tip or correction" },
                vocabularyUpgrade: { type: Type.STRING, description: "Alternative advanced word suggestion" }
              }
            }
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota exceeded")) {
      console.warn("API Quota Exceeded during video call simulation. Returning 429 to trigger offline fallback.");
      return res.status(429).json({ error: "Gemini API Quota Exceeded." });
    }
    console.error("Video call simulation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. EMAIL / PROPOSAL WRITING FEEDBACK ENDPOINT
app.post("/api/analyze/writing", async (req, res) => {
  try {
    const { scenario, draftText } = req.body;
    
    const ai = getGemini();
    const systemPrompt = `You are a corporate communication coach for native Brazilian Portuguese speakers.
Analyze business emails, pitch letters, and proposals. Focus on professional vocabulary alignment, brevity, power verbs, and diplomacy.
Output your evaluation metrics strictly in JSON.
CRITICAL LOCALIZATION REQUIREMENT: While the target 'suggestedRewrite' must be provided in polished, high-impact business English, all evaluations, redundancies analyses, reasons ('redundancies.[].why'), and 'coachingCommentary' must be written in Portuguese (Brazilian Portuguese).`;

    const userPrompt = `Writing Exercise Scenario: ${scenario?.title || "Drafting a Project Proposal Pitch"}
Required Focus Area: ${scenario?.context || "Persuasive yet diplomatic email requesting resources"}
User Draft:
"${draftText}"

Analyze this draft. Provide highly specific feedback on phrasing, professional standards compliance, and tone metrics.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["clarityScore", "diplomacyScore", "persuasivenessScore", "redundancies", "suggestedRewrite", "coachingCommentary"],
          properties: {
            clarityScore: { type: Type.INTEGER, description: "0 to 100" },
            diplomacyScore: { type: Type.INTEGER, description: "0 to 100" },
            persuasivenessScore: { type: Type.INTEGER, description: "0 to 100" },
            redundancies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["original", "replacement", "why"],
                properties: {
                  original: { type: Type.STRING },
                  replacement: { type: Type.STRING },
                  why: { type: Type.STRING }
                }
              },
              description: "Clunky corporate phrases to replace with streamlined direct/rich business vocab."
            },
            commonGrammarErrors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["errorType", "description", "example", "correction"],
                properties: {
                  errorType: { type: Type.STRING, description: "Type of grammatical error (e.g. Agreement, Tense, Prepositions)" },
                  description: { type: Type.STRING, description: "Explanation of the rule in Portuguese" },
                  example: { type: Type.STRING, description: "The incorrect snippet from the user's text" },
                  correction: { type: Type.STRING, description: "The corrected snippet" }
                }
              },
              description: "Top 3 most common grammatical errors in the user's draft."
            },
            suggestedRewrite: { type: Type.STRING, description: "Power rewrite incorporating premium business vocabulary" },
            coachingCommentary: { type: Type.STRING, description: "Direct coaching on register, style, and vocabulary" }
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota exceeded")) {
      console.warn("API Quota Exceeded during writing analysis. Returning 429 to trigger offline fallback.");
      return res.status(429).json({ error: "Gemini API Quota Exceeded." });
    }
    console.error("Writing feedback error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API health/status route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Vite middleware / Dist routing
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server and Vite routing listening on hmr-disabled port ${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Vite/Express initialization failed:", err);
});
