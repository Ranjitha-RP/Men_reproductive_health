"use client";

import { EMPTY_CLEAN_INTAKE } from "./personasAndContent";
import { SimulatedCaseStudy } from "../types/clinical";

export const PROGRAM_MEASURABLE_METRICS = [
  {
    id: "referral_completion",
    value: "91.2%",
    labelEn: "Referral Completion Rate",
    labelAr: "معدل إتمام الإحالة الطبية",
    detailEn: "vs. 38% unassisted clinic referral follow-through",
    detailAr: "مقارنةً بـ 38% في الإحالات الورقية التقليدية",
  },
  {
    id: "handoff_speed",
    value: "42 hrs",
    labelEn: "Median Screening-to-Doctor Review",
    labelAr: "متوسط وقت وصول التقرير للطبيب",
    detailEn: "Down from ~180 days of silent stigma delay",
    detailAr: "انخفاضاً من ~180 يوماً من التأخر الصامت",
  },
  {
    id: "risk_reduction",
    value: "-38%",
    labelEn: "Avg. 90-Day Lifestyle Risk Reduction",
    labelAr: "متوسط انخفاض المخاطر خلال 90 يوماً",
    detailEn: "Across users following thermal, sleep & metabolic habits",
    detailAr: "لدى الملتزمين بخطة التبريد الحراري والنوم والتغذية",
  },
  {
    id: "privacy_opt_in",
    value: "84.6%",
    labelEn: "Consent-Masked Report Handoff",
    labelAr: "استخدام مصفوفة الخصوصية والموافقة",
    detailEn: "Patients selectively controlling shared domains",
    detailAr: "مرضى يتحكمون ببياناتهم قبل إرسالها للطبيب",
  },
];

export const SIMULATED_CASE_STUDIES: SimulatedCaseStudy[] = [
  {
    id: "case_tariq",
    personaEn: "Tariq, 32 · Software Engineer",
    personaAr: "طارق، 32 عاماً · مهندس برمجيات",
    categoryEn: "Lifestyle & Thermal Load",
    categoryAr: "نمط الحياة والحرارة",
    concernSummaryEn:
      "10+ hours of daily desk sitting, laptop directly on lap, irregular sleep, and borderline motility (36%).",
    concernSummaryAr:
      "جلوس مكتبي +10 ساعات يومياً، وضع الحاسوب على الحجر، نوم متقطع، وحركة حيوانات منوية حدية (36%).",
    baselineScore: 54,
    followUpScore: 21,
    referralStatusEn: "Completed · Home Kit + Teleconsult",
    referralStatusAr: "مكتمل · باقة فحص منزلي + استشارة فيديو",
    timeToReferralEn: "36 hours",
    timeToReferralAr: "36 ساعة",
    clinicalOutcomeEn:
      "AI Companion explained how lap heat impacts 74-day sperm maturation. After 90 days of desk breaks, stopping lap heat, and 7.5h sleep, risk dropped 61% and follow-up motility rose to 48%.",
    clinicalOutcomeAr:
      "أوضح المساعد الذكي تأثير حرارة الحاسوب خلال دورة 74 يوماً. بعد 90 يوماً من الفواصل الحركية والنوم المنتظم، انخفضت المخاطر 61% وارتفعت الحركة إلى 48%.",
    interventionsEn: [
      "AI plain-language explanation of scrotal cooling",
      "Masked report sent to Fertility Specialist",
      "90-day lifestyle follow-up reminders completed",
    ],
    interventionsAr: [
      "شرح مبسط بالذكاء الاصطناعي لأهمية التبريد الحراري",
      "إرسال تقرير محجوب الهوية لأخصائي الخصوبة",
      "إتمام تذكيرات المتابعة لمدة 90 يوماً",
    ],
    timelinePoints: [
      { label: "Day 1", score: 54 },
      { label: "Day 30", score: 38 },
      { label: "Day 60", score: 27 },
      { label: "Day 90", score: 21 },
    ],
    intakePreset: {
      ...EMPTY_CLEAN_INTAKE,
      sittingHoursPerDay: "8plus",
      thermalExposure: "frequent",
      sleepQuality: "irregular",
      stressLevel: "moderate",
      labFileUploaded: true,
      labFileName: "Tariq_Baseline_Lab.pdf",
      spermConcentrationMml: 22,
      totalMotilityPercent: 36,
      morningTestosteroneNgDl: 410,
      fshIuL: 6.4,
    },
  },
  {
    id: "case_faisal",
    personaEn: "Faisal, 29 · Operations Supervisor",
    personaAr: "فيصل، 29 عاماً · مشرف عمليات",
    categoryEn: "Anatomical & Varicocele Priority",
    categoryAr: "أولوية تشريحية ودوالي",
    concernSummaryEn:
      "Dull left-sided ache after standing shifts, palpable vein fullness, and low sperm concentration (12 M/mL).",
    concernSummaryAr:
      "ألم خفيف بعد الوقوف الطويل، توسع أوردة محسوس، وانخفاض التركيز المخبري (12 مليون/مل).",
    baselineScore: 78,
    followUpScore: 34,
    referralStatusEn: "Completed · Priority Urologist Doppler",
    referralStatusAr: "مكتمل · إحالة عاجلة لطبيب الذكورة والدوبلر",
    timeToReferralEn: "48 hours",
    timeToReferralAr: "48 ساعة",
    clinicalOutcomeEn:
      "Consent-masked report passed directly to Urologist, who pre-approved a Scrotal Color Doppler Ultrasound before the visit—confirming Grade II varicocele and preventing months of partner-only testing.",
    clinicalOutcomeAr:
      "انتقل التقرير للطبيب مع اعتماد مسبق لتصوير الدوبلر، مما كشف دوالي من الدرجة الثانية خلال 48 ساعة واختصر شهوراً من التأخير.",
    interventionsEn: [
      "Consent-filtered anatomical & lab report handoff",
      "Doctor pre-approved Scrotal Doppler Ultrasound",
      "Follow-up post-procedure recovery tracking",
    ],
    interventionsAr: [
      "إرسال التقرير التشريحي والمخبري بموافقة المراجع",
      "اعتماد مسبق لفحص الدوبلر من الطبيب",
      "متابعة التعافي بعد التقييم الطبي",
    ],
    timelinePoints: [
      { label: "Day 1", score: 78 },
      { label: "Day 30", score: 61 },
      { label: "Day 60", score: 45 },
      { label: "Day 90", score: 34 },
    ],
    intakePreset: {
      ...EMPTY_CLEAN_INTAKE,
      sittingHoursPerDay: "4to7",
      dullTesticularAche: true,
      scrotalHeavinessAfterStanding: true,
      visibleVeinSwelling: true,
      labFileUploaded: true,
      labFileName: "Faisal_Semen_Report.pdf",
      spermConcentrationMml: 12,
      totalMotilityPercent: 34,
      morningTestosteroneNgDl: 380,
      fshIuL: 9.1,
    },
  },
  {
    id: "case_khalid",
    personaEn: "Khalid, 38 · Finance Manager",
    personaAr: "خالد، 38 عاماً · مدير مالي",
    categoryEn: "Metabolic & Endocrine Strain",
    categoryAr: "إجهاد أيضي وهرموني",
    concernSummaryEn:
      "BMI > 28, pre-diabetic HbA1c, daily vaping, poor sleep, and morning testosterone at 295 ng/dL.",
    concernSummaryAr:
      "مؤشر كتلة > 28، ما قبل السكري، تدخين إلكتروني، واضطراب نوم مع تستوستيرون صباحي 295.",
    baselineScore: 71,
    followUpScore: 39,
    referralStatusEn: "Completed · Endocrine + Lifestyle Plan",
    referralStatusAr: "مكتمل · غدد صماء + خطة نمط حياة",
    timeToReferralEn: "40 hours",
    timeToReferralAr: "40 ساعة",
    clinicalOutcomeEn:
      "AI Companion translated how insulin resistance lowers testosterone. Combining specialist metabolic panel orders with vaping cessation and strength training cut composite risk by 45% in 90 days.",
    clinicalOutcomeAr:
      "شرح المساعد الذكي العلاقة بين مقاومة الإنسولين والهرمونات. مع إيقاف النيكوتين وتحسين الأيض، تراجعت المخاطر 45% خلال 90 يوماً.",
    interventionsEn: [
      "AI guidance linking HbA1c & hormone recovery",
      "Morning endocrine lab panel approved by doctor",
      "30/60/90-day metabolic risk check-ins logged",
    ],
    interventionsAr: [
      "توجيه ذكي حول علاقة سكر الدم بالهرمونات",
      "اعتماد فحص الهرمونات الصباحي عبر لوحة الطبيب",
      "تسجيل تحسن النقاط في اليوم 30 و60 و90",
    ],
    timelinePoints: [
      { label: "Day 1", score: 71 },
      { label: "Day 30", score: 56 },
      { label: "Day 60", score: 46 },
      { label: "Day 90", score: 39 },
    ],
    intakePreset: {
      ...EMPTY_CLEAN_INTAKE,
      sittingHoursPerDay: "8plus",
      sleepQuality: "poor",
      stressLevel: "high",
      nicotineHabit: "vaping_occasional",
      bmiRange: "high_over_28",
      hba1cStatus: "borderline_prediabetic",
      bloodPressureFlag: "borderline",
      labFileUploaded: true,
      labFileName: "Khalid_Endocrine_Lab.pdf",
      morningTestosteroneNgDl: 295,
      fshIuL: 6.1,
    },
  },
  {
    id: "case_omar",
    personaEn: "Omar, 35 · Logistics Coordinator",
    personaAr: "عمر، 35 عاماً · منسق لوجستي",
    categoryEn: "Acute Red-Flag Safety Override",
    categoryAr: "بروتوكول الطوارئ الحاد",
    concernSummaryEn:
      "Reported sudden severe unilateral testicular pain and swelling starting 2 hours before screening.",
    concernSummaryAr:
      "أبلغ عن ألم حاد ومفاجئ وتورم في الخصية بدأ قبل ساعتين من الفحص.",
    baselineScore: 95,
    followUpScore: 18,
    referralStatusEn: "Emergency Override · Immediate ER Triage",
    referralStatusAr: "تجاوز طارئ · توجيه فوري للطوارئ",
    timeToReferralEn: "3 hours to ER",
    timeToReferralAr: "3 ساعات للطوارئ",
    clinicalOutcomeEn:
      "Deterministic Red-Flag Guardrail and AI Companion overrode routine scheduling and directed immediate hospital ER evaluation within the critical 4–6 hour salvage window, safely resolving acute epididymo-orchitis.",
    clinicalOutcomeAr:
      "تجاوز حاجز الأمان والمرافق الذكي الحجز الروتيني ووجه المريض فوراً للطوارئ ضمن نافذة الأمان الحرجة، وتم العلاج المبكر بأمان.",
    interventionsEn: [
      "Instant acute red-flag emergency modal triggered",
      "AI Companion reinforced urgent ER arrival",
      "Post-recovery outpatient follow-up completed",
    ],
    interventionsAr: [
      "تفعيل تنبيه الطوارئ الحاد فورياً",
      "تأكيد المساعد الذكي على مراجعة الطوارئ فوراً",
      "إتمام المتابعة الطبية بعد التعافي",
    ],
    timelinePoints: [
      { label: "ER Day 1", score: 95 },
      { label: "Day 14", score: 42 },
      { label: "Day 30", score: 25 },
      { label: "Day 60", score: 18 },
    ],
    intakePreset: {
      ...EMPTY_CLEAN_INTAKE,
      acuteSevereTesticularPain: true,
      acuteSuddenSwellingOrFever: true,
    },
  },
];
