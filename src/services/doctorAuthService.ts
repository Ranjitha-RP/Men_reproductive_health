import { supabase } from "../lib/supabase";
import { isStrictGmailAddress } from "../lib/googleGmailAuth";
import { DOCTOR_SPECIALTY_OPTIONS } from "../data/personasAndContent";
import { AuthenticatedDoctor } from "../types/clinical";

export interface RegisteredDoctorOption {
  id: string;
  doctorName: string;
  specialtyEn: string;
  specialtyAr: string;
  gmailEmail?: string;
}

interface DoctorRow {
  id: string;
  doctor_name: string;
  doctor_specialty: string;
  gmail_email?: string | null;
  password_hash: string;
  created_at: string;
}

interface LocalDoctorRecord {
  id: string;
  doctorName: string;
  specialtyEn: string;
  specialtyAr: string;
  gmailEmail?: string;
  passwordHash: string;
}

const inMemoryDoctorRegistry: Map<string, LocalDoctorRecord> = new Map();

function isMissingDoctorsTable(err: unknown): boolean {
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

export async function hashDoctorPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`mrh-doc-auth::${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function resolveArabicSpecialty(specialtyEn: string): string {
  const matched = DOCTOR_SPECIALTY_OPTIONS.find(
    (s) => s.labelEn.toLowerCase() === specialtyEn.toLowerCase()
  );
  return matched ? matched.labelAr : specialtyEn;
}

function formatDoctorDisplayName(rawName: string): string {
  const trimmed = rawName.trim();
  if (!trimmed) return "Dr. Clinician";
  if (/^(dr\.?\s|د\.\s?)/i.test(trimmed)) {
    return trimmed;
  }
  return `Dr. ${trimmed}`;
}

export async function registerDoctorWithPassword(params: {
  doctorName: string;
  specialtyEn: string;
  specialtyAr: string;
  gmailEmail?: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{
  doctor: AuthenticatedDoctor | null;
  doctorsTableMissing: boolean;
  errorEn?: string;
  errorAr?: string;
}> {
  const cleanName = params.doctorName.trim();
  const cleanSpecialtyEn = params.specialtyEn.trim();
  const cleanSpecialtyAr =
    params.specialtyAr.trim() || resolveArabicSpecialty(cleanSpecialtyEn);
  const cleanGmail = (params.gmailEmail || "").trim().toLowerCase();

  if (cleanName.length < 2) {
    return {
      doctor: null,
      doctorsTableMissing: false,
      errorEn: "Please enter your full doctor name.",
      errorAr: "يرجى إدخال اسم الطبيب بالكامل.",
    };
  }

  if (cleanSpecialtyEn.length < 2) {
    return {
      doctor: null,
      doctorsTableMissing: false,
      errorEn: "Please specify what type of doctor / specialty you are.",
      errorAr: "يرجى تحديد التخصص الطبي.",
    };
  }

  if (cleanGmail && !isStrictGmailAddress(cleanGmail)) {
    return {
      doctor: null,
      doctorsTableMissing: false,
      errorEn: "Please enter a valid @gmail.com email address.",
      errorAr: "يرجى إدخال عنوان بريد Gmail صحيح ينتهي بـ @gmail.com.",
    };
  }

  if (params.newPassword.length < 6) {
    return {
      doctor: null,
      doctorsTableMissing: false,
      errorEn: "New password must be at least 6 characters.",
      errorAr: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.",
    };
  }

  if (params.newPassword !== params.confirmPassword) {
    return {
      doctor: null,
      doctorsTableMissing: false,
      errorEn: "Passwords do not match. Please confirm the exact same password.",
      errorAr: "كلمتا المرور غير متطابقتين. يرجى تأكيد نفس كلمة المرور بدقة.",
    };
  }

  const passwordHash = await hashDoctorPassword(params.newPassword);
  const normalizedKey = cleanName.toLowerCase();

  try {
    const existing = await supabase
      .from("doctors")
      .select("*")
      .ilike("doctor_name", cleanName)
      .maybeSingle();

    if (existing.error && isMissingDoctorsTable(existing.error)) {
      const localId = `doc-${Date.now()}`;
      inMemoryDoctorRegistry.set(normalizedKey, {
        id: localId,
        doctorName: cleanName,
        specialtyEn: cleanSpecialtyEn,
        specialtyAr: cleanSpecialtyAr,
        gmailEmail: cleanGmail || undefined,
        passwordHash,
      });
      return {
        doctor: {
          id: localId,
          doctorName: cleanName,
          specialtyEn: cleanSpecialtyEn,
          specialtyAr: cleanSpecialtyAr,
          gmailEmail: cleanGmail || undefined,
          persistedInSupabase: false,
        },
        doctorsTableMissing: true,
      };
    }

    if (existing.data) {
      const row = existing.data as DoctorRow;
      let updateRes = await supabase
        .from("doctors")
        .update({
          doctor_specialty: cleanSpecialtyEn,
          password_hash: passwordHash,
          ...(cleanGmail ? { gmail_email: cleanGmail } : {}),
        })
        .eq("id", row.id)
        .select("*")
        .single();

      if (updateRes.error && isMissingGmailColumn(updateRes.error)) {
        updateRes = await supabase
          .from("doctors")
          .update({
            doctor_specialty: cleanSpecialtyEn,
            password_hash: passwordHash,
          })
          .eq("id", row.id)
          .select("*")
          .single();
      }

      if (updateRes.error) {
        return {
          doctor: null,
          doctorsTableMissing: false,
          errorEn: updateRes.error.message || "Could not save doctor credentials.",
          errorAr: "تعذر حفظ بيانات اعتماد الطبيب.",
        };
      }

      const savedRow = updateRes.data as DoctorRow;
      return {
        doctor: {
          id: savedRow.id,
          doctorName: savedRow.doctor_name,
          specialtyEn: savedRow.doctor_specialty,
          specialtyAr: resolveArabicSpecialty(savedRow.doctor_specialty),
          gmailEmail: savedRow.gmail_email || cleanGmail || undefined,
          persistedInSupabase: true,
        },
        doctorsTableMissing: false,
      };
    }

    let insertRes = await supabase
      .from("doctors")
      .insert({
        doctor_name: cleanName,
        doctor_specialty: cleanSpecialtyEn,
        password_hash: passwordHash,
        ...(cleanGmail ? { gmail_email: cleanGmail } : {}),
      })
      .select("*")
      .single();

    if (insertRes.error && isMissingGmailColumn(insertRes.error)) {
      insertRes = await supabase
        .from("doctors")
        .insert({
          doctor_name: cleanName,
          doctor_specialty: cleanSpecialtyEn,
          password_hash: passwordHash,
        })
        .select("*")
        .single();
    }

    if (insertRes.error) {
      if (isMissingDoctorsTable(insertRes.error)) {
        const localId = `doc-${Date.now()}`;
        inMemoryDoctorRegistry.set(normalizedKey, {
          id: localId,
          doctorName: cleanName,
          specialtyEn: cleanSpecialtyEn,
          specialtyAr: cleanSpecialtyAr,
          gmailEmail: cleanGmail || undefined,
          passwordHash,
        });
        return {
          doctor: {
            id: localId,
            doctorName: cleanName,
            specialtyEn: cleanSpecialtyEn,
            specialtyAr: cleanSpecialtyAr,
            gmailEmail: cleanGmail || undefined,
            persistedInSupabase: false,
          },
          doctorsTableMissing: true,
        };
      }

      return {
        doctor: null,
        doctorsTableMissing: false,
        errorEn: insertRes.error.message || "Failed to register doctor account.",
        errorAr: "تعذر تسجيل حساب الطبيب.",
      };
    }

    const docRow = insertRes.data as DoctorRow;
    return {
      doctor: {
        id: docRow.id,
        doctorName: docRow.doctor_name,
        specialtyEn: docRow.doctor_specialty,
        specialtyAr: resolveArabicSpecialty(docRow.doctor_specialty),
        gmailEmail: docRow.gmail_email || cleanGmail || undefined,
        persistedInSupabase: true,
      },
      doctorsTableMissing: false,
    };
  } catch {
    const localId = `doc-${Date.now()}`;
    inMemoryDoctorRegistry.set(normalizedKey, {
      id: localId,
      doctorName: cleanName,
      specialtyEn: cleanSpecialtyEn,
      specialtyAr: cleanSpecialtyAr,
      gmailEmail: cleanGmail || undefined,
      passwordHash,
    });
    return {
      doctor: {
        id: localId,
        doctorName: cleanName,
        specialtyEn: cleanSpecialtyEn,
        specialtyAr: cleanSpecialtyAr,
        gmailEmail: cleanGmail || undefined,
        persistedInSupabase: false,
      },
      doctorsTableMissing: false,
    };
  }
}

export async function signInDoctorWithPassword(params: {
  doctorName: string;
  specialtyEn: string;
  specialtyAr: string;
  password: string;
}): Promise<{
  doctor: AuthenticatedDoctor | null;
  errorEn?: string;
  errorAr?: string;
}> {
  const cleanName = params.doctorName.trim();
  const cleanSpecialtyEn = params.specialtyEn.trim();
  const cleanSpecialtyAr =
    params.specialtyAr.trim() || resolveArabicSpecialty(cleanSpecialtyEn);

  if (cleanName.length < 2 || !params.password) {
    return {
      doctor: null,
      errorEn: "Please enter your doctor name, specialty, and password.",
      errorAr: "يرجى إدخال اسم الطبيب والتخصص وكلمة المرور.",
    };
  }

  const passwordHash = await hashDoctorPassword(params.password);
  const normalizedKey = cleanName.toLowerCase();

  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .ilike("doctor_name", cleanName)
      .maybeSingle();

    if (error && isMissingDoctorsTable(error)) {
      const localDoc = inMemoryDoctorRegistry.get(normalizedKey);
      if (!localDoc) {
        return {
          doctor: null,
          errorEn:
            "No account found for this doctor name yet. Switch to 'Set & Confirm Password' or use Sign in with Gmail.",
          errorAr:
            "لم يتم العثور على حساب لهذا الطبيب بعد. انتقل إلى 'تعيين كلمة المرور' أو سجل الدخول عبر Gmail.",
        };
      }
      if (localDoc.passwordHash !== passwordHash) {
        return {
          doctor: null,
          errorEn: "Incorrect password for this doctor account.",
          errorAr: "كلمة المرور غير صحيحة لحساب هذا الطبيب.",
        };
      }
      return {
        doctor: {
          id: localDoc.id,
          doctorName: localDoc.doctorName,
          specialtyEn: cleanSpecialtyEn || localDoc.specialtyEn,
          specialtyAr: cleanSpecialtyAr || localDoc.specialtyAr,
          gmailEmail: localDoc.gmailEmail,
          persistedInSupabase: false,
        },
      };
    }

    if (!data) {
      return {
        doctor: null,
        errorEn:
          "Doctor account not found. Use 'Set & Confirm Password' or click Sign in with Gmail.",
        errorAr:
          "حساب الطبيب غير موجود. استخدم 'تعيين كلمة المرور' أو اضغط الدخول عبر Gmail.",
      };
    }

    const row = data as DoctorRow;
    if (row.password_hash !== passwordHash) {
      return {
        doctor: null,
        errorEn: "Incorrect password. Please try again.",
        errorAr: "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
      };
    }

    return {
      doctor: {
        id: row.id,
        doctorName: row.doctor_name,
        specialtyEn: row.doctor_specialty || cleanSpecialtyEn,
        specialtyAr: resolveArabicSpecialty(
          row.doctor_specialty || cleanSpecialtyEn
        ),
        gmailEmail: row.gmail_email || undefined,
        persistedInSupabase: true,
      },
    };
  } catch {
    return {
      doctor: null,
      errorEn: "Unable to verify credentials right now.",
      errorAr: "تعذر التحقق من بيانات الدخول حالياً.",
    };
  }
}

/**
 * Direct 1-click Gmail authentication for Doctors (after Google verifies @gmail.com).
 */
export async function authenticateDoctorWithGmail(params: {
  gmailEmail: string;
  googleDisplayName: string;
  googleUid: string;
  typedDoctorName?: string;
  specialtyEn: string;
  specialtyAr: string;
}): Promise<{
  doctor: AuthenticatedDoctor | null;
  doctorsTableMissing: boolean;
  errorEn?: string;
  errorAr?: string;
}> {
  const cleanGmail = params.gmailEmail.trim().toLowerCase();
  if (!isStrictGmailAddress(cleanGmail)) {
    return {
      doctor: null,
      doctorsTableMissing: false,
      errorEn: "Direct sign-in requires a valid @gmail.com address.",
      errorAr: "يتطلب الدخول المباشر عنوان Gmail صحيح ينتهي بـ @gmail.com.",
    };
  }

  const preferredName = formatDoctorDisplayName(
    params.typedDoctorName?.trim() || params.googleDisplayName
  );
  const cleanSpecialtyEn =
    params.specialtyEn.trim() || DOCTOR_SPECIALTY_OPTIONS[0].labelEn;
  const cleanSpecialtyAr =
    params.specialtyAr.trim() || resolveArabicSpecialty(cleanSpecialtyEn);

  const oauthPasswordHash = await hashDoctorPassword(
    `google-oauth::${params.googleUid}::${cleanGmail}`
  );

  try {
    // 1. Check by gmail_email first
    const byEmail = await supabase
      .from("doctors")
      .select("*")
      .ilike("gmail_email", cleanGmail)
      .maybeSingle();

    if (byEmail.error && isMissingDoctorsTable(byEmail.error)) {
      const existingLocal = Array.from(inMemoryDoctorRegistry.values()).find(
        (d) =>
          d.gmailEmail?.toLowerCase() === cleanGmail ||
          d.doctorName.toLowerCase() === preferredName.toLowerCase()
      );
      if (existingLocal) {
        existingLocal.gmailEmail = cleanGmail;
        return {
          doctor: {
            id: existingLocal.id,
            doctorName: existingLocal.doctorName,
            specialtyEn: existingLocal.specialtyEn,
            specialtyAr: existingLocal.specialtyAr,
            gmailEmail: cleanGmail,
            persistedInSupabase: false,
          },
          doctorsTableMissing: true,
        };
      }

      const localId = `doc-gmail-${Date.now()}`;
      inMemoryDoctorRegistry.set(preferredName.toLowerCase(), {
        id: localId,
        doctorName: preferredName,
        specialtyEn: cleanSpecialtyEn,
        specialtyAr: cleanSpecialtyAr,
        gmailEmail: cleanGmail,
        passwordHash: oauthPasswordHash,
      });
      return {
        doctor: {
          id: localId,
          doctorName: preferredName,
          specialtyEn: cleanSpecialtyEn,
          specialtyAr: cleanSpecialtyAr,
          gmailEmail: cleanGmail,
          persistedInSupabase: false,
        },
        doctorsTableMissing: true,
      };
    }

    if (!byEmail.error && byEmail.data) {
      const row = byEmail.data as DoctorRow;
      return {
        doctor: {
          id: row.id,
          doctorName: row.doctor_name,
          specialtyEn: row.doctor_specialty || cleanSpecialtyEn,
          specialtyAr: resolveArabicSpecialty(
            row.doctor_specialty || cleanSpecialtyEn
          ),
          gmailEmail: row.gmail_email || cleanGmail,
          persistedInSupabase: true,
        },
        doctorsTableMissing: false,
      };
    }

    // 2. Check by doctor_name in case doctor registered earlier without gmail_email column
    const byName = await supabase
      .from("doctors")
      .select("*")
      .ilike("doctor_name", preferredName)
      .maybeSingle();

    if (!byName.error && byName.data) {
      const row = byName.data as DoctorRow;
      // Opportunistically attach gmail_email if column exists
      await supabase
        .from("doctors")
        .update({ gmail_email: cleanGmail })
        .eq("id", row.id);

      return {
        doctor: {
          id: row.id,
          doctorName: row.doctor_name,
          specialtyEn: row.doctor_specialty || cleanSpecialtyEn,
          specialtyAr: resolveArabicSpecialty(
            row.doctor_specialty || cleanSpecialtyEn
          ),
          gmailEmail: cleanGmail,
          persistedInSupabase: true,
        },
        doctorsTableMissing: false,
      };
    }

    // 3. Provision verified Gmail doctor directly in Supabase
    let insertRes = await supabase
      .from("doctors")
      .insert({
        doctor_name: preferredName,
        doctor_specialty: cleanSpecialtyEn,
        gmail_email: cleanGmail,
        password_hash: oauthPasswordHash,
      })
      .select("*")
      .single();

    if (insertRes.error && isMissingGmailColumn(insertRes.error)) {
      insertRes = await supabase
        .from("doctors")
        .insert({
          doctor_name: preferredName,
          doctor_specialty: cleanSpecialtyEn,
          password_hash: oauthPasswordHash,
        })
        .select("*")
        .single();
    }

    if (insertRes.data) {
      const row = insertRes.data as DoctorRow;
      return {
        doctor: {
          id: row.id,
          doctorName: row.doctor_name,
          specialtyEn: row.doctor_specialty,
          specialtyAr: resolveArabicSpecialty(row.doctor_specialty),
          gmailEmail: row.gmail_email || cleanGmail,
          persistedInSupabase: true,
        },
        doctorsTableMissing: false,
      };
    }

    // Fallback in-memory session so valid Gmail always logs in directly
    return {
      doctor: {
        id: `doc-gmail-${Date.now()}`,
        doctorName: preferredName,
        specialtyEn: cleanSpecialtyEn,
        specialtyAr: cleanSpecialtyAr,
        gmailEmail: cleanGmail,
        persistedInSupabase: false,
      },
      doctorsTableMissing: Boolean(
        insertRes.error && isMissingDoctorsTable(insertRes.error)
      ),
    };
  } catch {
    return {
      doctor: {
        id: `doc-gmail-${Date.now()}`,
        doctorName: preferredName,
        specialtyEn: cleanSpecialtyEn,
        specialtyAr: cleanSpecialtyAr,
        gmailEmail: cleanGmail,
        persistedInSupabase: false,
      },
      doctorsTableMissing: false,
    };
  }
}

export async function fetchRegisteredDoctorsFromSupabase(): Promise<
  RegisteredDoctorOption[]
> {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("id, doctor_name, doctor_specialty")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return Array.from(inMemoryDoctorRegistry.values()).map((d) => ({
        id: d.id,
        doctorName: d.doctorName,
        specialtyEn: d.specialtyEn,
        specialtyAr: d.specialtyAr,
        gmailEmail: d.gmailEmail,
      }));
    }

    return (
      data as Pick<DoctorRow, "id" | "doctor_name" | "doctor_specialty">[]
    ).map((row) => ({
      id: row.id,
      doctorName: row.doctor_name,
      specialtyEn: row.doctor_specialty,
      specialtyAr: resolveArabicSpecialty(row.doctor_specialty),
    }));
  } catch {
    return [];
  }
}
