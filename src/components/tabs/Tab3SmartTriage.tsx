"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Package,
  Video,
  Calendar,
  FileText,
  PhoneCall,
  X,
  ShieldCheck,
  Stethoscope,
  ArrowUpRight,
  Activity,
  UserCheck,
  MapPin,
  Phone,
} from "lucide-react";
import {
  CONSULTATION_TIME_SLOTS,
  DOCTOR_SPECIALTY_OPTIONS,
} from "../../data/personasAndContent";
import { RegisteredDoctorOption } from "../../services/doctorAuthService";
import { calculateAgeFromBirthYear } from "../../services/patientAuthService";
import {
  AuthenticatedPatient,
  BookedAppointmentSummary,
  DoctorCooperationResponse,
  IntakeData,
  Language,
  RiskReport,
} from "../../types/clinical";
import { extractSelectedSymptomsFromIntake } from "../../utils/doctorCaseHelpers";

interface Tab3SmartTriageProps {
  lang: Language;
  authenticatedPatient: AuthenticatedPatient;
  intake: IntakeData;
  report: RiskReport;
  registeredDoctors: RegisteredDoctorOption[];
  bookedAppointments: BookedAppointmentSummary[];
  isBookingSaving?: boolean;
  onUpdateIntake: (patch: Partial<IntakeData>) => void;
  liveDoctorResponse: DoctorCooperationResponse;
  onDispatchPatientQuery: (payload: {
    requestedDoctorOrSpecialtyEn: string;
    requestedDoctorOrSpecialtyAr: string;
    slot: string;
    modalityEn: string;
    modalityAr: string;
    queryNoteEn: string;
    queryNoteAr: string;
  }) => Promise<void> | void;
  onOpenDoctorPortal: (appointmentId?: string) => void;
}

export const Tab3SmartTriage: React.FC<Tab3SmartTriageProps> = ({
  lang,
  authenticatedPatient,
  intake,
  report,
  registeredDoctors,
  bookedAppointments,
  isBookingSaving = false,
  onUpdateIntake,
  liveDoctorResponse,
  onDispatchPatientQuery,
  onOpenDoctorPortal,
}) => {
  const isAr = lang === "ar";
  const patientAge = calculateAgeFromBirthYear(authenticatedPatient.birthYear);

  // Emergency Modal State
  const [dismissedEmergencyModal, setDismissedEmergencyModal] = useState(false);
  const [forceEmergencyPreview, setForceEmergencyPreview] = useState(false);
  const showEmergencyModal =
    forceEmergencyPreview ||
    (report.hasAcuteRedFlag && !dismissedEmergencyModal);

  // Low-Risk Self-Care Checklist State
  const [checkedHabits, setCheckedHabits] = useState<Record<string, boolean>>({
    h1: true,
    h2: true,
    h3: false,
    h4: false,
  });
  const [downloadedGuide, setDownloadedGuide] = useState(false);

  // Moderate-Risk Kit & Teleconsult State
  const [kitOrdered, setKitOrdered] = useState(false);
  const [teleconsultRequested, setTeleconsultRequested] = useState(false);
  const [deliveryWindow, setDeliveryWindow] = useState<"evening" | "weekend">(
    "evening"
  );

  // Choose Symptoms & Request to Meet Doctor State
  const [selectedDoctorTarget, setSelectedDoctorTarget] = useState<string>(
    registeredDoctors[0]
      ? `reg::${registeredDoctors[0].id}`
      : `spec::${DOCTOR_SPECIALTY_OPTIONS[0].id}`
  );
  const [selectedSlot, setSelectedSlot] = useState<string>(
    CONSULTATION_TIME_SLOTS[0]
  );
  const [meetingModality, setMeetingModality] = useState<
    "video" | "in_person" | "chat"
  >("video");
  const [referralNotes, setReferralNotes] = useState<string>("");
  const [symptomValidationMsg, setSymptomValidationMsg] = useState<
    string | null
  >(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  const currentSymptoms = useMemo(
    () => extractSelectedSymptomsFromIntake(intake),
    [intake]
  );

  const symptomToggleCatalog: {
    id: string;
    labelEn: string;
    labelAr: string;
    active: boolean;
    toggle: () => void;
  }[] = [
    {
      id: "dull_ache",
      labelEn: "Intermittent dull testicular ache",
      labelAr: "ألم خفيف متكرر في الخصية",
      active: intake.dullTesticularAche,
      toggle: () =>
        onUpdateIntake({ dullTesticularAche: !intake.dullTesticularAche }),
    },
    {
      id: "heaviness",
      labelEn: "Scrotal heaviness after standing",
      labelAr: "شعور بثقل يزداد مع الوقوف",
      active: intake.scrotalHeavinessAfterStanding,
      toggle: () =>
        onUpdateIntake({
          scrotalHeavinessAfterStanding: !intake.scrotalHeavinessAfterStanding,
        }),
    },
    {
      id: "varicocele",
      labelEn: "Visible / palpable vein swelling (Varicocele)",
      labelAr: "توسع أوردة مرئي أو محسوس (دوالي الخصية)",
      active: intake.visibleVeinSwelling,
      toggle: () =>
        onUpdateIntake({ visibleVeinSwelling: !intake.visibleVeinSwelling }),
    },
    {
      id: "prolonged_sitting",
      labelEn: "Prolonged sitting (8+ hrs/day)",
      labelAr: "جلوس مكتبي طويل (+8 ساعات يومياً)",
      active: intake.sittingHoursPerDay === "8plus",
      toggle: () =>
        onUpdateIntake({
          sittingHoursPerDay:
            intake.sittingHoursPerDay === "8plus" ? "under4" : "8plus",
        }),
    },
    {
      id: "heat_exposure",
      labelEn: "Frequent heat exposure (laptop / sauna)",
      labelAr: "تعرض حراري متكرر (حاسوب / ساونا)",
      active: intake.thermalExposure === "frequent",
      toggle: () =>
        onUpdateIntake({
          thermalExposure:
            intake.thermalExposure === "frequent" ? "none" : "frequent",
        }),
    },
    {
      id: "metabolic_bmi",
      labelEn: "Elevated BMI or blood sugar strain",
      labelAr: "ارتفاع مؤشر الكتلة أو سكر الدم",
      active: intake.bmiRange === "high_over_28",
      toggle: () =>
        onUpdateIntake({
          bmiRange:
            intake.bmiRange === "high_over_28"
              ? "normal_18_24"
              : "high_over_28",
        }),
    },
    {
      id: "stress_sleep",
      labelEn: "High daily stress & irregular sleep",
      labelAr: "ضغط نفسي مرتفع واضطراب النوم",
      active: intake.stressLevel === "high" || intake.sleepQuality !== "optimal",
      toggle: () => {
        const nextActive = !(
          intake.stressLevel === "high" || intake.sleepQuality !== "optimal"
        );
        onUpdateIntake({
          stressLevel: nextActive ? "high" : "low",
          sleepQuality: nextActive ? "irregular" : "optimal",
        });
      },
    },
    {
      id: "urinary_infection",
      labelEn: "Prior urinary or pelvic infection",
      labelAr: "التهاب مسالك أو حوض متكرر",
      active: intake.chronicPelvicOrUrinaryInfection,
      toggle: () =>
        onUpdateIntake({
          chronicPelvicOrUrinaryInfection:
            !intake.chronicPelvicOrUrinaryInfection,
        }),
    },
  ];

  const resolveDoctorSelection = (): { en: string; ar: string } => {
    if (selectedDoctorTarget.startsWith("reg::")) {
      const regId = selectedDoctorTarget.replace("reg::", "");
      const foundDoc = registeredDoctors.find((d) => d.id === regId);
      if (foundDoc) {
        return {
          en: `${foundDoc.doctorName} — ${foundDoc.specialtyEn}`,
          ar: `${foundDoc.doctorName} — ${foundDoc.specialtyAr}`,
        };
      }
    }
    const specId = selectedDoctorTarget.replace("spec::", "");
    const foundSpec =
      DOCTOR_SPECIALTY_OPTIONS.find((s) => s.id === specId) ||
      DOCTOR_SPECIALTY_OPTIONS[0];
    return {
      en: foundSpec.labelEn,
      ar: foundSpec.labelAr,
    };
  };

  const handleDownloadSelfCareGuide = () => {
    const content = [
      "MEN'S REPRODUCTIVE HEALTH — 90-DAY PRECONCEPTION & VITALITY PROTOCOL",
      "====================================================================",
      "Educational Preventive Plan",
      "",
      "1. Scrotal Thermoregulation:",
      "   - Keep laptops on desks, never directly on the lap.",
      "   - Take a 5-minute standing movement break every 45 minutes.",
      "   - Pause sauna, steam room, and hot-tub immersion for 90 days.",
      "",
      "2. Micronutrient & Antioxidant Nutrition:",
      "   - Daily walnuts (40g), pumpkin seeds (zinc), olive oil, and berries.",
      "   - Key cofactors: CoQ10 (200mg), L-Carnitine, Folate, Selenium, Vitamin D3.",
      "",
      "3. Circadian & Metabolic Alignment:",
      "   - Maintain a consistent 7.5–8 hour sleep window before midnight.",
      "   - 3x weekly moderate resistance + zone-2 cardiovascular training.",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Mens_Reproductive_Health_90Day_Guide.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadedGuide(true);
  };

  const selfCareItems = [
    {
      id: "h1",
      text: isAr
        ? "إلغاء التعرض الحراري المباشر (الحاسوب على المكتب وإيقاف الساونا لمدة 90 يوماً)"
        : "Zero direct lap heat & sauna pause across full 90-day spermatogenesis cycle",
    },
    {
      id: "h2",
      text: isAr
        ? "نظام غذائي متوسطي غني بالزنك والسيلينيوم وCoQ10 وحمض أوميغا-3"
        : "Daily antioxidant nutrition: CoQ10, Zinc, Omega-3s, and 40g raw walnuts",
    },
    {
      id: "h3",
      text: isAr
        ? "فواصل حركة كل 45 دقيقة لتحسين التروية وتخفيف الاحتقان الحراري"
        : "5-minute standing circulation breaks every 45 minutes of desk work",
    },
    {
      id: "h4",
      text: isAr
        ? "تثبيت 7.5 ساعات نوم ليلي عميق لدعم إفراز التستوستيرون الصباحي"
        : "Consistent 7.5-hour sleep schedule to protect morning testosterone peaks",
    },
  ];

  const approvedActions = isAr
    ? liveDoctorResponse.approvedActionsAr
    : liveDoctorResponse.approvedActionsEn;

  return (
    <div className="space-y-6">
      {/* LIVE CLINICIAN RESPONSE & COOPERATION CARD */}
      {liveDoctorResponse.status !== "pending" && (
        <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#059669]">
                  {liveDoctorResponse.status === "cooperating"
                    ? isAr
                      ? "تم قبول طلب المقابلة وإرسال الخطة التعاونية من الطبيب"
                      : "Doctor Accepted Your Meeting Request & Sent Care Plan"
                    : isAr
                    ? "قام الطبيب بقبول طلب المقابلة للمراجعة"
                    : "Doctor Accepted Your Meeting Request"}
                </span>
                <h4 className="text-base font-semibold text-slate-900">
                  {isAr
                    ? liveDoctorResponse.doctorNameAr
                    : liveDoctorResponse.doctorNameEn}{" "}
                  <span className="text-xs font-normal text-slate-500 font-mono-tabular">
                    · {liveDoctorResponse.scheduledSlot}
                  </span>
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDoctorPortal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-slate-800 hover:bg-emerald-100/50 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <span>{isAr ? "فتح لوحة الطبيب" : "Doctor Portal"}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#059669]" />
            </button>
          </div>

          {liveDoctorResponse.status === "cooperating" && (
            <>
              <p className="text-xs sm:text-sm text-slate-800 bg-white/90 border border-emerald-200 rounded-xl p-4 leading-relaxed">
                “
                {isAr
                  ? liveDoctorResponse.clinicianNoteAr
                  : liveDoctorResponse.clinicianNoteEn}
                ”
              </p>

              {approvedActions.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-emerald-950">
                    {isAr
                      ? "الإجراءات والطلبات المعتمدة من الطبيب:"
                      : "Approved Clinical Orders from Doctor:"}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {approvedActions.map((act, i) => (
                      <div
                        key={i}
                        className="bg-white border border-emerald-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SUBMITTED MEETING REQUESTS LIST (Backed by Supabase) */}
      {bookedAppointments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-base font-semibold text-slate-900">
                {isAr
                  ? "طلبات مقابلة الأطباء المرسلة"
                  : "Your Submitted Doctor Meeting Requests"}
              </h4>
              <p className="text-xs text-slate-500">
                {isAr
                  ? "طلباتك المحفوظة في قاعدة البيانات مع الأعراض المختارة وحالة رد الطبيب."
                  : "Saved meeting requests with your selected symptoms and live doctor status."}
              </p>
            </div>
            <span className="text-xs font-mono-tabular font-semibold text-slate-600">
              {bookedAppointments.length} {isAr ? "طلب مسجل" : "submitted"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {bookedAppointments.slice(0, 6).map((appt) => {
              const statusLabel =
                appt.status === "cooperating"
                  ? isAr
                    ? "تم إرسال الخطة التعاونية"
                    : "Care Plan Sent"
                  : appt.status === "accepted"
                  ? isAr
                    ? "تم قبول الطلب"
                    : "Accepted by Doctor"
                  : isAr
                  ? "بانتظار مراجعة الطبيب"
                  : "Pending Doctor Review";

              const statusColor =
                appt.status === "pending"
                  ? "text-[#D97706]"
                  : "text-[#059669]";

              const symptoms = isAr
                ? appt.selectedSymptomsAr
                : appt.selectedSymptomsEn;

              return (
                <div
                  key={appt.id}
                  className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-900 truncate">
                        {appt.patientProfile.patientName}
                        {appt.patientProfile.birthYear
                          ? ` · ${appt.patientProfile.birthYear}`
                          : ""}
                      </span>
                      <span className={`font-semibold shrink-0 ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {(appt.patientProfile.cityLocation ||
                      appt.patientProfile.phoneNumber) && (
                      <p className="text-[11px] text-slate-500 truncate">
                        {[
                          appt.patientProfile.cityLocation,
                          appt.patientProfile.phoneNumber,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    <p className="text-xs font-medium text-[#1B5683]">
                      {appt.status !== "pending"
                        ? isAr
                          ? appt.doctorResponse.doctorNameAr
                          : appt.doctorResponse.doctorNameEn
                        : isAr
                        ? appt.requestedDoctorOrSpecialtyAr
                        : appt.requestedDoctorOrSpecialtyEn}
                    </p>

                    {symptoms.length > 0 && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {symptoms.join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono-tabular font-medium text-slate-800">
                      {appt.doctorResponse.scheduledSlot || appt.appointmentSlot}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenDoctorPortal(appt.id)}
                      className="inline-flex items-center gap-1 font-semibold text-[#1B5683] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      <span>{isAr ? "لوحة الطبيب" : "Doctor Portal"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Red Flag Emergency Guardrail Control & Status */}
      <div
        className={`rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          report.hasAcuteRedFlag
            ? "bg-red-950 text-white border-red-800"
            : "bg-[#F8FAFC] text-slate-900 border-slate-200"
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              report.hasAcuteRedFlag
                ? "bg-red-600 text-white"
                : "bg-red-50 text-[#DC2626] border border-red-200"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {isAr
                ? "حاجز الأمان للطوارئ السريرية (Red Flag Emergency Guardrail)"
                : "Red Flag Emergency Clinical Guardrail"}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                report.hasAcuteRedFlag ? "text-red-200" : "text-slate-600"
              }`}
            >
              {report.hasAcuteRedFlag
                ? isAr
                  ? "تم رصد عرض حاد يستوجب تقييماً إسعافياً عاجلاً بدلاً من الفحص الروتيني."
                  : "Acute urological symptom flagged — immediate in-person clinical evaluation advised."
                : isAr
                ? "لم يتم الإبلاغ عن ألم حاد مفاجئ أو تورم طارئ أو دم في السائل المنوي."
                : "No acute testicular pain, sudden swelling, or hematospermia flagged. Safe for outpatient routing."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onUpdateIntake({
                acuteSevereTesticularPain: !intake.acuteSevereTesticularPain,
              });
              setDismissedEmergencyModal(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
              intake.acuteSevereTesticularPain
                ? "bg-white text-red-900 border-white"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {intake.acuteSevereTesticularPain
              ? isAr
                ? "إلغاء محاكاة العرض الطارئ"
                : "Clear Simulated Acute Pain"
              : isAr
              ? "اختبار تنبيه الطوارئ الحاد"
              : "Simulate Red Flag Alert"}
          </button>

          {report.hasAcuteRedFlag && (
            <button
              type="button"
              onClick={() => setForceEmergencyPreview(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isAr ? "عرض بروتوكول الطوارئ" : "Open Emergency Directive"}
            </button>
          )}
        </div>
      </div>

      {/* High-Contrast Emergency Guardrail Modal */}
      {showEmergencyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border-2 border-[#DC2626] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 text-[#DC2626]">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#DC2626]">
                    {isAr
                      ? "تنبيه طوارئ سريري فوري"
                      : "IMMEDIATE CLINICAL EVALUATION"}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr
                      ? "تم رصد أعراض حادة تتطلب فحصاً طبياً عاجلاً"
                      : "Acute Urological Red Flag Detected"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDismissedEmergencyModal(true);
                  setForceEmergencyPreview(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 text-xs text-red-950">
              {report.redFlagReasons.length > 0 ? (
                report.redFlagReasons.map((reason, idx) => (
                  <p key={idx} className="font-medium leading-relaxed">
                    • {reason}
                  </p>
                ))
              ) : (
                <p className="font-medium leading-relaxed">
                  {isAr
                    ? "• ألم الخصية المفاجئ والشديد يتطلب تقييماً في قسم الطوارئ خلال أقل من 4-6 ساعات لاستبعاد التواء الخصية."
                    : "• Sudden severe testicular pain or acute swelling requires emergency department evaluation within 4–6 hours to protect testicular viability."}
                </p>
              )}
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-red-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold">
                    {isAr
                      ? "خط الطوارئ الطبية (998 / أقرب طوارئ)"
                      : "Emergency Medical Services: Nearest Hospital ER"}
                  </p>
                  <p className="text-slate-300">
                    {isAr
                      ? "توجّه فوراً إلى أقرب قسم طوارئ مستشفى لإجراء فحص سريري ودوبلر عاجل."
                      : "Proceed directly to the nearest hospital Emergency Department for urgent urology triage."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  onUpdateIntake({
                    acuteSevereTesticularPain: false,
                    acuteSuddenSwellingOrFever: false,
                    hematospermia: false,
                  });
                  setDismissedEmergencyModal(true);
                  setForceEmergencyPreview(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {isAr
                  ? "تم التحديد بالخطأ (إلغاء العرض)"
                  : "Marked by Mistake — Clear"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDismissedEmergencyModal(true);
                  setForceEmergencyPreview(false);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#DC2626] text-white hover:bg-red-700 cursor-pointer"
              >
                {isAr ? "فهمت التوجيه الطبي العاجل" : "I Understand — Acknowledge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY ACTION CARD: CHOOSE SYMPTOMS & SEND REQUEST TO MEET DOCTOR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#1B5683]">
              {isAr
                ? "اختيار الأعراض وطلب مقابلة الطبيب"
                : "SYMPTOM SELECTION & DOCTOR MEETING REQUEST"}
            </span>
            <h3 className="text-xl font-semibold text-slate-900">
              {isAr
                ? "اختر الأعراض التي تعاني منها وأرسل طلب مقابلة الطبيب"
                : "Choose Your Symptoms & Send Request to Meet a Doctor"}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? "لن يظهر أي استفسار في لوحة الطبيب إلا بعد اختيار الأعراض هنا وإرسال طلب المقابلة."
                : "Doctors only see requests after you select your symptoms below and send a request to meet."}
            </p>
          </div>

          <span className="text-xs font-mono-tabular font-semibold text-[#1B5683] bg-[#F3F6FA] px-3 py-1.5 rounded-lg shrink-0 self-start">
            {currentSymptoms.en.length}{" "}
            {isAr ? "أعراض محددة" : "symptom(s) selected"}
          </span>
        </div>

        {/* Step 1: Interactive Symptom Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-800">
            {isAr
              ? "1. اختر الأعراض أو العوامل التي ترغب في استشارة الطبيب بشأنها *"
              : "1. Choose Symptoms You Are Experiencing *"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {symptomToggleCatalog.map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => {
                  sym.toggle();
                  setSymptomValidationMsg(null);
                  setBookingConfirmed(false);
                }}
                className={`p-3.5 rounded-xl border text-start flex items-start justify-between gap-2.5 transition-colors cursor-pointer ${
                  sym.active
                    ? "bg-[#F3F6FA] border-[#1B5683] text-slate-900"
                    : "bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-white"
                }`}
              >
                <span className="text-xs font-medium leading-snug">
                  {isAr ? sym.labelAr : sym.labelEn}
                </span>
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    sym.active ? "text-[#1B5683]" : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Logged-In Patient Details Preview (Automatically Reflected to Doctor) */}
        <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <UserCheck className="w-4 h-4 text-[#1B5683] shrink-0" />
              <span className="font-semibold text-slate-900">
                {authenticatedPatient.patientName}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono-tabular text-slate-700 font-medium">
                {isAr
                  ? `مواليد ${authenticatedPatient.birthYear}${
                      patientAge ? ` (${patientAge} سنة)` : ""
                    }`
                  : `Born ${authenticatedPatient.birthYear}${
                      patientAge ? ` (${patientAge} yrs)` : ""
                    }`}
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-slate-600 font-mono-tabular">
                <Phone className="w-3 h-3 text-slate-400" />
                {authenticatedPatient.phoneNumber}
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-slate-600">
                <MapPin className="w-3 h-3 text-slate-400" />
                {authenticatedPatient.cityLocation}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isAr
                ? `الهدف الصحي: ${authenticatedPatient.maritalGoalAr} — ستنعكس هذه البيانات مباشرة للطبيب عند إرسال طلب المقابلة.`
                : `${authenticatedPatient.maritalGoalEn} — Your profile details above will be reflected directly to the doctor when you book.`}
            </p>
          </div>
        </div>

        {/* Step 2: Doctor Specialty / Registered Doctor, Modality, Time Slot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              {isAr
                ? "2. التخصص أو الطبيب المطلوب *"
                : "2. Doctor / Specialty to Meet *"}
            </label>
            <select
              value={selectedDoctorTarget}
              onChange={(e) => {
                setSelectedDoctorTarget(e.target.value);
                setBookingConfirmed(false);
              }}
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683] cursor-pointer"
            >
              {registeredDoctors.length > 0 && (
                <optgroup
                  label={
                    isAr ? "الأطباء المسجلون في النظام" : "Registered Doctors"
                  }
                >
                  {registeredDoctors.map((doc) => (
                    <option key={doc.id} value={`reg::${doc.id}`}>
                      {doc.doctorName} —{" "}
                      {isAr ? doc.specialtyAr : doc.specialtyEn}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup
                label={isAr ? "التخصصات الطبية" : "Medical Specialties"}
              >
                {DOCTOR_SPECIALTY_OPTIONS.map((spec) => (
                  <option key={spec.id} value={`spec::${spec.id}`}>
                    {isAr ? spec.labelAr : spec.labelEn}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              {isAr ? "3. طريقة المقابلة *" : "3. Meeting Modality *"}
            </label>
            <select
              value={meetingModality}
              onChange={(e) => {
                setMeetingModality(
                  e.target.value as "video" | "in_person" | "chat"
                );
                setBookingConfirmed(false);
              }}
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683] cursor-pointer"
            >
              <option value="video">
                {isAr ? "استشارة فيديو خاصة" : "Private Video Meeting"}
              </option>
              <option value="in_person">
                {isAr ? "مقابلة حضورية في العيادة" : "In-Person Clinic Meeting"}
              </option>
              <option value="chat">
                {isAr ? "استشارة صوتية / نصية" : "Voice & Chat Consultation"}
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              {isAr ? "4. الموعد المفضل *" : "4. Preferred Time Slot *"}
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => {
                setSelectedSlot(e.target.value);
                setBookingConfirmed(false);
              }}
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono-tabular font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683] cursor-pointer"
            >
              {CONSULTATION_TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Patient Message */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-800 inline-flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1B5683]" />
            <span>
              {isAr
                ? "ملاحظات إضافية للطبيب حول الأعراض أو سبب طلب المقابلة"
                : "Describe What You Are Experiencing / Reason to Meet Doctor"}
            </span>
          </label>
          <textarea
            rows={2}
            value={referralNotes}
            onChange={(e) => setReferralNotes(e.target.value)}
            placeholder={
              isAr
                ? "اكتب وصفاً مختصراً للأعراض أو استفسارك للطبيب..."
                : "Briefly describe how long you've noticed these symptoms and what guidance you'd like during the meeting..."
            }
            className="w-full p-3.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:bg-white focus:border-[#1B5683]"
          />
        </div>

        {symptomValidationMsg && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs font-medium text-amber-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>{symptomValidationMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
            <span>
              {isAr
                ? "يُحفظ الطلب مع الأعراض المختارة في Supabase ليطلع عليه الطبيب بعد تسجيل الدخول."
                : "Stored directly in Supabase and shown to authenticated doctors in the Doctor Dashboard."}
            </span>
          </div>

          <button
            type="button"
            disabled={isBookingSaving}
            onClick={async () => {
              const latestSymptoms = extractSelectedSymptomsFromIntake(intake);
              if (latestSymptoms.en.length === 0) {
                setSymptomValidationMsg(
                  isAr
                    ? "يرجى اختيار عرض واحد على الأقل من القائمة أعلاه قبل إرسال طلب مقابلة الطبيب."
                    : "Please select at least one symptom above before sending a request to meet a doctor."
                );
                return;
              }
              setSymptomValidationMsg(null);

              const targetDoc = resolveDoctorSelection();
              const modalityLabels =
                meetingModality === "in_person"
                  ? {
                      en: "In-Person Clinic Meeting",
                      ar: "مقابلة حضورية في العيادة",
                    }
                  : meetingModality === "chat"
                  ? {
                      en: "Voice & Chat Consultation",
                      ar: "استشارة صوتية ونصية",
                    }
                  : {
                      en: "Private Video Meeting",
                      ar: "استشارة فيديو خاصة",
                    };

              const defaultNoteEn = `Requesting a meeting regarding: ${latestSymptoms.en.join(
                ", "
              )}.`;
              const defaultNoteAr = `طلب مقابلة طبية بخصوص الأعراض التالية: ${latestSymptoms.ar.join(
                " ، "
              )}.`;

              await onDispatchPatientQuery({
                requestedDoctorOrSpecialtyEn: targetDoc.en,
                requestedDoctorOrSpecialtyAr: targetDoc.ar,
                slot: selectedSlot,
                modalityEn: modalityLabels.en,
                modalityAr: modalityLabels.ar,
                queryNoteEn: referralNotes.trim() || defaultNoteEn,
                queryNoteAr: referralNotes.trim() || defaultNoteAr,
              });
              setBookingConfirmed(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B5683] text-white text-xs sm:text-sm font-semibold hover:bg-[#154468] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            <span>
              {isBookingSaving
                ? isAr
                  ? "جارٍ إرسال الطلب..."
                  : "Sending Meeting Request..."
                : bookingConfirmed
                ? isAr
                  ? "تم إرسال طلب المقابلة"
                  : "Meeting Request Sent"
                : isAr
                ? "إرسال طلب مقابلة الطبيب"
                : "Send Request to Meet Doctor"}
            </span>
          </button>
        </div>

        {bookingConfirmed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                ✓{" "}
                {isAr
                  ? `تم إرسال الأعراض المختارة وطلب المقابلة (${selectedSlot}) وحفظها في قاعدة البيانات.`
                  : `Your selected symptoms and request to meet (${selectedSlot}) have been saved to Supabase.`}
              </p>
              <p className="text-emerald-800 mt-0.5">
                {isAr
                  ? "يمكن للطبيب الآن تسجيل الدخول إلى لوحة الأطباء لمراجعة أعراضك وقبول الطلب."
                  : "Doctors can now sign in to the Doctor Dashboard to inspect your symptoms and accept your meeting."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenDoctorPortal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B5683] text-white font-semibold hover:bg-[#154468] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>
                {isAr ? "تسجيل دخول الطبيب" : "Go to Doctor Login"}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* TIER 1 & TIER 2 SELF-CARE & HOME KIT SUPPORT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LOW RISK PATHWAY: Interactive Self-Care Plan */}
        <div
          className={`rounded-2xl border p-6 space-y-5 flex flex-col justify-between transition-colors ${
            report.overallLevel === "low"
              ? "bg-white border-[#059669] ring-1 ring-[#059669]/30"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#059669]">
                {isAr ? "المسار 01 · الوقاية الذاتية" : "Tier 01 · Self-Care Pathway"}
              </span>
              {report.overallLevel === "low" && (
                <span className="text-xs font-medium text-[#059669]">
                  {isAr ? "المسار الموصى به لك" : "Recommended for You"}
                </span>
              )}
            </div>

            <h4 className="text-lg font-semibold text-slate-900">
              {isAr
                ? "خطة العناية الذاتية والتغذية لـ 90 يوماً ما قبل الإنجاب"
                : "Interactive 90-Day Preconception Self-Care Plan"}
            </h4>

            <div className="space-y-2.5">
              {selfCareItems.map((item) => {
                const done = !!checkedHabits[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setCheckedHabits((prev) => ({
                        ...prev,
                        [item.id]: !done,
                      }))
                    }
                    className={`w-full p-3 rounded-xl border text-start flex items-start gap-3 transition-colors cursor-pointer ${
                      done
                        ? "bg-emerald-50/60 border-emerald-200 text-slate-900"
                        : "bg-[#F8FAFC] border-slate-200 text-slate-700"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        done ? "text-[#059669]" : "text-slate-300"
                      }`}
                    />
                    <span className="text-xs leading-relaxed">{item.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSelfCareGuide}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloadedGuide
                ? isAr
                  ? "تم تنزيل دليل التغذية ونمط الحياة بنجاح"
                  : "Preconception Nutrition Guide Downloaded"
                : isAr
                ? "تنزيل دليل التغذية والجدول اليومي"
                : "Download Preconception Nutrition & Schedule Guide"}
            </span>
          </button>
        </div>

        {/* MODERATE RISK PATHWAY: Teleconsultation + At-Home Semen Kit */}
        <div
          className={`rounded-2xl border p-6 space-y-5 flex flex-col justify-between transition-colors ${
            report.overallLevel === "moderate"
              ? "bg-white border-[#D97706] ring-1 ring-[#D97706]/30"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#D97706]">
                {isAr
                  ? "المسار 02 · الفحص المنزلي السري"
                  : "Tier 02 · Discreet Home Kit & Teleconsult"}
              </span>
              {report.overallLevel === "moderate" && (
                <span className="text-xs font-medium text-[#D97706]">
                  {isAr ? "المسار الموصى به لك" : "Recommended for You"}
                </span>
              )}
            </div>

            <h4 className="text-lg font-semibold text-slate-900">
              {isAr
                ? "استشارة عن بُعد + باقة الفحص المنزلي السري"
                : "Discreet Teleconsultation & At-Home Semen Assessment Kit"}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? "تُسلّم باقة الفحص المنزلي في عبوة بيضاء غير معنونة مع استلام مبرد، متبوعة بمراجعة مرئية أو صوتية خاصة مع الطبيب."
                : "Unmarked matte-white courier box delivered to your door with temperature-stabilized lab pickup, paired with a private 20-minute physician review."}
            </p>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-700">
                {isAr
                  ? "فترة التسليم السري المفضلة:"
                  : "Preferred Unmarked Courier Window:"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryWindow("evening")}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border cursor-pointer ${
                    deliveryWindow === "evening"
                      ? "bg-[#1B5683] text-white border-[#1B5683]"
                      : "bg-[#F8FAFC] text-slate-700 border-slate-200"
                  }`}
                >
                  {isAr ? "مساء اليوم (7–10 م)" : "Evening (7:00–10:00 PM)"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryWindow("weekend")}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border cursor-pointer ${
                    deliveryWindow === "weekend"
                      ? "bg-[#1B5683] text-white border-[#1B5683]"
                      : "bg-[#F8FAFC] text-slate-700 border-slate-200"
                  }`}
                >
                  {isAr
                    ? "عطلة نهاية الأسبوع (صباحاً)"
                    : "Weekend Morning (9–11 AM)"}
                </button>
              </div>
            </div>

            {(kitOrdered || teleconsultRequested) && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 space-y-1.5">
                {kitOrdered && (
                  <p className="font-medium">
                    ✓{" "}
                    {isAr
                      ? "تم إرسال طلب باقة الفحص المنزلي إلى لوحة الطبيب."
                      : "At-Home Semen Kit request sent to Supabase for doctor review."}
                  </p>
                )}
                {teleconsultRequested && (
                  <p className="font-medium">
                    ✓{" "}
                    {isAr
                      ? "تم إرسال طلب الاستشارة عن بُعد إلى لوحة الطبيب."
                      : "Teleconsultation meeting request saved to Supabase."}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isBookingSaving}
              onClick={async () => {
                setKitOrdered(true);
                const targetDoc = resolveDoctorSelection();
                await onDispatchPatientQuery({
                  requestedDoctorOrSpecialtyEn: targetDoc.en,
                  requestedDoctorOrSpecialtyAr: targetDoc.ar,
                  slot:
                    deliveryWindow === "evening"
                      ? "Evening Courier · 7–10 PM"
                      : "Weekend Courier · 9–11 AM",
                  modalityEn: "Unmarked Home Semen Kit + Teleconsult",
                  modalityAr: "باقة فحص منزلي غير معنونة + استشارة عن بُعد",
                  queryNoteEn:
                    "Requesting approval for an unmarked at-home semen assessment kit and doctor follow-up.",
                  queryNoteAr:
                    "طلب اعتماد إرسال باقة الفحص المنزلي غير المعنونة ومتابعة مع الطبيب.",
                });
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B5683] text-white text-xs font-semibold hover:bg-[#154468] disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>
                {kitOrdered
                  ? isAr
                    ? "تم إرسال طلب الباقة"
                    : "Home Kit Requested"
                  : isAr
                  ? "طلب باقة الفحص المنزلي"
                  : "Order At-Home Kit"}
              </span>
            </button>
            <button
              type="button"
              disabled={isBookingSaving}
              onClick={async () => {
                setTeleconsultRequested(true);
                const targetDoc = resolveDoctorSelection();
                await onDispatchPatientQuery({
                  requestedDoctorOrSpecialtyEn: targetDoc.en,
                  requestedDoctorOrSpecialtyAr: targetDoc.ar,
                  slot: "Today · 5:30 PM",
                  modalityEn: "Private Video Teleconsultation",
                  modalityAr: "استشارة مرئية خاصة",
                  queryNoteEn:
                    "Requesting a private 20-minute teleconsultation to discuss my symptoms and recommended plan.",
                  queryNoteAr:
                    "طلب استشارة مرئية خاصة لمدة 20 دقيقة لمناقشة الأعراض والخطة الموصى بها.",
                });
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4 text-[#1B5683]" />
              <span>
                {teleconsultRequested
                  ? isAr
                    ? "تم إرسال طلب الاستشارة"
                    : "Teleconsult Sent"
                  : isAr
                  ? "طلب استشارة عن بُعد"
                  : "Request Teleconsult"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
