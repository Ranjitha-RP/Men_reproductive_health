"use client";

import React, { useState } from "react";
import {
  Shield,
  Lock,
  Unlock,
  Flame,
  Activity,
  Stethoscope,
  Microscope,
  FileUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Fingerprint,
  FileText,
  RefreshCw,
} from "lucide-react";
import { IntakeData, Language } from "../../types/clinical";

interface Tab1IntakeWizardProps {
  lang: Language;
  intake: IntakeData;
  onUpdateIntake: (patch: Partial<IntakeData>) => void;
  onCompleteWizard: () => void;
}

export const Tab1IntakeWizard: React.FC<Tab1IntakeWizardProps> = ({
  lang,
  intake,
  onUpdateIntake,
  onCompleteWizard,
}) => {
  const isAr = lang === "ar";
  const [step, setStep] = useState<number>(1);
  const [screenLockEnabled, setScreenLockEnabled] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>("2486");
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);
  const [isSimulatingOcr, setIsSimulatingOcr] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const steps = [
    {
      num: 1,
      title: isAr ? "نمط الحياة والبيئة" : "Lifestyle & Environment",
      icon: Flame,
    },
    {
      num: 2,
      title: isAr ? "الصحة الأيضية والبدنية" : "Metabolic & Physical",
      icon: Activity,
    },
    {
      num: 3,
      title: isAr ? "التاريخ التشريحي والجراحي" : "Anatomical & History",
      icon: Stethoscope,
    },
    {
      num: 4,
      title: isAr ? "التاريخ الطبي والالتهابات" : "Infectious & Medical",
      icon: Microscope,
    },
    {
      num: 5,
      title: isAr ? "رفع التحاليل والمؤشرات" : "Lab Biomarkers (OCR)",
      icon: FileUp,
    },
  ];

  const handleToggleLockFeature = () => {
    if (!screenLockEnabled) {
      setScreenLockEnabled(true);
      setIsLocked(true);
      setPinInput("");
      setPinError(false);
    } else {
      setScreenLockEnabled(false);
      setIsLocked(false);
    }
  };

  const handleUnlockAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === pinCode) {
      setIsLocked(false);
      setPinInput("");
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleBiometricUnlock = () => {
    setIsLocked(false);
    setPinInput("");
    setPinError(false);
  };

  const triggerSampleOcrUpload = (fileNameOverride?: string) => {
    setIsSimulatingOcr(true);
    setTimeout(() => {
      onUpdateIntake({
        labFileUploaded: true,
        labFileName:
          fileNameOverride ||
          (isAr ? "تحليل_هرمونات_وسائل_منوي_2026.pdf" : "Sample_Andrology_Lab_Report_2026.pdf"),
        spermConcentrationMml: 19,
        totalMotilityPercent: 36,
        morningTestosteroneNgDl: 345,
        fshIuL: 7.2,
      });
      setIsSimulatingOcr(false);
    }, 550);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      triggerSampleOcrUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerSampleOcrUpload(file.name);
    }
  };

  const progressPercent = (step / 5) * 100;

  return (
    <div className="space-y-6 relative">
      {/* Zero-Knowledge Security & Screen Lock Bar */}
      <div className="bg-[#F3F6FA] border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1B5683]/10 text-[#1B5683] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {isAr
                ? "وضع عدم المعرفة نشط (Zero-Knowledge Mode Active)"
                : "Zero-Knowledge Mode Active"}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {isAr
                ? "لا يتم طلب أو تخزين أي بيانات هوية شخصية (الاسم، الهاتف، أو رقم الهوية). المعالجة محلية بالكامل."
                : "No personal identity (Name, Phone, or National ID) is stored or required. All risk calculations run locally in memory."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          {screenLockEnabled && !isLocked && (
            <button
              type="button"
              onClick={() => setIsLocked(true)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isAr ? "قفل الشاشة الآن" : "Lock Screen Now"}
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleLockFeature}
            aria-pressed={screenLockEnabled}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              screenLockEnabled
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            {screenLockEnabled ? (
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>
              {isAr
                ? screenLockEnabled
                  ? "قفل البصمة / الرمز مفعل"
                  : "تفعيل قفل الرمز / البصمة"
                : screenLockEnabled
                ? "PIN / Biometric Lock On"
                : "Enable PIN / Biometric Lock"}
            </span>
          </button>
        </div>
      </div>

      {/* Simulated Local PIN / Biometric Privacy Curtain */}
      {isLocked ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto my-6 space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-semibold text-slate-900">
              {isAr ? "جلسة الفحص محمية محلياً" : "Assessment Session Locally Locked"}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? `أدخل رمز الحماية المحلي (${pinCode}) أو استخدم البصمة المحاكاة للمتابعة.`
                : `Enter local session PIN (${pinCode}) or use simulated biometric authentication to resume.`}
            </p>
          </div>

          <form onSubmit={handleUnlockAttempt} className="space-y-3">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, ""));
                setPinError(false);
              }}
              placeholder="••••"
              className="w-40 text-center tracking-[0.5em] font-mono-tabular text-lg py-2.5 px-4 border border-slate-300 rounded-xl focus:outline-none focus:border-[#1B5683]"
            />
            {pinError && (
              <p className="text-xs text-red-600">
                {isAr ? `الرمز غير صحيح. جرّب ${pinCode}` : `Incorrect PIN. Try demo PIN ${pinCode}`}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1B5683] text-white text-xs font-semibold rounded-xl hover:bg-[#154468] transition-colors cursor-pointer"
              >
                {isAr ? "فتح بالرمز" : "Unlock with PIN"}
              </button>
              <button
                type="button"
                onClick={handleBiometricUnlock}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Fingerprint className="w-4 h-4 text-[#1B5683]" />
                <span>{isAr ? "بصمة الوجه / الإصبع" : "Biometric Pass"}</span>
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>{isAr ? "تخصيص الرمز التجريبي:" : "Customize local PIN:"}</span>
            <input
              type="text"
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "") || "2486")}
              className="w-14 text-center font-mono-tabular border border-slate-200 rounded px-1.5 py-0.5 text-slate-600"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8">
          {/* Progress Header & Stepper */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-slate-500">
                  {isAr
                    ? `الركيزة ${step} من 5 · الفحص المبكر السري`
                    : `Pillar ${step} of 5 · Proactive Risk Screening`}
                </span>
                <h3 className="text-xl font-semibold text-slate-900 mt-0.5">
                  {steps[step - 1].title}
                </h3>
              </div>
              <span className="text-xs font-mono-tabular font-semibold text-[#1B5683]">
                {Math.round(progressPercent)}% {isAr ? "مكتمل" : "Complete"}
              </span>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B5683] transition-transform duration-200 origin-left"
                style={{
                  transform: `scaleX(${progressPercent / 100})`,
                  transformOrigin: isAr ? "right" : "left",
                }}
              />
            </div>

            {/* Interactive Step Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {steps.map((s) => {
                const Icon = s.icon;
                const active = s.num === step;
                const done = s.num < step;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setStep(s.num)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-start transition-colors cursor-pointer ${
                      active
                        ? "bg-[#0F172A] text-white border-[#0F172A]"
                        : done
                        ? "bg-[#F3F6FA] text-slate-800 border-slate-200 hover:border-slate-300"
                        : "bg-white text-slate-500 border-slate-200/80 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium truncate">
                      0{s.num}. {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: LIFESTYLE & ENVIRONMENT */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OptionGroup
                label={
                  isAr
                    ? "ساعات الجلوس المتواصل يومياً (المكتب / القيادة)"
                    : "Daily Prolonged Sitting Duration (Desk / Driving)"
                }
                value={intake.sittingHoursPerDay}
                onChange={(val) =>
                  onUpdateIntake({
                    sittingHoursPerDay: val as IntakeData["sittingHoursPerDay"],
                  })
                }
                options={[
                  {
                    value: "under4",
                    label: isAr ? "أقل من 4 ساعات" : "Under 4 hrs/day",
                  },
                  {
                    value: "4to7",
                    label: isAr ? "4 إلى 7 ساعات" : "4–7 hrs/day",
                  },
                  {
                    value: "8plus",
                    label: isAr ? "+8 ساعات يومياً" : "8+ hrs/day (High sedentary)",
                  },
                ]}
              />

              <OptionGroup
                label={
                  isAr
                    ? "التعرض للحرارة الموضعية (الحاسوب على الحجر، الساونا، المغاطس الحارة)"
                    : "Pelvic Thermal Exposure (Laptop on lap, saunas, hot baths)"
                }
                value={intake.thermalExposure}
                onChange={(val) =>
                  onUpdateIntake({
                    thermalExposure: val as IntakeData["thermalExposure"],
                  })
                }
                options={[
                  { value: "none", label: isAr ? "نادراً / لا يوجد" : "Minimal / None" },
                  {
                    value: "occasional",
                    label: isAr ? "مرة إلى مرتين أسبوعياً" : "1–2x per week",
                  },
                  {
                    value: "frequent",
                    label: isAr ? "3 مرات أو أكثر أسبوعياً" : "3+ times/week (Elevated heat)",
                  },
                ]}
              />

              <OptionGroup
                label={isAr ? "جودة وانتظام النوم الليلي" : "Sleep Architecture & Duration"}
                value={intake.sleepQuality}
                onChange={(val) =>
                  onUpdateIntake({ sleepQuality: val as IntakeData["sleepQuality"] })
                }
                options={[
                  {
                    value: "optimal",
                    label: isAr ? "7-8 ساعات منتظمة" : "7–8 hrs restful",
                  },
                  {
                    value: "irregular",
                    label: isAr ? "متقطع / سهر متكرر" : "Irregular / Shift schedule",
                  },
                  {
                    value: "poor",
                    label: isAr ? "أقل من 6 ساعات" : "Under 6 hrs / Chronic insomnia",
                  },
                ]}
              />

              <OptionGroup
                label={isAr ? "مستوى الضغط النفسي والمهني" : "Perceived Work & Life Stress"}
                value={intake.stressLevel}
                onChange={(val) =>
                  onUpdateIntake({ stressLevel: val as IntakeData["stressLevel"] })
                }
                options={[
                  { value: "low", label: isAr ? "منخفض ومتوازن" : "Low / Managed" },
                  { value: "moderate", label: isAr ? "متوسط" : "Moderate" },
                  { value: "high", label: isAr ? "مرتفع ومستمر" : "High sustained stress" },
                ]}
              />

              <OptionGroup
                label={isAr ? "التدخين أو السجائر الإلكترونية (Vape)" : "Smoking / Vaping / Shisha"}
                value={intake.nicotineHabit}
                onChange={(val) =>
                  onUpdateIntake({ nicotineHabit: val as IntakeData["nicotineHabit"] })
                }
                options={[
                  { value: "none", label: isAr ? "غير مدخن" : "None" },
                  {
                    value: "vaping_occasional",
                    label: isAr ? "تدخين إلكتروني / متقطع" : "Vaping / Occasional",
                  },
                  {
                    value: "daily_smoking",
                    label: isAr ? "مدخن يومي" : "Daily tobacco / shisha",
                  },
                ]}
              />

              <OptionGroup
                label={isAr ? "استهلاك الكحول" : "Alcohol Frequency"}
                value={intake.alcoholFrequency}
                onChange={(val) =>
                  onUpdateIntake({
                    alcoholFrequency: val as IntakeData["alcoholFrequency"],
                  })
                }
                options={[
                  { value: "none", label: isAr ? "لا يوجد" : "None" },
                  { value: "occasional", label: isAr ? "نادر" : "Occasional (1–2/wk)" },
                  { value: "frequent", label: isAr ? "متكرر" : "Frequent (5+ drinks/wk)" },
                ]}
              />
            </div>
          )}

          {/* STEP 2: METABOLIC & PHYSICAL HEALTH */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OptionGroup
                label={isAr ? "نطاق مؤشر كتلة الجسم (BMI)" : "Self-Reported BMI / Weight Profile"}
                value={intake.bmiRange}
                onChange={(val) =>
                  onUpdateIntake({ bmiRange: val as IntakeData["bmiRange"] })
                }
                options={[
                  {
                    value: "normal_18_24",
                    label: isAr ? "طبيعي (18.5 – 24.9)" : "Optimal (BMI 18.5–24.9)",
                  },
                  {
                    value: "elevated_25_28",
                    label: isAr ? "زيادة طفيفة (25 – 28)" : "Moderately Elevated (25–28)",
                  },
                  {
                    value: "high_over_28",
                    label: isAr ? "مرتفع (> 28)" : "BMI > 28 (Metabolic priority)",
                  },
                ]}
              />

              <OptionGroup
                label={
                  isAr
                    ? "تاريخ سكر الدم التراكمي (HbA1c) أو مقاومة الإنسولين"
                    : "Blood Sugar / HbA1c History"
                }
                value={intake.hba1cStatus}
                onChange={(val) =>
                  onUpdateIntake({ hba1cStatus: val as IntakeData["hba1cStatus"] })
                }
                options={[
                  { value: "normal", label: isAr ? "طبيعي (< 5.7%)" : "Normal (< 5.7%)" },
                  {
                    value: "borderline_prediabetic",
                    label: isAr ? "مرحلة ما قبل السكري" : "Borderline / Insulin resistance",
                  },
                  {
                    value: "elevated_diabetic",
                    label: isAr ? "سكري مشخص" : "Elevated / Managed diabetes",
                  },
                  { value: "unknown", label: isAr ? "غير مفحوص مؤخراً" : "Not tested recently" },
                ]}
              />

              <OptionGroup
                label={isAr ? "قراءات ضغط الدم" : "Blood Pressure Status"}
                value={intake.bloodPressureFlag}
                onChange={(val) =>
                  onUpdateIntake({
                    bloodPressureFlag: val as IntakeData["bloodPressureFlag"],
                  })
                }
                options={[
                  {
                    value: "normal",
                    label: isAr ? "طبيعي (< 120/80)" : "Normal (< 120/80 mmHg)",
                  },
                  {
                    value: "borderline",
                    label: isAr ? "حدّي (125–139)" : "Elevated / Borderline",
                  },
                  {
                    value: "hypertensive",
                    label: isAr ? "ارتفاع ضغط الدم" : "Hypertension flag",
                  },
                ]}
              />

              <OptionGroup
                label={isAr ? "مؤشرات الدهون والكوليسترول" : "Lipid & Triglyceride Profile"}
                value={intake.lipidProfile}
                onChange={(val) =>
                  onUpdateIntake({ lipidProfile: val as IntakeData["lipidProfile"] })
                }
                options={[
                  { value: "normal", label: isAr ? "ضمن المعدل الطبيعي" : "Within normal range" },
                  {
                    value: "dyslipidemia",
                    label: isAr ? "ارتفاع الدهون الثلاثية / الكوليسترول" : "Elevated lipids / triglycerides",
                  },
                  { value: "unknown", label: isAr ? "غير معروف" : "Unknown" },
                ]}
              />
            </div>
          )}

          {/* STEP 3: ANATOMICAL, VARICOCELE & RED FLAG CHECK */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleCheckCard
                  checked={intake.dullTesticularAche}
                  onChange={(v) => onUpdateIntake({ dullTesticularAche: v })}
                  title={
                    isAr
                      ? "ألم خفيف متكرر أو انزعاج غير حاد"
                      : "Intermittent dull testicular ache"
                  }
                  subtitle={
                    isAr
                      ? "شعور بانزعاج خفيف يظهر غالباً في نهاية اليوم أو بعد المجهود."
                      : "Mild aching sensation, often more noticeable late in the day."
                  }
                />

                <ToggleCheckCard
                  checked={intake.scrotalHeavinessAfterStanding}
                  onChange={(v) => onUpdateIntake({ scrotalHeavinessAfterStanding: v })}
                  title={
                    isAr
                      ? "شعور بالثقل بعد الوقوف المطوّل أو الرياضة"
                      : "Scrotal heaviness after standing or exercise"
                  }
                  subtitle={
                    isAr
                      ? "يتحسن عادةً عند الاستلقاء (علامة كلاسيكية لارتجاع الأوردة)."
                      : "Typically eases when lying flat (classic venous reflux pattern)."
                  }
                />

                <ToggleCheckCard
                  checked={intake.visibleVeinSwelling}
                  onChange={(v) => onUpdateIntake({ visibleVeinSwelling: v })}
                  title={
                    isAr
                      ? "ملاحظة توسع أو انتفاخ في الأوردة (مؤشر دوالي الخصية)"
                      : "Visible or palpable enlarged veins (Varicocele flag)"
                  }
                  subtitle={
                    isAr
                      ? "تورم وريدي غير مؤلم يشبه تجمّع الأوردة الدقيقة."
                      : "Noticeable venous fullness above the testicle."
                  }
                />

                <ToggleCheckCard
                  checked={intake.cryptorchidismHistory}
                  onChange={(v) => onUpdateIntake({ cryptorchidismHistory: v })}
                  title={
                    isAr
                      ? "تاريخ سابق للخصية الهاجرة في الطفولة (Cryptorchidism)"
                      : "Childhood history of undescended testicle (Cryptorchidism)"
                  }
                  subtitle={
                    isAr
                      ? "سواء نزلت تلقائياً أو تم تثبيتها جراحياً في الصغر."
                      : "Including surgically corrected orchidopexy in infancy/childhood."
                  }
                />

                <ToggleCheckCard
                  checked={intake.testicularTraumaOrSurgery}
                  onChange={(v) => onUpdateIntake({ testicularTraumaOrSurgery: v })}
                  title={
                    isAr
                      ? "إصابة رياضية سابقة أو جراحة أربية / فتق"
                      : "Prior physical testicular trauma or inguinal hernia repair"
                  }
                  subtitle={
                    isAr
                      ? "تاريخ إصابة مباشرة أو عمليات جراحية في منطقة الحوض."
                      : "History of significant groin impact or prior pelvic surgery."
                  }
                />
              </div>

              {/* Acute Clinical Red Flag Safety Screening */}
              <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-red-950">
                    {isAr
                      ? "فحص الأمان للأعراض الطارئة الحادة (حاجز الأمان السريري)"
                      : "Acute Symptom Safety Check (Emergency Guardrail)"}
                  </h4>
                  <p className="text-xs text-red-800 mt-0.5">
                    {isAr
                      ? "إذا كنت تعاني من أي من الأعراض الحادة التالية الآن، سيقوم النظام بتوجيهك فوراً للتقييم الطبي العاجل."
                      : "Checking any acute symptom below triggers our immediate clinical safety guardrail in Smart Triage."}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ToggleCheckCard
                    danger
                    checked={intake.acuteSevereTesticularPain}
                    onChange={(v) => onUpdateIntake({ acuteSevereTesticularPain: v })}
                    title={isAr ? "ألم حاد ومفاجئ وشديد" : "Sudden severe testicular pain"}
                    subtitle={isAr ? "بدأ خلال الساعات الماضية" : "Acute onset within hours"}
                  />
                  <ToggleCheckCard
                    danger
                    checked={intake.acuteSuddenSwellingOrFever}
                    onChange={(v) => onUpdateIntake({ acuteSuddenSwellingOrFever: v })}
                    title={isAr ? "تورم حاد مفاجئ مع حرارة" : "Acute rapid swelling or fever"}
                    subtitle={isAr ? "احمرار أو ألم شديد باللمس" : "Rapid inflammation or chills"}
                  />
                  <ToggleCheckCard
                    danger
                    checked={intake.hematospermia}
                    onChange={(v) => onUpdateIntake({ hematospermia: v })}
                    title={isAr ? "وجود دم في السائل المنوي" : "Blood visible in semen"}
                    subtitle={isAr ? "تغير لوني وردي أو أحمر" : "Hematospermia observation"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: INFECTIOUS & MEDICAL HISTORY */}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ToggleCheckCard
                checked={intake.postPubertyMumps}
                onChange={(v) => onUpdateIntake({ postPubertyMumps: v })}
                title={
                  isAr
                    ? "الإصابة بالنكاف بعد سن البلوغ"
                    : "Post-puberty mumps history"
                }
                subtitle={
                  isAr
                    ? "عدوى فيروسية بعد سن 12 عاماً قد تؤثر على أنسجة الخصية."
                    : "Viral mumps infection occurring after age 12."
                }
              />

              <ToggleCheckCard
                checked={intake.priorStiHistory}
                onChange={(v) => onUpdateIntake({ priorStiHistory: v })}
                title={
                  isAr
                    ? "تاريخ سابق لالتهابات منقولة عولجت أو لم تعالج"
                    : "Prior history of urogenital / STI infection"
                }
                subtitle={
                  isAr
                    ? "قد تترك آثاراً التهابية صامتة قابلة للعلاج بالمضادات المناسبة."
                    : "Even resolved infections can occasionally leave treatable ductal inflammation."
                }
              />

              <ToggleCheckCard
                checked={intake.chronicPelvicOrUrinaryInfection}
                onChange={(v) =>
                  onUpdateIntake({ chronicPelvicOrUrinaryInfection: v })
                }
                title={
                  isAr
                    ? "التهابات متكررة في المسالك البولية أو البروستاتا"
                    : "Recurrent urinary tract or chronic pelvic inflammation"
                }
                subtitle={
                  isAr
                    ? "حرقة متكررة أو انزعاج مزمن في منطقة الحوض."
                    : "History of prostatitis symptoms or recurrent UTIs."
                }
              />
            </div>
          )}

          {/* STEP 5: LAB / BIOMARKER OCR UPLOAD */}
          {step === 5 && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-[#1B5683] bg-[#F3F6FA]"
                    : "border-slate-300 bg-[#F8FAFC] hover:border-slate-400"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-[#1B5683]">
                  {isSimulatingOcr ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileUp className="w-5 h-5" />
                  )}
                </div>

                <h4 className="text-base font-semibold text-slate-900">
                  {isAr
                    ? "اسحب وأفلت ملف التحاليل المخبرية (PDF / صورة) للاستخراج الضوئي المحلي"
                    : "Drag & Drop Existing Bloodwork or Semen Analysis PDF (Local OCR)"}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                  {isAr
                    ? "يدعم قراءة تركيز وحركة الحيوانات المنوية، التستوستيرون الصباحي، وهرمون FSH دون رفع الملف لأي خادم خارجي."
                    : "Extracts Sperm Concentration, Total Motility, Morning Testosterone, and FSH locally in-browser without cloud storage."}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <label className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
                    <span>{isAr ? "اختيار ملف من الجهاز" : "Browse Local PDF / Image"}</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => triggerSampleOcrUpload()}
                    disabled={isSimulatingOcr}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B5683] text-white rounded-xl text-xs font-semibold hover:bg-[#154468] transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>
                      {isSimulatingOcr
                        ? isAr
                          ? "جاري تحليل القيم..."
                          : "Parsing Biomarkers..."
                        : isAr
                        ? "محاكاة رفع تحليل نموذجي (OCR)"
                        : "Simulate Sample Upload"}
                    </span>
                  </button>
                </div>

                {intake.labFileUploaded && (
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isAr ? "تم استخراج البيانات من:" : "Parsed locally from:"}{" "}
                      <strong className="font-mono-tabular">{intake.labFileName}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Editable Parsed Lab Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <LabNumberField
                  label={isAr ? "تركيز الحيوانات المنوية (M/mL)" : "Sperm Concentration (M/mL)"}
                  refNote={isAr ? "مرجع WHO ≥ 16" : "WHO ref ≥ 16 M/mL"}
                  value={intake.spermConcentrationMml}
                  onChange={(val) =>
                    onUpdateIntake({
                      labFileUploaded: true,
                      spermConcentrationMml: val,
                    })
                  }
                />
                <LabNumberField
                  label={isAr ? "الحركة الكلية (%)" : "Total Motility (%)"}
                  refNote={isAr ? "مرجع WHO ≥ 42%" : "WHO ref ≥ 42%"}
                  value={intake.totalMotilityPercent}
                  onChange={(val) =>
                    onUpdateIntake({
                      labFileUploaded: true,
                      totalMotilityPercent: val,
                    })
                  }
                />
                <LabNumberField
                  label={isAr ? "التستوستيرون الصباحي (ng/dL)" : "Morning Testosterone (ng/dL)"}
                  refNote={isAr ? "المعدل 350–950" : "Ref 350–950 ng/dL"}
                  value={intake.morningTestosteroneNgDl}
                  onChange={(val) =>
                    onUpdateIntake({
                      labFileUploaded: true,
                      morningTestosteroneNgDl: val,
                    })
                  }
                />
                <LabNumberField
                  label={isAr ? "الهرمون المنبه للجريب FSH (IU/L)" : "Serum FSH (IU/L)"}
                  refNote={isAr ? "المعدل 1.5–8.5" : "Optimal 1.5–8.5 IU/L"}
                  value={intake.fshIuL}
                  onChange={(val) =>
                    onUpdateIntake({
                      labFileUploaded: true,
                      fshIuL: val,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{isAr ? "الخطوة السابقة" : "Previous Step"}</span>
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#1B5683] text-white hover:bg-[#154468] transition-colors cursor-pointer"
              >
                <span>{isAr ? "الركيزة التالية" : "Continue to Next Pillar"}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={onCompleteWizard}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#059669] text-white hover:bg-[#047857] transition-colors cursor-pointer"
              >
                <span>
                  {isAr
                    ? "عرض التقرير التفسيري الذكي للمخاطر"
                    : "View Explainable Risk Report"}
                </span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface OptionGroupProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const OptionGroup: React.FC<OptionGroupProps> = ({
  label,
  value,
  options,
  onChange,
}) => (
  <div className="space-y-2.5">
    <label className="block text-sm font-medium text-slate-900">{label}</label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-medium border text-start transition-colors cursor-pointer ${
              selected
                ? "bg-[#1B5683] text-white border-[#1B5683]"
                : "bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

interface ToggleCheckCardProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  title: string;
  subtitle: string;
  danger?: boolean;
}

const ToggleCheckCard: React.FC<ToggleCheckCardProps> = ({
  checked,
  onChange,
  title,
  subtitle,
  danger = false,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`w-full p-4 rounded-xl border text-start transition-colors cursor-pointer flex items-start justify-between gap-3 ${
      checked
        ? danger
          ? "bg-red-600 text-white border-red-600"
          : "bg-[#0F172A] text-white border-[#0F172A]"
        : danger
        ? "bg-white text-slate-900 border-red-200 hover:border-red-300"
        : "bg-[#F8FAFC] text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-white"
    }`}
  >
    <div className="space-y-1">
      <p className="text-xs font-semibold leading-snug">{title}</p>
      <p
        className={`text-[11px] leading-relaxed ${
          checked ? "text-slate-200" : "text-slate-500"
        }`}
      >
        {subtitle}
      </p>
    </div>
    <div
      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
        checked
          ? "bg-white text-slate-900 border-white"
          : "border-slate-300 bg-white"
      }`}
    >
      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-[#1B5683]" />}
    </div>
  </button>
);

interface LabNumberFieldProps {
  label: string;
  refNote: string;
  value: number | null;
  onChange: (val: number | null) => void;
}

const LabNumberField: React.FC<LabNumberFieldProps> = ({
  label,
  refNote,
  value,
  onChange,
}) => (
  <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 space-y-1.5">
    <label className="block text-xs font-semibold text-slate-800">{label}</label>
    <input
      type="number"
      step="0.1"
      value={value ?? ""}
      placeholder="—"
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === "" ? null : Number(raw));
      }}
      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono-tabular text-slate-900 focus:outline-none focus:border-[#1B5683]"
    />
    <span className="block text-[11px] text-slate-500 font-mono-tabular">{refNote}</span>
  </div>
);
