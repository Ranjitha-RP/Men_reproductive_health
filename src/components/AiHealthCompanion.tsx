"use client";

import React, { useMemo, useState } from "react";
import {
  Bot,
  Send,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import {
  AiChatMessage,
  AiExplanationResult,
  ConsentMatrix,
  Language,
  RiskReport,
} from "../types/clinical";

interface AiHealthCompanionProps {
  lang: Language;
  report: RiskReport;
  consent: ConsentMatrix;
  patientGoal?: string;
  onProceedToReferral: (prefillNote?: string) => void;
}

export const AiHealthCompanion: React.FC<AiHealthCompanionProps> = ({
  lang,
  report,
  consent,
  patientGoal,
  onProceedToReferral,
}) => {
  const isAr = lang === "ar";

  const [explanation, setExplanation] = useState<AiExplanationResult | null>(
    null
  );
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Build strict Zero-PII consent-filtered payload for Gemini
  const consentPayload = useMemo(() => {
    const consentedDomains: string[] = [];
    if (consent.shareLifestyle) consentedDomains.push("Lifestyle & Heat");
    if (consent.shareMetabolic) consentedDomains.push("Metabolic & Endocrine");
    if (consent.shareAnatomical) consentedDomains.push("Anatomical Symptoms");
    if (consent.shareInfectious) consentedDomains.push("Infectious History");
    if (consent.shareBiomarkers) consentedDomains.push("Lab Biomarkers");

    const allowedPillars = new Set<string>();
    if (consent.shareLifestyle) allowedPillars.add("lifestyle");
    if (consent.shareMetabolic) allowedPillars.add("metabolic");
    if (consent.shareAnatomical) allowedPillars.add("anatomical");
    if (consent.shareInfectious) allowedPillars.add("infectious");
    if (consent.shareBiomarkers) allowedPillars.add("biomarker");

    const filteredFactorTitles = report.factors
      .filter((f) => allowedPillars.has(f.pillar))
      .map((f) => f.title);

    return {
      compositeScore: report.compositeScore,
      overallLevel: report.overallLevel,
      hasAcuteRedFlag: report.hasAcuteRedFlag,
      redFlagReasons: report.redFlagReasons,
      pillarScores: {
        lifestyle: consent.shareLifestyle ? report.pillarScores.lifestyle : 0,
        metabolic: consent.shareMetabolic ? report.pillarScores.metabolic : 0,
        anatomical: consent.shareAnatomical
          ? report.pillarScores.anatomical
          : 0,
        infectious: consent.shareInfectious
          ? report.pillarScores.infectious
          : 0,
      },
      consentedDomains,
      factorTitles: filteredFactorTitles,
      patientGoal: patientGoal || "Proactive reproductive wellness",
    };
  }, [report, consent, patientGoal]);

  async function safeParseApiResponse(res: Response): Promise<Record<string, unknown>> {
    const rawText = await res.text();
    const trimmed = rawText.trim();
    if (trimmed.startsWith("<")) {
      throw new Error(
        isAr
          ? "خدمة الذكاء الاصطناعي الخلفية غير نشطة على هذا الرابط (تأكد من النشر كـ Web Service وليس Static Site)."
          : "AI backend route is not active on this host (returned HTML instead of JSON). Ensure the Node server is running (Render Web Service with npm start)."
      );
    }
    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      throw new Error(
        isAr
          ? "استجابة غير صالحة من الخادم. يرجى المحاولة مرة أخرى."
          : "Unexpected non-JSON response from AI server. Please try again."
      );
    }
  }

  const handleGenerateExplanation = async () => {
    setIsExplaining(true);
    setExplainError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          lang,
          context: consentPayload,
        }),
      });
      const data = await safeParseApiResponse(res);
      if (!res.ok) {
        throw new Error(String(data.error || "Unable to reach AI Companion."));
      }
      setExplanation(data as unknown as AiExplanationResult);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setExplainError(
          isAr
            ? "انتهت مهلة الاتصال بالمرافق الذكي. يرجى المحاولة مجدداً."
            : "AI Companion timed out while waiting for the server. Please retry."
        );
      } else {
        setExplainError(
          err instanceof Error
            ? err.message
            : "Unable to generate AI explanation right now."
        );
      }
    } finally {
      clearTimeout(timer);
      setIsExplaining(false);
    }
  };

  const handleSendFollowUp = async (questionOverride?: string) => {
    const query = (questionOverride ?? chatInput).trim();
    if (!query || isChatLoading) return;

    const userMsg: AiChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!questionOverride) setChatInput("");
    setChatError(null);
    setIsChatLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          lang,
          message: query,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          context: consentPayload,
        }),
      });
      const data = await safeParseApiResponse(res);
      if (!res.ok) {
        throw new Error(String(data.error || "AI Companion chat failed."));
      }

      const aiMsg: AiChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: String(data.reply || ""),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setChatError(
          isAr
            ? "انتهت مهلة الانتظار. يرجى إعادة إرسال سؤالك."
            : "Request timed out. Please send your question again."
        );
      } else {
        setChatError(
          err instanceof Error
            ? err.message
            : "Could not get a reply from the AI Companion."
        );
      }
    } finally {
      clearTimeout(timer);
      setIsChatLoading(false);
    }
  };

  const suggestedPrompts = isAr
    ? [
        "ماذا تعني هذه النتيجة بلغة بسيطة؟",
        "هل يمكن أن تنخفض المخاطر خلال 90 يوماً بتغيير العادات؟",
        "ما الفحوصات التي يُفضل أن أسأل الطبيب عنها؟",
        "ما الخطوة الأكثر أماناً لي اليوم؟",
      ]
    : [
        "What does my risk score mean in simple words?",
        "Can 90 days of habit changes lower my score?",
        "What tests should I ask my doctor about?",
        "What is the safest next step for me today?",
      ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-sky-300" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-[#1B5683]">
                {isAr
                  ? "المرافق الصحي الذكي"
                  : "AI Health Companion"}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#059669] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isAr
                  ? "تحليل خالٍ من الهوية الشخصية حسب موافقتك"
                  : "Zero-PII · Consent-Filtered"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
              {isAr
                ? "فهم نتيجتك بلغة بسيطة والخطوات الآمنة التالية"
                : "Plain-Language Result Guide & Follow-Up Q&A"}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? `يقرأ المساعد الذكي المجالات التي سمحت بمشاركتها فقط (${consentPayload.consentedDomains.length} من 5) دون إرسال اسمك أو هاتفك.`
                : `Reads only the ${consentPayload.consentedDomains.length} of 5 health areas you allowed in Privacy Controls—never your name, phone, or email.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateExplanation}
          disabled={isExplaining}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1B5683] text-white text-xs sm:text-sm font-semibold hover:bg-[#154468] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start lg:self-auto"
        >
          <RefreshCw
            className={`w-4 h-4 ${isExplaining ? "animate-spin" : ""}`}
          />
          <span>
            {isExplaining
              ? isAr
                ? "جارٍ تبسيط النتيجة..."
                : "Explaining Result..."
              : explanation
              ? isAr
                ? "تحديث الشرح الذكي"
                : "Refresh AI Explanation"
              : isAr
              ? "اشرح نتيجتي بلغة بسيطة"
              : "Explain My Result in Simple Words"}
          </span>
        </button>
      </div>

      {/* Error State (transparent, never masks errors with fake text) */}
      {explainError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-xs text-red-900">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              {isAr
                ? "تعذر الاتصال بالمرافق الذكي"
                : "AI Companion Unavailable"}
            </p>
            <p>{explainError}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isExplaining && !explanation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-32 bg-slate-100 rounded-xl" />
          <div className="h-32 bg-slate-100 rounded-xl" />
        </div>
      )}

      {/* Empty Prompt State before user clicks Explain */}
      {!explanation && !isExplaining && (
        <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {isAr
                ? "هل تريد ملخصاً سهلاً لدرجتك الحالية والخطوات الآمنة المناسبة لك؟"
                : "Want a clear, everyday explanation of your current score?"}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? "اضغط على «اشرح نتيجتي بلغة بسيطة» ليقوم المساعد الذكي بتوضيح العوامل الرئيسية واقتراح أسئلة جاهزة للطبيب."
                : "Click “Explain My Result in Simple Words” above or ask any follow-up question below."}
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-slate-500 whitespace-nowrap shrink-0">
            {isAr ? "المؤشر الحالي:" : "Current Index:"}{" "}
            <strong className="text-slate-900">{report.compositeScore}/100</strong>
          </span>
        </div>
      )}

      {/* Structured AI Plain-Language Output */}
      {explanation && (
        <div className="space-y-5">
          <div className="bg-[#F3F6FA] border border-[#1B5683]/20 rounded-xl p-5 space-y-2">
            <span className="text-xs font-semibold text-[#1B5683]">
              {isAr ? "ملخص مبسط لحالتك" : "Your Result in Plain Language"}
            </span>
            <p className="text-sm text-slate-800 leading-relaxed">
              {explanation.plainLanguageSummary}
            </p>
            <p className="text-xs text-slate-600 pt-1">
              {explanation.safetyNote}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Key Drivers */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900">
                {isAr ? "أهم العوامل المؤثرة في درجتك" : "What Is Driving This Score"}
              </h4>
              <ul className="space-y-2">
                {explanation.keyDrivers.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                  >
                    <span className="font-mono-tabular font-semibold text-[#1B5683]">
                      0{idx + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safe Tailored Next Steps */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900">
                {isAr ? "الخطوات الآمنة المقترحة لك" : "Safe Tailored Next Steps"}
              </h4>
              <ul className="space-y-2">
                {explanation.safeNextSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Questions to Carry Straight to the Doctor Referral */}
          {explanation.questionsToAskDoctor.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#1B5683]" />
                  {isAr
                    ? "أسئلة مقترحة يمكنك إرفاقها لطبيبك:"
                    : "Questions You Can Send With Your Specialist Referral:"}
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {explanation.questionsToAskDoctor.map((q, i) => (
                    <li key={i}>• {q}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() =>
                  onProceedToReferral(
                    explanation.questionsToAskDoctor.join(" | ")
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
              >
                <span>
                  {isAr
                    ? "أرفق هذه الأسئلة وأرسل للطبيب"
                    : "Carry Questions to Doctor Referral"}
                </span>
                {isAr ? (
                  <ArrowLeft className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Follow-Up Q&A Chat */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#1B5683]" />
            {isAr
              ? "اسأل المرافق الذكي أي سؤال متابعة"
              : "Ask a Follow-Up Question"}
          </span>
          <span className="text-[11px] text-slate-500">
            {isAr
              ? "إجابات مخصصة لنتيجتك بدون تشخيص طبي"
              : "Tailored educational answers grounded in your consented screening"}
          </span>
        </div>

        {/* 1-Click Suggested Follow-up Buttons */}
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isChatLoading}
              onClick={() => handleSendFollowUp(promptText)}
              className="px-3 py-1.5 rounded-lg bg-[#F3F6FA] border border-slate-200 text-xs font-medium text-slate-700 hover:border-[#1B5683] hover:text-[#1B5683] transition-colors cursor-pointer text-start"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Conversation Feed */}
        {messages.length > 0 && (
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 space-y-3 max-h-72 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-[#1B5683] text-white"
                      : "bg-white border border-slate-200 text-slate-800"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-mono-tabular">
                  {msg.role === "user"
                    ? isAr
                      ? "أنت"
                      : "You"
                    : isAr
                    ? "المرافق الذكي"
                    : "Aegis Companion"}{" "}
                  · {msg.timestamp}
                </span>
              </div>
            ))}
            {isChatLoading && (
              <div className="text-xs text-slate-500 italic">
                {isAr ? "المرافق الذكي يكتب الإجابة..." : "Aegis Companion is thinking..."}
              </div>
            )}
          </div>
        )}

        {chatError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{chatError}</span>
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendFollowUp();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={
              isAr
                ? "اكتب سؤالك هنا (مثلاً: هل الجلوس الطويل يؤثر على النتيجة؟)..."
                : "Ask anything about your score, lifestyle habits, or specialist visit..."
            }
            className="flex-1 px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
          />
          <button
            type="submit"
            disabled={isChatLoading || !chatInput.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? "إرسال" : "Ask AI"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
