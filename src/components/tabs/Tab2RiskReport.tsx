"use client";

import React from "react";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { Language, RiskReport } from "../../types/clinical";

interface Tab2RiskReportProps {
  lang: Language;
  report: RiskReport;
  onProceedToTriage: () => void;
}

export const Tab2RiskReport: React.FC<Tab2RiskReportProps> = ({
  lang,
  report,
  onProceedToTriage,
}) => {
  const isAr = lang === "ar";

  const statusMeta = {
    low: {
      label: isAr ? "مخاطر منخفضة · جاهزية وقائية مطمئنة" : "Low Risk · Optimal Preventive Readiness",
      bg: "bg-emerald-50/80 border-emerald-200",
      accentText: "text-[#059669]",
      barColor: "bg-[#059669]",
      Icon: CheckCircle2,
    },
    moderate: {
      label: isAr
        ? "مخاطر متوسطة · عوامل قابلة للتعديل والتحسين"
        : "Moderate Risk · Modifiable Metabolic & Thermal Factors",
      bg: "bg-amber-50/80 border-amber-200",
      accentText: "text-[#D97706]",
      barColor: "bg-[#D97706]",
      Icon: AlertTriangle,
    },
    high: {
      label: isAr
        ? "مخاطر مرتفعة · يُنصح بتقييم متخصص مبكر"
        : "High Risk · Priority Specialist Evaluation Recommended",
      bg: "bg-red-50/80 border-red-200",
      accentText: "text-[#DC2626]",
      barColor: "bg-[#DC2626]",
      Icon: ShieldAlert,
    },
  }[report.overallLevel];

  const StatusIcon = statusMeta.Icon;

  const categories = [
    {
      key: "lifestyle",
      label: isAr ? "نمط الحياة والحرارة" : "Lifestyle & Thermal Load",
      score: report.pillarScores.lifestyle,
    },
    {
      key: "metabolic",
      label: isAr ? "الصحة الأيضية والتمثيل الغذائي" : "Metabolic & Endocrine",
      score: report.pillarScores.metabolic,
    },
    {
      key: "anatomical",
      label: isAr ? "العوامل التشريحية والدوالي" : "Anatomical & Varicocele",
      score: report.pillarScores.anatomical,
    },
    {
      key: "infectious",
      label: isAr ? "التاريخ الالتهابي والطبي" : "Infectious & Urogenital",
      score: report.pillarScores.infectious,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Prominent Screening vs Diagnosis Disclaimer Banner */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <Info className="w-5 h-5 text-sky-300 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="text-sm font-semibold tracking-tight">
              {isAr
                ? "أداة فحص وتوعية لتقدير المخاطر — وليست تشخيصاً طبياً"
                : "Educational Risk Screening Tool — Not a Medical Diagnosis"}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAr
                ? "تهدف هذه النتائج إلى تفسير العوامل القابلة للتعديل وتسهيل الوصول المبكر للرعاية التخصصية المناسبة."
                : "Designed to highlight modifiable risk patterns early and guide respectful, timely clinical conversations."}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Risk Status Hero Card + 4-Pillar Score Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div
          className={`lg:col-span-5 rounded-2xl border p-6 sm:p-7 flex flex-col justify-between space-y-6 ${statusMeta.bg}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className={`inline-flex items-center gap-2 font-semibold text-sm ${statusMeta.accentText}`}>
                <StatusIcon className="w-5 h-5 shrink-0" />
                <span>{statusMeta.label}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-editorial font-semibold text-slate-900 tabular-nums">
                {report.compositeScore}
              </span>
              <span className="text-xs text-slate-600 font-mono-tabular">
                / 100 {isAr ? "مؤشر العبء التراكمي" : "Composite Risk Index"}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {report.preconceptionSummary}
            </p>
          </div>

          <button
            type="button"
            onClick={onProceedToTriage}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1B5683] text-white text-xs font-semibold hover:bg-[#154468] transition-colors cursor-pointer"
          >
            <span>
              {isAr
                ? "الانتقال إلى التوجيه الذكي ومسار الرعاية المخصص"
                : "Open Smart Triage & Care Pathway"}
            </span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Category Pillar Scores */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {isAr
                ? "توزيع المؤشرات عبر الركائز السريرية الأربع"
                : "Category Risk Distribution Across Four Clinical Pillars"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? "الدرجات المنخفضة تعكس توازناً وقائياً أفضل؛ الدرجات المرتفعة تحدد أولوية التدخل."
                : "Lower scores reflect protective alignment; higher values pinpoint where targeted care yields the greatest benefit."}
            </p>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const barColor =
                cat.score >= 55
                  ? "bg-[#DC2626]"
                  : cat.score >= 30
                  ? "bg-[#D97706]"
                  : "bg-[#059669]";
              const tierWord =
                cat.score >= 55
                  ? isAr
                    ? "مرتفع"
                    : "Elevated"
                  : cat.score >= 30
                  ? isAr
                    ? "متوسط"
                    : "Moderate"
                  : isAr
                  ? "منخفض"
                  : "Low";
              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{cat.label}</span>
                    <span className="font-mono-tabular text-slate-600">
                      {tierWord} · {cat.score}/100
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-transform duration-300`}
                      style={{
                        transform: `scaleX(${Math.max(0.04, cat.score / 100)})`,
                        transformOrigin: isAr ? "right" : "left",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explainable Risk Breakdown Cards ("Why this score was given") */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isAr
              ? "التفسير السريري المفصّل: لماذا ظهر هذا التقييم؟"
              : "Explainable Clinical Breakdown — Why This Score Was Generated"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr
              ? "يربط المحرك بين مدخلاتك والآليات الفسيولوجية المعروفة مع خطوة عملية لكل عامل."
              : "Transparent factor-by-factor reasoning linking your inputs to reproductive physiology and actionable next steps."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.factors.map((factor) => {
            const severityText =
              factor.severity === "high"
                ? isAr
                  ? "أولوية عالية"
                  : "High Priority"
                : factor.severity === "moderate"
                ? isAr
                  ? "عامل قابل للتعديل"
                  : "Modifiable Factor"
                : isAr
                ? "مؤشر مطمئن"
                : "Protective Factor";

            const severityColor =
              factor.severity === "high"
                ? "text-[#DC2626]"
                : factor.severity === "moderate"
                ? "text-[#D97706]"
                : "text-[#059669]";

            return (
              <div
                key={factor.id}
                className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${severityColor}`}>
                      {severityText}
                    </span>
                    <span className="text-slate-400 capitalize">{factor.pillar}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    {factor.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    • {factor.explanation}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/70">
                  <p className="text-xs text-slate-800">
                    <span className="font-semibold text-[#1B5683]">
                      {isAr ? "التوصية العملية: " : "Recommended Action: "}
                    </span>
                    {factor.actionableStep}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Culturally Sensitive Preconception & Family Wellness Panel */}
      <div className="bg-[#F3F6FA] border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#7F3D4B]">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {isAr
                ? "إرشادات العافية الأسرية والاستعداد الهادئ لما قبل الإنجاب"
                : "Preconception & Family Wellness Guidance"}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? "مصاغ بلغة تحترم الخصوصية الثقافية وتضع صحة الرجل ضمن الرعاية الوقائية الشاملة."
                : "Culturally respectful preventive guidance framed around shared family vitality and routine health."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {report.culturalGuidancePoints.map((pt, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-start gap-3"
            >
              <Sparkles className="w-4 h-4 text-[#1B5683] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed">{pt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
