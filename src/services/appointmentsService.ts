import { supabase } from "../lib/supabase";
import { EMPTY_CLEAN_INTAKE } from "../data/personasAndContent";
import {
  BookedAppointmentSummary,
  ConsentMatrix,
  DoctorCooperationResponse,
  IntakeData,
  PatientDemographicsSnapshot,
  PatientQueryCase,
  QueryStatus,
  RiskLevel,
} from "../types/clinical";
import { extractSelectedSymptomsFromIntake } from "../utils/doctorCaseHelpers";
import { calculateAgeFromBirthYear } from "./patientAuthService";

export interface CreateAppointmentInput {
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
  patientQueryEn: string;
  patientQueryAr: string;
  userRecommendationEn: string;
  userRecommendationAr: string;
  intake: IntakeData;
  consent: ConsentMatrix;
}

interface DoctorResponseRow {
  id: string;
  appointment_id: string;
  doctor_name_en: string;
  doctor_name_ar: string;
  response_status: "accepted" | "cooperating";
  confirmed_slot: string;
  approved_actions_en: string[];
  approved_actions_ar: string[];
  clinician_note_en: string;
  clinician_note_ar: string;
  responded_at: string;
}

interface SnapshotWithMeta extends Partial<IntakeData> {
  __patientLabel?: string;
  __patientProfile?: PatientDemographicsSnapshot;
  __selectedSymptomsEn?: string[];
  __selectedSymptomsAr?: string[];
}

interface AppointmentRow {
  id: string;
  session_token: string;
  patient_id?: string | null;
  patient_name?: string | null;
  patient_birth_year?: number | null;
  patient_phone?: string | null;
  patient_city?: string | null;
  patient_goal?: string | null;
  patient_gmail?: string | null;
  specialist_id: string;
  doctor_name_en: string;
  doctor_name_ar: string;
  clinic_name_en: string;
  clinic_name_ar: string;
  city_en: string;
  city_ar: string;
  appointment_slot: string;
  modality_en: string;
  modality_ar: string;
  risk_level: RiskLevel;
  composite_score: number;
  patient_query_en: string;
  patient_query_ar: string;
  user_recommendation_en: string;
  user_recommendation_ar: string;
  selected_symptoms?: string[] | null;
  intake_snapshot: SnapshotWithMeta | null;
  consent_snapshot: Partial<ConsentMatrix> | null;
  status: QueryStatus;
  created_at: string;
  doctor_responses?: DoctorResponseRow[] | DoctorResponseRow | null;
}

const DEFAULT_CONSENT: ConsentMatrix = {
  maskPersonalIdentity: true,
  shareMetabolic: true,
  shareLifestyle: true,
  shareAnatomical: true,
  shareInfectious: true,
  shareBiomarkers: true,
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isMissingSchemaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  const msg = ((err as { message?: string }).message || "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("schema cache") ||
    msg.includes("does not exist")
  );
}

function isMissingNewColumnError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  const msg = ((err as { message?: string }).message || "").toLowerCase();
  return (
    code === "PGRST204" ||
    code === "42703" ||
    msg.includes("selected_symptoms") ||
    msg.includes("patient_name") ||
    msg.includes("patient_birth_year") ||
    msg.includes("patient_phone") ||
    msg.includes("patient_city") ||
    msg.includes("patient_goal") ||
    msg.includes("patient_gmail") ||
    msg.includes("patient_id")
  );
}

function formatRelativeTimestamp(iso: string): { en: string; ar: string } {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return { en: "Requested", ar: "مرسل" };
  }
  const diffMin = Math.max(0, Math.round((Date.now() - parsed) / 60000));
  if (diffMin < 1) {
    return { en: "Just now", ar: "الآن" };
  }
  if (diffMin < 60) {
    return { en: `${diffMin}m ago`, ar: `منذ ${diffMin} دقيقة` };
  }
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) {
    return { en: `${diffHr}h ago`, ar: `منذ ${diffHr} ساعة` };
  }
  const dateLabel = new Date(parsed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return { en: dateLabel, ar: dateLabel };
}

function sanitizeIntakeFromSnapshot(raw: SnapshotWithMeta | null): IntakeData {
  if (!raw) return { ...EMPTY_CLEAN_INTAKE };
  const copy: Record<string, unknown> = { ...raw };
  delete copy.__patientLabel;
  delete copy.__patientProfile;
  delete copy.__selectedSymptomsEn;
  delete copy.__selectedSymptomsAr;
  return {
    ...EMPTY_CLEAN_INTAKE,
    ...(copy as Partial<IntakeData>),
  };
}

function extractDoctorResponse(row: AppointmentRow): DoctorCooperationResponse {
  const raw = Array.isArray(row.doctor_responses)
    ? row.doctor_responses[0]
    : row.doctor_responses;

  if (raw) {
    const stamp = formatRelativeTimestamp(raw.responded_at);
    return {
      status: raw.response_status || row.status || "accepted",
      doctorNameEn: raw.doctor_name_en || row.doctor_name_en,
      doctorNameAr: raw.doctor_name_ar || row.doctor_name_ar,
      acceptedAt: stamp.en,
      approvedActionsEn: Array.isArray(raw.approved_actions_en)
        ? raw.approved_actions_en
        : [],
      approvedActionsAr: Array.isArray(raw.approved_actions_ar)
        ? raw.approved_actions_ar
        : [],
      clinicianNoteEn: raw.clinician_note_en || "",
      clinicianNoteAr: raw.clinician_note_ar || "",
      scheduledSlot: raw.confirmed_slot || row.appointment_slot,
    };
  }

  return {
    status: row.status || "pending",
    doctorNameEn: row.doctor_name_en,
    doctorNameAr: row.doctor_name_ar,
    acceptedAt: "",
    approvedActionsEn: [],
    approvedActionsAr: [],
    clinicianNoteEn: "",
    clinicianNoteAr: "",
    scheduledSlot: row.appointment_slot,
  };
}

function extractPatientProfileFromRow(
  row: AppointmentRow
): PatientDemographicsSnapshot {
  const snap = row.intake_snapshot?.__patientProfile;
  const resolvedName =
    (row.patient_name && row.patient_name.trim()) ||
    snap?.patientName ||
    row.intake_snapshot?.__patientLabel ||
    row.city_en ||
    "Patient";

  const resolvedYear =
    typeof row.patient_birth_year === "number" && row.patient_birth_year > 1900
      ? row.patient_birth_year
      : snap?.birthYear ?? null;

  const resolvedPhone =
    (row.patient_phone && row.patient_phone.trim()) || snap?.phoneNumber || "";

  const resolvedCity =
    (row.patient_city && row.patient_city.trim()) || snap?.cityLocation || "";

  const resolvedGoalEn =
    (row.patient_goal && row.patient_goal.trim()) ||
    snap?.maritalGoalEn ||
    "Fertility & Reproductive Consultation";

  const resolvedGoalAr = snap?.maritalGoalAr || resolvedGoalEn;

  const resolvedGmail =
    (row.patient_gmail && row.patient_gmail.trim()) || snap?.gmailEmail || "";

  return {
    patientId: row.patient_id || snap?.patientId,
    patientName: resolvedName,
    birthYear: resolvedYear,
    phoneNumber: resolvedPhone,
    cityLocation: resolvedCity,
    maritalGoalEn: resolvedGoalEn,
    maritalGoalAr: resolvedGoalAr,
    gmailEmail: resolvedGmail || undefined,
  };
}

function buildDisplayLabelFromProfile(
  profile: PatientDemographicsSnapshot
): string {
  const age = calculateAgeFromBirthYear(profile.birthYear);
  if (profile.birthYear && age !== null) {
    return `${profile.patientName} · ${profile.birthYear} (${age}y)`;
  }
  if (profile.birthYear) {
    return `${profile.patientName} · ${profile.birthYear}`;
  }
  return profile.patientName;
}

function mapRowToCaseAndSummary(
  row: AppointmentRow,
  activeSessionPrefix?: string,
  activePatientName?: string
): {
  queryCase: PatientQueryCase;
  summary: BookedAppointmentSummary;
} {
  const rel = formatRelativeTimestamp(row.created_at);
  const doctorResponse = extractDoctorResponse(row);
  const intake = sanitizeIntakeFromSnapshot(row.intake_snapshot);
  const consent: ConsentMatrix = {
    ...DEFAULT_CONSENT,
    ...(row.consent_snapshot || {}),
  };

  const derivedSymptoms = extractSelectedSymptomsFromIntake(intake);
  const selectedSymptomsEn =
    Array.isArray(row.selected_symptoms) && row.selected_symptoms.length > 0
      ? row.selected_symptoms
      : Array.isArray(row.intake_snapshot?.__selectedSymptomsEn) &&
        row.intake_snapshot!.__selectedSymptomsEn!.length > 0
      ? row.intake_snapshot!.__selectedSymptomsEn!
      : derivedSymptoms.en;

  const selectedSymptomsAr =
    Array.isArray(row.intake_snapshot?.__selectedSymptomsAr) &&
    row.intake_snapshot!.__selectedSymptomsAr!.length > 0
      ? row.intake_snapshot!.__selectedSymptomsAr!
      : derivedSymptoms.ar.length > 0
      ? derivedSymptoms.ar
      : selectedSymptomsEn;

  const patientProfile = extractPatientProfileFromRow(row);
  const patientLabel = buildDisplayLabelFromProfile(patientProfile);

  const matchesSession =
    Boolean(activeSessionPrefix) &&
    row.session_token.startsWith(activeSessionPrefix as string);

  const matchesPatientName =
    Boolean(activePatientName) &&
    patientProfile.patientName.toLowerCase() ===
      (activePatientName as string).trim().toLowerCase();

  const isCurrentUser = matchesSession || matchesPatientName;

  return {
    queryCase: {
      id: row.id,
      isLiveUserSession: isCurrentUser,
      persistedInSupabase: true,
      patientLabel,
      patientProfile,
      sessionToken: row.session_token,
      submittedAtEn: rel.en,
      submittedAtAr: rel.ar,
      requestedDoctorOrSpecialtyEn: row.doctor_name_en,
      requestedDoctorOrSpecialtyAr: row.doctor_name_ar,
      preferredModalityEn: row.modality_en,
      preferredModalityAr: row.modality_ar,
      requestedSlot: row.appointment_slot,
      selectedSymptomsEn,
      selectedSymptomsAr,
      patientQueryTextEn: row.patient_query_en,
      patientQueryTextAr: row.patient_query_ar,
      userRecommendationEn: row.user_recommendation_en,
      userRecommendationAr: row.user_recommendation_ar,
      intake,
      consent,
      doctorResponse,
    },
    summary: {
      id: row.id,
      patientLabel,
      patientProfile,
      sessionToken: row.session_token,
      requestedDoctorOrSpecialtyEn: row.doctor_name_en,
      requestedDoctorOrSpecialtyAr: row.doctor_name_ar,
      appointmentSlot: row.appointment_slot,
      modalityEn: row.modality_en,
      modalityAr: row.modality_ar,
      selectedSymptomsEn,
      selectedSymptomsAr,
      riskLevel: row.risk_level,
      compositeScore: row.composite_score,
      status: doctorResponse.status,
      createdAt: row.created_at,
      persistedInSupabase: true,
      doctorResponse,
    },
  };
}

export async function fetchBookedAppointments(
  activeSessionPrefix?: string,
  activePatientName?: string
): Promise<{
  cases: PatientQueryCase[];
  summaries: BookedAppointmentSummary[];
  schemaMissing: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, doctor_responses(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      if (isMissingSchemaError(error)) {
        return { cases: [], summaries: [], schemaMissing: true };
      }
      const fallback = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fallback.error) {
        return {
          cases: [],
          summaries: [],
          schemaMissing: isMissingSchemaError(fallback.error),
        };
      }

      const mappedFallback = ((fallback.data || []) as AppointmentRow[]).map(
        (r) =>
          mapRowToCaseAndSummary(r, activeSessionPrefix, activePatientName)
      );
      return {
        cases: mappedFallback.map((m) => m.queryCase),
        summaries: mappedFallback.map((m) => m.summary),
        schemaMissing: false,
      };
    }

    const mapped = ((data || []) as AppointmentRow[]).map((r) =>
      mapRowToCaseAndSummary(r, activeSessionPrefix, activePatientName)
    );

    return {
      cases: mapped.map((m) => m.queryCase),
      summaries: mapped.map((m) => m.summary),
      schemaMissing: false,
    };
  } catch {
    return { cases: [], summaries: [], schemaMissing: false };
  }
}

export async function createDoctorAppointment(
  input: CreateAppointmentInput,
  activeSessionPrefix?: string
): Promise<{
  queryCase: PatientQueryCase | null;
  summary: BookedAppointmentSummary | null;
  schemaMissing: boolean;
  errorMessage?: string;
}> {
  const enrichedIntakeSnapshot: SnapshotWithMeta = {
    ...input.intake,
    __patientLabel: input.patientLabel,
    __patientProfile: input.patientProfile,
    __selectedSymptomsEn: input.selectedSymptomsEn,
    __selectedSymptomsAr: input.selectedSymptomsAr,
  };

  const baseInsertPayload = {
    session_token: input.sessionToken,
    specialist_id: input.requestedDoctorOrSpecialtyEn,
    doctor_name_en: input.requestedDoctorOrSpecialtyEn,
    doctor_name_ar: input.requestedDoctorOrSpecialtyAr,
    clinic_name_en: input.patientProfile.maritalGoalEn || "Consultation",
    clinic_name_ar: input.patientProfile.maritalGoalAr || "استشارة طبية",
    city_en: input.patientProfile.cityLocation || input.patientLabel,
    city_ar: input.patientProfile.cityLocation || input.patientLabel,
    appointment_slot: input.appointmentSlot,
    modality_en: input.modalityEn,
    modality_ar: input.modalityAr,
    risk_level: input.riskLevel,
    composite_score: input.compositeScore,
    patient_query_en: input.patientQueryEn,
    patient_query_ar: input.patientQueryAr,
    user_recommendation_en: input.userRecommendationEn,
    user_recommendation_ar: input.userRecommendationAr,
    intake_snapshot: enrichedIntakeSnapshot,
    consent_snapshot: input.consent,
    status: "pending" as const,
  };

  const validPatientUuid =
    input.patientProfile.patientId &&
    UUID_REGEX.test(input.patientProfile.patientId)
      ? input.patientProfile.patientId
      : null;

  try {
    const fullPatientPayload = {
      ...baseInsertPayload,
      patient_id: validPatientUuid,
      patient_name: input.patientProfile.patientName,
      patient_birth_year: input.patientProfile.birthYear,
      patient_phone: input.patientProfile.phoneNumber,
      patient_city: input.patientProfile.cityLocation,
      patient_goal: input.patientProfile.maritalGoalEn,
      patient_gmail: input.patientProfile.gmailEmail || "",
      selected_symptoms: input.selectedSymptomsEn,
    };

    let { data, error } = await supabase
      .from("appointments")
      .insert(fullPatientPayload)
      .select("*")
      .single();

    if (error && isMissingNewColumnError(error)) {
      const retry = await supabase
        .from("appointments")
        .insert(baseInsertPayload)
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      if (isMissingSchemaError(error)) {
        return {
          queryCase: null,
          summary: null,
          schemaMissing: true,
        };
      }
      return {
        queryCase: null,
        summary: null,
        schemaMissing: false,
        errorMessage: error.message || "Unable to save meeting request.",
      };
    }

    const mapped = mapRowToCaseAndSummary(
      data as AppointmentRow,
      activeSessionPrefix,
      input.patientProfile.patientName
    );
    return {
      queryCase: mapped.queryCase,
      summary: mapped.summary,
      schemaMissing: false,
    };
  } catch (err: unknown) {
    return {
      queryCase: null,
      summary: null,
      schemaMissing: false,
      errorMessage:
        err instanceof Error ? err.message : "Network error saving appointment.",
    };
  }
}

export async function saveDoctorCooperationToSupabase(
  appointmentId: string,
  response: DoctorCooperationResponse
): Promise<{ ok: boolean; schemaMissing: boolean }> {
  try {
    const nextStatus =
      response.status === "pending" ? "accepted" : response.status;

    const { error: apptErr } = await supabase
      .from("appointments")
      .update({
        status: nextStatus,
        appointment_slot: response.scheduledSlot,
        doctor_name_en: response.doctorNameEn,
        doctor_name_ar: response.doctorNameAr,
      })
      .eq("id", appointmentId);

    if (apptErr && isMissingSchemaError(apptErr)) {
      return { ok: false, schemaMissing: true };
    }

    const { error: respErr } = await supabase.from("doctor_responses").upsert(
      {
        appointment_id: appointmentId,
        doctor_name_en: response.doctorNameEn,
        doctor_name_ar: response.doctorNameAr,
        response_status: nextStatus,
        confirmed_slot: response.scheduledSlot,
        approved_actions_en: response.approvedActionsEn,
        approved_actions_ar: response.approvedActionsAr,
        clinician_note_en: response.clinicianNoteEn,
        clinician_note_ar: response.clinicianNoteAr,
        responded_at: new Date().toISOString(),
      },
      { onConflict: "appointment_id" }
    );

    if (respErr && isMissingSchemaError(respErr)) {
      return { ok: !apptErr, schemaMissing: true };
    }

    return { ok: !apptErr && !respErr, schemaMissing: false };
  } catch {
    return { ok: false, schemaMissing: false };
  }
}

export async function deleteSessionAppointmentsFromSupabase(
  sessionPrefix: string
): Promise<void> {
  try {
    await supabase
      .from("appointments")
      .delete()
      .like("session_token", `${sessionPrefix}%`);
  } catch {
    // Ignore errors during session purge
  }
}

export function subscribeToAppointmentsRealtime(onChange: () => void): () => void {
  const channel = supabase
    .channel("mrh-appointments-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "appointments" },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "doctor_responses" },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "doctors" },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "patients" },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
