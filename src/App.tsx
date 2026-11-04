"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ClipboardList,
  FileSpreadsheet,
  GitBranch,
  Shield,
  BarChart3,
  EyeOff,
  Globe,
  Stethoscope,
  User,
  CheckCircle2,
  Lock,
  Database,
  LogOut,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import {
  AuthenticatedDoctor,
  AuthenticatedPatient,
  BookedAppointmentSummary,
  ClinicalTabId,
  ConsentMatrix,
  DoctorCooperationResponse,
  IntakeData,
  Language,
  PatientDemographicsSnapshot,
  PatientQueryCase,
  PortalMode,
} from "./types/clinical";
import { EMPTY_CLEAN_INTAKE } from "./data/personasAndContent";
import { evaluateClinicalRisk } from "./utils/riskEngine";
import {
  deriveDefaultRecommendationForReport,
  extractSelectedSymptomsFromIntake,
} from "./utils/doctorCaseHelpers";
import {
  CreateAppointmentInput,
  createDoctorAppointment,
  deleteSessionAppointmentsFromSupabase,
  fetchBookedAppointments,
  saveDoctorCooperationToSupabase,
  subscribeToAppointmentsRealtime,
} from "./services/appointmentsService";
import {
  RegisteredDoctorOption,
  fetchRegisteredDoctorsFromSupabase,
} from "./services/doctorAuthService";
import { calculateAgeFromBirthYear } from "./services/patientAuthService";
import { initAuth, logoutGoogleGmail } from "./lib/googleGmailAuth";
import { QuickExitDecoy } from "./components/QuickExitDecoy";
import { SupabaseSchemaModal } from "./components/SupabaseSchemaModal";
import {
  EditorialHeroAndProcess,
  EditorialPlansAndConsult,
} from "./components/EditorialSections";
import { PatientAuthPage } from "./components/PatientAuthPage";
import { DoctorAuthPage } from "./components/DoctorAuthPage";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { Tab1IntakeWizard } from "./components/tabs/Tab1IntakeWizard";
import { Tab2RiskReport } from "./components/tabs/Tab2RiskReport";
import { Tab3SmartTriage } from "./components/tabs/Tab3SmartTriage";
import { Tab4PrivacyCenter } from "./components/tabs/Tab4PrivacyCenter";
import { Tab5JudgeImpact } from "./components/tabs/Tab5JudgeImpact";

function createBrowserSessionPrefix(): string {
  const randomId = Math.floor(100000 + Math.random() * 900000);
  return `mrh-session-${randomId}`;
}

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [portalMode, setPortalMode] = useState<PortalMode>("patient");
  const [quickExitActive, setQuickExitActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ClinicalTabId>("triage");

  // Clean initial intake — patient selects their own symptoms after logging in
  const [intake, setIntake] = useState<IntakeData>(() => ({
    ...EMPTY_CLEAN_INTAKE,
  }));
  const [consent, setConsent] = useState<ConsentMatrix>({
    maskPersonalIdentity: true,
    shareMetabolic: true,
    shareLifestyle: true,
    shareAnatomical: true,
    shareInfectious: true,
    shareBiomarkers: true,
  });

  const [sessionPrefix] = useState<string>(() => createBrowserSessionPrefix());

  // Patient & Doctor Authentication Gate States
  const [authenticatedPatient, setAuthenticatedPatient] =
    useState<AuthenticatedPatient | null>(null);
  const [authenticatedDoctor, setAuthenticatedDoctor] =
    useState<AuthenticatedDoctor | null>(null);

  const [schemaMissingNotice, setSchemaMissingNotice] =
    useState<boolean>(false);
  const [registeredDoctors, setRegisteredDoctors] = useState<
    RegisteredDoctorOption[]
  >([]);

  // Persisted & Optimistic Patient Queries
  const [supabaseCases, setSupabaseCases] = useState<PatientQueryCase[]>([]);
  const [optimisticCases, setOptimisticCases] = useState<PatientQueryCase[]>(
    []
  );
  const [bookedAppointments, setBookedAppointments] = useState<
    BookedAppointmentSummary[]
  >([]);
  const [unsyncedQueue, setUnsyncedQueue] = useState<CreateAppointmentInput[]>(
    []
  );
  const [isBookingSaving, setIsBookingSaving] = useState<boolean>(false);
  const [schemaModalOpen, setSchemaModalOpen] = useState<boolean>(false);
  const [isVerifyingSchema, setIsVerifyingSchema] = useState<boolean>(false);
  const [schemaSyncError, setSchemaSyncError] = useState<string | null>(null);

  const [selectedDoctorCaseId, setSelectedDoctorCaseId] = useState<string>("");

  const [liveDoctorResponse, setLiveDoctorResponse] =
    useState<DoctorCooperationResponse>({
      status: "pending",
      doctorNameEn: "",
      doctorNameAr: "",
      acceptedAt: "",
      approvedActionsEn: [],
      approvedActionsAr: [],
      clinicianNoteEn: "",
      clinicianNoteAr: "",
      scheduledSlot: "",
    });

  const suiteSectionRef = useRef<HTMLElement | null>(null);
  const lastEscPress = useRef<number>(0);

  const refreshRegisteredDoctors = useCallback(async () => {
    const docs = await fetchRegisteredDoctorsFromSupabase();
    setRegisteredDoctors(docs);
  }, []);

  // Initialize Firebase Google OAuth state listener (in-memory token management)
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, []);

  // Load existing patient requests & registered doctors from Supabase + subscribe to Realtime updates
  useEffect(() => {
    let mounted = true;

    const loadFromSupabase = async () => {
      const [appointmentsRes, docsRes] = await Promise.all([
        fetchBookedAppointments(
          sessionPrefix,
          authenticatedPatient?.patientName
        ),
        fetchRegisteredDoctorsFromSupabase(),
      ]);
      if (!mounted) return;

      setRegisteredDoctors(docsRes);

      if (!appointmentsRes.schemaMissing) {
        setSupabaseCases(appointmentsRes.cases);
        setBookedAppointments(appointmentsRes.summaries);

        const latestMyResponded = appointmentsRes.summaries.find((s) => {
          const belongsToSession = s.sessionToken.startsWith(sessionPrefix);
          const belongsToPatient =
            Boolean(authenticatedPatient?.patientName) &&
            s.patientProfile.patientName.toLowerCase() ===
              authenticatedPatient!.patientName.toLowerCase();
          return (
            (belongsToSession || belongsToPatient) &&
            s.doctorResponse.status !== "pending"
          );
        });

        if (latestMyResponded) {
          setLiveDoctorResponse(latestMyResponded.doctorResponse);
        }
      }
    };

    loadFromSupabase();
    const unsubscribe = subscribeToAppointmentsRealtime(() => {
      loadFromSupabase();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [sessionPrefix, authenticatedPatient?.patientName]);

  // Double-Esc shortcut for instant privacy Quick Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const now = Date.now();
        if (now - lastEscPress.current < 500) {
          setQuickExitActive(true);
        }
        lastEscPress.current = now;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isAr = lang === "ar";

  const riskReport = useMemo(
    () => evaluateClinicalRisk(intake, lang),
    [intake, lang]
  );

  const liveRecommendation = useMemo(
    () => deriveDefaultRecommendationForReport(riskReport),
    [riskReport]
  );

  // Unified Doctor Queue: ONLY real requests sent by logged-in patients
  const allDoctorQueueCases: PatientQueryCase[] = useMemo(() => {
    const persistedIds = new Set(supabaseCases.map((c) => c.id));
    const remainingOptimistic = optimisticCases.filter(
      (c) => !persistedIds.has(c.id)
    );
    return [...remainingOptimistic, ...supabaseCases];
  }, [optimisticCases, supabaseCases]);

  // Filtered appointments for currently logged-in patient
  const currentPatientAppointments: BookedAppointmentSummary[] = useMemo(() => {
    if (!authenticatedPatient) return [];
    const targetName = authenticatedPatient.patientName.trim().toLowerCase();
    return bookedAppointments.filter(
      (b) =>
        b.patientProfile.patientName.trim().toLowerCase() === targetName ||
        b.sessionToken.startsWith(sessionPrefix)
    );
  }, [authenticatedPatient, bookedAppointments, sessionPrefix]);

  const pendingDoctorCount = useMemo(
    () =>
      allDoctorQueueCases.filter((c) => c.doctorResponse.status === "pending")
        .length,
    [allDoctorQueueCases]
  );

  const handleUpdateIntake = (patch: Partial<IntakeData>) => {
    setIntake((prev) => ({ ...prev, ...patch }));
  };

  const handleUpdateConsent = (patch: Partial<ConsentMatrix>) => {
    setConsent((prev) => ({ ...prev, ...patch }));
  };

  const handlePurgeAllData = () => {
    deleteSessionAppointmentsFromSupabase(sessionPrefix);
    setBookedAppointments((prev) =>
      prev.filter((b) => !b.sessionToken.startsWith(sessionPrefix))
    );
    setSupabaseCases((prev) =>
      prev.filter((c) => !c.sessionToken.startsWith(sessionPrefix))
    );
    setOptimisticCases((prev) =>
      prev.filter((c) => !c.sessionToken.startsWith(sessionPrefix))
    );
    setUnsyncedQueue([]);
    setIntake({ ...EMPTY_CLEAN_INTAKE });
    setConsent({
      maskPersonalIdentity: true,
      shareMetabolic: false,
      shareLifestyle: false,
      shareAnatomical: false,
      shareInfectious: false,
      shareBiomarkers: false,
    });
    setLiveDoctorResponse({
      status: "pending",
      doctorNameEn: "",
      doctorNameAr: "",
      acceptedAt: "",
      approvedActionsEn: [],
      approvedActionsAr: [],
      clinicianNoteEn: "",
      clinicianNoteAr: "",
      scheduledSlot: "",
    });
  };

  const handleDispatchPatientQuery = async (payload: {
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
  }) => {
    const extracted = extractSelectedSymptomsFromIntake(intake);
    const selectedSymptomsEn =
      extracted.en.length > 0
        ? extracted.en
        : payload.selectedSymptomsOverrideEn &&
          payload.selectedSymptomsOverrideEn.length > 0
        ? payload.selectedSymptomsOverrideEn
        : ["General Fertility & Preconception Check"];

    const selectedSymptomsAr =
      extracted.ar.length > 0
        ? extracted.ar
        : payload.selectedSymptomsOverrideAr &&
          payload.selectedSymptomsOverrideAr.length > 0
        ? payload.selectedSymptomsOverrideAr
        : ["فحص وقائي شامل للخصوبة وصحة الرجل"];

    const patientProfile: PatientDemographicsSnapshot = authenticatedPatient
      ? {
          patientId: authenticatedPatient.id,
          patientName: authenticatedPatient.patientName,
          birthYear: authenticatedPatient.birthYear,
          phoneNumber: authenticatedPatient.phoneNumber,
          cityLocation: authenticatedPatient.cityLocation,
          maritalGoalEn: authenticatedPatient.maritalGoalEn,
          maritalGoalAr: authenticatedPatient.maritalGoalAr,
          gmailEmail: authenticatedPatient.gmailEmail,
        }
      : {
          patientName: payload.patientLabel?.trim() || "Patient",
          birthYear: null,
          phoneNumber: "",
          cityLocation: "",
          maritalGoalEn: "Fertility Consultation",
          maritalGoalAr: "استشارة خصوبة",
        };

    const age = calculateAgeFromBirthYear(patientProfile.birthYear);
    const cleanPatientLabel =
      patientProfile.birthYear && age !== null
        ? `${patientProfile.patientName} · ${patientProfile.birthYear} (${age}y)`
        : patientProfile.patientName;

    const sessionToken = `${sessionPrefix}-${Date.now()}`;

    setLiveDoctorResponse({
      status: "pending",
      doctorNameEn: payload.requestedDoctorOrSpecialtyEn,
      doctorNameAr: payload.requestedDoctorOrSpecialtyAr,
      acceptedAt: "",
      approvedActionsEn: [],
      approvedActionsAr: [],
      clinicianNoteEn: "",
      clinicianNoteAr: "",
      scheduledSlot: payload.slot,
    });

    const appointmentInput: CreateAppointmentInput = {
      patientLabel: cleanPatientLabel,
      patientProfile,
      sessionToken,
      requestedDoctorOrSpecialtyEn: payload.requestedDoctorOrSpecialtyEn,
      requestedDoctorOrSpecialtyAr: payload.requestedDoctorOrSpecialtyAr,
      appointmentSlot: payload.slot,
      modalityEn: payload.modalityEn,
      modalityAr: payload.modalityAr,
      selectedSymptomsEn,
      selectedSymptomsAr,
      riskLevel: riskReport.overallLevel,
      compositeScore: riskReport.compositeScore,
      patientQueryEn: payload.queryNoteEn,
      patientQueryAr: payload.queryNoteAr,
      userRecommendationEn: liveRecommendation.en,
      userRecommendationAr: liveRecommendation.ar,
      intake,
      consent,
    };

    setIsBookingSaving(true);
    const result = await createDoctorAppointment(
      appointmentInput,
      sessionPrefix
    );
    setIsBookingSaving(false);

    if (result.queryCase && result.summary) {
      setSupabaseCases((prev) => [
        result.queryCase!,
        ...prev.filter((c) => c.id !== result.queryCase!.id),
      ]);
      setBookedAppointments((prev) => [
        result.summary!,
        ...prev.filter((b) => b.id !== result.summary!.id),
      ]);
      setSelectedDoctorCaseId(result.queryCase.id);
      return;
    }

    // Fallback optimistic record if Supabase tables haven't been initialized yet
    const tempId = `local-${Date.now()}`;
    const optimisticResponse: DoctorCooperationResponse = {
      status: "pending",
      doctorNameEn: payload.requestedDoctorOrSpecialtyEn,
      doctorNameAr: payload.requestedDoctorOrSpecialtyAr,
      acceptedAt: "",
      approvedActionsEn: [],
      approvedActionsAr: [],
      clinicianNoteEn: "",
      clinicianNoteAr: "",
      scheduledSlot: payload.slot,
    };

    const fallbackCase: PatientQueryCase = {
      id: tempId,
      isLiveUserSession: true,
      persistedInSupabase: false,
      patientLabel: cleanPatientLabel,
      patientProfile,
      sessionToken,
      submittedAtEn: "Just now",
      submittedAtAr: "الآن",
      requestedDoctorOrSpecialtyEn: payload.requestedDoctorOrSpecialtyEn,
      requestedDoctorOrSpecialtyAr: payload.requestedDoctorOrSpecialtyAr,
      preferredModalityEn: payload.modalityEn,
      preferredModalityAr: payload.modalityAr,
      requestedSlot: payload.slot,
      selectedSymptomsEn,
      selectedSymptomsAr,
      patientQueryTextEn: payload.queryNoteEn,
      patientQueryTextAr: payload.queryNoteAr,
      userRecommendationEn: liveRecommendation.en,
      userRecommendationAr: liveRecommendation.ar,
      intake: { ...intake },
      consent: { ...consent },
      doctorResponse: optimisticResponse,
    };

    setOptimisticCases((prev) => [fallbackCase, ...prev]);
    setBookedAppointments((prev) => [
      {
        id: tempId,
        patientLabel: cleanPatientLabel,
        patientProfile,
        sessionToken,
        requestedDoctorOrSpecialtyEn: payload.requestedDoctorOrSpecialtyEn,
        requestedDoctorOrSpecialtyAr: payload.requestedDoctorOrSpecialtyAr,
        selectedSymptomsEn,
        selectedSymptomsAr,
        appointmentSlot: payload.slot,
        modalityEn: payload.modalityEn,
        modalityAr: payload.modalityAr,
        riskLevel: riskReport.overallLevel,
        compositeScore: riskReport.compositeScore,
        status: "pending",
        createdAt: new Date().toISOString(),
        persistedInSupabase: false,
        doctorResponse: optimisticResponse,
      },
      ...prev,
    ]);
    setSelectedDoctorCaseId(tempId);

    if (result.schemaMissing) {
      setUnsyncedQueue((prev) => [...prev, appointmentInput]);
      setSchemaSyncError(null);
      setSchemaModalOpen(true);
    }
  };

  const handleVerifyAndFlushSupabaseSchema = async () => {
    setIsVerifyingSchema(true);
    setSchemaSyncError(null);

    const check = await fetchBookedAppointments(
      sessionPrefix,
      authenticatedPatient?.patientName
    );
    if (check.schemaMissing) {
      setIsVerifyingSchema(false);
      setSchemaSyncError(
        isAr
          ? "لم يتم العثور على الجداول المطلوبة بعد. يرجى لصق وتشغيل كود SQL في محرر Supabase ثم المحاولة مرة أخرى."
          : "Required tables were not found yet in project ytiwdumsfdrwxszxglep. Please run the SQL script above in your Supabase SQL Editor first."
      );
      return;
    }

    for (const item of unsyncedQueue) {
      await createDoctorAppointment(item, sessionPrefix);
    }
    setUnsyncedQueue([]);
    setOptimisticCases([]);
    setSchemaMissingNotice(false);

    const [refreshed, docs] = await Promise.all([
      fetchBookedAppointments(sessionPrefix, authenticatedPatient?.patientName),
      fetchRegisteredDoctorsFromSupabase(),
    ]);
    setRegisteredDoctors(docs);
    setSupabaseCases(refreshed.cases);
    setBookedAppointments(refreshed.summaries);
    if (refreshed.cases[0]) {
      setSelectedDoctorCaseId(refreshed.cases[0].id);
    }

    setIsVerifyingSchema(false);
    setSchemaModalOpen(false);
  };

  const handleDoctorCooperationSubmit = async (
    caseId: string,
    response: DoctorCooperationResponse
  ) => {
    const targetSupabaseCase = supabaseCases.find((c) => c.id === caseId);

    if (targetSupabaseCase?.persistedInSupabase) {
      setSupabaseCases((prev) =>
        prev.map((c) =>
          c.id === caseId ? { ...c, doctorResponse: response } : c
        )
      );
      setBookedAppointments((prev) =>
        prev.map((b) =>
          b.id === caseId
            ? {
                ...b,
                status: response.status,
                appointmentSlot: response.scheduledSlot,
                doctorResponse: response,
              }
            : b
        )
      );
      const matchesLoggedPatient =
        Boolean(authenticatedPatient?.patientName) &&
        targetSupabaseCase.patientProfile.patientName.toLowerCase() ===
          authenticatedPatient!.patientName.toLowerCase();

      if (
        targetSupabaseCase.sessionToken.startsWith(sessionPrefix) ||
        matchesLoggedPatient
      ) {
        setLiveDoctorResponse(response);
      }
      await saveDoctorCooperationToSupabase(caseId, response);
      return;
    }

    setOptimisticCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, doctorResponse: response } : c
      )
    );
    setBookedAppointments((prev) =>
      prev.map((b) =>
        b.id === caseId
          ? {
              ...b,
              status: response.status,
              appointmentSlot: response.scheduledSlot,
              doctorResponse: response,
            }
          : b
      )
    );
    setLiveDoctorResponse(response);
  };

  const scrollToClinicalSuite = (targetTab?: ClinicalTabId) => {
    setPortalMode("patient");
    if (targetTab) {
      setActiveTab(targetTab);
    }
    if (!authenticatedPatient) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setTimeout(() => {
      suiteSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // Instant Privacy Decoy View ("Quick Exit")
  if (quickExitActive) {
    return (
      <QuickExitDecoy
        lang={lang}
        onRestoreSession={() => setQuickExitActive(false)}
      />
    );
  }

  const loggedInPatientAge = authenticatedPatient
    ? calculateAgeFromBirthYear(authenticatedPatient.birthYear)
    : null;

  const tabs: {
    id: ClinicalTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "intake",
      label: isAr ? "1. الفحص السري (البوابة)" : "1. Discreet Intake",
      icon: ClipboardList,
    },
    {
      id: "report",
      label: isAr ? "2. التقرير التفسيري الذكي" : "2. Explainable Risk Report",
      icon: FileSpreadsheet,
    },
    {
      id: "triage",
      label: isAr ? "3. اختيار الأعراض وطلب طبيب" : "3. Symptoms & Meet Doctor",
      icon: GitBranch,
    },
    {
      id: "privacy",
      label: isAr ? "4. مركز الخصوصية والموافقة" : "4. Privacy & Consent",
      icon: Shield,
    },
    {
      id: "impact",
      label: isAr ? "5. لوحة تقييم الأثر" : "5. Impact & Analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-white text-[#0F172A] flex flex-col"
    >
      {/* PERSISTENT TOP NAVIGATION HEADER — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setPortalMode("patient");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAr ? "صحة الرجل الإنجابية" : "Men's Reproductive Health"}
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => scrollToClinicalSuite("triage")}
              className={`hover:text-[#1B5683] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                portalMode === "patient"
                  ? "text-[#1B5683] underline underline-offset-8"
                  : ""
              }`}
            >
              {authenticatedPatient
                ? isAr
                  ? "لوحة المراجع"
                  : "Patient Dashboard"
                : isAr
                ? "دخول المراجع"
                : "Patient Login"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalMode("doctor");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`hover:text-[#1B5683] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                portalMode === "doctor"
                  ? "text-[#1B5683] underline underline-offset-8"
                  : ""
              }`}
            >
              {isAr
                ? pendingDoctorCount > 0
                  ? `لوحة الأطباء (${pendingDoctorCount})`
                  : "دخول الأطباء"
                : pendingDoctorCount > 0
                ? `Doctor Portal (${pendingDoctorCount})`
                : "Doctor Login"}
            </button>
            <button
              type="button"
              onClick={() => scrollToClinicalSuite("triage")}
              className="hover:text-[#1B5683] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAr ? "لقاء طبيب" : "Meet a Doctor"}
            </button>
            <button
              type="button"
              onClick={() => scrollToClinicalSuite("privacy")}
              className="hover:text-[#1B5683] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAr ? "الخصوصية" : "Privacy Vault"}
            </button>
          </nav>

          {/* Zone 3: Language Switcher & Quick Panic Exit */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === "en" ? "ar" : "en"))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Toggle Arabic or English language"
            >
              <Globe className="w-3.5 h-3.5 text-[#1B5683]" />
              <span>{isAr ? "English" : "العربية"}</span>
            </button>

            <button
              type="button"
              onClick={() => setQuickExitActive(true)}
              title={
                isAr
                  ? "استبدال الشاشة فوراً بصفحة أخبار اقتصادية محايدة (أو اضغط Esc مرتين)"
                  : "Instantly replace screen with a neutral daily news brief (or double-tap Esc)"
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-300" />
              <span>{isAr ? "خروج سريع" : "Quick Exit"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* DUAL PORTAL WORKSPACE BAR */}
        <div className="bg-[#0F172A] text-white border-b border-slate-800 px-4 sm:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center p-1 bg-slate-900 border border-slate-700 rounded-xl">
              <button
                type="button"
                onClick={() => setPortalMode("patient")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  portalMode === "patient"
                    ? "bg-[#1B5683] text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {authenticatedPatient ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>
                  {authenticatedPatient
                    ? isAr
                      ? `${authenticatedPatient.patientName} · لوحة المراجع`
                      : `${authenticatedPatient.patientName} · Patient Dashboard`
                    : isAr
                    ? "دخول وتسجيل المراجع"
                    : "Patient Login & Dashboard"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPortalMode("doctor")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  portalMode === "doctor"
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {authenticatedDoctor ? (
                  <Stethoscope className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>
                  {authenticatedDoctor
                    ? isAr
                      ? `لوحة ${authenticatedDoctor.doctorName} (${pendingDoctorCount})`
                      : `${authenticatedDoctor.doctorName} · Dashboard (${pendingDoctorCount})`
                    : isAr
                    ? `دخول الأطباء (${pendingDoctorCount} طلب)`
                    : `Doctor Login & Dashboard (${pendingDoctorCount})`}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span>
                {isAr
                  ? "تسجيل موثق للمراجع والطبيب · مزامنة فورية للأعراض وبيانات الموعد عبر Supabase"
                  : "Authenticated Patient & Doctor Portals · Real-time Supabase symptom & appointment sync"}
              </span>
              {schemaMissingNotice && (
                <button
                  type="button"
                  onClick={() => setSchemaModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sky-300 hover:text-white text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                >
                  <Database className="w-3 h-3" />
                  <span>{isAr ? "مزامنة SQL" : "Sync Supabase SQL"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RENDER ACTIVE PORTAL */}
        {portalMode === "doctor" ? (
          !authenticatedDoctor ? (
            <DoctorAuthPage
              lang={lang}
              onAuthenticated={(doctor, missingTable) => {
                setAuthenticatedDoctor(doctor);
                if (missingTable) {
                  setSchemaMissingNotice(true);
                }
                refreshRegisteredDoctors();
                if (!selectedDoctorCaseId && allDoctorQueueCases[0]) {
                  setSelectedDoctorCaseId(allDoctorQueueCases[0].id);
                }
              }}
              onBackToPatientPortal={() => setPortalMode("patient")}
            />
          ) : (
            <DoctorDashboard
              lang={lang}
              authenticatedDoctor={authenticatedDoctor}
              cases={allDoctorQueueCases}
              selectedCaseId={selectedDoctorCaseId}
              onSelectCase={(id) => setSelectedDoctorCaseId(id)}
              onSubmitDoctorCooperation={handleDoctorCooperationSubmit}
              onLogoutDoctor={() => {
                logoutGoogleGmail();
                setAuthenticatedDoctor(null);
              }}
              onSwitchToPatientPortal={() => {
                setPortalMode("patient");
                setActiveTab("triage");
              }}
            />
          )
        ) : !authenticatedPatient ? (
          /* PATIENT AUTHENTICATION GATE: Enter Name, Birth Year, Phone, City, Goal & Confirmed Password */
          <PatientAuthPage
            lang={lang}
            onAuthenticated={(patient, missingTable) => {
              setAuthenticatedPatient(patient);
              setActiveTab("triage");
              if (missingTable) {
                setSchemaMissingNotice(true);
              }
              setTimeout(() => {
                suiteSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }, 80);
            }}
            onSwitchToDoctorPortal={() => {
              setPortalMode("doctor");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ) : (
          /* AUTHENTICATED PATIENT DASHBOARD */
          <>
            {/* LOGGED-IN PATIENT IDENTITY BAR */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#1B5683] text-white flex items-center justify-center font-editorial text-xl font-semibold shrink-0">
                    {authenticatedPatient.patientName
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "P"}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-900 text-sm">
                        {authenticatedPatient.patientName}
                      </span>
                      {authenticatedPatient.birthYear > 1900 && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono-tabular font-medium text-slate-700">
                            {isAr
                              ? `سنة الميلاد: ${authenticatedPatient.birthYear}${
                                  loggedInPatientAge
                                    ? ` (${loggedInPatientAge} سنة)`
                                    : ""
                                }`
                              : `Born ${authenticatedPatient.birthYear}${
                                  loggedInPatientAge
                                    ? ` (${loggedInPatientAge} yrs)`
                                    : ""
                                }`}
                          </span>
                        </>
                      )}
                      {authenticatedPatient.gmailEmail && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 text-[#059669] font-mono-tabular font-medium">
                            <Mail className="w-3 h-3" />
                            {authenticatedPatient.gmailEmail}
                          </span>
                        </>
                      )}
                      {authenticatedPatient.phoneNumber && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 text-slate-600 font-mono-tabular">
                            <Phone className="w-3 h-3 text-[#1B5683]" />
                            {authenticatedPatient.phoneNumber}
                          </span>
                        </>
                      )}
                      {authenticatedPatient.cityLocation && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-[#1B5683]" />
                            {authenticatedPatient.cityLocation}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? authenticatedPatient.maritalGoalAr
                        : authenticatedPatient.maritalGoalEn}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => scrollToClinicalSuite("triage")}
                    className="px-4 py-2 rounded-xl bg-[#1B5683] text-white text-xs font-semibold hover:bg-[#154468] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isAr
                      ? "اختيار الأعراض وطلب مقابلة الطبيب"
                      : "Select Symptoms & Book Meeting"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logoutGoogleGmail();
                      setAuthenticatedPatient(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isAr ? "خروج المراجع" : "Sign Out"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* EDITORIAL FRONT DOOR: HERO + 4-METRIC STRIP + PROCESS + SERVICES */}
            <EditorialHeroAndProcess
              lang={lang}
              onJumpToSuite={(tab) => scrollToClinicalSuite(tab)}
            />

            {/* INTERACTIVE 5-TAB CLINICAL SUITE WORKSPACE */}
            <section
              id="clinical-suite"
              ref={suiteSectionRef}
              className="py-16 sm:py-20 bg-[#F3F6FA] border-y border-slate-200/80 px-4 sm:px-8 scroll-mt-16"
            >
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Notification Banner when Doctor Accepts / Cooperates */}
                {liveDoctorResponse.status !== "pending" && (
                  <div className="bg-emerald-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs sm:text-sm">
                        <span className="font-semibold">
                          {isAr
                            ? `قام ${liveDoctorResponse.doctorNameAr} بقبول طلب اللقاء واعتماد خطة الرعاية!`
                            : `${liveDoctorResponse.doctorNameEn} accepted your meeting request and sent a cooperative care plan!`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("triage")}
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
                    >
                      {isAr
                        ? "عرض رد الطبيب في الفرز الذكي"
                        : "View Doctor's Plan"}
                    </button>
                  </div>
                )}

                {/* Workspace Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#1B5683]">
                      {isAr
                        ? "صحة الرجل الإنجابية · الفحص والتوجيه السريري"
                        : "Men's Reproductive Health · Clinical Screening & Triage"}
                    </span>
                    <h2 className="font-editorial text-3xl sm:text-4xl text-slate-900 balance-text">
                      {isAr
                        ? "المنصة المتكاملة لصحة الرجل الإنجابية والوقاية المبكرة"
                        : "Select Symptoms, Book Your Doctor Meeting & Track Risk"}
                    </h2>
                  </div>

                  {/* Active Risk Live Readout + Shortcut to Doctor Login */}
                  <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
                    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {isAr ? "التصنيف الحالي:" : "Screening Tier:"}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          riskReport.overallLevel === "high"
                            ? "text-[#DC2626]"
                            : riskReport.overallLevel === "moderate"
                            ? "text-[#D97706]"
                            : "text-[#059669]"
                        }`}
                      >
                        {riskReport.overallLevel === "high"
                          ? isAr
                            ? "مخاطر مرتفعة"
                            : "High Risk"
                          : riskReport.overallLevel === "moderate"
                          ? isAr
                            ? "مخاطر متوسطة"
                            : "Moderate Risk"
                          : isAr
                          ? "مخاطر منخفضة"
                          : "Low Risk"}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-mono-tabular font-semibold text-slate-800">
                        {riskReport.compositeScore}/100
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (allDoctorQueueCases[0]) {
                          setSelectedDoctorCaseId(allDoctorQueueCases[0].id);
                        }
                        setPortalMode("doctor");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {authenticatedDoctor
                          ? isAr
                            ? "فتح لوحة الطبيب"
                            : "Open Doctor Dashboard"
                          : isAr
                          ? "تسجيل دخول الأطباء"
                          : "Doctor Login"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Segmented 5-Tab Bar */}
                <div
                  role="tablist"
                  aria-label="Men's Reproductive Health Clinical Tabs"
                  className="bg-white border border-slate-200 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-fit inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          active
                            ? "bg-[#1B5683] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Tab Panel with Smooth Compositor Animation (<200ms) */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTab}-${lang}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {activeTab === "intake" && (
                      <Tab1IntakeWizard
                        lang={lang}
                        intake={intake}
                        onUpdateIntake={handleUpdateIntake}
                        onCompleteWizard={() => setActiveTab("report")}
                      />
                    )}

                    {activeTab === "report" && (
                      <Tab2RiskReport
                        lang={lang}
                        report={riskReport}
                        onProceedToTriage={() => setActiveTab("triage")}
                      />
                    )}

                    {activeTab === "triage" && (
                      <Tab3SmartTriage
                        lang={lang}
                        authenticatedPatient={authenticatedPatient}
                        intake={intake}
                        report={riskReport}
                        registeredDoctors={registeredDoctors}
                        bookedAppointments={currentPatientAppointments}
                        isBookingSaving={isBookingSaving}
                        onUpdateIntake={handleUpdateIntake}
                        liveDoctorResponse={liveDoctorResponse}
                        onDispatchPatientQuery={handleDispatchPatientQuery}
                        onOpenDoctorPortal={(appointmentId?: string) => {
                          if (appointmentId) {
                            setSelectedDoctorCaseId(appointmentId);
                          } else if (allDoctorQueueCases[0]) {
                            setSelectedDoctorCaseId(allDoctorQueueCases[0].id);
                          }
                          setPortalMode("doctor");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    )}

                    {activeTab === "privacy" && (
                      <Tab4PrivacyCenter
                        lang={lang}
                        intake={intake}
                        report={riskReport}
                        consent={consent}
                        onUpdateConsent={handleUpdateConsent}
                        onPurgeAllData={handlePurgeAllData}
                      />
                    )}

                    {activeTab === "impact" && <Tab5JudgeImpact lang={lang} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            {/* SANCTUARY CARE PLANS & BOTTOM COMPLIMENTARY CONSULTATION MODULE */}
            <EditorialPlansAndConsult
              lang={lang}
              isBookingSaving={isBookingSaving}
              onJumpToSuite={(tab) => scrollToClinicalSuite(tab)}
              onDispatchConsultQuery={(payload) =>
                handleDispatchPatientQuery(payload)
              }
              onOpenDoctorPortal={() => {
                if (allDoctorQueueCases[0]) {
                  setSelectedDoctorCaseId(allDoctorQueueCases[0].id);
                }
                setPortalMode("doctor");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </main>

      {/* SUPABASE TABLE SYNC MODAL */}
      <SupabaseSchemaModal
        lang={lang}
        isOpen={schemaModalOpen}
        pendingCount={unsyncedQueue.length}
        isSyncing={isVerifyingSchema}
        syncError={schemaSyncError}
        onClose={() => setSchemaModalOpen(false)}
        onVerifyAndSync={handleVerifyAndFlushSupabaseSchema}
      />

      {/* QUIET EDITORIAL FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5 space-y-3">
              <div className="font-editorial text-2xl font-semibold text-slate-900">
                {isAr ? "صحة الرجل الإنجابية" : "Men's Reproductive Health"}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                {isAr
                  ? "رعاية وقائية موثوقة لصحة الرجل الإنجابية، تجمع بين بوابة تسجيل المراجعين ولوحة الطبيب الموثقة بكلمة مرور."
                  : "Proactive male reproductive healthcare pairing authenticated patient registration with a password-verified clinician triage console."}
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-3 gap-6 text-xs">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">
                  {isAr ? "البوابات" : "Portals"}
                </h4>
                <ul className="space-y-2 text-slate-500">
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("triage")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "دخول المراجعين" : "Patient Login & Dashboard"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalMode("doctor");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="hover:text-slate-900 cursor-pointer font-medium text-[#1B5683]"
                    >
                      {isAr ? "دخول الأطباء" : "Doctor Login & Console"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("report")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "التقرير التفسيري" : "Explainable Report"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("impact")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "لوحة تقييم الأثر" : "Impact & Analytics"}
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">
                  {isAr ? "الخصوصية" : "Privacy"}
                </h4>
                <ul className="space-y-2 text-slate-500">
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("privacy")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "مصفوفة الموافقة" : "Consent Matrix"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("privacy")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "ملخص QR المشفر" : "Masked QR Pass"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("privacy")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "الحق في النسيان" : "Right to Erasure"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setQuickExitActive(true)}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "الخروج الفوري" : "Quick Exit Mode"}
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">
                  {isAr ? "الرعاية الطبية" : "Clinical Care"}
                </h4>
                <ul className="space-y-2 text-slate-500">
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("triage")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "اختيار الأعراض وطلب لقاء" : "Request Doctor Meeting"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("triage")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "علاج دوالي الخصية" : "Varicocele Care"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToClinicalSuite("triage")}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      {isAr ? "باقة الفحص المنزلي" : "Home Semen Kits"}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <span>
              {isAr
                ? "© 2026 صحة الرجل الإنجابية. أداة فحص وتوعية — ليست تشخيصاً طبياً."
                : "© 2026 Men's Reproductive Health. Educational screening tool — not a medical diagnosis."}
            </span>
            <div className="flex items-center gap-3 font-medium text-slate-500">
              <span>{isAr ? "بوابة مراجعين موثقة" : "Verified Patient Portal"}</span>
              <span>·</span>
              <span>{isAr ? "طب الذكورة التعاوني" : "Cooperative Andrology"}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
