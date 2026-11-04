"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Calendar,
  Video,
  ClipboardCheck,
  Activity,
  HeartPulse,
  Stethoscope,
  Microscope,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Clock,
  Info,
} from "lucide-react";
import { ClinicalTabId, Language } from "../types/clinical";
import { BRAND_IMAGES } from "../data/personasAndContent";
import { SafeImage } from "./SafeImage";

interface EditorialHeroAndProcessProps {
  lang: Language;
  onJumpToSuite: (tab?: ClinicalTabId) => void;
}

export const EditorialHeroAndProcess: React.FC<EditorialHeroAndProcessProps> = ({
  lang,
  onJumpToSuite,
}) => {
  const isAr = lang === "ar";

  const metrics = [
    {
      value: isAr ? "3 أيام" : "3 Days",
      label: isAr ? "متوسط الوصول للتقييم التخصصي" : "Median Time to Care (vs. 180d)",
    },
    {
      value: "89.4%",
      label: isAr ? "معدل إكمال الفحص السري" : "Discreet Intake Completion",
    },
    {
      value: "45+",
      label: isAr ? "استشاري ذكورة ومسالك مرخص" : "Licensed UAE Andrologists",
    },
    {
      value: "24/7",
      label: isAr ? "فرز ذكي بوضع عدم المعرفة" : "Zero-Knowledge Smart Triage",
    },
  ];

  const processSteps = [
    {
      num: "01",
      title: isAr ? "فحص مبكر سري" : "Screen Discreetly",
      desc: isAr
        ? "تقييم ذاتي هادئ من 5 ركائز في أقل من أربع دقائق دون الحاجة لكتابة الاسم أو رقم الهاتف أو الهوية."
        : "Complete our 5-pillar reproductive & metabolic check in under four minutes with zero personal identity required.",
      image: BRAND_IMAGES.stepIntakeMan,
      icon: Calendar,
      targetTab: "intake" as ClinicalTabId,
    },
    {
      num: "02",
      title: isAr ? "افهم مؤشراتك بوضوح" : "Understand Why",
      desc: isAr
        ? "تقرير تفسيري مبسط يوضح تأثير الحرارة ونمط الحياة والتمثيل الغذائي أو الدوالي بلغة علمية مطمئنة."
        : "Receive an explainable clinical breakdown translating thermal, metabolic, and anatomical signals into plain language.",
      image: BRAND_IMAGES.stepConsultMan,
      icon: Video,
      targetTab: "report" as ClinicalTabId,
    },
    {
      num: "03",
      title: isAr ? "توجيه علاجي مخصص" : "Follow-through",
      desc: isAr
        ? "خطة وقاية لـ 90 يوماً، باقة فحص منزلي غير معنونة، أو حجز مباشر مع استشاري الذكورة برمز QR مشفر."
        : "Download a 90-day vitality protocol, order an unmarked home semen kit, or book a specialist with a masked QR summary.",
      image: BRAND_IMAGES.stepWellnessKit,
      icon: ClipboardCheck,
      targetTab: "triage" as ClinicalTabId,
    },
  ];

  const services = [
    {
      title: isAr ? "التمثيل الغذائي والحيوية" : "Metabolic & Endocrine",
      desc: isAr
        ? "تقييم متكامل لمقاومة الإنسولين، مؤشر الكتلة، والتوازن الهرموني الصباحي المؤثر على الخصوبة."
        : "Proactive alignment for insulin sensitivity, weight, lipids, and morning androgen rhythm.",
      image: BRAND_IMAGES.serviceDoctorConsult,
      icon: Activity,
      tab: "intake" as ClinicalTabId,
    },
    {
      title: isAr ? "الإيقاع الحراري ونمط الحياة" : "Preconception & Longevity",
      desc: isAr
        ? "بروتوكولات علمية لحماية التنظيم الحراري وجودة الحمض النووي خلال دورة الـ 90 يوماً."
        : "Evidence-backed thermoregulation, sleep architecture, and antioxidant micronutrient guidance.",
      image: BRAND_IMAGES.stepIntakeMan,
      icon: HeartPulse,
      tab: "report" as ClinicalTabId,
    },
    {
      title: isAr ? "أمراض الذكورة ودوالي الخصية" : "Andrology & Varicocele",
      desc: isAr
        ? "كشف مبكر لأكثر الأسباب التشريحية قابلية للعلاج مع إحالة مباشرة لاستشاريي الجراحة المجهرية."
        : "Early detection for correctable venous reflux and anatomical history with direct UAE specialist routing.",
      image: BRAND_IMAGES.maleClinicianAvatar,
      icon: Stethoscope,
      tab: "triage" as ClinicalTabId,
    },
    {
      title: isAr ? "تحليل المؤشرات المخبرية" : "Biomarker & Lab Review",
      desc: isAr
        ? "قراءة فورية لتحاليل السائل المنوي والهرمونات المرفقة محلياً مع تحكم كامل في الخصوصية."
        : "Instant local OCR parsing for prior semen or hormone panels with granular field-by-field consent.",
      image: BRAND_IMAGES.stepConsultMan,
      icon: Microscope,
      tab: "privacy" as ClinicalTabId,
    },
  ];

  return (
    <div>
      {/* HERO SANCTUARY SECTION — Inspired by Reference Aesthetic */}
      <section className="relative px-4 sm:px-8 pt-6 pb-10 bg-gradient-to-b from-[#F3F6FA] to-white">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden border border-slate-200/80 min-h-[540px] flex items-center">
          {/* Background Architectural Sanctuary Image */}
          <SafeImage
            src={BRAND_IMAGES.heroSanctuary}
            alt={
              isAr
                ? "مساحة هادئة وحديثة لصحة الرجل الوقائية"
                : "Serene architectural men's health sanctuary interior"
            }
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Soft Frosted Atmospheric Scrim */}
          <div
            className={`absolute inset-0 ${
              isAr
                ? "bg-gradient-to-l from-white/95 via-white/85 to-white/35"
                : "bg-gradient-to-r from-white/95 via-white/85 to-white/35"
            }`}
          />

          {/* Inner Sanctuary Frame */}
          <div className="relative z-10 w-full m-4 sm:m-8 p-6 sm:p-12 rounded-2xl border border-white/80 bg-white/55 backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs font-semibold tracking-wider text-[#1B5683]">
                {isAr
                  ? "فحص وقائي مبكر وسري لصحة الرجل الإنجابية"
                  : "PROACTIVE ZERO-KNOWLEDGE MEN'S HEALTH"}
              </p>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-normal text-slate-900 balance-text">
                {isAr ? (
                  <>
                    رعاية تحمي{" "}
                    <span className="italic text-[#7F3D4B] font-medium">
                      مستقبلك الأسري
                    </span>{" "}
                    بخصوصية تامة
                  </>
                ) : (
                  <>
                    Care that protects{" "}
                    <em className="italic text-[#7F3D4B]">your</em> rhythm &
                    future
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                {isAr
                  ? "بوابة رقمية موثوقة تنقل صحة الرجل الإنجابية من التشخيص المتأخر إلى الفحص الاستباقي المبكر والفرز الذكي الموجه — دون تخزين أي بيانات هوية شخصية."
                  : "A calm, culturally respectful digital front door shifting male fertility care from late-stage diagnosis to early proactive risk screening, explainable insights, and guided specialist care."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onJumpToSuite("intake")}
                  className="px-6 py-3.5 rounded-xl bg-[#1B5683] text-white text-sm font-semibold hover:bg-[#154468] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isAr
                    ? "ابدأ الفحص السري — مجاناً"
                    : "Start discreet screening — free"}
                </button>
                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-xl bg-white/90 border border-slate-200 text-slate-800 text-sm font-medium hover:bg-white transition-colors whitespace-nowrap"
                >
                  {isAr ? "كيف يعمل النظام؟" : "See how it works"}
                </a>
              </div>

              {/* Male Clinician Avatars & Licensing Proof */}
              <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    <SafeImage
                      src={BRAND_IMAGES.maleClinicianAvatar}
                      alt="Consultant Andrologist"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                    <SafeImage
                      src={BRAND_IMAGES.serviceDoctorConsult}
                      alt="Consultant Urologist"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                    <SafeImage
                      src={BRAND_IMAGES.stepIntakeMan}
                      alt="Men's Vitality Physician"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div className="leading-tight">
                    <span className="font-semibold text-[#1B5683] tabular-nums">
                      ★ 4.9
                    </span>{" "}
                    <span className="text-slate-500">
                      · {isAr ? "شبكة أطباء الذكورة" : "45+ Male Specialists"}
                    </span>
                  </div>
                </div>

                <span className="text-slate-300 hidden sm:inline">·</span>

                <div className="inline-flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <span>
                    {isAr
                      ? "بروتوكول عدم المعرفة · أبوظبي والإمارات"
                      : "Zero-Knowledge Privacy · Licensed across UAE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Floating Clinical Card (Matches Reference Circadian Card) */}
            <div className="lg:col-span-5 flex lg:justify-end">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-lg max-w-sm w-full space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F3F6FA] text-[#1B5683] flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {isAr
                          ? "توافق الحرارة والمؤشرات الحيوية"
                          : "Thermal & Biomarker Alignment"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isAr
                          ? "محرك الفرز الوقائي بـ 5 ركائز"
                          : "Personalized 5-pillar preconception screen"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#1B5683] whitespace-nowrap">
                    {isAr ? "نشط محلياً" : "Zero-PII"}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    {isAr ? "زمن الإحالة المستهدف" : "Target evaluation window"}
                  </span>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {isAr ? "72 ساعة (بدلاً من 180 يوماً)" : "72 hrs (vs. ~180 days)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-METRIC CLINICAL PROOF BAR */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-slate-200">
          {metrics.map((m, idx) => (
            <div key={idx} className="py-4 md:py-1 px-4 text-center space-y-1">
              <div className="font-editorial text-3xl sm:text-4xl text-slate-900 tabular-nums">
                {m.value}
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS SECTION: "Three steps between you and clarity" (Male Photography) */}
      <section id="how-it-works" className="py-20 bg-[#F3F6FA]/70 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">
              {isAr ? "خطوات الرعاية" : "PROCESS"}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-slate-900 balance-text">
              {isAr
                ? "ثلاث خطوات هادئة تفصلك عن الاطمئنان الطبي"
                : "Three steps between you and clinical clarity"}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? "بلا استمارات ورقية محرجة أو سلاسل إحالة معقدة. رعاية وقائية تحترم وقتك وخصوصيتك."
                : "No awkward waiting rooms, no convoluted referral chains. Just discreet, evidence-based guidance when you want it."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  onClick={() => onJumpToSuite(step.targetTab)}
                  className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="h-52 overflow-hidden relative">
                      <SafeImage
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>

                    <div className="p-6 pt-5 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-[#F3F6FA] border border-slate-200/80 text-[#1B5683] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-editorial text-3xl text-slate-300 tabular-nums select-none">
                          {step.num}
                        </span>
                      </div>

                      <h3 className="font-editorial text-2xl font-medium text-slate-900">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-5 pt-1 text-xs font-semibold text-[#1B5683] inline-flex items-center gap-1.5">
                    <span>{isAr ? "افتح في المنصة السريرية" : "Explore in suite"}</span>
                    {isAr ? (
                      <ArrowLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION: "One specialist, or a whole team — your call" (Male Photos) */}
      <section id="services" className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <span className="text-xs font-semibold text-slate-500 tracking-wider">
                {isAr ? "التخصصات الوقائية" : "CLINICAL PILLARS"}
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-slate-900 balance-text">
                {isAr
                  ? "طبيب واحد، أو فريق متكامل لصحة الرجل — الخيار لك"
                  : "One specialist, or a whole team — your call"}
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              {isAr
                ? "رعاية وقائية مصممة لحيوية الرجل، التوازن الهرموني، والاستعداد الأسري المبكر."
                : "Comprehensive male reproductive and metabolic healthcare tailored to preconception readiness, hormonal balance, and longevity."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onJumpToSuite(srv.tab)}
                  className="group bg-[#F8FAFC] border border-slate-200/80 rounded-2xl overflow-hidden hover:bg-white hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 overflow-hidden relative">
                      <SafeImage
                        src={srv.image}
                        alt={srv.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 space-y-2.5">
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 text-[#1B5683] flex items-center justify-center -mt-9 relative z-10 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-editorial text-xl font-semibold text-slate-900">
                        {srv.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {srv.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

interface EditorialPlansAndConsultProps {
  lang: Language;
  isBookingSaving?: boolean;
  onJumpToSuite: (tab?: ClinicalTabId) => void;
  onDispatchConsultQuery: (payload: {
    patientLabel?: string;
    requestedDoctorOrSpecialtyEn: string;
    requestedDoctorOrSpecialtyAr: string;
    selectedSymptomsOverrideEn?: string[];
    selectedSymptomsOverrideAr?: string[];
    slot: string;
    modalityEn: string;
    modalityAr: string;
    queryNoteEn: string;
    queryNoteAr: string;
  }) => Promise<void> | void;
  onOpenDoctorPortal: () => void;
}

export const EditorialPlansAndConsult: React.FC<EditorialPlansAndConsultProps> = ({
  lang,
  isBookingSaving = false,
  onJumpToSuite,
  onDispatchConsultQuery,
  onOpenDoctorPortal,
}) => {
  const isAr = lang === "ar";
  const [focusArea, setFocusArea] = useState<string>("preconception");
  const [modality, setModality] = useState<"video" | "messaging">("video");
  const [timeSlot, setTimeSlot] = useState<string>("Today · 2:15 PM");
  const [consultConfirmed, setConsultConfirmed] = useState<boolean>(false);

  const focusOptions = [
    {
      id: "preconception",
      titleEn: "Preconception & Prevention",
      titleAr: "فحص ما قبل الإنجاب والوقاية",
      specialtyEn: "Reproductive Endocrinologist & Fertility Specialist",
      specialtyAr: "أخصائي الغدد الصماء التناسلية والخصوبة",
      symptomEn: "Proactive Preconception Fertility Check",
      symptomAr: "فحص وقائي للخصوبة قبل الإنجاب",
      title: isAr ? "فحص ما قبل الإنجاب والوقاية" : "Preconception & Prevention",
      sub: isAr ? "تقييم شامل للحيوية والخصوبة" : "Routine readiness & 90-day rhythm",
      icon: Activity,
    },
    {
      id: "andrology",
      titleEn: "Andrology & Varicocele Check",
      titleAr: "أمراض الذكورة ودوالي الخصية",
      specialtyEn: "Consultant Urologist & Microsurgeon",
      specialtyAr: "استشاري المسالك البولية والجراحة المجهرية",
      symptomEn: "Testicular Dull Ache / Varicocele Screening",
      symptomAr: "ألم خفيف بالخصية / فحص دوالي الخصية",
      title: isAr ? "أمراض الذكورة ودوالي الخصية" : "Andrology & Varicocele Check",
      sub: isAr ? "استشارة متخصصة وتوجيه للدوبلر" : "Anatomical & microsurgical review",
      icon: Stethoscope,
    },
    {
      id: "metabolic",
      titleEn: "Hormonal & Metabolic Vitality",
      titleAr: "التوازن الهرموني والأيضي",
      specialtyEn: "Metabolic & Male Hormone Physician",
      specialtyAr: "طبيب التمثيل الغذائي وهرمونات الذكورة",
      symptomEn: "Metabolic, Sleep & Hormonal Fatigue",
      symptomAr: "إجهاد هرموني واضطراب النوم والتمثيل الغذائي",
      title: isAr ? "التوازن الهرموني والأيضي" : "Hormonal & Metabolic Vitality",
      sub: isAr ? "التستوستيرون، الوزن، وسكر الدم" : "Testosterone, BMI & cellular energy",
      icon: HeartPulse,
    },
    {
      id: "biomarkers",
      titleEn: "Semen & Biomarker Interpretation",
      titleAr: "مراجعة التحاليل المخبرية",
      specialtyEn: "Andrologist & Male Reproductive Specialist",
      specialtyAr: "استشاري أمراض الذكورة والعقم",
      symptomEn: "Prior Semen / Hormone Lab Review Needed",
      symptomAr: "مراجعة نتائج تحليل السائل المنوي والهرمونات",
      title: isAr ? "مراجعة التحاليل المخبرية" : "Semen & Biomarker Interpretation",
      sub: isAr ? "شرح دقيق للنتائج السابقة" : "Confidential lab panel walkthrough",
      icon: Microscope,
    },
  ];

  const slots = [
    { id: "Today · 2:15 PM", day: isAr ? "اليوم" : "TODAY", time: "2:15 PM" },
    { id: "Today · 5:30 PM", day: isAr ? "اليوم" : "TODAY", time: "5:30 PM" },
    { id: "Tomorrow · 10:00 AM", day: isAr ? "غداً" : "TOMORROW", time: "10:00 AM" },
  ];

  return (
    <div>
      {/* CARE PLANS SECTION — Reference Still-Life Banner + Dual Cards */}
      <section id="care-plans" className="py-20 bg-[#F3F6FA]/70 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">
              {isAr ? "خيارات الرعاية" : "CARE ACCESS"}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-slate-900">
              {isAr
                ? "افحص مجاناً بخصوصية، أو اختر المتابعة السنوية"
                : "Screen per visit, or cover the year"}
            </h2>
          </div>

          {/* Sanctuary Still-Life Wide Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 h-64 sm:h-80">
            <SafeImage
              src={BRAND_IMAGES.stepWellnessKit}
              alt={
                isAr
                  ? "باقة الفحص المنزلي السري والمكملات الوقائية"
                  : "Discreet home biomarker kit and preconception supplements"
              }
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-md border border-white rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
              <div className="inline-flex items-center gap-2 font-semibold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-[#1B5683]" />
                <span>
                  {isAr
                    ? "توصيل سري غير معنون وتوجيه سريري متكامل"
                    : "UNMARKED HOME KIT DISPATCH & ZERO-KNOWLEDGE PRIVACY"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {isAr ? "متاح في جميع إمارات الدولة" : "Included across every pathway"}
              </span>
            </div>
          </div>

          {/* Two Plan Cards Matching WREN Visual Contrast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left Light Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-slate-500">
                    {isAr ? "البوابة الرقمية المفتوحة" : "OPEN FRONT DOOR"}
                  </span>
                  <h3 className="font-editorial text-2xl font-semibold text-slate-900 mt-0.5">
                    {isAr ? "الفحص الفوري المجهول" : "Discreet Risk Screen"}
                  </h3>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="font-editorial text-4xl font-semibold text-slate-900 tabular-nums">
                    $0
                  </span>
                  <span className="text-xs text-slate-500">
                    {isAr ? "/ جلسة فورية" : "/ assessment"}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {isAr
                        ? "محرك الفحص بـ 5 ركائز دون أي بيانات شخصية"
                        : "5-pillar risk engine with zero personal identity"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {isAr
                        ? "قراءة محلية فورية لتحاليل PDF السابقة"
                        : "In-browser OCR lab & semen analysis parser"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {isAr
                        ? "توليد ملخص QR مشفر للطبيب"
                        : "Masked QR clinical summary & consent matrix"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {isAr
                        ? "مسح كامل للبيانات بضغطة واحدة"
                        : "Instant one-click Right to be Forgotten purge"}
                    </span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onJumpToSuite("intake")}
                className="w-full py-3.5 px-5 rounded-xl bg-[#F3F6FA] text-slate-900 text-sm font-semibold hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                {isAr ? "ابدأ الفحص المجاني الآن" : "Start free screening"}
              </button>
            </div>

            {/* Right Deep Atmospheric Gradient Card (Reference Signature) */}
            <div className="bg-gradient-to-br from-[#1B5683] via-[#2A486B] to-[#6B3B4E] text-white rounded-3xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-sky-200 tracking-wide">
                    {isAr ? "المتابعة الوقائية المستمرة" : "CONTINUOUS SANCTUARY"}
                  </span>
                  <span className="text-xs text-rose-200 font-medium">
                    {isAr ? "الأكثر اختياراً للأسرة" : "Preconception Plus"}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl font-semibold text-white">
                  {isAr ? "باقة صحة الرجل الإنجابية الشاملة" : "Men's Reproductive Health Plus"}
                </h3>

                <div className="flex items-baseline gap-1.5">
                  <span className="font-editorial text-4xl font-semibold text-white tabular-nums">
                    AED 95
                  </span>
                  <span className="text-xs text-slate-200">
                    {isAr ? "/ شهرياً" : "/ month"}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-100 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
                    <span>
                      {isAr
                        ? "مراسلة مشفرة على مدار الساعة مع أطباء الذكورة"
                        : "Unlimited 24/7 encrypted clinician messaging"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
                    <span>
                      {isAr
                        ? "باقة فحص منزلي كل 90 يوماً لمتابعة التحسن"
                        : "Quarterly at-home semen & hormone tracking kit"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
                    <span>
                      {isAr
                        ? "أولوية حجز في نفس اليوم بأبوظبي ودبي"
                        : "Priority same-week UAE urology & Doppler slots"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
                    <span>
                      {isAr
                        ? "خطة تغذية ومكملات مخصصة لدورة الـ 90 يوماً"
                        : "Personalized 90-day spermatogenesis nutrition plan"}
                    </span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onJumpToSuite("triage")}
                className="w-full py-3.5 px-5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isAr ? "استكشف مسارات الرعاية" : "Explore Care Pathways"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM INTERACTIVE CONSULTATION MODULE (Matches WREN Reference Footer Card) */}
      <section id="specialists" className="py-20 bg-white px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-12 shadow-xs space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-semibold text-[#1B5683] tracking-wider">
                {isAr
                  ? "استشارة توجيهية أولى مجانية وسرية"
                  : "COMPLIMENTARY INITIAL CONSULTATION"}
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-slate-900 leading-tight balance-text">
                {isAr ? (
                  <>
                    زيارتك الأولى مجانية.{" "}
                    <span className="italic text-[#7F3D4B]">
                      تحدث مع استشاري اليوم.
                    </span>
                  </>
                ) : (
                  <>
                    Your first visit is free.{" "}
                    <em className="italic text-[#7F3D4B]">
                      See a specialist today.
                    </em>
                  </>
                )}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {isAr
                  ? "ابدأ محادثة هادئة ومشفرة مع طبيب متخصص في صحة الرجل والخصوبة الوقائية."
                  : "Begin a confidential conversation with a dedicated male reproductive health physician."}
              </p>
            </div>

            {/* 1. Select Care Focus */}
            <div className="space-y-3">
              <span className="block text-[11px] font-semibold text-slate-500 tracking-wider">
                {isAr ? "1. اختر محور الاهتمام الصحي" : "1. SELECT CARE FOCUS"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {focusOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = focusArea === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setFocusArea(opt.id);
                        setConsultConfirmed(false);
                      }}
                      className={`p-4 rounded-2xl border text-start flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        active
                          ? "bg-[#F3F6FA] border-[#1B5683]"
                          : "bg-[#F8FAFC] border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-white border border-slate-200 text-[#1B5683] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {opt.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {opt.sub}
                          </p>
                        </div>
                      </div>
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-[#1B5683] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Modality & 3. Window */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-3">
                <span className="block text-[11px] font-semibold text-slate-500 tracking-wider">
                  {isAr ? "2. وسيلة التواصل المفضلة" : "2. CONSULTATION MODALITY"}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setModality("video");
                      setConsultConfirmed(false);
                    }}
                    className={`py-3 px-3 rounded-xl border text-center space-y-1 cursor-pointer transition-colors ${
                      modality === "video"
                        ? "bg-[#F3F6FA] border-[#1B5683] text-slate-900"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    <Video className="w-4 h-4 mx-auto text-[#1B5683]" />
                    <span className="block text-xs font-medium">
                      {isAr ? "فيديو مشفر" : "Private Video"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModality("messaging");
                      setConsultConfirmed(false);
                    }}
                    className={`py-3 px-3 rounded-xl border text-center space-y-1 cursor-pointer transition-colors ${
                      modality === "messaging"
                        ? "bg-[#F3F6FA] border-[#1B5683] text-slate-900"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mx-auto text-[#1B5683]" />
                    <span className="block text-xs font-medium">
                      {isAr ? "محادثة صوتية/نصية" : "Voice & Chat"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <span className="block text-[11px] font-semibold text-slate-500 tracking-wider">
                  {isAr ? "3. اختر الموعد المناسب" : "3. SELECT APPOINTMENT WINDOW"}
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {slots.map((s) => {
                    const active = timeSlot === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setTimeSlot(s.id);
                          setConsultConfirmed(false);
                        }}
                        className={`py-3 px-2 rounded-xl border text-center space-y-0.5 cursor-pointer transition-colors ${
                          active
                            ? "bg-[#F3F6FA] border-[#1B5683] text-slate-900"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="block text-[10px] text-slate-400">
                          {s.day}
                        </span>
                        <span className="block text-xs font-semibold font-mono-tabular">
                          {s.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Confirmation Row */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SafeImage
                  src={BRAND_IMAGES.maleClinicianAvatar}
                  alt="Lead Male Clinician"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">
                    {isAr
                      ? "أطباء متخصصون وموثقون في صحة الرجل"
                      : "Verified Male Reproductive Health Specialists"}
                  </p>
                  <p className="text-slate-500">
                    {isAr
                      ? "دون التزام · جلسة سرية لمدة 20 دقيقة"
                      : "Zero PII required · Complimentary 20-minute session"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isBookingSaving}
                onClick={async () => {
                  const chosenFocus =
                    focusOptions.find((f) => f.id === focusArea) ||
                    focusOptions[0];
                  await onDispatchConsultQuery({
                    requestedDoctorOrSpecialtyEn: chosenFocus.specialtyEn,
                    requestedDoctorOrSpecialtyAr: chosenFocus.specialtyAr,
                    selectedSymptomsOverrideEn: [chosenFocus.symptomEn],
                    selectedSymptomsOverrideAr: [chosenFocus.symptomAr],
                    slot: timeSlot,
                    modalityEn:
                      modality === "video"
                        ? "Complimentary Private Video"
                        : "Encrypted Voice & Chat",
                    modalityAr:
                      modality === "video"
                        ? "استشارة مرئية مجانية مشفرة"
                        : "محادثة صوتية ونصية مشفرة",
                    queryNoteEn: `Requesting a meeting regarding ${chosenFocus.titleEn}. Please review my selected symptoms and cooperate on next steps.`,
                    queryNoteAr: `أرغب في حجز لقاء طبي حول ${chosenFocus.titleAr}. يرجى مراجعة الأعراض والتعاون على الخطوات القادمة.`,
                  });
                  setConsultConfirmed(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B5683] text-white text-xs sm:text-sm font-semibold hover:bg-[#154468] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>
                  {isBookingSaving
                    ? isAr
                      ? "جارٍ إرسال الطلب..."
                      : "Sending Request..."
                    : consultConfirmed
                    ? isAr
                      ? "تم إرسال طلب اللقاء"
                      : "Meeting Request Sent"
                    : isAr
                    ? "إرسال طلب لقاء الطبيب"
                    : "Send Request to Meet Doctor"}
                </span>
                {isAr ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {consultConfirmed && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>
                  ✓{" "}
                  {isAr
                    ? `تم إرسال طلب اللقاء (${timeSlot}) وحفظه في قاعدة البيانات ليظهر للطبيب بعد تسجيل الدخول.`
                    : `Meeting request (${timeSlot}) saved and routed to the Doctor Dashboard.`}
                </span>
                <button
                  type="button"
                  onClick={onOpenDoctorPortal}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1B5683] text-white font-semibold hover:bg-[#154468] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isAr ? "تسجيل دخول الطبيب للمراجعة" : "Doctor Login to Review"}
                </button>
              </div>
            )}
          </div>

          {/* Emergency Notice Below Card (Matches Reference Bottom Warning) */}
          <p className="text-center text-xs text-red-700 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isAr
                ? "في حال وجود ألم حاد ومفاجئ في الخصية أو حالة طبية طارئة، يرجى الاتصال بـ 998 أو التوجه لأقرب قسم طوارئ فوراً."
                : "If this is an acute medical emergency or sudden severe testicular pain, please call 998 or visit your nearest emergency room immediately."}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
};
