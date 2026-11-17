"use client";

export type Language = "en" | "ar";

export type PortalMode = "patient" | "doctor";

export type RiskLevel = "low" | "moderate" | "high";

export type ClinicalTabId = "intake" | "report" | "triage" | "privacy" | "impact";

export type QueryStatus = "pending" | "accepted" | "cooperating";

export interface AuthenticatedDoctor {
  id: string;
  doctorName: string;
  specialtyEn: string;
  specialtyAr: string;
  gmailEmail?: string;
  persistedInSupabase: boolean;
}

export interface AuthenticatedPatient {
  id: string;
  patientName: string;
  birthYear: number;
  phoneNumber: string;
  cityLocation: string;
  maritalGoalEn: string;
  maritalGoalAr: string;
  gmailEmail?: string;
  persistedInSupabase: boolean;
}

export interface PatientDemographicsSnapshot {
  patientId?: string;
  patientName: string;
  birthYear: number | null;
  phoneNumber: string;
  cityLocation: string;
  maritalGoalEn: string;
  maritalGoalAr: string;
  gmailEmail?: string;
}

export interface IntakeData {
  // Step 1: Lifestyle & Environment
  sittingHoursPerDay: "under4" | "4to7" | "8plus";
  thermalExposure: "none" | "occasional" | "frequent";
  sleepQuality: "optimal" | "irregular" | "poor";
  stressLevel: "low" | "moderate" | "high";
  nicotineHabit: "none" | "vaping_occasional" | "daily_smoking";
  alcoholFrequency: "none" | "occasional" | "frequent";

  // Step 2: Metabolic & Physical Health
  bmiRange: "normal_18_24" | "elevated_25_28" | "high_over_28";
  hba1cStatus: "normal" | "borderline_prediabetic" | "elevated_diabetic" | "unknown";
  bloodPressureFlag: "normal" | "borderline" | "hypertensive";
  lipidProfile: "normal" | "dyslipidemia" | "unknown";

  // Step 3: Anatomical & Surgical History + Acute Red Flags
  dullTesticularAche: boolean;
  scrotalHeavinessAfterStanding: boolean;
  visibleVeinSwelling: boolean;
  cryptorchidismHistory: boolean;
  testicularTraumaOrSurgery: boolean;

  // Acute Red Flags (Guardrail triggers)
  acuteSevereTesticularPain: boolean;
  acuteSuddenSwellingOrFever: boolean;
  hematospermia: boolean;

  // Step 4: Infectious & Medical History
  postPubertyMumps: boolean;
  priorStiHistory: boolean;
  chronicPelvicOrUrinaryInfection: boolean;

  // Step 5: Existing Lab / Biomarker OCR
  labFileUploaded: boolean;
  labFileName: string;
  spermConcentrationMml: number | null;
  totalMotilityPercent: number | null;
  morningTestosteroneNgDl: number | null;
  fshIuL: number | null;
}

export interface ExplainableFactor {
  id: string;
  pillar: "lifestyle" | "metabolic" | "anatomical" | "infectious" | "biomarker";
  severity: RiskLevel;
  title: string;
  explanation: string;
  actionableStep: string;
}

export interface PillarScores {
  lifestyle: number;
  metabolic: number;
  anatomical: number;
  infectious: number;
}

export interface RiskReport {
  overallLevel: RiskLevel;
  compositeScore: number;
  hasAcuteRedFlag: boolean;
  redFlagReasons: string[];
  pillarScores: PillarScores;
  factors: ExplainableFactor[];
  preconceptionSummary: string;
  culturalGuidancePoints: string[];
}

export interface ConsentMatrix {
  shareMetabolic: boolean;
  shareLifestyle: boolean;
  shareAnatomical: boolean;
  shareInfectious: boolean;
  shareBiomarkers: boolean;
  maskPersonalIdentity: boolean;
}

export interface DoctorCooperationResponse {
  status: QueryStatus;
  doctorNameEn: string;
  doctorNameAr: string;
  doctorSpecialtyEn?: string;
  doctorSpecialtyAr?: string;
  acceptedAt: string;
  approvedActionsEn: string[];
  approvedActionsAr: string[];
  clinicianNoteEn: string;
  clinicianNoteAr: string;
  scheduledSlot: string;
}

export interface PatientQueryCase {
  id: string;
  isLiveUserSession: boolean;
  persistedInSupabase?: boolean;
  patientLabel: string;
  patientProfile: PatientDemographicsSnapshot;
  sessionToken: string;
  submittedAtEn: string;
  submittedAtAr: string;
  requestedDoctorOrSpecialtyEn: string;
  requestedDoctorOrSpecialtyAr: string;
  preferredModalityEn: string;
  preferredModalityAr: string;
  requestedSlot: string;
  selectedSymptomsEn: string[];
  selectedSymptomsAr: string[];
  patientQueryTextEn: string;
  patientQueryTextAr: string;
  userRecommendationEn: string;
  userRecommendationAr: string;
  intake: IntakeData;
  consent: ConsentMatrix;
  doctorResponse: DoctorCooperationResponse;
}

export interface BookedAppointmentSummary {
  id: string;
  patientLabel: string;
  patientProfile: PatientDemographicsSnapshot;
  sessionToken: string;
  requestedDoctorOrSpecialtyEn: string;
  requestedDoctorOrSpecialtyAr: string;
  appointmentSlot: string;
  modalityEn: string;
  modalityAr: string;
  selectedSymptomsEn: string[];
  selectedSymptomsAr: string[];
  riskLevel: RiskLevel;
  compositeScore: number;
  status: QueryStatus;
  createdAt: string;
  persistedInSupabase: boolean;
  doctorResponse: DoctorCooperationResponse;
}

export interface AiExplanationResult {
  plainLanguageSummary: string;
  keyDrivers: string[];
  safeNextSteps: string[];
  questionsToAskDoctor: string[];
  safetyNote: string;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface FollowUpReminder {
  id: string;
  dayLabelEn: string;
  dayLabelAr: string;
  titleEn: string;
  titleAr: string;
  detailEn: string;
  detailAr: string;
  category: "specialist" | "lifestyle" | "lab" | "rescreen";
  completed: boolean;
}

export interface ProgressCheckpoint {
  id: string;
  dayLabelEn: string;
  dayLabelAr: string;
  compositeScore: number;
  noteEn: string;
  noteAr: string;
  habitsActive: string[];
}

export interface SimulatedCaseStudy {
  id: string;
  personaEn: string;
  personaAr: string;
  categoryEn: string;
  categoryAr: string;
  concernSummaryEn: string;
  concernSummaryAr: string;
  baselineScore: number;
  followUpScore: number;
  referralStatusEn: string;
  referralStatusAr: string;
  timeToReferralEn: string;
  timeToReferralAr: string;
  clinicalOutcomeEn: string;
  clinicalOutcomeAr: string;
  interventionsEn: string[];
  interventionsAr: string[];
  timelinePoints: { label: string; score: number }[];
  intakePreset: IntakeData;
}

