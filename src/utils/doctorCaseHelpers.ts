"use client";

import {
  ConsentMatrix,
  IntakeData,
  Language,
  RiskReport,
} from "../types/clinical";

export interface SufferingItem {
  category: string;
  severity: "high" | "moderate" | "low";
  label: string;
  detail: string;
  redacted?: boolean;
}

export interface CooperationActionOption {
  id: string;
  labelEn: string;
  labelAr: string;
  recommendedForTiers: ("low" | "moderate" | "high")[];
}

export const COOPERATION_ACTIONS_CATALOG: CooperationActionOption[] = [
  {
    id: "doppler_ultrasound",
    labelEn: "Approve Non-Invasive Scrotal Color Doppler Ultrasound Order",
    labelAr: "اعتماد طلب تصوير دوبلر ملون غير جراحي للخصية والأوردة",
    recommendedForTiers: ["high"],
  },
  {
    id: "andrology_inperson",
    labelEn: "Confirm Priority In-Person Specialist Meeting",
    labelAr: "تأكيد موعد المقابلة التخصصية الحضورية",
    recommendedForTiers: ["high"],
  },
  {
    id: "home_semen_kit",
    labelEn: "Dispatch Unmarked Temperature-Stabilized At-Home Semen Kit",
    labelAr: "إرسال باقة الفحص المنزلي السري غير المعنونة مع استلام مبرد",
    recommendedForTiers: ["moderate", "high"],
  },
  {
    id: "morning_hormone_panel",
    labelEn: "Order Fasting Morning Endocrine & Glycemic Panel (Total T, FSH, LH, HbA1c)",
    labelAr: "طلب فحص الهرمونات الصباحي والتمثيل الغذائي (التستوستيرون، FSH، السكر التراكمي)",
    recommendedForTiers: ["moderate", "high"],
  },
  {
    id: "encrypted_teleconsult",
    labelEn: "Confirm 20-Minute Private Video / Audio Consultation",
    labelAr: "تأكيد جلسة استشارة مرئية أو صوتية خاصة لمدة 20 دقيقة",
    recommendedForTiers: ["low", "moderate", "high"],
  },
  {
    id: "protocol_90day",
    labelEn: "Co-Sign 90-Day Scrotal Cooling & Antioxidant Regimen (CoQ10, Zinc, L-Carnitine)",
    labelAr: "اعتماد بروتوكول الـ 90 يوماً للتبريد الحراري ومضادات الأكسدة (CoQ10 والزنك)",
    recommendedForTiers: ["low", "moderate", "high"],
  },
];

/**
 * Extracts a clean, plain-language list of exact symptoms selected by the patient
 * in both English and Arabic (no cryptic codes).
 */
export function extractSelectedSymptomsFromIntake(intake: IntakeData): {
  en: string[];
  ar: string[];
} {
  const en: string[] = [];
  const ar: string[] = [];

  if (intake.acuteSevereTesticularPain) {
    en.push("Sudden severe testicular pain");
    ar.push("ألم حاد ومفاجئ في الخصية");
  }
  if (intake.acuteSuddenSwellingOrFever) {
    en.push("Sudden scrotal swelling / fever");
    ar.push("تورم مفاجئ مع حرارة");
  }
  if (intake.hematospermia) {
    en.push("Blood noted in semen");
    ar.push("وجود دم في السائل المنوي");
  }
  if (intake.dullTesticularAche) {
    en.push("Intermittent dull testicular ache");
    ar.push("ألم خفيف متكرر في الخصية");
  }
  if (intake.scrotalHeavinessAfterStanding) {
    en.push("Scrotal heaviness after standing");
    ar.push("شعور بثقل يزداد مع الوقوف");
  }
  if (intake.visibleVeinSwelling) {
    en.push("Visible or palpable vein swelling (Varicocele sign)");
    ar.push("توسع أوردة مرئي أو محسوس (مؤشر دوالي)");
  }
  if (intake.cryptorchidismHistory) {
    en.push("History of undescended testicle");
    ar.push("تاريخ خصية هاجرة بالطفولة");
  }
  if (intake.testicularTraumaOrSurgery) {
    en.push("Prior testicular trauma or surgery");
    ar.push("إصابة أو جراحة سابقة في الخصية");
  }
  if (intake.sittingHoursPerDay === "8plus") {
    en.push("Prolonged sitting (8+ hrs/day)");
    ar.push("جلوس مكتبي طويل (+8 ساعات يومياً)");
  }
  if (intake.thermalExposure === "frequent") {
    en.push("Frequent heat exposure (laptop on lap / sauna)");
    ar.push("تعرض حراري متكرر (حاسوب على الحجر / ساونا)");
  } else if (intake.thermalExposure === "occasional") {
    en.push("Occasional pelvic heat exposure");
    ar.push("تعرض حراري متقطع");
  }
  if (intake.sleepQuality !== "optimal") {
    en.push("Irregular or poor sleep quality");
    ar.push("اضطراب أو ضعف جودة النوم");
  }
  if (intake.stressLevel === "high") {
    en.push("High daily stress levels");
    ar.push("ضغط نفسي ومهني مرتفع");
  }
  if (intake.nicotineHabit !== "none") {
    en.push("Smoking / vaping nicotine use");
    ar.push("استخدام التدخين أو السجائر الإلكترونية");
  }
  if (intake.bmiRange === "high_over_28") {
    en.push("Elevated BMI (> 28)");
    ar.push("ارتفاع مؤشر كتلة الجسم (> 28)");
  } else if (intake.bmiRange === "elevated_25_28") {
    en.push("Borderline BMI (25–28)");
    ar.push("مؤشر كتلة الجسم 25–28");
  }
  if (
    intake.hba1cStatus === "borderline_prediabetic" ||
    intake.hba1cStatus === "elevated_diabetic"
  ) {
    en.push("Elevated blood sugar / HbA1c");
    ar.push("ارتفاع سكر الدم التراكمي");
  }
  if (intake.bloodPressureFlag !== "normal") {
    en.push("Elevated blood pressure");
    ar.push("ارتفاع ضغط الدم");
  }
  if (intake.lipidProfile === "dyslipidemia") {
    en.push("Elevated cholesterol / lipids");
    ar.push("اضطراب الدهون والكوليسترول");
  }
  if (intake.postPubertyMumps) {
    en.push("Post-puberty mumps history");
    ar.push("تاريخ إصابة بالنكاف بعد البلوغ");
  }
  if (intake.priorStiHistory) {
    en.push("Prior STI history");
    ar.push("تاريخ عدوى تناسلية سابقة");
  }
  if (intake.chronicPelvicOrUrinaryInfection) {
    en.push("Chronic pelvic or urinary infection");
    ar.push("التهابات مسالك أو حوض متكررة");
  }
  if (intake.labFileUploaded) {
    en.push("Uploaded lab / semen biomarker report");
    ar.push("تقرير تحاليل مخبرية مرفق");
  }

  return { en, ar };
}

export function derivePatientSufferingList(
  intake: IntakeData,
  consent: ConsentMatrix,
  lang: Language
): SufferingItem[] {
  const isAr = lang === "ar";
  const items: SufferingItem[] = [];

  if (
    intake.acuteSevereTesticularPain ||
    intake.acuteSuddenSwellingOrFever ||
    intake.hematospermia
  ) {
    const flags: string[] = [];
    if (intake.acuteSevereTesticularPain)
      flags.push(isAr ? "ألم حاد ومفاجئ في الخصية" : "Sudden severe testicular pain");
    if (intake.acuteSuddenSwellingOrFever)
      flags.push(isAr ? "تورم مفاجئ مع حرارة" : "Acute rapid swelling / fever");
    if (intake.hematospermia)
      flags.push(isAr ? "وجود دم في السائل المنوي" : "Blood noted in semen (hematospermia)");

    items.push({
      category: isAr ? "إنذار طوارئ حاد" : "Acute Safety Alert",
      severity: "high",
      label: flags.join(" · "),
      detail: isAr
        ? "يستلزم توجيه المراجع فوراً للتقييم الإسعافي لاستبعاد الالتواء أو العدوى الحادة."
        : "Requires immediate urgent/ER triage to exclude torsion or acute epididymo-orchitis.",
    });
  }

  if (!consent.shareAnatomical) {
    items.push({
      category: isAr ? "التاريخ التشريحي" : "Anatomical & Symptoms",
      severity: "low",
      label: isAr ? "محجوب بناءً على موافقة المراجع" : "Hidden by Patient Privacy Setting",
      detail: isAr
        ? "اختار المراجع عدم مشاركة تفاصيل الفحص التشريحي قبل الجلسة."
        : "Patient chose to discuss anatomical history directly during the meeting.",
      redacted: true,
    });
  } else {
    const anatSymptoms: string[] = [];
    if (intake.dullTesticularAche)
      anatSymptoms.push(isAr ? "ألم خفيف متكرر" : "Intermittent dull testicular ache");
    if (intake.scrotalHeavinessAfterStanding)
      anatSymptoms.push(
        isAr ? "ثقل يزداد مع الوقوف" : "Scrotal heaviness after standing"
      );
    if (intake.visibleVeinSwelling)
      anatSymptoms.push(
        isAr ? "توسع أوردة محسوس/مرئي (دوالي)" : "Visible/palpable enlarged veins (Varicocele)"
      );
    if (intake.cryptorchidismHistory)
      anatSymptoms.push(
        isAr ? "تاريخ خصية هاجرة بالطفولة" : "Childhood cryptorchidism history"
      );
    if (intake.testicularTraumaOrSurgery)
      anatSymptoms.push(
        isAr ? "تاريخ إصابة أو جراحة أربية" : "Prior testicular trauma / inguinal surgery"
      );

    if (anatSymptoms.length > 0) {
      items.push({
        category: isAr ? "الأعراض التشريحية والدوالي" : "Anatomical & Varicocele",
        severity: intake.visibleVeinSwelling || intake.cryptorchidismHistory ? "high" : "moderate",
        label: anatSymptoms.join(" · "),
        detail: isAr
          ? "نمط سريري يتوافق مع ارتجاع الضفيرة الوريدية (دوالي الخصية) أو تاريخ نمائي يستفيد من تصوير الدوبلر."
          : "Clinical presentation consistent with venous reflux (varicocele) or developmental reserve strain.",
      });
    }
  }

  if (!consent.shareMetabolic) {
    items.push({
      category: isAr ? "الصحة الأيضية" : "Metabolic Profile",
      severity: "low",
      label: isAr ? "محجوب بناءً على موافقة المراجع" : "Hidden by Patient Privacy Setting",
      detail: isAr
        ? "المؤشرات الأيضية مخفية بواسطة مصفوفة الخصوصية."
        : "Metabolic indicators hidden by patient's privacy settings.",
      redacted: true,
    });
  } else {
    const metFlags: string[] = [];
    if (intake.bmiRange === "high_over_28")
      metFlags.push(isAr ? "مؤشر كتلة الجسم > 28" : "Elevated BMI (> 28)");
    else if (intake.bmiRange === "elevated_25_28")
      metFlags.push(isAr ? "مؤشر كتلة الجسم 25–28" : "Borderline BMI (25–28)");

    if (intake.hba1cStatus === "borderline_prediabetic")
      metFlags.push(isAr ? "مقاومة إنسولين / ما قبل السكري" : "Borderline HbA1c / Prediabetic");
    else if (intake.hba1cStatus === "elevated_diabetic")
      metFlags.push(isAr ? "ارتفاع السكر التراكمي" : "Elevated HbA1c / Diabetes");

    if (intake.bloodPressureFlag !== "normal")
      metFlags.push(isAr ? "ضغط دم مرتفع/حدي" : "Elevated blood pressure");
    if (intake.lipidProfile === "dyslipidemia")
      metFlags.push(isAr ? "اضطراب الدهون الثلاثية" : "Dyslipidemia");

    if (metFlags.length > 0) {
      items.push({
        category: isAr ? "التمثيل الغذائي والهرمونات" : "Metabolic & Endocrine Strain",
        severity: intake.bmiRange === "high_over_28" || intake.hba1cStatus === "elevated_diabetic" ? "moderate" : "low",
        label: metFlags.join(" · "),
        detail: isAr
          ? "يزيد من تحويل التستوستيرون المحيطي ويرفع الإجهاد التأكسدي المنوي."
          : "Linked to peripheral androgen aromatization and elevated seminal oxidative stress.",
      });
    }
  }

  if (!consent.shareLifestyle) {
    items.push({
      category: isAr ? "نمط الحياة والحرارة" : "Lifestyle & Thermal",
      severity: "low",
      label: isAr ? "محجوب بناءً على موافقة المراجع" : "Hidden by Patient Privacy Setting",
      detail: isAr
        ? "اختار المراجع حجب تفاصيل نمط الحياة اليومي في الملخص المرسل."
        : "Lifestyle & thermal exposure fields hidden per patient consent.",
      redacted: true,
    });
  } else {
    const lifeFlags: string[] = [];
    if (intake.sittingHoursPerDay === "8plus")
      lifeFlags.push(isAr ? "جلوس متواصل +8 ساعات/يوم" : "Prolonged sitting (8+ hrs/day)");
    if (intake.thermalExposure === "frequent")
      lifeFlags.push(isAr ? "تعرض حراري متكرر (ساونا/حاسوب)" : "Frequent pelvic heat (sauna/laptop)");
    else if (intake.thermalExposure === "occasional")
      lifeFlags.push(isAr ? "تعرض حراري متقطع" : "Occasional heat exposure");
    if (intake.sleepQuality !== "optimal")
      lifeFlags.push(isAr ? "اضطراب جودة النوم" : "Suboptimal sleep rhythm");
    if (intake.stressLevel === "high")
      lifeFlags.push(isAr ? "ضغط نفسي ومهني مرتفع" : "High sustained stress");
    if (intake.nicotineHabit !== "none")
      lifeFlags.push(isAr ? "تعرض للنيكوتين / التدخين الإلكتروني" : "Nicotine / vaping exposure");

    if (lifeFlags.length > 0) {
      items.push({
        category: isAr ? "الإجهاد الحراري ونمط الحياة" : "Thermal & Lifestyle Load",
        severity:
          intake.thermalExposure === "frequent" || intake.sittingHoursPerDay === "8plus"
            ? "moderate"
            : "low",
        label: lifeFlags.join(" · "),
        detail: isAr
          ? "يؤثر على التبريد الطبيعي للخصية وجودة حركة الحيوانات المنوية."
          : "Disrupts scrotal thermoregulation and nocturnal gonadotropin signaling.",
      });
    }
  }

  if (consent.shareInfectious) {
    const infFlags: string[] = [];
    if (intake.postPubertyMumps)
      infFlags.push(isAr ? "تاريخ نكاف بعد البلوغ" : "Post-puberty mumps history");
    if (intake.priorStiHistory)
      infFlags.push(isAr ? "عدوى تناسلية سابقة" : "Prior STI history");
    if (intake.chronicPelvicOrUrinaryInfection)
      infFlags.push(
        isAr ? "التهابات مسالك أو بروستاتا متكررة" : "Recurrent UTI / pelvic inflammation"
      );

    if (infFlags.length > 0) {
      items.push({
        category: isAr ? "التاريخ الالتهابي" : "Infectious / Urogenital",
        severity: intake.postPubertyMumps ? "high" : "moderate",
        label: infFlags.join(" · "),
        detail: isAr
          ? "يستدعي فحص الكريات البيضاء المنوية والتأكد من سلامة القنوات الناقلة."
          : "Warrants seminal leukocyte check and ductal patency consideration.",
      });
    }
  }

  if (consent.shareBiomarkers && intake.labFileUploaded) {
    const labFlags: string[] = [];
    if (intake.spermConcentrationMml !== null) {
      labFlags.push(
        `${isAr ? "التركيز" : "Conc"}: ${intake.spermConcentrationMml} M/mL`
      );
    }
    if (intake.totalMotilityPercent !== null) {
      labFlags.push(
        `${isAr ? "الحركة" : "Motility"}: ${intake.totalMotilityPercent}%`
      );
    }
    if (intake.morningTestosteroneNgDl !== null) {
      labFlags.push(
        `${isAr ? "التستوستيرون" : "Morning T"}: ${intake.morningTestosteroneNgDl} ng/dL`
      );
    }
    if (intake.fshIuL !== null) {
      labFlags.push(`FSH: ${intake.fshIuL} IU/L`);
    }

    if (labFlags.length > 0) {
      const subOptimal =
        (intake.spermConcentrationMml !== null && intake.spermConcentrationMml < 16) ||
        (intake.totalMotilityPercent !== null && intake.totalMotilityPercent < 42) ||
        (intake.fshIuL !== null && intake.fshIuL > 8.5);
      items.push({
        category: isAr ? "المؤشرات المخبرية المرفقة" : "Parsed Lab Biomarkers",
        severity: subOptimal ? "high" : "low",
        label: labFlags.join(" · "),
        detail: subOptimal
          ? isAr
            ? "قيم دون النطاق المرجعي لمنظمة الصحة العالمية تستدعي مطابقة سريرية وتأكيد مخبري."
            : "Sub-reference WHO 6th Ed. parameters warrant targeted clinical correlation."
          : isAr
          ? "المؤشرات المخبرية المرفقة تقع ضمن النطاق المرجعي الطبيعي."
          : "Uploaded baseline parameters sit within WHO reference thresholds.",
      });
    }
  }

  if (items.length === 0) {
    items.push({
      category: isAr ? "فحص وقائي استباقي" : "Proactive Preconception Check",
      severity: "low",
      label: isAr
        ? "استشارة وقائية عامة دون أعراض مرضية حادة"
        : "General preventive preconception & men's health consultation",
      detail: isAr
        ? "يبحث المراجع عن خطة وقائية معتمدة لمدة 90 يوماً لدعم خصوبة الأسرة."
        : "Patient seeks clinician-verified 90-day preventive nutrition and guidance.",
    });
  }

  return items;
}

export function deriveDefaultRecommendationForReport(report: RiskReport): {
  en: string;
  ar: string;
  defaultActionIds: string[];
  draftNoteEn: string;
  draftNoteAr: string;
} {
  if (report.overallLevel === "high") {
    return {
      en: "Priority Specialist Meeting: Direct Evaluation, Non-Invasive Scrotal Color Doppler Ultrasound & Confirmatory Hormone/Semen Workup.",
      ar: "موعد تخصصي ذو أولوية: تقييم مباشر مع تصوير دوبلر ملون غير جراحي للخصية ومراجعة المؤشرات الهرمونية.",
      defaultActionIds: [
        "doppler_ultrasound",
        "andrology_inperson",
        "morning_hormone_panel",
        "protocol_90day",
      ],
      draftNoteEn:
        "I have reviewed the symptoms you selected and accepted your meeting request. Based on your symptoms, I have pre-authorized a painless Scrotal Color Doppler Ultrasound alongside our consultation so we can address any underlying issue early.",
      draftNoteAr:
        "تمت مراجعة الأعراض التي اخترتها وقبول طلب المقابلة الطبية. بناءً على الأعراض المذكورة، قمتُ باعتماد تصوير دوبلر ملون غير جراحي للخصية بالتزامن مع موعد الاستشارة.",
    };
  }

  if (report.overallLevel === "moderate") {
    return {
      en: "Guided Care Pathway: At-Home Semen Assessment Kit + Private Video Meeting + 90-Day Metabolic & Thermal Cooling Plan.",
      ar: "مسار الرعاية الموجهة: باقة الفحص المنزلي السري + مقابلة مرئية خاصة + خطة تعديل الحرارة والتمثيل الغذائي لمدة 90 يوماً.",
      defaultActionIds: [
        "home_semen_kit",
        "encrypted_teleconsult",
        "morning_hormone_panel",
        "protocol_90day",
      ],
      draftNoteEn:
        "I have reviewed your selected symptoms and accepted your request to meet. Your thermal and metabolic factors respond very well to targeted adjustments—I look forward to walking through your 90-day recovery plan during our scheduled session.",
      draftNoteAr:
        "تمت مراجعة الأعراض التي حددتها وقبول طلبك للمقابلة. العوامل الحرارية والأيضية المرصودة قابلة للتحسن الكبير، وسنناقش خطة الـ 90 يوماً بالتفصيل في الموعد المحدد.",
    };
  }

  return {
    en: "Preventive Wellness Pathway: 90-Day Preconception Self-Care & Micronutrient Protocol + Scheduled Doctor Check-In.",
    ar: "المسار الوقائي: خطة العناية الذاتية والتغذية لمدة 90 يوماً ما قبل الإنجاب مع جلسة متابعة مع الطبيب.",
    defaultActionIds: ["protocol_90day", "encrypted_teleconsult"],
    draftNoteEn:
      "Thank you for submitting your request. I have accepted your consultation slot and co-signed a tailored 90-day preventive nutrition and sleep/thermoregulation plan to discuss during our meeting.",
    draftNoteAr:
      "شكراً لإرسال طلبك. قمت بقبول موعد المقابلة واعتماد جدول التغذية وتنظيم النوم لمدة 90 يوماً لمناقشته معاً خلال الجلسة.",
  };
}
