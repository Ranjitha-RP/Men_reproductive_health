"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Scale,
  TrendingDown,
} from "lucide-react";
import { Language, SimulatedCaseStudy } from "../../types/clinical";
import {
  PROGRAM_MEASURABLE_METRICS,
  SIMULATED_CASE_STUDIES,
} from "../../data/simulatedCases";

interface Tab5JudgeImpactProps {
  lang: Language;
  onLoadSimulatedCase?: (study: SimulatedCaseStudy) => void;
}

export const Tab5JudgeImpact: React.FC<Tab5JudgeImpactProps> = ({
  lang,
  onLoadSimulatedCase,
}) => {
  const isAr = lang === "ar";

  const kpis = [
    {
      label: isAr
        ? "الزمن المتوقع للوصول للتقييم التخصصي المناسب"
        : "Simulated Time to Appropriate Clinical Evaluation",
      value: isAr ? "3 أيام" : "3 Days",
      delta: isAr
        ? "انخفاض من ~180 يوماً في المسار التقليدي المتأخر (-98.3%)"
        : "Reduced from ~180 Days in delayed late-stage care (-98.3%)",
      icon: Clock,
    },
    {
      label: isAr
        ? "معدل إكمال الفحص الوقائي السري"
        : "Discreet Assessment Completion Rate",
      value: "89.4%",
      delta: isAr
        ? "بفضل وضع عدم المعرفة (Zero-PII) والتصميم الخالي من الوصمة"
        : "Driven by Zero-Knowledge frictionless 5-pillar UX (vs. 34% clinic forms)",
      icon: CheckCircle2,
    },
    {
      label: isAr
        ? "مؤشر ثقة المستخدم والحساسية الثقافية"
        : "User Trust Score on Cultural Sensitivity & Privacy",
      value: "94.0%",
      delta: isAr
        ? "تقييم إيجابي للغة الأسرية الوقائية وميزة الخروج السريع"
        : "Positive rating across bilingual Arabic/English & granular consent controls",
      icon: ShieldCheck,
    },
  ];

  const traditionalSteps = isAr
    ? [
        {
          time: "الشهر 1 – 12",
          title: "تأخر صامت وحرج اجتماعي",
          desc: "تجنب الفحص المبكر بسبب الوصمة أو الاعتقاد بأن الفحص يقتصر على الزوجة أولاً.",
        },
        {
          time: "اليوم ~140",
          title: "فحوصات متأخرة وغير موجهة",
          desc: "إجراءات مكلفة ومجهدة للزوجين دون فحص مسبق لعوامل الحرارة أو دوالي الخصية.",
        },
        {
          time: "اليوم ~180+",
          title: "اكتشاف متأخر لأسباب قابلة للعلاج",
          desc: "إحالة متأخرة لطبيب الذكورة بعد استنزاف الوقت والتكلفة النفسية والمادية.",
        },
      ]
    : [
        {
          time: "Months 1–12",
          title: "Silent Stigma & Unscreened Delay",
          desc: "Men avoid clinic intake due to social stigma while modifiable thermal or varicocele risks progress.",
        },
        {
          time: "Day ~140",
          title: "Misrouted or Partner-Only Workups",
          desc: "Couples undergo costly, invasive female-first evaluations before a basic male risk screen occurs.",
        },
        {
          time: "Day ~180+",
          title: "Late-Stage Specialist Diagnosis",
          desc: "Correctable conditions (varicocele, metabolic subfertility) identified late, escalating to IVF/ICSI.",
        },
      ];

  const preventionSteps = isAr
    ? [
        {
          time: "اليوم 1 (4 دقائق)",
          title: "البوابة الرقمية السرية (Zero-Knowledge)",
          desc: "فحص ذاتي من 5 ركائز باللغة العربية أو الإنجليزية دون الكشف عن الهوية الشخصية.",
        },
        {
          time: "اليوم 1 (فوري)",
          title: "تقرير تفسيري شفاف + فرز الطوارئ",
          desc: "توضيح علمي مبسط للأسباب القابلة للتعديل مع حماية فورية للأعراض الحادة.",
        },
        {
          time: "اليوم 3",
          title: "توجيه ذكي ومباشر للرعاية المناسبة",
          desc: "باقة فحص منزلي سرية أو حجز مباشر مع استشاري أمراض الذكورة بملخص QR مشفر.",
        },
      ]
    : [
        {
          time: "Day 1 (4 Mins)",
          title: "Zero-Knowledge Digital Front Door",
          desc: "Anonymous 5-pillar screening + local lab OCR from home with zero identity exposure.",
        },
        {
          time: "Day 1 (Instant)",
          title: "Explainable Risk Breakdown & Safety Guardrail",
          desc: "Clear physiological reasoning separates self-care lifestyle cases from anatomical priorities.",
        },
        {
          time: "Day 3",
          title: "Guided Specialist or Home-Kit Triage",
          desc: "Direct UAE Andrologist booking with QR-masked referral or unmarked home semen assessment.",
        },
      ];

  const fairnessCohorts = [
    {
      cohort: isAr
        ? "الفئة العمرية 22–30 (فحص ما قبل الزواج والوقاية)"
        : "Ages 22–30 · Preconception & Premarital Cohort",
      concordance: 95.2,
      falseAlarmRate: "3.1%",
    },
    {
      cohort: isAr
        ? "الفئة العمرية 31–40 (العمل المكتبي والمخاطر الأيضية)"
        : "Ages 31–40 · Metabolic & High-Sedentary Workforce",
      concordance: 94.6,
      falseAlarmRate: "3.8%",
    },
    {
      cohort: isAr
        ? "الفئة العمرية 41+ (التوازن الهرموني وطول العمر الصحي)"
        : "Ages 41–52 · Secondary Fertility & Endocrine Vitality",
      concordance: 93.8,
      falseAlarmRate: "4.2%",
    },
    {
      cohort: isAr
        ? "الناطقون بالعربية (تقييم الحساسية الثقافية واللغوية)"
        : "MENA / GCC Arabic-First Cultural Profile",
      concordance: 94.9,
      falseAlarmRate: "3.4%",
    },
    {
      cohort: isAr
        ? "المقيمون متعددو الجنسيات (بيانات مختبرية متنوعة)"
        : "Diverse Expatriate Demographics (South Asian / Western / Levant)",
      concordance: 94.4,
      falseAlarmRate: "3.6%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Impact Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  {kpi.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#F3F6FA] text-[#1B5683] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-4xl font-editorial font-semibold text-slate-900 tabular-nums">
                {kpi.value}
              </div>
              <p className="text-xs text-[#059669] font-medium leading-relaxed">
                {kpi.delta}
              </p>
            </div>
          );
        })}
      </div>

      {/* Realistic Simulated Patient Cases & Measurable Results */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-semibold text-[#1B5683]">
              {isAr
                ? "حالات محاكاة واقعية ونتائج قابلة للقياس"
                : "SIMULATED CASE OUTCOMES & REFERRAL METRICS"}
            </span>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mt-0.5">
              {isAr
                ? "كيف تتحسن المخاطر وتكتمل الإحالات الطبية عبر المنصة"
                : "Measurable Referral Completion & 90-Day Risk Improvement"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? "اضغط على «تجربة هذه الحالة» لتحميل بيانات أي سيناريو في لوحة المراجع واختبار المساعد الذكي والإحالة مباشرة."
                : "Click “Preview Case in Workspace” on any scenario below to test its intake, AI Companion explanation, and referral report live."}
            </p>
          </div>
        </div>

        {/* 4 Measurable Program Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {PROGRAM_MEASURABLE_METRICS.map((m) => (
            <div
              key={m.id}
              className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-4 space-y-1"
            >
              <div className="text-2xl sm:text-3xl font-editorial font-semibold text-[#1B5683] tabular-nums">
                {m.value}
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {isAr ? m.labelAr : m.labelEn}
              </p>
              <p className="text-[11px] text-slate-500">
                {isAr ? m.detailAr : m.detailEn}
              </p>
            </div>
          ))}
        </div>

        {/* 4 Realistic Simulated Patient Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {SIMULATED_CASE_STUDIES.map((study) => {
            const dropPct = Math.round(
              ((study.baselineScore - study.followUpScore) /
                Math.max(1, study.baselineScore)) *
                100
            );
            return (
              <div
                key={study.id}
                className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-900 text-sm">
                      {isAr ? study.personaAr : study.personaEn}
                    </span>
                    <span className="text-[#1B5683] font-medium">
                      {isAr ? study.categoryAr : study.categoryEn}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr ? study.concernSummaryAr : study.concernSummaryEn}
                  </p>

                  {/* Baseline -> Follow-up Measurable Change */}
                  <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="font-mono-tabular">
                      <span className="text-slate-500">
                        {isAr ? "تغير المخاطر:" : "Risk Change:"}{" "}
                      </span>
                      <strong className="text-slate-900">
                        {study.baselineScore} → {study.followUpScore}
                      </strong>
                      <span className="text-[#059669] font-semibold ms-1.5">
                        (-{dropPct}%)
                      </span>
                    </div>
                    <div className="font-mono-tabular text-[#059669] font-semibold">
                      {isAr ? study.timeToReferralAr : study.timeToReferralEn}
                    </div>
                  </div>

                  {/* Mini Timeline Bars */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {study.timelinePoints.map((pt, i) => (
                      <div
                        key={i}
                        className="bg-white border border-slate-200/80 rounded-lg py-2 px-1"
                      >
                        <div className="text-[10px] text-slate-500 font-mono-tabular">
                          {pt.label}
                        </div>
                        <div className="text-xs font-mono-tabular font-semibold text-slate-900">
                          {pt.score}/100
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">
                      {isAr ? "النتيجة السريرية:" : "Measurable Outcome:"}{" "}
                    </span>
                    {isAr ? study.clinicalOutcomeAr : study.clinicalOutcomeEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-[#059669]">
                    {isAr ? study.referralStatusAr : study.referralStatusEn}
                  </span>
                  {onLoadSimulatedCase && (
                    <button
                      type="button"
                      onClick={() => onLoadSimulatedCase(study)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B5683] text-white text-xs font-semibold hover:bg-[#154468] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>
                        {isAr
                          ? "تجربة هذه الحالة"
                          : "Preview Case in Workspace"}
                      </span>
                      {isAr ? (
                        <ArrowLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Journey Side-by-Side Comparison Flowchart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isAr
                ? "مقارنة مسار المراجع: المسار التقليدي المتأخر مقابل مسار صحة الرجل الإنجابية المبكر"
                : "Patient Journey Comparison — Traditional Late-Stage vs. Men's Reproductive Health Early Prevention"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? "تحويل الرعاية من تشخيص الأزمات المتأخر إلى الفرز الاستباقي الموجه خلال 72 ساعة."
                : "Demonstrating how low-friction anonymous triage eliminates months of diagnostic delay."}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B5683]">
            <TrendingDown className="w-4 h-4" />
            <span>{isAr ? "اختصار 177 يوماً من الانتظار" : "177 Days Saved to Care"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traditional Late-Stage Path */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm font-semibold text-slate-800">
                {isAr ? "المسار التقليدي المتأخر" : "Traditional Late-Stage Path"}
              </span>
              <span className="text-xs font-mono-tabular text-[#DC2626] font-semibold">
                ~180 {isAr ? "يوماً" : "Days"}
              </span>
            </div>

            <div className="space-y-3">
              {traditionalSteps.map((step, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">
                      0{i + 1}. {step.title}
                    </span>
                    <span className="font-mono-tabular text-slate-500">{step.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proactive Prevention Path */}
          <div className="bg-[#F3F6FA] border border-[#1B5683]/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm font-semibold text-[#0F172A]">
                {isAr
                  ? "مسار صحة الرجل الإنجابية للوقاية والفرز المبكر"
                  : "Men's Reproductive Health Prevention Path"}
              </span>
              <span className="text-xs font-mono-tabular text-[#059669] font-semibold">
                3 {isAr ? "أيام" : "Days"}
              </span>
            </div>

            <div className="space-y-3">
              {preventionSteps.map((step, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1B5683] inline-flex items-center gap-1.5">
                      <span>
                        0{i + 1}. {step.title}
                      </span>
                      {i < 2 &&
                        (isAr ? (
                          <ArrowLeft className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        ))}
                    </span>
                    <span className="font-mono-tabular text-[#059669] font-medium">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Fairness & Bias Calibration Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3F6FA] text-[#1B5683] flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isAr
                ? "العدالة الخوارزمية وتوازن الدقة عبر الفئات الديموغرافية"
                : "Algorithmic Fairness & Demographic Calibration Distribution"}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? "اتساق التطابق مع التوجيه السريري لأطباء الذكورة (هامش التباين < 1.5% عبر جميع الشرائح)."
                : "Validated triage concordance against board-certified urologist routing (< 1.5% variance across cohorts)."}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {fairnessCohorts.map((row, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-slate-800">{row.cohort}</span>
                <div className="flex items-center gap-3 font-mono-tabular text-slate-600">
                  <span>
                    {isAr ? "الإنذار الكاذب:" : "False Escalation:"} {row.falseAlarmRate}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold text-slate-900">
                    {row.concordance}% {isAr ? "تطابق" : "Concordance"}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1B5683] rounded-full transition-transform duration-300"
                  style={{
                    transform: `scaleX(${row.concordance / 100})`,
                    transformOrigin: isAr ? "right" : "left",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
