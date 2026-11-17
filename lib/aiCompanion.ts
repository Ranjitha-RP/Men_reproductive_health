import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

export interface ConsentFilteredContext {
  compositeScore: number;
  overallLevel: string;
  hasAcuteRedFlag: boolean;
  redFlagReasons: string[];
  pillarScores: {
    lifestyle: number;
    metabolic: number;
    anatomical: number;
    infectious: number;
  };
  consentedDomains: string[];
  factorTitles: string[];
  patientGoal?: string;
}

const PRIMARY_MODEL = "gemini-4-hydrogen";
const FALLBACK_MODEL = "gemini-3.1-flash-lite";

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function buildSafetySystemInstruction(
  lang: "en" | "ar",
  ctx: ConsentFilteredContext
): string {
  const isAr = lang === "ar";
  const langInstruction = isAr
    ? "Respond strictly in clear, warm, culturally respectful Arabic (العربية) suitable for a patient."
    : "Respond strictly in clear, calm, plain English suitable for a non-medical patient.";

  const domainNote =
    ctx.consentedDomains.length > 0
      ? `The patient consented to share these clinical domains with you (Zero PII): ${ctx.consentedDomains.join(", ")}.`
      : "The patient has restricted detailed clinical domain sharing; speak in helpful general preventive terms based only on their composite tier.";

  const redFlagRule = ctx.hasAcuteRedFlag
    ? "CRITICAL SAFETY OVERRIDE: Acute red-flag symptoms are active (" +
      ctx.redFlagReasons.join("; ") +
      "). You MUST prioritize advising immediate in-person emergency evaluation (e.g., to rule out time-sensitive conditions like testicular torsion) before any routine lifestyle tips."
    : "No acute emergency red flags are active.";

  return [
    "You are Aegis Companion, a calm, empathetic, culturally sensitive Men's Reproductive Health educational AI guide.",
    langInstruction,
    "Rules:",
    "1. You are an educational pre-screening companion, NOT a doctor and NOT giving a medical diagnosis.",
    "2. Explain numbers and risk factors in simple everyday language without scary jargon or blame.",
    "3. Suggest only safe, evidence-aligned preventive lifestyle steps and appropriate clinical follow-up questions.",
    "4. Respect privacy: never ask for or expect full name, phone number, address, or identity details.",
    domainNote,
    redFlagRule,
  ].join("\n");
}

function isTransientError(err: unknown): boolean {
  const raw = (
    err instanceof Error ? err.message : String(err || "")
  ).toLowerCase();
  return (
    raw.includes("503") ||
    raw.includes("unavailable") ||
    raw.includes("high demand") ||
    raw.includes("429") ||
    raw.includes("resource_exhausted") ||
    raw.includes("econnreset") ||
    raw.includes("primary_model_timeout")
  );
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (val) => {
        clearTimeout(id);
        resolve(val);
      },
      (err) => {
        clearTimeout(id);
        reject(err);
      }
    );
  });
}

async function generateWithModelFallback<T>(
  runner: (model: string, useThinkingLow: boolean) => Promise<T>
): Promise<T> {
  try {
    return await withTimeout(
      runner(PRIMARY_MODEL, true),
      8000,
      "PRIMARY_MODEL_TIMEOUT"
    );
  } catch (err) {
    if (!isTransientError(err)) {
      throw err;
    }
    await new Promise((r) => setTimeout(r, 300));
    try {
      return await withTimeout(
        runner(FALLBACK_MODEL, false),
        14000,
        "FALLBACK_MODEL_TIMEOUT"
      );
    } catch (fallbackErr) {
      if (isTransientError(fallbackErr)) {
        await new Promise((r) => setTimeout(r, 500));
        return await withTimeout(
          runner(FALLBACK_MODEL, false),
          14000,
          "FALLBACK_MODEL_TIMEOUT"
        );
      }
      throw fallbackErr;
    }
  }
}

export function extractApiErrorMessage(err: unknown): {
  status: number;
  message: string;
} {
  if (!process.env.GEMINI_API_KEY) {
    return {
      status: 503,
      message:
        "Gemini API key is not configured on the server. Add GEMINI_API_KEY in your environment variables.",
    };
  }
  const raw =
    err instanceof Error ? err.message : String(err || "AI request failed");
  let cleanMessage = raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      cleanMessage = String(parsed.error.message);
    }
  } catch {
    // Keep raw message
  }

  const lower = cleanMessage.toLowerCase();
  if (
    lower.includes("403") ||
    lower.includes("permission_denied") ||
    lower.includes("api_key_invalid")
  ) {
    return {
      status: 403,
      message:
        "Gemini API key was rejected. Please verify GEMINI_API_KEY in environment variables.",
    };
  }
  if (lower.includes("429") || lower.includes("resource_exhausted")) {
    return {
      status: 429,
      message:
        "AI companion rate limit reached temporarily. Please wait a few seconds and retry.",
    };
  }
  if (
    lower.includes("503") ||
    lower.includes("unavailable") ||
    lower.includes("high demand") ||
    lower.includes("timeout")
  ) {
    return {
      status: 503,
      message:
        "The AI service is temporarily busy due to high demand. Please click retry in a moment.",
    };
  }
  return {
    status: 500,
    message: cleanMessage || "Unable to reach the AI Health Companion right now.",
  };
}

export async function runExplainCompanion(
  lang: "en" | "ar",
  context: ConsentFilteredContext
) {
  const ai = getGeminiClient();
  const prompt = [
    `Patient Screening Summary (Zero-PII, Consent-Filtered):`,
    `- Composite Risk Index: ${context.compositeScore}/100 (${context.overallLevel.toUpperCase()} tier)`,
    `- Pillar Scores (0-100): Lifestyle=${context.pillarScores.lifestyle}, Metabolic=${context.pillarScores.metabolic}, Anatomical=${context.pillarScores.anatomical}, Infectious=${context.pillarScores.infectious}`,
    `- Consented Factors: ${context.factorTitles.length > 0 ? context.factorTitles.join(" | ") : "No elevated risk flags in consented domains"}`,
    `- Care Goal: ${context.patientGoal || "Proactive reproductive wellness"}`,
    `- Acute Red Flags Active: ${context.hasAcuteRedFlag ? "YES — " + context.redFlagReasons.join("; ") : "No"}`,
    ``,
    `Provide a structured, reassuring, plain-language explanation tailored specifically to these numbers.`,
  ].join("\n");

  const response = await generateWithModelFallback((model, useThinkingLow) =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: buildSafetySystemInstruction(lang, context),
        ...(useThinkingLow
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plainLanguageSummary: {
              type: Type.STRING,
              description:
                "A warm, 2-3 sentence plain-language explanation of what this risk score means for the user.",
            },
            keyDrivers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "2 to 4 simple bullet points explaining the main factors behind the score.",
            },
            safeNextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "3 safe, actionable next steps tailored to the user's score and lifestyle/clinical needs.",
            },
            questionsToAskDoctor: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "2 to 3 concise, helpful questions the user can ask their specialist during consultation.",
            },
            safetyNote: {
              type: Type.STRING,
              description:
                "A 1-sentence calm safety reminder clarifying this is educational screening, or urgent ER warning if red flags exist.",
            },
          },
          required: [
            "plainLanguageSummary",
            "keyDrivers",
            "safeNextSteps",
            "questionsToAskDoctor",
            "safetyNote",
          ],
        },
      },
    })
  );

  return JSON.parse((response.text ?? "{}").trim());
}

export async function runChatCompanion(params: {
  lang: "en" | "ar";
  message: string;
  history?: { role: "user" | "assistant"; text: string }[];
  context: ConsentFilteredContext;
}) {
  const ai = getGeminiClient();
  const { lang, message, history = [], context } = params;

  const transcript = history
    .slice(-6)
    .map(
      (m) =>
        `${m.role === "user" ? "User" : "Aegis Companion"}: ${m.text}`
    )
    .join("\n");

  const prompt = [
    `Consent-Filtered Screening Snapshot: Score=${context.compositeScore}/100 (${context.overallLevel}), Pillars=[Lifestyle:${context.pillarScores.lifestyle}, Metabolic:${context.pillarScores.metabolic}, Anatomical:${context.pillarScores.anatomical}, Infectious:${context.pillarScores.infectious}], Factors=[${context.factorTitles.join("; ") || "None"}], AcuteRedFlag=${context.hasAcuteRedFlag}.`,
    transcript ? `Recent conversation:\n${transcript}` : "",
    `User's follow-up question: ${message.trim()}`,
    `Answer clearly and concisely in 3-5 sentences or short bullets, giving safe, practical guidance tailored to their numbers. Remind them to discuss specifics with a clinician when appropriate.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await generateWithModelFallback((model, useThinkingLow) =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: buildSafetySystemInstruction(lang, context),
        ...(useThinkingLow
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
      },
    })
  );

  return (response.text ?? "").trim();
}
