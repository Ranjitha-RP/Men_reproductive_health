import { supabase } from "../lib/supabase";
import { isStrictGmailAddress } from "../lib/googleGmailAuth";
import { AuthenticatedPatient } from "../types/clinical";

export interface PatientGoalOption {
  id: string;
  labelEn: string;
  labelAr: string;
}

export const PATIENT_GOAL_OPTIONS: PatientGoalOption[] = [
  {
    id: "planning_conception",
    labelEn: "Married · Planning Conception",
    labelAr: "متزوج · تخطيط للإنجاب",
  },
  {
    id: "fertility_check",
    labelEn: "Married · Proactive Fertility & Hormone Check",
    labelAr: "متزوج · فحص وقائي للخصوبة والهرمونات",
  },
  {
    id: "premarital_baseline",
    labelEn: "Single / Engaged · Pre-Marital Baseline",
    labelAr: "مقبل على الزواج · فحص تأسيسي مبكر",
  },
  {
    id: "symptom_followup",
    labelEn: "Experiencing Symptoms · Seeking Specialist Review",
    labelAr: "أعراض حالية · طلب استشارة طبية متخصصة",
  },
];

interface PatientRow {
  id: string;
  patient_name: string;
  birth_year: number;
  phone_number: string;
  city_location: string;
  marital_goal: string;
  gmail_email?: string | null;
  password_hash: string;
  created_at: string;
}

interface LocalPatientRecord {
  id: string;
  patientName: string;
  birthYear: number;
  phoneNumber: string;
  cityLocation: string;
  maritalGoalEn: string;
  maritalGoalAr: string;
  gmailEmail?: string;
  passwordHash: string;
}

const inMemoryPatientRegistry: Map<string, LocalPatientRecord> = new Map();

function isMissingPatientsTable(err: unknown): boolean {
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

function isMissingGmailColumn(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  const msg = ((err as { message?: string }).message || "").toLowerCase();
  return (
    code === "PGRST204" ||
    code === "42703" ||
    msg.includes("gmail_email")
  );
}

export async function hashPatientPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`mrh-patient-auth::${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function resolveArabicGoal(goalEn: string): string {
  const found = PATIENT_GOAL_OPTIONS.find(
    (g) => g.labelEn.toLowerCase() === goalEn.toLowerCase()
  );
  return found ? found.labelAr : goalEn;
}

export function calculateAgeFromBirthYear(
  birthYear: number | null
): number | null {
  if (!birthYear || Number.isNaN(birthYear)) return null;
  const nowYear = new Date().getFullYear();
  const age = nowYear - birthYear;
  if (age < 1 || age > 110) return null;
  return age;
}

export async function registerPatientWithPassword(params: {
  patientName: string;
  birthYear: number;
  phoneNumber: string;
  cityLocation: string;
  maritalGoalEn: string;
  maritalGoalAr: string;
  gmailEmail?: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{
  patient: AuthenticatedPatient | null;
  patientsTableMissing: boolean;
  errorEn?: string;
  errorAr?: string;
}> {
  const cleanName = params.patientName.trim();
  const cleanPhone = params.phoneNumber.trim();
  const cleanCity = params.cityLocation.trim();
  const cleanGoalEn =
    params.maritalGoalEn.trim() || PATIENT_GOAL_OPTIONS[0].labelEn;
  const cleanGoalAr =
    params.maritalGoalAr.trim() || resolveArabicGoal(cleanGoalEn);
  const cleanGmail = (params.gmailEmail || "").trim().toLowerCase();

  const currentYear = new Date().getFullYear();

  if (cleanName.length < 2) {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: "Please enter your full name.",
      errorAr: "يرجى إدخال اسم المراجع بالكامل.",
    };
  }

  if (
    !params.birthYear ||
    Number.isNaN(params.birthYear) ||
    params.birthYear < 1935 ||
    params.birthYear > currentYear - 16
  ) {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: `Please enter a valid birth year between 1935 and ${
        currentYear - 16
      }.`,
      errorAr: `يرجى إدخال سنة ميلاد صحيحة بين 1935 و ${currentYear - 16}.`,
    };
  }

  if (cleanPhone.length < 5) {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: "Please enter your contact / phone number.",
      errorAr: "يرجى إدخال رقم الهاتف للتواصل.",
    };
  }

  if (cleanCity.length < 2) {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: "Please enter your city or location.",
      errorAr: "يرجى إدخال المدينة أو الموقع.",
    };
  }

  if (cleanGmail && !isStrictGmailAddress(cleanGmail)) {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: "Please enter a valid @gmail.com email address.",
      errorAr: "يرجى إدخال عنوان بريد Gmail صحيح ينتهي بـ @gmail.com.",
    };
  }

  if (params.newPassword.length < 6) {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: "New password must be at least 6 characters.",
      errorAr: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.",
    };
  }

  if (params.newPassword !== params.confirmPassword) {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: "Passwords do not match. Please confirm the exact same password.",
      errorAr: "كلمتا المرور غير متطابقتين. يرجى تأكيد نفس كلمة المرور.",
    };
  }

  const passwordHash = await hashPatientPassword(params.newPassword);
  const normalizedKey = cleanName.toLowerCase();

  try {
    const { data: existing, error: fetchErr } = await supabase
      .from("patients")
      .select("*")
      .ilike("patient_name", cleanName)
      .maybeSingle();

    if (fetchErr && isMissingPatientsTable(fetchErr)) {
      const localRecord: LocalPatientRecord = {
        id: `pat-local-${Date.now()}`,
        patientName: cleanName,
        birthYear: params.birthYear,
        phoneNumber: cleanPhone,
        cityLocation: cleanCity,
        maritalGoalEn: cleanGoalEn,
        maritalGoalAr: cleanGoalAr,
        gmailEmail: cleanGmail || undefined,
        passwordHash,
      };
      inMemoryPatientRegistry.set(normalizedKey, localRecord);

      return {
        patient: {
          id: localRecord.id,
          patientName: localRecord.patientName,
          birthYear: localRecord.birthYear,
          phoneNumber: localRecord.phoneNumber,
          cityLocation: localRecord.cityLocation,
          maritalGoalEn: localRecord.maritalGoalEn,
          maritalGoalAr: localRecord.maritalGoalAr,
          gmailEmail: localRecord.gmailEmail,
          persistedInSupabase: false,
        },
        patientsTableMissing: true,
      };
    }

    if (existing) {
      const existingRow = existing as PatientRow;
      if (existingRow.password_hash !== passwordHash) {
        return {
          patient: null,
          patientsTableMissing: false,
          errorEn:
            "A patient profile with this name already exists. Switch to 'Returning Patient Sign-In' or click Sign in with Gmail.",
          errorAr:
            "يوجد حساب مسجل بهذا الاسم بالفعل. انتقل إلى 'تسجيل دخول مراجع مسجل' أو سجل الدخول عبر Gmail.",
        };
      }

      let updateRes = await supabase
        .from("patients")
        .update({
          birth_year: params.birthYear,
          phone_number: cleanPhone,
          city_location: cleanCity,
          marital_goal: cleanGoalEn,
          ...(cleanGmail ? { gmail_email: cleanGmail } : {}),
        })
        .eq("id", existingRow.id)
        .select("*")
        .single();

      if (updateRes.error && isMissingGmailColumn(updateRes.error)) {
        updateRes = await supabase
          .from("patients")
          .update({
            birth_year: params.birthYear,
            phone_number: cleanPhone,
            city_location: cleanCity,
            marital_goal: cleanGoalEn,
          })
          .eq("id", existingRow.id)
          .select("*")
          .single();
      }

      const row = (updateRes.data || existingRow) as PatientRow;
      return {
        patient: {
          id: row.id,
          patientName: row.patient_name,
          birthYear: row.birth_year,
          phoneNumber: row.phone_number,
          cityLocation: row.city_location,
          maritalGoalEn: row.marital_goal || cleanGoalEn,
          maritalGoalAr: resolveArabicGoal(row.marital_goal || cleanGoalEn),
          gmailEmail: row.gmail_email || cleanGmail || undefined,
          persistedInSupabase: true,
        },
        patientsTableMissing: false,
      };
    }

    let insertRes = await supabase
      .from("patients")
      .insert({
        patient_name: cleanName,
        birth_year: params.birthYear,
        phone_number: cleanPhone,
        city_location: cleanCity,
        marital_goal: cleanGoalEn,
        password_hash: passwordHash,
        ...(cleanGmail ? { gmail_email: cleanGmail } : {}),
      })
      .select("*")
      .single();

    if (insertRes.error && isMissingGmailColumn(insertRes.error)) {
      insertRes = await supabase
        .from("patients")
        .insert({
          patient_name: cleanName,
          birth_year: params.birthYear,
          phone_number: cleanPhone,
          city_location: cleanCity,
          marital_goal: cleanGoalEn,
          password_hash: passwordHash,
        })
        .select("*")
        .single();
    }

    if (insertRes.error || !insertRes.data) {
      if (insertRes.error && isMissingPatientsTable(insertRes.error)) {
        const localRecord: LocalPatientRecord = {
          id: `pat-local-${Date.now()}`,
          patientName: cleanName,
          birthYear: params.birthYear,
          phoneNumber: cleanPhone,
          cityLocation: cleanCity,
          maritalGoalEn: cleanGoalEn,
          maritalGoalAr: cleanGoalAr,
          gmailEmail: cleanGmail || undefined,
          passwordHash,
        };
        inMemoryPatientRegistry.set(normalizedKey, localRecord);
        return {
          patient: {
            id: localRecord.id,
            patientName: localRecord.patientName,
            birthYear: localRecord.birthYear,
            phoneNumber: localRecord.phoneNumber,
            cityLocation: localRecord.cityLocation,
            maritalGoalEn: localRecord.maritalGoalEn,
            maritalGoalAr: localRecord.maritalGoalAr,
            gmailEmail: localRecord.gmailEmail,
            persistedInSupabase: false,
          },
          patientsTableMissing: true,
        };
      }

      return {
        patient: null,
        patientsTableMissing: false,
        errorEn:
          insertRes.error?.message ||
          "Unable to register patient account right now.",
        errorAr: "تعذر إنشاء حساب المراجع حالياً.",
      };
    }

    const row = insertRes.data as PatientRow;
    return {
      patient: {
        id: row.id,
        patientName: row.patient_name,
        birthYear: row.birth_year,
        phoneNumber: row.phone_number,
        cityLocation: row.city_location,
        maritalGoalEn: row.marital_goal || cleanGoalEn,
        maritalGoalAr: resolveArabicGoal(row.marital_goal || cleanGoalEn),
        gmailEmail: row.gmail_email || cleanGmail || undefined,
        persistedInSupabase: true,
      },
      patientsTableMissing: false,
    };
  } catch {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: "Network error while saving patient credentials.",
      errorAr: "حدث خطأ في الاتصال أثناء حفظ بيانات المراجع.",
    };
  }
}

export async function signInPatientWithPassword(params: {
  patientName: string;
  password: string;
}): Promise<{
  patient: AuthenticatedPatient | null;
  errorEn?: string;
  errorAr?: string;
}> {
  const cleanName = params.patientName.trim();
  if (cleanName.length < 2 || !params.password) {
    return {
      patient: null,
      errorEn: "Please enter your full name and password.",
      errorAr: "يرجى إدخال الاسم الكامل وكلمة المرور.",
    };
  }

  const passwordHash = await hashPatientPassword(params.password);
  const normalizedKey = cleanName.toLowerCase();

  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .ilike("patient_name", cleanName)
      .maybeSingle();

    if (error && isMissingPatientsTable(error)) {
      const localPat = inMemoryPatientRegistry.get(normalizedKey);
      if (!localPat) {
        return {
          patient: null,
          errorEn:
            "No patient profile found for this name yet. Switch to 'New Patient Registration' or click Sign in with Gmail.",
          errorAr:
            "لم يتم العثور على ملف لهذا الاسم بعد. انتقل إلى 'تسجيل مراجع جديد' أو اضغط الدخول عبر Gmail.",
        };
      }
      if (localPat.passwordHash !== passwordHash) {
        return {
          patient: null,
          errorEn: "Incorrect password for this patient profile.",
          errorAr: "كلمة المرور غير صحيحة لهذا الحساب.",
        };
      }
      return {
        patient: {
          id: localPat.id,
          patientName: localPat.patientName,
          birthYear: localPat.birthYear,
          phoneNumber: localPat.phoneNumber,
          cityLocation: localPat.cityLocation,
          maritalGoalEn: localPat.maritalGoalEn,
          maritalGoalAr: localPat.maritalGoalAr,
          gmailEmail: localPat.gmailEmail,
          persistedInSupabase: false,
        },
      };
    }

    if (!data) {
      return {
        patient: null,
        errorEn:
          "Patient account not found. Use 'New Patient Registration' or click Sign in with Gmail.",
        errorAr:
          "حساب المراجع غير موجود. استخدم 'تسجيل مراجع جديد' أو اضغط الدخول عبر Gmail.",
      };
    }

    const row = data as PatientRow;
    if (row.password_hash !== passwordHash) {
      return {
        patient: null,
        errorEn: "Incorrect password. Please try again.",
        errorAr: "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
      };
    }

    return {
      patient: {
        id: row.id,
        patientName: row.patient_name,
        birthYear: row.birth_year,
        phoneNumber: row.phone_number,
        cityLocation: row.city_location,
        maritalGoalEn: row.marital_goal || PATIENT_GOAL_OPTIONS[0].labelEn,
        maritalGoalAr: resolveArabicGoal(
          row.marital_goal || PATIENT_GOAL_OPTIONS[0].labelEn
        ),
        gmailEmail: row.gmail_email || undefined,
        persistedInSupabase: true,
      },
    };
  } catch {
    return {
      patient: null,
      errorEn: "Unable to verify patient credentials right now.",
      errorAr: "تعذر التحقق من بيانات الدخول حالياً.",
    };
  }
}

/**
 * Direct 1-click Gmail authentication for Patients (after Google verifies @gmail.com).
 */
export async function authenticatePatientWithGmail(params: {
  gmailEmail: string;
  googleDisplayName: string;
  googleUid: string;
  typedPatientName?: string;
  typedBirthYear?: number | null;
  typedPhoneNumber?: string;
  typedCityLocation?: string;
  maritalGoalEn?: string;
  maritalGoalAr?: string;
}): Promise<{
  patient: AuthenticatedPatient | null;
  patientsTableMissing: boolean;
  errorEn?: string;
  errorAr?: string;
}> {
  const cleanGmail = params.gmailEmail.trim().toLowerCase();
  if (!isStrictGmailAddress(cleanGmail)) {
    return {
      patient: null,
      patientsTableMissing: false,
      errorEn: "Direct sign-in requires a valid @gmail.com address.",
      errorAr: "يتطلب الدخول المباشر عنوان Gmail صحيح ينتهي بـ @gmail.com.",
    };
  }

  const preferredName =
    params.typedPatientName?.trim() ||
    params.googleDisplayName.trim() ||
    cleanGmail.split("@")[0];

  const currentYear = new Date().getFullYear();
  const resolvedBirthYear =
    params.typedBirthYear &&
    params.typedBirthYear >= 1935 &&
    params.typedBirthYear <= currentYear - 16
      ? params.typedBirthYear
      : 1995;

  const resolvedPhone = params.typedPhoneNumber?.trim() || cleanGmail;
  const resolvedCity = params.typedCityLocation?.trim() || "Gmail Verified";
  const resolvedGoalEn =
    params.maritalGoalEn?.trim() || PATIENT_GOAL_OPTIONS[0].labelEn;
  const resolvedGoalAr =
    params.maritalGoalAr?.trim() || resolveArabicGoal(resolvedGoalEn);

  const oauthPasswordHash = await hashPatientPassword(
    `google-oauth::${params.googleUid}::${cleanGmail}`
  );

  try {
    // 1. Check existing patient by gmail_email first
    const byEmail = await supabase
      .from("patients")
      .select("*")
      .ilike("gmail_email", cleanGmail)
      .maybeSingle();

    if (byEmail.error && isMissingPatientsTable(byEmail.error)) {
      const existingLocal = Array.from(inMemoryPatientRegistry.values()).find(
        (p) =>
          p.gmailEmail?.toLowerCase() === cleanGmail ||
          p.patientName.toLowerCase() === preferredName.toLowerCase()
      );
      if (existingLocal) {
        existingLocal.gmailEmail = cleanGmail;
        return {
          patient: {
            id: existingLocal.id,
            patientName: existingLocal.patientName,
            birthYear: existingLocal.birthYear,
            phoneNumber: existingLocal.phoneNumber,
            cityLocation: existingLocal.cityLocation,
            maritalGoalEn: existingLocal.maritalGoalEn,
            maritalGoalAr: existingLocal.maritalGoalAr,
            gmailEmail: cleanGmail,
            persistedInSupabase: false,
          },
          patientsTableMissing: true,
        };
      }

      const localRecord: LocalPatientRecord = {
        id: `pat-gmail-${Date.now()}`,
        patientName: preferredName,
        birthYear: resolvedBirthYear,
        phoneNumber: resolvedPhone,
        cityLocation: resolvedCity,
        maritalGoalEn: resolvedGoalEn,
        maritalGoalAr: resolvedGoalAr,
        gmailEmail: cleanGmail,
        passwordHash: oauthPasswordHash,
      };
      inMemoryPatientRegistry.set(preferredName.toLowerCase(), localRecord);

      return {
        patient: {
          id: localRecord.id,
          patientName: localRecord.patientName,
          birthYear: localRecord.birthYear,
          phoneNumber: localRecord.phoneNumber,
          cityLocation: localRecord.cityLocation,
          maritalGoalEn: localRecord.maritalGoalEn,
          maritalGoalAr: localRecord.maritalGoalAr,
          gmailEmail: cleanGmail,
          persistedInSupabase: false,
        },
        patientsTableMissing: true,
      };
    }

    if (!byEmail.error && byEmail.data) {
      const row = byEmail.data as PatientRow;
      return {
        patient: {
          id: row.id,
          patientName: row.patient_name,
          birthYear: row.birth_year,
          phoneNumber: row.phone_number || cleanGmail,
          cityLocation: row.city_location || resolvedCity,
          maritalGoalEn: row.marital_goal || resolvedGoalEn,
          maritalGoalAr: resolveArabicGoal(row.marital_goal || resolvedGoalEn),
          gmailEmail: row.gmail_email || cleanGmail,
          persistedInSupabase: true,
        },
        patientsTableMissing: false,
      };
    }

    // 2. Check by patient_name in case patient registered before adding gmail_email column
    const byName = await supabase
      .from("patients")
      .select("*")
      .ilike("patient_name", preferredName)
      .maybeSingle();

    if (!byName.error && byName.data) {
      const row = byName.data as PatientRow;
      await supabase
        .from("patients")
        .update({ gmail_email: cleanGmail })
        .eq("id", row.id);

      return {
        patient: {
          id: row.id,
          patientName: row.patient_name,
          birthYear: row.birth_year,
          phoneNumber: row.phone_number || cleanGmail,
          cityLocation: row.city_location || resolvedCity,
          maritalGoalEn: row.marital_goal || resolvedGoalEn,
          maritalGoalAr: resolveArabicGoal(row.marital_goal || resolvedGoalEn),
          gmailEmail: cleanGmail,
          persistedInSupabase: true,
        },
        patientsTableMissing: false,
      };
    }

    // 3. Provision verified Gmail patient directly in Supabase
    let insertRes = await supabase
      .from("patients")
      .insert({
        patient_name: preferredName,
        birth_year: resolvedBirthYear,
        phone_number: resolvedPhone,
        city_location: resolvedCity,
        marital_goal: resolvedGoalEn,
        gmail_email: cleanGmail,
        password_hash: oauthPasswordHash,
      })
      .select("*")
      .single();

    if (insertRes.error && isMissingGmailColumn(insertRes.error)) {
      insertRes = await supabase
        .from("patients")
        .insert({
          patient_name: preferredName,
          birth_year: resolvedBirthYear,
          phone_number: resolvedPhone,
          city_location: resolvedCity,
          marital_goal: resolvedGoalEn,
          password_hash: oauthPasswordHash,
        })
        .select("*")
        .single();
    }

    if (insertRes.data) {
      const row = insertRes.data as PatientRow;
      return {
        patient: {
          id: row.id,
          patientName: row.patient_name,
          birthYear: row.birth_year,
          phoneNumber: row.phone_number,
          cityLocation: row.city_location,
          maritalGoalEn: row.marital_goal || resolvedGoalEn,
          maritalGoalAr: resolveArabicGoal(row.marital_goal || resolvedGoalEn),
          gmailEmail: row.gmail_email || cleanGmail,
          persistedInSupabase: true,
        },
        patientsTableMissing: false,
      };
    }

    return {
      patient: {
        id: `pat-gmail-${Date.now()}`,
        patientName: preferredName,
        birthYear: resolvedBirthYear,
        phoneNumber: resolvedPhone,
        cityLocation: resolvedCity,
        maritalGoalEn: resolvedGoalEn,
        maritalGoalAr: resolvedGoalAr,
        gmailEmail: cleanGmail,
        persistedInSupabase: false,
      },
      patientsTableMissing: Boolean(
        insertRes.error && isMissingPatientsTable(insertRes.error)
      ),
    };
  } catch {
    return {
      patient: {
        id: `pat-gmail-${Date.now()}`,
        patientName: preferredName,
        birthYear: resolvedBirthYear,
        phoneNumber: resolvedPhone,
        cityLocation: resolvedCity,
        maritalGoalEn: resolvedGoalEn,
        maritalGoalAr: resolvedGoalAr,
        gmailEmail: cleanGmail,
        persistedInSupabase: false,
      },
      patientsTableMissing: false,
    };
  }
}
