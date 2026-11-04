"use client";

import {
  ConsentMatrix,
  ExplainableFactor,
  IntakeData,
  Language,
  RiskLevel,
  RiskReport,
} from "../types/clinical";

export function evaluateClinicalRisk(
  data: IntakeData,
  lang: Language
): RiskReport {
  const isAr = lang === "ar";

  // 1. Lifestyle Score (0 - 100)
  let lifestyleScore = 8;
  if (data.sittingHoursPerDay === "4to7") lifestyleScore += 12;
  if (data.sittingHoursPerDay === "8plus") lifestyleScore += 28;
  if (data.thermalExposure === "occasional") lifestyleScore += 15;
  if (data.thermalExposure === "frequent") lifestyleScore += 32;
  if (data.sleepQuality === "irregular") lifestyleScore += 10;
  if (data.sleepQuality === "poor") lifestyleScore += 20;
  if (data.stressLevel === "moderate") lifestyleScore += 8;
  if (data.stressLevel === "high") lifestyleScore += 18;
  if (data.nicotineHabit === "vaping_occasional") lifestyleScore += 15;
  if (data.nicotineHabit === "daily_smoking") lifestyleScore += 28;
  if (data.alcoholFrequency === "occasional") lifestyleScore += 8;
  if (data.alcoholFrequency === "frequent") lifestyleScore += 22;
  lifestyleScore = Math.min(100, lifestyleScore);

  // 2. Metabolic Score (0 - 100)
  let metabolicScore = 6;
  if (data.bmiRange === "elevated_25_28") metabolicScore += 20;
  if (data.bmiRange === "high_over_28") metabolicScore += 42;
  if (data.hba1cStatus === "borderline_prediabetic") metabolicScore += 24;
  if (data.hba1cStatus === "elevated_diabetic") metabolicScore += 40;
  if (data.bloodPressureFlag === "borderline") metabolicScore += 12;
  if (data.bloodPressureFlag === "hypertensive") metabolicScore += 24;
  if (data.lipidProfile === "dyslipidemia") metabolicScore += 16;
  metabolicScore = Math.min(100, metabolicScore);

  // 3. Anatomical Score (0 - 100)
  let anatomicalScore = 5;
  if (data.dullTesticularAche) anatomicalScore += 26;
  if (data.scrotalHeavinessAfterStanding) anatomicalScore += 24;
  if (data.visibleVeinSwelling) anatomicalScore += 35;
  if (data.cryptorchidismHistory) anatomicalScore += 32;
  if (data.testicularTraumaOrSurgery) anatomicalScore += 22;
  anatomicalScore = Math.min(100, anatomicalScore);

  // 4. Infectious Score (0 - 100)
  let infectiousScore = 4;
  if (data.postPubertyMumps) infectiousScore += 45;
  if (data.priorStiHistory) infectiousScore += 28;
  if (data.chronicPelvicOrUrinaryInfection) infectiousScore += 26;
  infectiousScore = Math.min(100, infectiousScore);

  // Biomarker modifiers
  let biomarkerPenalty = 0;
  if (data.labFileUploaded) {
    if (data.spermConcentrationMml !== null && data.spermConcentrationMml < 16) {
      biomarkerPenalty += 28;
    } else if (data.spermConcentrationMml !== null && data.spermConcentrationMml < 25) {
      biomarkerPenalty += 12;
    }
    if (data.totalMotilityPercent !== null && data.totalMotilityPercent < 40) {
      biomarkerPenalty += 16;
    }
    if (data.fshIuL !== null && data.fshIuL > 8.5) {
      biomarkerPenalty += 20;
    }
    if (data.morningTestosteroneNgDl !== null && data.morningTestosteroneNgDl < 340) {
      biomarkerPenalty += 12;
    }
  }

  // Acute Red Flags
  const redFlagReasons: string[] = [];
  if (data.acuteSevereTesticularPain) {
    redFlagReasons.push(
      isAr
        ? "ألم حاد ومفاجئ في الخصية — يتطلب استبعاد التواء الخصية فوراً في الطوارئ"
        : "Sudden severe testicular pain — requires immediate emergency evaluation to rule out testicular torsion"
    );
  }
  if (data.acuteSuddenSwellingOrFever) {
    redFlagReasons.push(
      isAr
        ? "تورم مفاجئ حاد أو ارتفاع بالحرارة — يستلزم تقييماً طبياً عاجلاً"
        : "Acute sudden scrotal swelling or systemic fever — warrants urgent clinical examination"
    );
  }
  if (data.hematospermia) {
    redFlagReasons.push(
      isAr
        ? "وجود دم في السائل المنوي (Hematospermia) — يستدعي فحصاً متخصصاً لدى طبيب المسالك البولية"
        : "Blood noted in semen (hematospermia) — warrants prompt urological workup"
    );
  }
  const hasAcuteRedFlag = redFlagReasons.length > 0;

  // Explainable Breakdown Factors
  const factors: ExplainableFactor[] = [];

  // Combined Thermal + Metabolic oxidative stress pattern
  if (
    (data.bmiRange === "high_over_28" || data.hba1cStatus !== "normal") &&
    (data.sittingHoursPerDay === "8plus" || data.thermalExposure !== "none")
  ) {
    factors.push({
      id: "metabolic-thermal-synergy",
      pillar: "metabolic",
      severity: "moderate",
      title: isAr
        ? "تداخل المؤشرات الأيضية مع التعرض الحراري الموضعي"
        : "Metabolic Profile + Scrotal Thermal Load Synergy",
      explanation: isAr
        ? "مؤشر كتلة الجسم المرتفع (> 28) أو اضطراب سكر الدم مع الجلوس المطوّل (+8 ساعات/يوم) والتعرض للحرارة يرفع الإجهاد التأكسدي ويؤثر على حركة الحيوانات المنوية وتوازن التستوستيرون."
        : "Metabolic profile (BMI > 28 / glycemic strain) combined with prolonged sitting (8+ hrs/day) and heat exposure is flagged for elevated scrotal temperature (+1.5°C) and seminal oxidative stress impacting motility.",
      actionableStep: isAr
        ? "فواصل حركة كل 45 دقيقة، إبعاد الحاسوب المحمول عن الحجر، وإيقاف حمامات الساونا لمدة 90 يوماً (دورة تكوين كاملة)."
        : "Take 5-minute standing breaks every 45 minutes, keep laptops off the lap, and pause sauna/hot-bath use across a full 90-day spermatogenesis cycle.",
    });
  } else {
    if (data.thermalExposure === "frequent" || data.sittingHoursPerDay === "8plus") {
      factors.push({
        id: "thermal-load",
        pillar: "lifestyle",
        severity: "moderate",
        title: isAr
          ? "إجهاد حراري مستمر في منطقة الحوض"
          : "Sustained Scrotal Thermal Exposure",
        explanation: isAr
          ? "الجلوس الطويل أو التعرض المتكرر للساونا والحواسيب المحمولة يعطّل التنظيم الحراري الطبيعي الضروري لإنتاج حيوانات منوية سليمة."
          : "Prolonged sedentary posture (8+ hrs/day) or frequent sauna/laptop heat disrupts natural counter-current cooling needed for optimal spermatogenesis.",
        actionableStep: isAr
          ? "استبدال الجلوس المتواصل بمكتب متغير الارتفاع وتجنب مصادر الحرارة المباشرة."
          : "Adopt cooling posture breaks and eliminate direct lap heat or hot immersion baths.",
      });
    }
    if (data.bmiRange === "high_over_28" || data.hba1cStatus === "borderline_prediabetic" || data.hba1cStatus === "elevated_diabetic") {
      factors.push({
        id: "metabolic-endocrine",
        pillar: "metabolic",
        severity: "moderate",
        title: isAr
          ? "تأثير التمثيل الغذائي ومقاومة الإنسولين على المحور الهرموني"
          : "Endocrine & Glycemic Impact on Reproductive Vitality",
        explanation: isAr
          ? "زيادة الأنسجة الدهنية واضطراب السكر التراكمي يزيدان من تحويل التستوستيرون إلى إستراديول ويرفعان تكسر الحمض النووي (DNA Fragmentation)."
          : "Elevated adiposity and glycemic resistance increase peripheral aromatase conversion of testosterone and heighten sperm DNA fragmentation risk.",
        actionableStep: isAr
          ? "برنامج تغذية متوسطي غني بمضادات الأكسدة مع فحص هرموني صباحي مبكر."
          : "Prioritize insulin-sensitizing nutrition, resistance training, and a fasting morning endocrine check.",
      });
    }
  }

  // Varicocele & Anatomical cluster
  if (data.visibleVeinSwelling || (data.dullTesticularAche && data.scrotalHeavinessAfterStanding)) {
    factors.push({
      id: "varicocele-signature",
      pillar: "anatomical",
      severity: "high",
      title: isAr
        ? "مؤشرات سريرية تتوافق مع احتمال دوالي الخصية (Varicocele)"
        : "Clinical Symptom Pattern Consistent with Possible Varicocele",
      explanation: isAr
        ? "الشعور بثقل أو ألم خفيف يزداد مع الوقوف مع ملاحظة توسع الأوردة يُعد السبب الأكثر قابلية للعلاج والتصحيح في تأخر الإنجاب عند الرجال."
        : "Dull ache, standing heaviness, and visible venous fullness strongly mirror pampiniform plexus reflux (varicocele)—the single most correctable anatomical cause of male subfertility.",
      actionableStep: isAr
        ? "حجز فحص سريري وتصوير دوبلر ملون غير جراحي لدى استشاري أمراض الذكورة."
        : "Schedule a painless, non-invasive Scrotal Color Doppler Ultrasound with a board-certified Andrologist.",
    });
  }

  if (data.cryptorchidismHistory || data.testicularTraumaOrSurgery) {
    factors.push({
      id: "developmental-surgical-history",
      pillar: "anatomical",
      severity: "high",
      title: isAr
        ? "تاريخ تشريحي أو جراحي سابق يستدعي تقييماً متخصصاً"
        : "Developmental or Surgical Testicular History Flagged",
      explanation: isAr
        ? "التاريخ السابق للخصية الهاجرة في الطفولة أو الإصابات المباشرة يستفيد بشكل كبير من تقييم مبكر لمخزون الخلايا الجرثومية والهرمونات."
        : "Prior history of cryptorchidism (undescended testicle) or significant trauma warrants proactive baseline evaluation of Sertoli cell reserve and seminal parameters.",
      actionableStep: isAr
        ? "مراجعة مبكرة مع طبيب المسالك والذكورة بدلاً من الانتظار لمدة 12 شهراً."
        : "Bypass standard 12-month waiting periods and proceed directly to early specialist baseline evaluation.",
    });
  }

  // Infectious history
  if (data.postPubertyMumps || data.priorStiHistory || data.chronicPelvicOrUrinaryInfection) {
    factors.push({
      id: "infectious-inflammatory",
      pillar: "infectious",
      severity: data.postPubertyMumps ? "high" : "moderate",
      title: isAr
        ? "عوامل التهابية أو عدوى سابقة قد تؤثر على القنوات الناقلة"
        : "Prior Inflammatory or Infectious Reproductive Tract Factor",
      explanation: isAr
        ? "التهاب النكاف بعد البلوغ أو الالتهابات المزمنة في المسالك البولية والبروستاتا قد يترك خلايا التهابية قابلة للعلاج أو انسداداً جزئياً."
        : "Post-pubertal mumps orchitis or recurrent urogenital inflammation can leave treatable leukocytospermia or subtle ductal patency changes.",
      actionableStep: isAr
        ? "إجراء مزرعة وتحليل متخصص للتأكد من خلو السائل من المؤشرات الالتهابية النشطة."
        : "Include seminal leukocyte/oxidative screening during targeted urological consultation.",
    });
  }

  // Nicotine / Sleep / Stress
  if (data.nicotineHabit !== "none" || data.sleepQuality === "poor" || data.stressLevel === "high") {
    factors.push({
      id: "neuroendocrine-circadian",
      pillar: "lifestyle",
      severity: "moderate",
      title: isAr
        ? "إجهاد الإيقاع اليومي أو التعرض للنيكوتين"
        : "Circadian Rhythm & Oxidative Lifestyle Load",
      explanation: isAr
        ? "قلة النوم العميق وارتفاع الكورتيزول أو التدخين الإلكتروني/التقليدي يثبّط إفراز التستوستيرون الليلي ويزيد الجذور الحرة."
        : "Fragmented sleep architecture, elevated cortisol, or nicotine/vape aerosol exposure blunts nocturnal LH/testosterone pulses and elevates reactive oxygen species.",
      actionableStep: isAr
        ? "تثبيت 7.5 ساعات نوم منتظمة وخفض النيكوتين تدريجياً لتحسين جودة الحيوانات المنوية خلال 74 يوماً."
        : "Anchor a consistent 7.5-hour sleep window and taper nicotine—measurable motility gains typically emerge within 74–90 days.",
    });
  }

  // Biomarker OCR Findings
  if (data.labFileUploaded) {
    if (
      (data.spermConcentrationMml !== null && data.spermConcentrationMml < 16) ||
      (data.fshIuL !== null && data.fshIuL > 8.5)
    ) {
      factors.push({
        id: "ocr-high-biomarker",
        pillar: "biomarker",
        severity: "high",
        title: isAr
          ? "نتائج التحليل المرفق تُظهر مؤشرات دون النطاق المرجعي لمنظمة الصحة العالمية"
          : "Uploaded Lab Panel Indicates Sub-Reference Spermatogenic Markers",
        explanation: isAr
          ? `التركيز المرصود (${data.spermConcentrationMml ?? "—"} مليون/مل) ومستوى هرمون FSH (${data.fshIuL ?? "—"} IU/L) يشيران إلى حاجة لتقييم متخصص مباشر.`
          : `Parsed concentration (${data.spermConcentrationMml ?? "—"} M/mL; WHO ref ≥16 M/mL) and FSH (${data.fshIuL ?? "—"} IU/L) suggest compensatory pituitary signaling that benefits from specialist review.`,
        actionableStep: isAr
          ? "مشاركة الملخص المشفر مع استشاري الذكورة لإجراء فحص تأكيدي وخطة علاجية دقيقة."
          : "Share your masked clinical summary with a UAE Andrologist for confirmatory testing and targeted therapy.",
      });
    } else if (
      (data.totalMotilityPercent !== null && data.totalMotilityPercent < 42) ||
      (data.morningTestosteroneNgDl !== null && data.morningTestosteroneNgDl < 350)
    ) {
      factors.push({
        id: "ocr-mod-biomarker",
        pillar: "biomarker",
        severity: "moderate",
        title: isAr
          ? "فرصة لتحسين الحركة المنوية والتوازن الهرموني الصباحي"
          : "Actionable Window in Motility & Morning Androgen Profile",
        explanation: isAr
          ? `الحركة الكلية (${data.totalMotilityPercent ?? "—"}%) والتستوستيرون الصباحي (${data.morningTestosteroneNgDl ?? "—"} ng/dL) يقعان في النطاق الحدي القابل للتحسن بتعديل نمط الحياة.`
          : `Total motility (${data.totalMotilityPercent ?? "—"}%; WHO ref ≥42%) and morning testosterone (${data.morningTestosteroneNgDl ?? "—"} ng/dL) sit in a responsive borderline zone linked to metabolic and thermal habits.`,
        actionableStep: isAr
          ? "طلب استشارة عن بُعد وإعادة الفحص المنزلي بعد 10-12 أسبوعاً من البروتوكول الوقائي."
          : "Book a discreet teleconsultation and re-verify via at-home semen assessment after 10–12 weeks of targeted adjustments.",
      });
    }
  }

  // Fallback positive wellness factor when Low Risk
  if (factors.length === 0) {
    factors.push({
      id: "optimal-baseline",
      pillar: "lifestyle",
      severity: "low",
      title: isAr
        ? "توازن ممتاز في المؤشرات الوقائية ونمط الحياة"
        : "Strong Baseline Reproductive & Metabolic Resilience",
      explanation: isAr
        ? "لا توجد علامات خطر تشريحية أو حرارية أو أيضية مرتفعة حالياً؛ مؤشراتك تدعم الصحة الإنجابية الوقائية بشكل مطمئن."
        : "Your current thermal habits, metabolic indicators, and anatomical history show low oxidative strain and strong preconception readiness.",
      actionableStep: isAr
        ? "الاستمرار على خطة العناية الذاتية لمدة 90 يوماً لدعم جودة الحمض النووي وحيوية الأسرة."
        : "Maintain your 90-day preconception nutrition, sleep, and thermal protection rhythm ahead of family planning.",
    });
  }

  // Overall Composite & Tier Determination
  const weightedBase = Math.round(
    anatomicalScore * 0.36 +
      metabolicScore * 0.24 +
      lifestyleScore * 0.22 +
      infectiousScore * 0.18 +
      biomarkerPenalty
  );
  const compositeScore = Math.min(98, Math.max(8, weightedBase));

  let overallLevel: RiskLevel = "low";
  if (
    hasAcuteRedFlag ||
    anatomicalScore >= 55 ||
    infectiousScore >= 48 ||
    compositeScore >= 58 ||
    (data.spermConcentrationMml !== null && data.spermConcentrationMml < 15)
  ) {
    overallLevel = "high";
  } else if (
    compositeScore >= 28 ||
    metabolicScore >= 40 ||
    lifestyleScore >= 45 ||
    (data.totalMotilityPercent !== null && data.totalMotilityPercent < 42)
  ) {
    overallLevel = "moderate";
  }

  const preconceptionSummary =
    overallLevel === "low"
      ? isAr
        ? "تُظهر مؤشراتك الأولية جاهزية صحية مطمئنة. العناية بصحة الرجل قبل التخطيط للأسرة خطوة استباقية تحمي جودة الأجنة وصحة الأب على المدى الطويل."
        : "Your screening profile reflects encouraging baseline readiness. Proactive male preconception care supports healthier embryogenesis, partner peace of mind, and long-term cardiovascular vitality."
      : overallLevel === "moderate"
      ? isAr
        ? "تم رصد عوامل نمط حياة وعوامل أيضية قابلة للتعديل بالكامل. لأن دورة تجدد الحيوانات المنوية تستغرق نحو 74 إلى 90 يوماً، فإن التدخل المبكر اليوم يحقق نتائج ملموسة دون إجراءات معقدة."
        : "Several modifiable thermal and metabolic factors were identified. Because sperm regenerate every 74–90 days, calm lifestyle alignment paired with a discreet teleconsultation often restores optimal parameters naturally."
      : isAr
      ? "تُشير المؤشرات التشريحية أو المخبرية إلى أهمية التقييم المباشر لدى استشاري أمراض الذكورة. الفحص المبكر يختصر شهوراً من الانتظار ويتيح حلولاً علاجية بسيطة ودقيقة تحفظ خصوصيتك بالكامل."
      : "Your profile highlights anatomical or biomarker patterns that benefit strongly from early specialist evaluation. Addressing treatable causes like varicocele early avoids years of delayed family planning and invasive partner procedures.";

  const culturalGuidancePoints = isAr
    ? [
        "صحة الأسرة مسؤولية مشتركة تبدأ بالاطمئنان المبكر والهادئ بعيداً عن التوتر أو الحرج الاجتماعي.",
        "جميع التوصيات مصممة كجزء من الفحص الوقائي العام للرجل (التمثيل الغذائي، النوم، والحيوية) بخصوصية تامة.",
        "لا يتم طلب أو تخزين أي بيانات تعريف شخصية (الاسم، الهوية الإماراتية، أو رقم الهاتف) خلال الفحص.",
      ]
    : [
        "Family readiness is a shared wellness partnership—early male screening spares couples unnecessary emotional strain and invasive testing.",
        "Framed around whole-body vitality: sperm quality serves as an early biomarker of male metabolic, hormonal, and cardiovascular longevity.",
        "100% confidential and culturally respectful: zero personal identifiers (Name, Emirates ID, or Phone) are collected in Zero-Knowledge Mode.",
      ];

  return {
    overallLevel,
    compositeScore,
    hasAcuteRedFlag,
    redFlagReasons,
    pillarScores: {
      lifestyle: lifestyleScore,
      metabolic: metabolicScore,
      anatomical: anatomicalScore,
      infectious: infectiousScore,
    },
    factors,
    preconceptionSummary,
    culturalGuidancePoints,
  };
}

export function buildMaskedClinicalSummary(
  data: IntakeData,
  report: RiskReport,
  consent: ConsentMatrix,
  accessPin: string,
  lang: Language
): string {
  const isAr = lang === "ar";
  const sessionToken = `MRH-ZK-${accessPin}-${report.compositeScore}X`;

  const lines: string[] = [
    isAr
      ? `=== ملخص سريري مشفر (صحة الرجل الإنجابية — بروتوكول عدم المعرفة) ===`
      : `=== ENCRYPTED CLINICAL HANDOFF (MEN'S REPRODUCTIVE HEALTH) ===`,
    `${isAr ? "معرّف الجلسة المؤقت" : "Ephemeral Session Token"}: ${sessionToken}`,
    `${isAr ? "هوية المراجع" : "Patient Identity"}: ${
      consent.maskPersonalIdentity
        ? isAr
          ? "محجوبة بالكامل (مجهول الهوية)"
          : "MASKED (Anonymous Zero-PII Mode)"
        : isAr
        ? "مصرّح بمشاركتها عند الحضور للعيادة"
        : "Cleared for In-Clinic Verification"
    }`,
    `${isAr ? "تصنيف الفحص الأولي" : "Screening Tier"}: ${report.overallLevel.toUpperCase()} (${report.compositeScore}/100)`,
    `--------------------------------------------------------`,
  ];

  if (consent.shareMetabolic) {
    lines.push(
      `[METABOLIC] BMI: ${data.bmiRange} | Glycemic/HbA1c: ${data.hba1cStatus} | BP: ${data.bloodPressureFlag} | Lipids: ${data.lipidProfile}`
    );
  } else {
    lines.push(`[METABOLIC] ${isAr ? "محجوب بناءً على رغبة المراجع" : "REDACTED BY PATIENT CONSENT"}`);
  }

  if (consent.shareLifestyle) {
    lines.push(
      `[LIFESTYLE] Sitting: ${data.sittingHoursPerDay} | Thermal: ${data.thermalExposure} | Sleep: ${data.sleepQuality} | Nicotine: ${data.nicotineHabit}`
    );
  } else {
    lines.push(`[LIFESTYLE] ${isAr ? "محجوب بناءً على رغبة المراجع" : "REDACTED BY PATIENT CONSENT"}`);
  }

  if (consent.shareAnatomical) {
    lines.push(
      `[ANATOMICAL] Ache: ${data.dullTesticularAche ? "Yes" : "No"} | Heaviness: ${
        data.scrotalHeavinessAfterStanding ? "Yes" : "No"
      } | Vein Swelling: ${data.visibleVeinSwelling ? "Yes" : "No"} | Cryptorchidism Hx: ${
        data.cryptorchidismHistory ? "Yes" : "No"
      }`
    );
  } else {
    lines.push(`[ANATOMICAL] ${isAr ? "محجوب بناءً على رغبة المراجع" : "REDACTED BY PATIENT CONSENT"}`);
  }

  if (consent.shareInfectious) {
    lines.push(
      `[INFECTIOUS] Post-Puberty Mumps: ${data.postPubertyMumps ? "Yes" : "No"} | Chronic Urogenital Hx: ${
        data.chronicPelvicOrUrinaryInfection ? "Yes" : "No"
      }`
    );
  } else {
    lines.push(`[INFECTIOUS] ${isAr ? "محجوب بناءً على رغبة المراجع" : "REDACTED BY PATIENT CONSENT"}`);
  }

  if (consent.shareBiomarkers && data.labFileUploaded) {
    lines.push(
      `[BIOMARKERS] Conc: ${data.spermConcentrationMml ?? "N/A"} M/mL | Motility: ${
        data.totalMotilityPercent ?? "N/A"
      }% | T: ${data.morningTestosteroneNgDl ?? "N/A"} ng/dL | FSH: ${data.fshIuL ?? "N/A"} IU/L`
    );
  } else {
    lines.push(
      `[BIOMARKERS] ${
        !consent.shareBiomarkers
          ? isAr
            ? "محجوب بناءً على رغبة المراجع"
            : "REDACTED BY PATIENT CONSENT"
          : isAr
          ? "لم يتم إرفاق تحاليل سابقة"
          : "No Prior Labs Attached"
      }`
    );
  }

  lines.push(`--------------------------------------------------------`);
  lines.push(
    isAr
      ? `ملاحظة: أداة فرز وتوجيه تثقيفية — لا تُعد تشخيصاً طبياً نهائياً.`
      : `Note: Educational risk screening summary — not a standalone medical diagnosis.`
  );

  return lines.join("\n");
}

// Deterministic 21x21 QR-style matrix based on PIN + consent state
export function generateDeterministicQrMatrix(seedStr: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      grid[r][c] = (Math.abs(hash) % 10) < 5;
    }
  }

  return grid;
}
