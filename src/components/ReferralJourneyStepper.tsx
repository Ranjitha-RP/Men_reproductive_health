"use client";

import React from "react";
import {
  ClipboardList,
  Bot,
  Send,
  Stethoscope,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { ClinicalTabId, Language } from "../types/clinical";

interface ReferralJourneyStepperProps {
  lang: Language;
  activeTab: ClinicalTabId;
  hasCompletedIntake: boolean;
  hasSubmittedReferral: boolean;
  doctorStatus: "pending" | "accepted" | "cooperating";
  progressCheckInsCount: number;
  onSelectTab: (tab: ClinicalTabId) => void;
}

export const ReferralJourneyStepper: React.FC<ReferralJourneyStepperProps> = ({
  lang,
  activeTab,
  hasCompletedIntake,
  hasSubmittedReferral,
  doctorStatus,
  progressCheckInsCount,
  onSelectTab,
}) => {
  const isAr = lang === "ar";

  const stages: {
    num: string;
    titleEn: string;
    titleAr: string;
    subEn: string;
    subAr: string;
    done: boolean;
    active: boolean;
    targetTab: ClinicalTabId;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      num: "01",
      titleEn: "Health Check",
      titleAr: "الفحص الصحي",
      subEn: hasCompletedIntake ? "Inputs recorded" : "5 quick pillars",
      subAr: hasCompletedIntake ? "تم تسجيل البيانات" : "5 خطوات بسيطة",
      done: hasCompletedIntake,
      active: activeTab === "intake",
      targetTab: "intake",
      icon: ClipboardList,
    },
    {
      num: "02",
      titleEn: "Risk & AI Guide",
      titleAr: "المخاطر والمرافق",
      subEn: "Plain-language AI",
      subAr: "شرح ذكي مبسط",
      done: hasCompletedIntake,
      active: activeTab === "report",
      targetTab: "report",
      icon: Bot,
    },
    {
      num: "03",
      titleEn: "Report Sent to Doctor",
      titleAr: "إرسال التقرير للطبيب",
      subEn: hasSubmittedReferral ? "Passed via Consent" : "Choose symptoms",
      subAr: hasSubmittedReferral ? "أُرسل حسب الموافقة" : "اختر الأعراض",
      done: hasSubmittedReferral,
      active: activeTab === "triage" && !hasSubmittedReferral,
      targetTab: "triage",
      icon: Send,
    },
    {
      num: "04",
      titleEn: "Specialist Care Plan",
      titleAr: "خطة الطبيب",
      subEn:
        doctorStatus === "cooperating"
          ? "Care plan active"
          : doctorStatus === "accepted"
          ? "Accepted by doctor"
          : "Awaiting review",
      subAr:
        doctorStatus === "cooperating"
          ? "الخطة نشطة"
          : doctorStatus === "accepted"
          ? "تم قبول الطلب"
          : "بانتظار الطبيب",
      done: doctorStatus !== "pending",
      active: activeTab === "triage" && hasSubmittedReferral && doctorStatus === "pending",
      targetTab: "triage",
      icon: Stethoscope,
    },
    {
      num: "05",
      titleEn: "Follow-Up & Progress",
      titleAr: "المتابعة والتحسن",
      subEn: `${progressCheckInsCount} check-in(s) logged`,
      subAr: `${progressCheckInsCount} متابعة مسجلة`,
      done: progressCheckInsCount > 1,
      active: activeTab === "triage" && doctorStatus !== "pending",
      targetTab: "triage",
      icon: TrendingDown,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-900">
          {isAr
            ? "مسار الرعاية الكامل من البداية للنهاية (اضغط على أي مرحلة للانتقال إليها)"
            : "End-to-End Care & Referral Journey (Click any step to jump there)"}
        </span>
        <span className="text-slate-500 font-mono-tabular">
          {stages.filter((s) => s.done).length}/5 {isAr ? "مراحل مكتملة" : "stages active"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <button
              key={stage.num}
              type="button"
              onClick={() => onSelectTab(stage.targetTab)}
              className={`p-3 rounded-xl border text-start transition-colors cursor-pointer flex items-start justify-between gap-2.5 ${
                stage.active
                  ? "bg-[#F3F6FA] border-[#1B5683]"
                  : stage.done
                  ? "bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/80"
                  : "bg-[#F8FAFC] border-slate-200 hover:bg-white"
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-mono-tabular text-slate-500">
                  <span>{stage.num}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate font-sans font-semibold text-slate-900">
                    {isAr ? stage.titleAr : stage.titleEn}
                  </span>
                </div>
                <p
                  className={`text-[11px] truncate ${
                    stage.done ? "text-[#059669] font-medium" : "text-slate-500"
                  }`}
                >
                  {isAr ? stage.subAr : stage.subEn}
                </p>
              </div>
              {stage.done ? (
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
              ) : (
                <Icon
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    stage.active ? "text-[#1B5683]" : "text-slate-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
