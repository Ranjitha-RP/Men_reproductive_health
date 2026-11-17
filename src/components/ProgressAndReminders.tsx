"use client";

import React, { useMemo, useState } from "react";
import {
  TrendingDown,
  Bell,
  CheckCircle2,
  Plus,
  Calendar,
  Activity,
} from "lucide-react";
import {
  DoctorCooperationResponse,
  FollowUpReminder,
  IntakeData,
  Language,
  ProgressCheckpoint,
  RiskReport,
} from "../types/clinical";
import { evaluateClinicalRisk } from "../utils/riskEngine";

interface ProgressAndRemindersProps {
  lang: Language;
  intake: IntakeData;
  baselineReport: RiskReport;
  doctorResponse: DoctorCooperationResponse;
  checkpoints: ProgressCheckpoint[];
  reminders: FollowUpReminder[];
  onAddCheckpoint: (cp: ProgressCheckpoint) => void;
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: FollowUpReminder) => void;
}

export const ProgressAndReminders: React.FC<ProgressAndRemindersProps> = ({
  lang,
  intake,
  baselineReport,
  doctorResponse,
  checkpoints,
  reminders,
  onAddCheckpoint,
  onToggleReminder,
  onAddReminder,
}) => {
  const isAr = lang === "ar";

  // Interactive "What-If Lifestyle Change" toggles
  const [habitReduceHeatSitting, setHabitReduceHeatSitting] =
    useState<boolean>(true);
  const [habitQuitNicotine, setHabitQuitNicotine] = useState<boolean>(false);
  const [habitImproveSleepStress, setHabitImproveSleepStress] =
    useState<boolean>(true);
  const [habitMetabolicCare, setHabitMetabolicCare] = useState<boolean>(false);

  const [newReminderTitle, setNewReminderTitle] = useState<string>("");
  const [newReminderDay, setNewReminderDay] = useState<string>("Day 45");

  // Compute live adjusted intake based on active healthy changes
  const projectedReport = useMemo(() => {
    const adjusted: IntakeData = { ...intake };
    if (habitReduceHeatSitting) {
      adjusted.sittingHoursPerDay = "under4";
      adjusted.thermalExposure = "none";
    }
    if (habitQuitNicotine) {
      adjusted.nicotineHabit = "none";
    }
    if (habitImproveSleepStress) {
      adjusted.sleepQuality = "optimal";
      adjusted.stressLevel = "low";
    }
    if (habitMetabolicCare) {
      if (adjusted.bmiRange === "high_over_28") {
        adjusted.bmiRange = "elevated_25_28";
      } else if (adjusted.bmiRange === "elevated_25_28") {
        adjusted.bmiRange = "normal_18_24";
      }
      if (adjusted.hba1cStatus === "elevated_diabetic") {
        adjusted.hba1cStatus = "borderline_prediabetic";
      } else if (adjusted.hba1cStatus === "borderline_prediabetic") {
        adjusted.hba1cStatus = "normal";
      }
    }
    return evaluateClinicalRisk(adjusted, lang);
  }, [
    intake,
    habitReduceHeatSitting,
    habitQuitNicotine,
    habitImproveSleepStress,
    habitMetabolicCare,
    lang,
  ]);

  const deltaPoints =
    baselineReport.compositeScore - projectedReport.compositeScore;

  const activeHabitLabels: string[] = [];
  if (habitReduceHeatSitting)
    activeHabitLabels.push(isAr ? "تبريد وتقليل الجلوس" : "Cooling & desk breaks");
  if (habitQuitNicotine)
    activeHabitLabels.push(isAr ? "إيقاف النيكوتين" : "Nicotine-free");
  if (habitImproveSleepStress)
    activeHabitLabels.push(isAr ? "نوم 7.5 ساعة" : "7.5h sleep & calm");
  if (habitMetabolicCare)
    activeHabitLabels.push(isAr ? "توازن الأيض والوزن" : "Metabolic care");

  const handleLogCheckIn = () => {
    const nextDayNum = checkpoints.length * 30;
    const cp: ProgressCheckpoint = {
      id: `cp-${Date.now()}`,
      dayLabelEn: `Day ${nextDayNum}`,
      dayLabelAr: `اليوم ${nextDayNum}`,
      compositeScore: projectedReport.compositeScore,
      noteEn:
        activeHabitLabels.length > 0
          ? `Logged check-in with: ${activeHabitLabels.join(", ")}`
          : "Logged follow-up risk check-in",
      noteAr:
        activeHabitLabels.length > 0
          ? `تسجيل متابعة مع: ${activeHabitLabels.join("، ")}`
          : "تسجيل متابعة دورية للمخاطر",
      habitsActive: activeHabitLabels,
    };
    onAddCheckpoint(cp);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    onAddReminder({
      id: `rem-${Date.now()}`,
      dayLabelEn: newReminderDay,
      dayLabelAr: newReminderDay,
      titleEn: newReminderTitle.trim(),
      titleAr: newReminderTitle.trim(),
      detailEn: "Personal follow-up reminder added to your 90-day care plan.",
      detailAr: "تذكير متابعة شخصي مضاف إلى خطة الـ 90 يوماً.",
      category: "lifestyle",
      completed: false,
    });
    setNewReminderTitle("");
  };

  const completedRemindersCount = reminders.filter((r) => r.completed).length;

  // Build simple SVG polyline points for checkpoints
  const chartPoints = useMemo(() => {
    const pts =
      checkpoints.length >= 2
        ? checkpoints
        : [
            ...checkpoints,
            {
              id: "projected",
              dayLabelEn: "90d Goal",
              dayLabelAr: "هدف 90 يوم",
              compositeScore: projectedReport.compositeScore,
              noteEn: "Projected score with selected habits",
              noteAr: "المؤشر المتوقع مع العادات المختارة",
              habitsActive: activeHabitLabels,
            },
          ];

    const width = 360;
    const height = 110;
    const padX = 24;
    const padY = 16;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    return pts.map((pt, idx) => {
      const x =
        pts.length === 1
          ? width / 2
          : padX + (idx / (pts.length - 1)) * usableW;
      const clamped = Math.max(0, Math.min(100, pt.compositeScore));
      const y = padY + ((100 - clamped) / 100) * usableH;
      return { ...pt, x, y };
    });
  }, [checkpoints, projectedReport.compositeScore, activeHabitLabels]);

  const polylineStr = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT: Progress Over Time + Lifestyle Change Risk Simulator */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1B5683]">
                <TrendingDown className="w-4 h-4" />
                <span>
                  {isAr
                    ? "تتبع التقدم وتغير المخاطر بمرور الوقت"
                    : "Progress Over Time · Risk Change After Lifestyle Habits"}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 mt-1">
                {isAr
                  ? "شاهد كيف ينخفض مؤشر المخاطر مع التغييرات الصحية"
                  : "See How Healthy Changes Lower Your Risk Over 90 Days"}
              </h4>
            </div>

            <div className="bg-[#F3F6FA] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono-tabular shrink-0 self-start">
              <span className="text-slate-500">
                {isAr ? "الأثر المتوقع:" : "Projected:"}{" "}
              </span>
              <strong className="text-slate-900">
                {baselineReport.compositeScore} → {projectedReport.compositeScore}
              </strong>
              {deltaPoints > 0 && (
                <span className="text-[#059669] font-semibold ms-1.5">
                  (-{deltaPoints} pts)
                </span>
              )}
            </div>
          </div>

          {/* Interactive Lifestyle Habit Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                checked: habitReduceHeatSitting,
                toggle: () => setHabitReduceHeatSitting((v) => !v),
                en: "Desk breaks + stop lap/sauna heat",
                ar: "فواصل حركية + إيقاف حرارة الحاسوب والساونا",
              },
              {
                checked: habitImproveSleepStress,
                toggle: () => setHabitImproveSleepStress((v) => !v),
                en: "Consistent 7.5h sleep + stress relief",
                ar: "نوم منتظم 7.5 ساعات وتخفيف التوتر",
              },
              {
                checked: habitQuitNicotine,
                toggle: () => setHabitQuitNicotine((v) => !v),
                en: "90-day smoking / vaping cessation",
                ar: "التوقف عن التدخين والنيكوتين لمدة 90 يوماً",
              },
              {
                checked: habitMetabolicCare,
                toggle: () => setHabitMetabolicCare((v) => !v),
                en: "Balanced nutrition & weight step-down",
                ar: "تغذية متوازنة وتحسين الوزن وسكر الدم",
              },
            ].map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={h.toggle}
                className={`p-3 rounded-xl border text-start flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                  h.checked
                    ? "bg-emerald-50/70 border-[#059669] text-slate-900 font-medium"
                    : "bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-white"
                }`}
              >
                <span>{isAr ? h.ar : h.en}</span>
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    h.checked ? "text-[#059669]" : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* SVG Longitudinal Risk Trajectory Chart */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium text-slate-700 inline-flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1B5683]" />
                {isAr
                  ? "منحنى تطور مؤشر المخاطر (0 = أمان مثالي)"
                  : "Risk Index Trajectory (Lower is Better)"}
              </span>
              <span className="font-mono-tabular">0 – 100 scale</span>
            </div>

            <svg
              viewBox="0 0 360 110"
              className="w-full h-28 overflow-visible"
              aria-label="Risk progression over time chart"
            >
              <line
                x1="24"
                y1="16"
                x2="336"
                y2="16"
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />
              <line
                x1="24"
                y1="55"
                x2="336"
                y2="55"
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />
              <line
                x1="24"
                y1="94"
                x2="336"
                y2="94"
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />
              <polyline
                fill="none"
                stroke="#1B5683"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
              {chartPoints.map((pt, idx) => (
                <g key={pt.id}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill={idx === chartPoints.length - 1 ? "#059669" : "#1B5683"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={Math.max(12, pt.y - 9)}
                    textAnchor="middle"
                    className="fill-slate-900 text-[10px] font-mono-tabular font-semibold"
                  >
                    {pt.compositeScore}
                  </text>
                </g>
              ))}
            </svg>

            <div className="flex items-center justify-between text-[11px] font-mono-tabular text-slate-600 px-2">
              {chartPoints.map((pt) => (
                <span key={pt.id}>
                  {isAr ? pt.dayLabelAr : pt.dayLabelEn}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            {isAr
              ? "سجّل التزامك بهذه العادات لحفظ نقطة تقدم جديدة في خطتك."
              : "Log a lifestyle check-in to record your updated risk progress."}
          </p>
          <button
            type="button"
            onClick={handleLogCheckIn}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {isAr ? "تسجيل نقطة متابعة جديدة" : "Log Progress Check-In"}
            </span>
          </button>
        </div>
      </div>

      {/* RIGHT: Actionable Follow-Up Reminders */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1B5683]">
                <Bell className="w-4 h-4" />
                <span>
                  {isAr ? "تذكيرات المتابعة الطبية" : "Follow-Up Care Reminders"}
                </span>
              </div>
              <h4 className="text-base font-semibold text-slate-900 mt-0.5">
                {isAr ? "خطواتك المجدولة القادمة" : "Your Scheduled Next Steps"}
              </h4>
            </div>
            <span className="text-xs font-mono-tabular font-semibold text-[#059669]">
              {completedRemindersCount}/{reminders.length}{" "}
              {isAr ? "مكتمل" : "done"}
            </span>
          </div>

          {doctorResponse.status !== "pending" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950">
              <span className="font-semibold">
                {isAr ? "مرتبط بخطة الطبيب:" : "Synced with Specialist Plan:"}
              </span>{" "}
              {isAr ? doctorResponse.doctorNameAr : doctorResponse.doctorNameEn}{" "}
              · <span className="font-mono-tabular">{doctorResponse.scheduledSlot}</span>
            </div>
          )}

          <div className="space-y-2.5 max-h-64 overflow-y-auto pe-1">
            {reminders.map((rem) => (
              <button
                key={rem.id}
                type="button"
                onClick={() => onToggleReminder(rem.id)}
                className={`w-full p-3.5 rounded-xl border text-start flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                  rem.completed
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-[#F8FAFC] border-slate-200 hover:bg-white"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono-tabular font-semibold text-[#1B5683]">
                      {isAr ? rem.dayLabelAr : rem.dayLabelEn}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`font-semibold ${
                        rem.completed
                          ? "line-through text-slate-400"
                          : "text-slate-900"
                      }`}
                    >
                      {isAr ? rem.titleAr : rem.titleEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isAr ? rem.detailAr : rem.detailEn}
                  </p>
                </div>
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    rem.completed ? "text-[#059669]" : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Follow-up Reminder */}
        <form
          onSubmit={handleCreateReminder}
          className="pt-3 border-t border-slate-100 space-y-2"
        >
          <div className="flex items-center gap-2">
            <select
              value={newReminderDay}
              onChange={(e) => setNewReminderDay(e.target.value)}
              className="px-2.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono-tabular text-slate-800"
            >
              <option value="Day 7">Day 7</option>
              <option value="Day 14">Day 14</option>
              <option value="Day 30">Day 30</option>
              <option value="Day 45">Day 45</option>
              <option value="Day 90">Day 90</option>
            </select>
            <input
              type="text"
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
              placeholder={
                isAr
                  ? "أضف تذكير متابعة جديد..."
                  : "Add a follow-up reminder..."
              }
              className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
            />
            <button
              type="submit"
              disabled={!newReminderTitle.trim()}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isAr ? "إضافة" : "Add"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
