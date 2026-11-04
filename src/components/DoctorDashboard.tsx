"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Send,
  UserCheck,
  FileText,
  Calendar,
  Activity,
  ArrowUpRight,
  RotateCcw,
  ClipboardCheck,
  LogOut,
  Inbox,
  Phone,
  MapPin,
  User,
  Mail,
} from "lucide-react";
import { CONSULTATION_TIME_SLOTS } from "../data/personasAndContent";
import { calculateAgeFromBirthYear } from "../services/patientAuthService";
import {
  AuthenticatedDoctor,
  DoctorCooperationResponse,
  Language,
  PatientQueryCase,
} from "../types/clinical";
import {
  COOPERATION_ACTIONS_CATALOG,
  deriveDefaultRecommendationForReport,
  derivePatientSufferingList,
} from "../utils/doctorCaseHelpers";
import { evaluateClinicalRisk } from "../utils/riskEngine";

interface DoctorDashboardProps {
  lang: Language;
  authenticatedDoctor: AuthenticatedDoctor;
  cases: PatientQueryCase[];
  selectedCaseId: string;
  onSelectCase: (id: string) => void;
  onSubmitDoctorCooperation: (
    caseId: string,
    response: DoctorCooperationResponse
  ) => void;
  onLogoutDoctor: () => void;
  onSwitchToPatientPortal: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  lang,
  authenticatedDoctor,
  cases,
  selectedCaseId,
  onSelectCase,
  onSubmitDoctorCooperation,
  onLogoutDoctor,
  onSwitchToPatientPortal,
}) => {
  const isAr = lang === "ar";
  const [queueFilter, setQueueFilter] = useState<
    "all" | "pending" | "cooperating" | "high"
  >("all");
  const [justDispatchedToast, setJustDispatchedToast] =
    useState<boolean>(false);

  const enrichedCases = useMemo(() => {
    return cases.map((c) => ({
      ...c,
      report: evaluateClinicalRisk(c.intake, lang),
    }));
  }, [cases, lang]);

  const filteredCases = useMemo(() => {
    return enrichedCases.filter((c) => {
      if (queueFilter === "pending")
        return c.doctorResponse.status === "pending";
      if (queueFilter === "cooperating")
        return c.doctorResponse.status !== "pending";
      if (queueFilter === "high") return c.report.overallLevel === "high";
      return true;
    });
  }, [enrichedCases, queueFilter]);

  const activeCase =
    enrichedCases.find((c) => c.id === selectedCaseId) ||
    filteredCases[0] ||
    enrichedCases[0] ||
    null;

  const defaultTemplate = useMemo(() => {
    if (!activeCase) {
      return {
        en: "",
        ar: "",
        defaultActionIds: [] as string[],
        draftNoteEn: "",
        draftNoteAr: "",
      };
    }
    return deriveDefaultRecommendationForReport(activeCase.report);
  }, [activeCase]);

  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
  const [confirmedSlot, setConfirmedSlot] = useState<string>("");
  const [noteEn, setNoteEn] = useState<string>("");
  const [noteAr, setNoteAr] = useState<string>("");

  useEffect(() => {
    if (!activeCase) return;
    if (activeCase.doctorResponse.status === "cooperating") {
      const matchedIds = COOPERATION_ACTIONS_CATALOG.filter((act) =>
        activeCase.doctorResponse.approvedActionsEn.includes(act.labelEn)
      ).map((a) => a.id);
      setSelectedActionIds(
        matchedIds.length > 0 ? matchedIds : defaultTemplate.defaultActionIds
      );
      setNoteEn(
        activeCase.doctorResponse.clinicianNoteEn || defaultTemplate.draftNoteEn
      );
      setNoteAr(
        activeCase.doctorResponse.clinicianNoteAr || defaultTemplate.draftNoteAr
      );
      setConfirmedSlot(
        activeCase.doctorResponse.scheduledSlot || activeCase.requestedSlot
      );
    } else {
      setSelectedActionIds(defaultTemplate.defaultActionIds);
      setNoteEn(defaultTemplate.draftNoteEn);
      setNoteAr(defaultTemplate.draftNoteAr);
      setConfirmedSlot(activeCase.requestedSlot);
    }
    setJustDispatchedToast(false);
  }, [activeCase?.id, activeCase?.report.overallLevel, defaultTemplate]);

  const sufferingItems = useMemo(() => {
    if (!activeCase) return [];
    return derivePatientSufferingList(
      activeCase.intake,
      activeCase.consent,
      lang
    );
  }, [activeCase, lang]);

  const toggleActionId = (id: string) => {
    setSelectedActionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const doctorDisplayTitleEn = `${authenticatedDoctor.doctorName} (${authenticatedDoctor.specialtyEn})`;
  const doctorDisplayTitleAr = `${authenticatedDoctor.doctorName} (${authenticatedDoctor.specialtyAr})`;

  const handleQuickAcceptOnly = () => {
    if (!activeCase) return;
    const nowLabel = isAr ? "الآن · تم القبول" : "Just now · Accepted";
    onSubmitDoctorCooperation(activeCase.id, {
      ...activeCase.doctorResponse,
      status: "accepted",
      doctorNameEn: doctorDisplayTitleEn,
      doctorNameAr: doctorDisplayTitleAr,
      doctorSpecialtyEn: authenticatedDoctor.specialtyEn,
      doctorSpecialtyAr: authenticatedDoctor.specialtyAr,
      acceptedAt: nowLabel,
      scheduledSlot: confirmedSlot || activeCase.requestedSlot,
    });
  };

  const handleSendCooperativePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;
    const chosenCatalog = COOPERATION_ACTIONS_CATALOG.filter((item) =>
      selectedActionIds.includes(item.id)
    );
    const nowLabel = isAr ? "الآن · خطة نشطة" : "Just now · Plan Sent";

    onSubmitDoctorCooperation(activeCase.id, {
      status: "cooperating",
      doctorNameEn: doctorDisplayTitleEn,
      doctorNameAr: doctorDisplayTitleAr,
      doctorSpecialtyEn: authenticatedDoctor.specialtyEn,
      doctorSpecialtyAr: authenticatedDoctor.specialtyAr,
      acceptedAt: nowLabel,
      approvedActionsEn: chosenCatalog.map((c) => c.labelEn),
      approvedActionsAr: chosenCatalog.map((c) => c.labelAr),
      clinicianNoteEn: noteEn.trim() || defaultTemplate.draftNoteEn,
      clinicianNoteAr: noteAr.trim() || defaultTemplate.draftNoteAr,
      scheduledSlot: confirmedSlot || activeCase.requestedSlot,
    });
    setJustDispatchedToast(true);
  };

  const pendingCount = enrichedCases.filter(
    (c) => c.doctorResponse.status === "pending"
  ).length;
  const highPriorityCount = enrichedCases.filter(
    (c) => c.report.overallLevel === "high"
  ).length;
  const cooperatingCount = enrichedCases.filter(
    (c) => c.doctorResponse.status !== "pending"
  ).length;

  return (
    <div className="bg-[#F3F6FA] min-h-screen py-8 sm:py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* LOGGED-IN DOCTOR HEADER (Shows ONLY Authenticated Doctor's Name & Specialty — No Doctor List!) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1B5683] text-white flex items-center justify-center font-editorial text-2xl font-semibold shrink-0">
              {authenticatedDoctor.doctorName.trim().charAt(0).toUpperCase() ||
                "D"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#1B5683] font-semibold">
                <Stethoscope className="w-4 h-4" />
                <span>
                  {isAr
                    ? "صحة الرجل الإنجابية · لوحة الطبيب المسجل"
                    : "MEN'S REPRODUCTIVE HEALTH · AUTHENTICATED DOCTOR CONSOLE"}
                </span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-slate-900">
                {authenticatedDoctor.doctorName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-600">
                <span>
                  {isAr
                    ? authenticatedDoctor.specialtyAr
                    : authenticatedDoctor.specialtyEn}
                </span>
                {authenticatedDoctor.gmailEmail && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-xs font-mono-tabular text-[#059669]">
                      <Mail className="w-3.5 h-3.5" />
                      {authenticatedDoctor.gmailEmail}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSwitchToPatientPortal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>
                {isAr ? "عرض واجهة المراجع" : "View Patient Dashboard"}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#1B5683]" />
            </button>

            <button
              type="button"
              onClick={onLogoutDoctor}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span>{isAr ? "تسجيل خروج الطبيب" : "Sign Out"}</span>
            </button>
          </div>
        </div>

        {/* 4-COLUMN CLINICAL QUEUE KPI STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-500">
              {isAr ? "طلبات المقابلة الواردة" : "Patient Meeting Requests"}
            </span>
            <div className="text-3xl font-editorial font-semibold text-slate-900 tabular-nums">
              {enrichedCases.length}
            </div>
            <span className="text-[11px] text-slate-500">
              {isAr
                ? "تصل عند اختيار المراجع للأعراض"
                : "Sent after patient selects symptoms"}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-500">
              {isAr ? "بانتظار قبولك" : "Awaiting Your Acceptance"}
            </span>
            <div className="text-3xl font-editorial font-semibold text-[#D97706] tabular-nums">
              {pendingCount}
            </div>
            <span className="text-[11px] text-slate-500">
              {isAr ? "طلبات جديدة غير مقبولة بعد" : "New incoming patient queries"}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-500">
              {isAr ? "أعراض عالية الأولوية" : "High-Risk Symptom Requests"}
            </span>
            <div className="text-3xl font-editorial font-semibold text-[#DC2626] tabular-nums">
              {highPriorityCount}
            </div>
            <span className="text-[11px] text-slate-500">
              {isAr ? "تحتاج مراجعة تخصصية عاجلة" : "Priority clinical attention"}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-500">
              {isAr ? "طلبات تم قبولها والتعاون معها" : "Accepted & Responded"}
            </span>
            <div className="text-3xl font-editorial font-semibold text-[#059669] tabular-nums">
              {cooperatingCount}
            </div>
            <span className="text-[11px] text-slate-500">
              {isAr ? "تم إرسال خطة العلاج للمراجع" : "Care plan synced to Supabase"}
            </span>
          </div>
        </div>

        {/* EMPTY STATE WHEN NO PATIENT HAS CHOSEN SYMPTOMS & SENT A MEETING REQUEST YET */}
        {enrichedCases.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F3F6FA] border border-slate-200 text-[#1B5683] flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="font-editorial text-2xl font-semibold text-slate-900">
                {isAr
                  ? "لا توجد طلبات مقابلة من المراجعين حالياً"
                  : "No Patient Meeting Requests Yet"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? "تظهر استفسارات المراجعين هنا تلقائياً بمجرد أن يختار المراجع الأعراض التي يعاني منها ويرسل طلب مقابلة الطبيب."
                  : "Incoming queries appear here automatically as soon as a patient selects their symptoms and sends a request to meet."}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onSwitchToPatientPortal}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1B5683] text-white text-xs font-semibold hover:bg-[#154468] transition-colors cursor-pointer"
              >
                <span>
                  {isAr
                    ? "انتقل لواجهة المراجع لاختيار الأعراض وإرسال طلب"
                    : "Go to Patient Dashboard to Select Symptoms & Request Meeting"}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* MAIN SPLIT WORKSPACE WHEN REAL PATIENT REQUESTS EXIST */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANE: INCOMING PATIENT MEETING REQUESTS */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {isAr ? "طلبات المراجعين الواردة" : "Incoming Patient Requests"}
                  </h2>
                  <span className="text-xs font-mono-tabular text-slate-500">
                    {filteredCases.length} {isAr ? "طلبات" : "requests"}
                  </span>
                </div>

                {/* Filter Segmented Control */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#F3F6FA] rounded-xl">
                  {(
                    [
                      { id: "all", label: isAr ? "الكل" : "All" },
                      { id: "pending", label: isAr ? "جديد" : "Pending" },
                      { id: "high", label: isAr ? "عاجل" : "High" },
                      { id: "cooperating", label: isAr ? "مقبول" : "Accepted" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setQueueFilter(tab.id)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap truncate ${
                        queueFilter === tab.id
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Queue Cards (Clean Readable Patient Labels — No Encoded Strings) */}
              <div className="space-y-3">
                {filteredCases.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-[#F8FAFC] rounded-xl border border-slate-200/80">
                    {isAr
                      ? "لا توجد طلبات مطابقة لهذا الفلتر."
                      : "No patient requests match this filter."}
                  </div>
                ) : (
                  filteredCases.map((item) => {
                    const selected = activeCase?.id === item.id;
                    const symptomsList = isAr
                      ? item.selectedSymptomsAr
                      : item.selectedSymptomsEn;

                    const riskColor =
                      item.report.overallLevel === "high"
                        ? "text-[#DC2626]"
                        : item.report.overallLevel === "moderate"
                        ? "text-[#D97706]"
                        : "text-[#059669]";

                    const riskWord =
                      item.report.overallLevel === "high"
                        ? isAr
                          ? "مخاطر مرتفعة"
                          : "High Risk"
                        : item.report.overallLevel === "moderate"
                        ? isAr
                          ? "مخاطر متوسطة"
                          : "Moderate Risk"
                        : isAr
                        ? "مخاطر منخفضة"
                        : "Low Risk";

                    const statusWord =
                      item.doctorResponse.status === "cooperating"
                        ? isAr
                          ? "تم إرسال الخطة"
                          : "Care Plan Sent"
                        : item.doctorResponse.status === "accepted"
                        ? isAr
                          ? "تم القبول"
                          : "Accepted"
                        : isAr
                        ? "بانتظار الطبيب"
                        : "Pending Review";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectCase(item.id)}
                        className={`w-full text-start p-4 rounded-xl border transition-colors cursor-pointer space-y-2.5 ${
                          selected
                            ? "bg-[#F3F6FA] border-[#1B5683]"
                            : "bg-[#F8FAFC] border-slate-200/90 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-900 truncate">
                            {item.patientProfile.patientName}
                          </span>
                          <span className="text-[11px] text-slate-500 shrink-0">
                            {isAr ? item.submittedAtAr : item.submittedAtEn}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 font-mono-tabular">
                          {item.patientProfile.birthYear && (
                            <span>
                              {isAr
                                ? `مواليد ${item.patientProfile.birthYear}`
                                : `Born ${item.patientProfile.birthYear}`}
                              {calculateAgeFromBirthYear(
                                item.patientProfile.birthYear
                              ) !== null
                                ? ` (${calculateAgeFromBirthYear(
                                    item.patientProfile.birthYear
                                  )}y)`
                                : ""}
                            </span>
                          )}
                          {item.patientProfile.cityLocation && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="font-sans">
                                {item.patientProfile.cityLocation}
                              </span>
                            </>
                          )}
                          {item.patientProfile.phoneNumber && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span>{item.patientProfile.phoneNumber}</span>
                            </>
                          )}
                        </div>

                        <div className="text-[11px] text-[#1B5683] font-medium truncate">
                          {isAr ? "التخصص المطلوب:" : "Requested:"}{" "}
                          {isAr
                            ? item.requestedDoctorOrSpecialtyAr
                            : item.requestedDoctorOrSpecialtyEn}
                        </div>

                        {symptomsList.length > 0 && (
                          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                            <span className="font-semibold">
                              {isAr ? "الأعراض:" : "Symptoms:"}{" "}
                            </span>
                            {symptomsList.join(" · ")}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                          <span className={`font-semibold ${riskColor}`}>
                            {riskWord}
                          </span>
                          <span
                            className={`font-medium ${
                              item.doctorResponse.status === "pending"
                                ? "text-amber-700"
                                : "text-[#059669]"
                            }`}
                          >
                            {statusWord}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT PANE: SELECTED PATIENT SYMPTOMS + MEETING REQUEST + DOCTOR COOPERATION */}
            {activeCase && (
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#1B5683]">
                          <User className="w-3.5 h-3.5" />
                          {activeCase.patientProfile.patientName}
                        </span>
                        <span>·</span>
                        <span>
                          {isAr
                            ? activeCase.preferredModalityAr
                            : activeCase.preferredModalityEn}
                        </span>
                        <span>·</span>
                        <span className="font-mono-tabular">
                          {activeCase.requestedSlot}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-slate-900">
                        {isAr
                          ? "بيانات المراجع المسجلة والأعراض المختارة"
                          : "Patient Registration Details, Symptoms & Meeting Request"}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {activeCase.doctorResponse.status === "pending" ? (
                        <button
                          type="button"
                          onClick={handleQuickAcceptOnly}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>
                            {isAr ? "قبول طلب المقابلة" : "Accept Meeting Request"}
                          </span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#059669]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {activeCase.doctorResponse.status === "cooperating"
                              ? isAr
                                ? "تم القبول وإرسال الخطة التعاونية"
                                : "Accepted · Care Plan Sent"
                              : isAr
                              ? "تم قبول الطلب للمراجعة"
                              : "Accepted · Drafting Care Plan"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PATIENT IDENTITY & DEMOGRAPHICS REFLECTED FROM PATIENT LOGIN */}
                  <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-semibold text-slate-900 block">
                      {isAr
                        ? "بيانات المراجع المسجلة عند الدخول:"
                        : "Verified Patient Profile (Entered at Login):"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-500 block">
                          {isAr ? "اسم المراجع" : "Patient Name"}
                        </span>
                        <span className="font-semibold text-slate-900 block">
                          {activeCase.patientProfile.patientName}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-500 block">
                          {isAr ? "سنة الميلاد والعمر" : "Birth Year & Age"}
                        </span>
                        <span className="font-semibold text-slate-900 font-mono-tabular block">
                          {activeCase.patientProfile.birthYear
                            ? `${activeCase.patientProfile.birthYear}${
                                calculateAgeFromBirthYear(
                                  activeCase.patientProfile.birthYear
                                ) !== null
                                  ? isAr
                                    ? ` (${calculateAgeFromBirthYear(
                                        activeCase.patientProfile.birthYear
                                      )} سنة)`
                                    : ` (${calculateAgeFromBirthYear(
                                        activeCase.patientProfile.birthYear
                                      )} yrs)`
                                  : ""
                              }`
                            : isAr
                            ? "غير محدد"
                            : "Not specified"}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-500 block">
                          {isAr ? "رقم الهاتف" : "Contact Phone"}
                        </span>
                        <span className="font-semibold text-slate-900 font-mono-tabular inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#1B5683]" />
                          {activeCase.patientProfile.phoneNumber ||
                            (isAr ? "غير مرفق" : "Not provided")}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-500 block">
                          {isAr ? "المدينة / الموقع" : "City / Location"}
                        </span>
                        <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#1B5683]" />
                          {activeCase.patientProfile.cityLocation ||
                            (isAr ? "غير محدد" : "Not specified")}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-500 block">
                          {isAr ? "الحالة والهدف الصحي" : "Care Goal"}
                        </span>
                        <span className="font-semibold text-slate-900 block">
                          {isAr
                            ? activeCase.patientProfile.maritalGoalAr
                            : activeCase.patientProfile.maritalGoalEn}
                        </span>
                      </div>
                    </div>
                    {activeCase.patientProfile.gmailEmail && (
                      <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-xs text-[#059669] font-medium">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isAr ? "حساب Gmail موثق:" : "Verified Gmail:"}{" "}
                          <strong className="font-mono-tabular">
                            {activeCase.patientProfile.gmailEmail}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* EXACT SYMPTOMS SELECTED BY THE PATIENT */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-slate-900 block">
                      {isAr
                        ? "الأعراض التي اختارها المراجع عند طلب المقابلة:"
                        : "Symptoms Selected by Patient:"}
                    </span>
                    {(isAr
                      ? activeCase.selectedSymptomsAr
                      : activeCase.selectedSymptomsEn
                    ).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(isAr
                          ? activeCase.selectedSymptomsAr
                          : activeCase.selectedSymptomsEn
                        ).map((sym, idx) => (
                          <div
                            key={idx}
                            className="bg-[#F3F6FA] border border-slate-200/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-medium text-slate-900"
                          >
                            <Activity className="w-3.5 h-3.5 text-[#1B5683] shrink-0" />
                            <span>{sym}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 bg-[#F8FAFC] border border-slate-200 rounded-xl p-3">
                        {isAr
                          ? "فحص وقائي استباقي عام قبل الإنجاب."
                          : "Routine preventive preconception wellness check."}
                      </p>
                    )}
                  </div>

                  {/* Patient's Direct Message */}
                  <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#1B5683]" />
                        {isAr
                          ? "رسالة المراجع وطلب المقابلة:"
                          : "Patient's Meeting Request Note:"}
                      </span>
                      <span className="font-mono-tabular">
                        {activeCase.requestedSlot}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      “
                      {isAr
                        ? activeCase.patientQueryTextAr
                        : activeCase.patientQueryTextEn}
                      ”
                    </p>
                  </div>

                  {/* Detailed Clinical Assessment Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#1B5683]" />
                        <span>
                          {isAr
                            ? "التفصيل السريري لما يعاني منه المراجع"
                            : "Clinical Breakdown of Patient's Condition"}
                        </span>
                      </h3>
                      <span className="text-xs font-mono-tabular text-slate-500">
                        {isAr ? "مؤشر المخاطر:" : "Risk Score:"}{" "}
                        <strong className="text-slate-900">
                          {activeCase.report.compositeScore}/100
                        </strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {sufferingItems.map((sItem, idx) => {
                        const SevIcon =
                          sItem.severity === "high"
                            ? ShieldAlert
                            : sItem.severity === "moderate"
                            ? AlertTriangle
                            : CheckCircle2;
                        const sevColor = sItem.redacted
                          ? "text-slate-400"
                          : sItem.severity === "high"
                          ? "text-[#DC2626]"
                          : sItem.severity === "moderate"
                          ? "text-[#D97706]"
                          : "text-[#059669]";

                        return (
                          <div
                            key={idx}
                            className={`rounded-xl border p-4 space-y-1.5 ${
                              sItem.redacted
                                ? "bg-slate-50/70 border-slate-200 text-slate-400"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-500">
                                {sItem.category}
                              </span>
                              <SevIcon className={`w-4 h-4 ${sevColor}`} />
                            </div>
                            <p
                              className={`text-xs font-semibold leading-snug ${
                                sItem.redacted
                                  ? "text-slate-500 italic"
                                  : "text-slate-900"
                              }`}
                            >
                              {sItem.label}
                            </p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {sItem.detail}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Screening Recommendation to Cooperate With */}
                  <div className="bg-[#F3F6FA] border border-[#1B5683]/30 rounded-xl p-4 sm:p-5 space-y-2">
                    <span className="text-xs font-semibold text-[#1B5683] inline-flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4" />
                      {isAr
                        ? "توصية الفرز الذكي للمراجع (للتعاون وفقاً لها)"
                        : "Recommended Care Pathway (Cooperate Accordingly)"}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                      {isAr
                        ? activeCase.userRecommendationAr
                        : activeCase.userRecommendationEn}
                    </p>
                  </div>
                </div>

                {/* DOCTOR COOPERATION & MEETING CONFIRMATION FORM */}
                <form
                  onSubmit={handleSendCooperativePlan}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {isAr
                          ? `رد وخطة تعاون ${authenticatedDoctor.doctorName}`
                          : `Response & Care Plan from ${authenticatedDoctor.doctorName}`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isAr
                          ? "حدد الإجراءات الطبية المعتمدة وأرسل موافقتك على المقابلة مباشرة إلى المراجع."
                          : "Confirm the meeting window and approve cooperative medical steps aligned with the patient's symptoms."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActionIds(defaultTemplate.defaultActionIds);
                        setNoteEn(defaultTemplate.draftNoteEn);
                        setNoteAr(defaultTemplate.draftNoteAr);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B5683] hover:underline cursor-pointer self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>
                        {isAr
                          ? "استعادة التوصية التلقائية"
                          : "Reset to Recommended"}
                      </span>
                    </button>
                  </div>

                  {/* Cooperative Medical Orders Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {COOPERATION_ACTIONS_CATALOG.map((action) => {
                      const checked = selectedActionIds.includes(action.id);
                      const matchesTier = action.recommendedForTiers.includes(
                        activeCase.report.overallLevel
                      );
                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => toggleActionId(action.id)}
                          className={`p-3.5 rounded-xl border text-start flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                            checked
                              ? "bg-[#0F172A] text-white border-[#0F172A]"
                              : "bg-[#F8FAFC] text-slate-800 border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-semibold leading-snug">
                              {isAr ? action.labelAr : action.labelEn}
                            </p>
                            {matchesTier && (
                              <span
                                className={`inline-block text-[10px] ${
                                  checked ? "text-sky-300" : "text-[#1B5683]"
                                }`}
                              >
                                {isAr
                                  ? "متوافق مع أعراض المراجع"
                                  : "Recommended for patient's symptoms"}
                              </span>
                            )}
                          </div>
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              checked ? "text-emerald-400" : "text-slate-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Confirmed Meeting Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-800">
                        {isAr ? "موعد المقابلة المؤكد:" : "Confirmed Meeting Slot:"}
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-[#1B5683] absolute top-2.5 start-3" />
                        <select
                          value={confirmedSlot}
                          onChange={(e) => setConfirmedSlot(e.target.value)}
                          className="w-full ps-9 pe-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono-tabular font-medium text-slate-900 focus:outline-none focus:border-[#1B5683]"
                        >
                          <option value={activeCase.requestedSlot}>
                            {activeCase.requestedSlot} (
                            {isAr ? "طلب المراجع" : "Patient Requested"})
                          </option>
                          {CONSULTATION_TIME_SLOTS.filter(
                            (s) => s !== activeCase.requestedSlot
                          ).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-xs font-semibold text-slate-800">
                        {isAr ? "الطبيب المجيب:" : "Responding Doctor:"}
                      </span>
                      <div className="px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#059669] shrink-0" />
                        <span className="truncate font-medium">
                          {doctorDisplayTitleEn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor's Cooperative Message */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      {isAr
                        ? "رسالتك التوجيهية للمراجع:"
                        : "Your Message & Meeting Instructions to Patient:"}
                    </label>
                    <textarea
                      rows={3}
                      value={isAr ? noteAr : noteEn}
                      onChange={(e) =>
                        isAr
                          ? setNoteAr(e.target.value)
                          : setNoteEn(e.target.value)
                      }
                      className="w-full p-3.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:bg-white focus:border-[#1B5683]"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? "يُحفظ ردك مباشرة في قاعدة بيانات Supabase ويظهر للمراجع فوراً."
                        : "Saved directly to Supabase and delivered live to the patient."}
                    </p>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B5683] text-white text-xs sm:text-sm font-semibold hover:bg-[#154468] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isAr
                          ? "قبول الطلب وإرسال الخطة للمراجع"
                          : "Accept Request & Send Care Plan"}
                      </span>
                    </button>
                  </div>

                  {justDispatchedToast && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                      <div className="space-y-0.5">
                        <p className="font-semibold">
                          ✓{" "}
                          {isAr
                            ? "تم قبول طلب المقابلة وحفظ الخطة العلاجية بنجاح!"
                            : "Meeting request accepted & care plan saved to Supabase!"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onSwitchToPatientPortal}
                        className="px-4 py-2 rounded-lg bg-[#059669] text-white font-semibold hover:bg-[#047857] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {isAr ? "معاينة في واجهة المراجع" : "View in Patient Portal"}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
