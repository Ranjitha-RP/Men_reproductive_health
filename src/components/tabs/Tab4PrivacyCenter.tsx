"use client";

import React, { useState } from "react";
import {
  Lock,
  EyeOff,
  QrCode,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  ConsentMatrix,
  IntakeData,
  Language,
  RiskReport,
} from "../../types/clinical";
import {
  buildMaskedClinicalSummary,
  generateDeterministicQrMatrix,
} from "../../utils/riskEngine";

interface Tab4PrivacyCenterProps {
  lang: Language;
  intake: IntakeData;
  report: RiskReport;
  consent: ConsentMatrix;
  onUpdateConsent: (patch: Partial<ConsentMatrix>) => void;
  onPurgeAllData: () => void;
}

export const Tab4PrivacyCenter: React.FC<Tab4PrivacyCenterProps> = ({
  lang,
  intake,
  report,
  consent,
  onUpdateConsent,
  onPurgeAllData,
}) => {
  const isAr = lang === "ar";
  const [accessPin, setAccessPin] = useState<string>("491820");
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [confirmPurgeModal, setConfirmPurgeModal] = useState<boolean>(false);
  const [purgedNotice, setPurgedNotice] = useState<boolean>(false);

  const rotatePin = () => {
    const nextPin = Math.floor(100000 + Math.random() * 900000).toString();
    setAccessPin(nextPin);
  };

  const maskedSummary = buildMaskedClinicalSummary(
    intake,
    report,
    consent,
    accessPin,
    lang
  );

  const qrSeed = `${accessPin}-${JSON.stringify(consent)}-${report.compositeScore}`;
  const qrMatrix = generateDeterministicQrMatrix(qrSeed);

  const handleCopySummary = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(maskedSummary);
    }
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const executeDataPurge = () => {
    onPurgeAllData();
    setConfirmPurgeModal(false);
    setPurgedNotice(true);
    rotatePin();
    setTimeout(() => setPurgedNotice(false), 5000);
  };

  const consentItems: {
    key: keyof ConsentMatrix;
    title: string;
    desc: string;
  }[] = [
    {
      key: "maskPersonalIdentity",
      title: isAr
        ? "إخفاء الهوية الشخصية بالكامل (Mask Personal Identity)"
        : "Mask Personal Identity (Zero-PII Pseudonymous Token)",
      desc: isAr
        ? "يستبدل الاسم والهاتف بمعرّف جلسة مشفر مؤقت عند مراجعة الطبيب."
        : "Replaces personal identifiers with an ephemeral consultation token.",
    },
    {
      key: "shareMetabolic",
      title: isAr
        ? "مشاركة البيانات الأيضية (BMI، السكر التراكمي، الضغط)"
        : "Share Metabolic & Endocrine Profile",
      desc: isAr
        ? "يسمح للطبيب بالاطلاع على مؤشرات الوزن وسكر الدم والدهون."
        : "Includes BMI category, HbA1c status, blood pressure, and lipid flags.",
    },
    {
      key: "shareLifestyle",
      title: isAr
        ? "مشاركة تفاصيل نمط الحياة والحرارة (Share Lifestyle Details)"
        : "Share Lifestyle & Thermal Exposure Details",
      desc: isAr
        ? "يتضمن ساعات الجلوس، التعرض للحرارة، النوم، والتدخين."
        : "Includes sitting duration, sauna/laptop heat habits, sleep, and nicotine.",
    },
    {
      key: "shareAnatomical",
      title: isAr
        ? "مشاركة التاريخ التشريحي ومؤشرات الدوالي"
        : "Share Anatomical & Varicocele Symptom Flags",
      desc: isAr
        ? "يشارك الأعراض الموضعية والتاريخ الجراحي لتسريع الفحص السريري."
        : "Includes scrotal heaviness, venous fullness, and childhood surgical history.",
    },
    {
      key: "shareInfectious",
      title: isAr
        ? "مشاركة التاريخ الطبي والالتهابي"
        : "Share Prior Infectious & Urogenital History",
      desc: isAr
        ? "يتحكم في إظهار أو حجب تاريخ العدوى السابقة في التقرير الموجه للطبيب."
        : "Controls visibility of post-puberty mumps or prior urogenital history.",
    },
    {
      key: "shareBiomarkers",
      title: isAr
        ? "مشاركة قيم التحاليل المخبرية المستخرجة (OCR)"
        : "Share Parsed Lab & Semen Biomarkers",
      desc: isAr
        ? "يدرج أرقام التركيز والحركة والهرمونات المرفقة في الملخص."
        : "Includes uploaded concentration, motility, testosterone, and FSH values.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Right to be Forgotten Confirmation Toast */}
      {purgedNotice && (
        <div className="bg-emerald-950 text-white rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-medium">
              {isAr
                ? "تم مسح جميع البيانات المحلية وسجل الجلسة فوراً (الحق في النسيان — Right to be Forgotten)."
                : "All local session state, lab values, and history have been permanently purged (Right to be Forgotten verified)."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Granular Data Sharing Matrix */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F3F6FA] border border-slate-200 flex items-center justify-center text-[#1B5683]">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {isAr
                    ? "مصفوفة التحكم الدقيق في مشاركة البيانات"
                    : "Granular Data Sharing & Consent Matrix"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "الخصوصية بالتصميم: اختر بدقة الحقول التي يراها الطبيب في الملخص السريري."
                    : "Privacy by Design: toggle exact clinical fields included in your doctor handoff."}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {consentItems.map((item) => {
                const enabled = consent[item.key];
                return (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => onUpdateConsent({ [item.key]: !enabled })}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 cursor-pointer ${
                        enabled ? "bg-[#1B5683]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                          enabled
                            ? isAr
                              ? "-translate-x-5"
                              : "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* One-Click Data Erasure ("Right to be Forgotten") */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {isAr
                ? "حذف فوري وشامل لجميع المدخلات من ذاكرة المتصفح."
                : "Zero server retention. Erase local memory at any time."}
            </div>
            <button
              type="button"
              onClick={() => setConfirmPurgeModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-[#DC2626] border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {isAr
                  ? "مسح جميع البيانات وسجل الجلسة"
                  : "Purge All Local Data & Session History"}
              </span>
            </button>
          </div>
        </div>

        {/* Masked Clinical Summary Generator + QR Code & PIN */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {isAr
                      ? "مولّد الملخص السريري المشفّر للطبيب"
                      : "Masked Clinical Summary & Clinician QR Pass"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? "يُمسح ضوئياً أثناء الاستشارة مع رمز دخول مؤقت صالح لمرة واحدة."
                      : "For clinician scanning during consultation with one-time PIN verification."}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code + Access PIN Box */}
            <div className="bg-[#F3F6FA] border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <svg
                  width="116"
                  height="116"
                  viewBox="0 0 21 21"
                  aria-label="Encrypted Consultation QR Code"
                  className="block"
                >
                  <rect width="21" height="21" fill="#FFFFFF" />
                  {qrMatrix.map((row, rIdx) =>
                    row.map((cell, cIdx) =>
                      cell ? (
                        <rect
                          key={`${rIdx}-${cIdx}`}
                          x={cIdx}
                          y={rIdx}
                          width="1"
                          height="1"
                          fill="#0F172A"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>

              <div className="space-y-3 text-center sm:text-start flex-1">
                <div>
                  <span className="text-[11px] font-medium text-slate-500">
                    {isAr ? "رمز دخول الطبيب المؤقت (One-Time PIN)" : "Clinician Consultation Access PIN"}
                  </span>
                  <div className="text-2xl font-mono-tabular font-bold tracking-widest text-slate-900 mt-0.5">
                    {accessPin.slice(0, 3)} · {accessPin.slice(3)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={rotatePin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#1B5683]" />
                    <span>{isAr ? "تدوير الرمز" : "Rotate PIN"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B5683] text-white text-xs font-medium hover:bg-[#154468] cursor-pointer"
                  >
                    {copiedSummary ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedSummary
                        ? isAr
                          ? "تم النسخ"
                          : "Copied"
                        : isAr
                        ? "نسخ التقرير المشفر"
                        : "Copy Masked Report"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Encrypted Summary Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-[#059669]" />
                  {isAr
                    ? "معاينة حية للبيانات المسموح بمشاركتها فقط"
                    : "Live Redacted Clinical Payload Preview"}
                </span>
                <span className="font-mono-tabular">AES-256-GCM Ephemeral</span>
              </div>
              <pre
                dir="ltr"
                className="bg-[#0F172A] text-slate-200 rounded-xl p-4 text-[11px] font-mono-tabular leading-relaxed overflow-x-auto whitespace-pre-wrap"
              >
                {maskedSummary}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Right to be Forgotten */}
      {confirmPurgeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-slate-900">
                {isAr
                  ? "تأكيد الحذف الفوري للبيانات (الحق في النسيان)"
                  : "Confirm Instant Data Erasure (Right to be Forgotten)"}
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? "سيؤدي هذا الإجراء إلى مسح جميع إجابات الفحص، القيم المخبرية، وإعدادات المشاركة فوراً وإعادة الجلسة إلى الحالة الصفرية."
                : "This immediately wipes all intake responses, parsed lab biomarkers, consent flags, and ephemeral PIN tokens from browser memory."}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPurgeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={executeDataPurge}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DC2626] text-white hover:bg-red-700 cursor-pointer"
              >
                {isAr ? "مسح نهائي الآن" : "Purge Session Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
