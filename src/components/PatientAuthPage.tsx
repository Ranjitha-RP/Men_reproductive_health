"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
  UserCheck,
} from "lucide-react";
import { signInWithVerifiedGmail } from "../lib/googleGmailAuth";
import {
  PATIENT_GOAL_OPTIONS,
  authenticatePatientWithGmail,
  calculateAgeFromBirthYear,
  registerPatientWithPassword,
  signInPatientWithPassword,
} from "../services/patientAuthService";
import { AuthenticatedPatient, Language } from "../types/clinical";
import { GoogleGmailSignInButton } from "./GoogleGmailSignInButton";

interface PatientAuthPageProps {
  lang: Language;
  onAuthenticated: (
    patient: AuthenticatedPatient,
    patientsTableMissing?: boolean
  ) => void;
  onSwitchToDoctorPortal: () => void;
}

export const PatientAuthPage: React.FC<PatientAuthPageProps> = ({
  lang,
  onAuthenticated,
  onSwitchToDoctorPortal,
}) => {
  const isAr = lang === "ar";
  const currentYear = new Date().getFullYear();

  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [patientName, setPatientName] = useState<string>("");
  const [birthYearInput, setBirthYearInput] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [cityLocation, setCityLocation] = useState<string>("");
  const [patientGmail, setPatientGmail] = useState<string>("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    PATIENT_GOAL_OPTIONS[0].id
  );

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [signInPassword, setSignInPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGmailLoading, setIsGmailLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedBirthYear = birthYearInput.trim()
    ? Number.parseInt(birthYearInput.trim(), 10)
    : null;
  const computedAge = calculateAgeFromBirthYear(parsedBirthYear);

  const resolvedGoal =
    PATIENT_GOAL_OPTIONS.find((g) => g.id === selectedGoalId) ||
    PATIENT_GOAL_OPTIONS[0];

  const passwordsMatch =
    newPassword.length >= 6 && newPassword === confirmPassword;

  const handleDirectGmailSignIn = async () => {
    setErrorMessage(null);
    setIsGmailLoading(true);

    const googleRes = await signInWithVerifiedGmail();
    if (!googleRes.identity) {
      setIsGmailLoading(false);
      setErrorMessage(
        isAr
          ? googleRes.errorAr ||
              "تعذر التحقق من حساب Gmail. يُسمح بالدخول لحسابات @gmail.com الصحيحة فقط."
          : googleRes.errorEn ||
              "Gmail verification failed. Only valid @gmail.com accounts can sign in directly."
      );
      return;
    }

    const patRes = await authenticatePatientWithGmail({
      gmailEmail: googleRes.identity.gmailEmail,
      googleDisplayName: googleRes.identity.displayName,
      googleUid: googleRes.identity.uid,
      typedPatientName: patientName,
      typedBirthYear: parsedBirthYear,
      typedPhoneNumber: phoneNumber,
      typedCityLocation: cityLocation,
      maritalGoalEn: resolvedGoal.labelEn,
      maritalGoalAr: resolvedGoal.labelAr,
    });
    setIsGmailLoading(false);

    if (!patRes.patient) {
      setErrorMessage(
        isAr
          ? patRes.errorAr || "تعذر تسجيل دخول المراجع عبر Gmail."
          : patRes.errorEn || "Patient Gmail sign-in failed."
      );
      return;
    }

    onAuthenticated(patRes.patient, patRes.patientsTableMissing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (authMode === "register") {
      const res = await registerPatientWithPassword({
        patientName,
        birthYear: parsedBirthYear || 0,
        phoneNumber,
        cityLocation,
        maritalGoalEn: resolvedGoal.labelEn,
        maritalGoalAr: resolvedGoal.labelAr,
        gmailEmail: patientGmail,
        newPassword,
        confirmPassword,
      });
      setIsSubmitting(false);

      if (!res.patient) {
        setErrorMessage(
          isAr
            ? res.errorAr || "تعذر التسجيل."
            : res.errorEn || "Registration failed."
        );
        return;
      }

      onAuthenticated(res.patient, res.patientsTableMissing);
      return;
    }

    const res = await signInPatientWithPassword({
      patientName,
      password: signInPassword,
    });
    setIsSubmitting(false);

    if (!res.patient) {
      setErrorMessage(
        isAr
          ? res.errorAr || "تعذر تسجيل الدخول."
          : res.errorEn || "Sign-in failed."
      );
      return;
    }

    onAuthenticated(res.patient, false);
  };

  return (
    <div className="bg-[#F3F6FA] min-h-[calc(100vh-7rem)] py-10 sm:py-14 px-4 sm:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {/* LEFT COLUMN: CLINICAL CONTEXT */}
        <div className="lg:col-span-5 bg-[#0F172A] text-white p-7 sm:p-9 flex flex-col justify-between space-y-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300">
              <User className="w-4 h-4" />
              <span>
                {isAr
                  ? "بوابة المراجعين الموثقة"
                  : "Patient Portal Authentication"}
              </span>
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold leading-snug text-white balance-text">
              {isAr
                ? "ادخل مباشرة عبر Gmail أو سجّل بياناتك لاختيار الأعراض وحجز الطبيب"
                : "Sign In Directly with Gmail or Register Your Profile to Meet a Doctor"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? "اضغط على زر Gmail للدخول المباشر الفوري في حال امتلاكك حساب @gmail.com صحيح وموثق، أو أنشئ ملفاً بالاسم وسنة الميلاد وكلمة المرور. تنعكس بياناتك وأعراضك تلقائياً لدى الطبيب عند حجز الموعد."
                : "Click Sign in with Google for direct one-click login when you have a valid @gmail.com account, or register with your name, birth year, contact details, and password. Your profile and selected symptoms are reflected live to your doctor."}
            </p>

            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? "دخول مباشر بنقرة واحدة لحسابات @gmail.com الصحيحة والموثقة"
                    : "Direct 1-click sign-in strictly for verified @gmail.com accounts"}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? "تسجيل الاسم وسنة الميلاد والعمر ورقم الهاتف والمدينة"
                    : "Full Name, Birth Year (Age), Phone, City & Gmail synced to Supabase"}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? "اختيار الأعراض وحجز المقابلة ليراها الطبيب كاملة"
                    : "Select symptoms & book—reflected immediately in Doctor Dashboard"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onSwitchToDoctorPortal}
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? "هل أنت طبيب؟ انتقل إلى دخول الأطباء"
                  : "Are you a clinician? Switch to Doctor Login"}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PATIENT SIGN-IN & REGISTRATION */}
        <div className="lg:col-span-7 p-7 sm:p-9 space-y-5">
          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F3F6FA] rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap truncate ${
                authMode === "signin"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isAr ? "تسجيل دخول المراجع" : "Patient Sign-In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap truncate ${
                authMode === "register"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isAr ? "تسجيل مراجع جديد" : "New Patient Registration"}
            </button>
          </div>

          {/* DIRECT 1-CLICK GMAIL SIGN-IN */}
          <div className="space-y-2">
            <GoogleGmailSignInButton
              label={
                isAr
                  ? "تسجيل دخول المراجع مباشرة عبر Gmail"
                  : "Sign in with Google (Verified Gmail Only)"
              }
              loadingLabel={
                isAr
                  ? "جارٍ التحقق من حساب Gmail..."
                  : "Verifying @gmail.com account..."
              }
              isLoading={isGmailLoading}
              disabled={isSubmitting}
              onClick={handleDirectGmailSignIn}
            />
            <p className="text-[11px] text-center text-slate-500">
              {isAr
                ? "تسجيل دخول فوري عند اختيار حساب Gmail صحيح وموثق (@gmail.com)."
                : "Logs you in directly if your Google account has a verified @gmail.com address."}
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-0.5">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink-0 px-3 text-[11px] font-medium text-slate-400">
              {isAr ? "أو عبر الاسم وكلمة المرور" : "or continue with password"}
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs font-medium text-red-800">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                {isAr ? "الاسم الكامل للمراجع *" : "Patient Full Name *"}
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder={
                    isAr ? "مثال: رامي محمود" : "e.g., Rahul Sharma"
                  }
                  className="w-full ps-10 pe-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                />
              </div>
            </div>

            {authMode === "register" && (
              <>
                {/* Birth Year + Live Age & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-semibold text-slate-800">
                        {isAr ? "سنة الميلاد *" : "Birth Year *"}
                      </label>
                      {computedAge !== null && (
                        <span className="text-[11px] font-mono-tabular font-semibold text-[#1B5683]">
                          {isAr
                            ? `العمر: ${computedAge} سنة`
                            : `Age: ${computedAge} yrs`}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                      <input
                        type="number"
                        required
                        min={1935}
                        max={currentYear - 16}
                        value={birthYearInput}
                        onChange={(e) => setBirthYearInput(e.target.value)}
                        placeholder={isAr ? "مثال: 1994" : "e.g., 1994"}
                        className="w-full ps-10 pe-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-mono-tabular text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      {isAr
                        ? "رقم الهاتف للتواصل *"
                        : "Phone / Contact Number *"}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={
                          isAr
                            ? "مثال: +971 50 123 4567"
                            : "e.g., +91 98765 43210"
                        }
                        className="w-full ps-10 pe-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-mono-tabular text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                      />
                    </div>
                  </div>
                </div>

                {/* City / Location & Marital / Family Goal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      {isAr ? "المدينة / الموقع *" : "City / Location *"}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={cityLocation}
                        onChange={(e) => setCityLocation(e.target.value)}
                        placeholder={
                          isAr ? "مثال: دبي / الرياض" : "e.g., Hyderabad / Dubai"
                        }
                        className="w-full ps-10 pe-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      {isAr
                        ? "الحالة / هدف الاستشارة *"
                        : "Marital Status & Care Goal *"}
                    </label>
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683] cursor-pointer"
                    >
                      {PATIENT_GOAL_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {isAr ? opt.labelAr : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Gmail Field on Manual Registration */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    {isAr
                      ? "عنوان Gmail (اختياري للربط المباشر)"
                      : "Gmail Address (Optional @gmail.com)"}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={patientGmail}
                      onChange={(e) => setPatientGmail(e.target.value)}
                      placeholder="patient.name@gmail.com"
                      className="w-full ps-10 pe-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                    />
                  </div>
                </div>

                {/* New Password & Confirm Same Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      {isAr ? "كلمة المرور الجديدة *" : "New Password *"}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={
                          isAr ? "6 أحرف على الأقل" : "Min. 6 characters"
                        }
                        className="w-full ps-10 pe-10 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      {isAr ? "تأكيد كلمة المرور *" : "Confirm Same Password *"}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={
                          isAr
                            ? "أعد إدخال نفس كلمة المرور"
                            : "Re-enter exact password"
                        }
                        className="w-full ps-10 pe-10 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Password Match Confirmation */}
                {confirmPassword.length > 0 && (
                  <div
                    className={`text-xs font-medium flex items-center gap-1.5 ${
                      passwordsMatch ? "text-[#059669]" : "text-[#DC2626]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {passwordsMatch
                        ? isAr
                          ? "كلمتا المرور متطابقتان — جاهز للدخول واختيار الأعراض"
                          : "Passwords match — ready to enter Patient Dashboard"
                        : isAr
                        ? "يجب أن تتطابق كلمتا المرور تماماً (6 أحرف على الأقل)"
                        : "Both passwords must match (minimum 6 characters)"}
                    </span>
                  </div>
                )}
              </>
            )}

            {authMode === "signin" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  {isAr ? "كلمة المرور *" : "Password *"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder={
                      isAr
                        ? "أدخل كلمة المرور المسجلة"
                        : "Enter your registered password"
                    }
                    className="w-full ps-10 pe-10 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#1B5683] shrink-0" />
                <span>
                  {isAr
                    ? "مصادقة موثقة عبر Gmail أو كلمة المرور المشفرة."
                    : "Verified Gmail OAuth & SHA-256 login."}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isGmailLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B5683] text-white text-xs sm:text-sm font-semibold hover:bg-[#154468] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>
                  {isSubmitting
                    ? isAr
                      ? "جارٍ التحقق والدخول..."
                      : "Signing In..."
                    : authMode === "register"
                    ? isAr
                      ? "حفظ البيانات والدخول لاختيار الأعراض"
                      : "Register & Enter Patient Dashboard"
                    : isAr
                    ? "دخول إلى لوحة المراجع"
                    : "Sign In to Patient Dashboard"}
                </span>
                {isAr ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
