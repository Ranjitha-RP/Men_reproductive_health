"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { DOCTOR_SPECIALTY_OPTIONS } from "../data/personasAndContent";
import { signInWithVerifiedGmail } from "../lib/googleGmailAuth";
import {
  authenticateDoctorWithGmail,
  registerDoctorWithPassword,
  signInDoctorWithPassword,
} from "../services/doctorAuthService";
import { AuthenticatedDoctor, Language } from "../types/clinical";
import { GoogleGmailSignInButton } from "./GoogleGmailSignInButton";

interface DoctorAuthPageProps {
  lang: Language;
  onAuthenticated: (
    doctor: AuthenticatedDoctor,
    doctorsTableMissing?: boolean
  ) => void;
  onBackToPatientPortal: () => void;
}

export const DoctorAuthPage: React.FC<DoctorAuthPageProps> = ({
  lang,
  onAuthenticated,
  onBackToPatientPortal,
}) => {
  const isAr = lang === "ar";

  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [doctorName, setDoctorName] = useState<string>("");
  const [doctorGmail, setDoctorGmail] = useState<string>("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] =
    useState<string>("andrologist");
  const [customSpecialty, setCustomSpecialty] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [signInPassword, setSignInPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGmailLoading, setIsGmailLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedSpecialty = (() => {
    if (selectedSpecialtyId === "custom") {
      const trimmed = customSpecialty.trim() || "Male Reproductive Specialist";
      return { en: trimmed, ar: trimmed };
    }
    const found =
      DOCTOR_SPECIALTY_OPTIONS.find((s) => s.id === selectedSpecialtyId) ||
      DOCTOR_SPECIALTY_OPTIONS[0];
    return { en: found.labelEn, ar: found.labelAr };
  })();

  const passwordsMatch =
    newPassword.length >= 6 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

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

    const docRes = await authenticateDoctorWithGmail({
      gmailEmail: googleRes.identity.gmailEmail,
      googleDisplayName: googleRes.identity.displayName,
      googleUid: googleRes.identity.uid,
      typedDoctorName: doctorName,
      specialtyEn: resolvedSpecialty.en,
      specialtyAr: resolvedSpecialty.ar,
    });
    setIsGmailLoading(false);

    if (!docRes.doctor) {
      setErrorMessage(
        isAr
          ? docRes.errorAr || "تعذر تسجيل دخول الطبيب عبر Gmail."
          : docRes.errorEn || "Doctor Gmail sign-in failed."
      );
      return;
    }

    onAuthenticated(docRes.doctor, docRes.doctorsTableMissing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === "register") {
      setIsSubmitting(true);
      const res = await registerDoctorWithPassword({
        doctorName,
        specialtyEn: resolvedSpecialty.en,
        specialtyAr: resolvedSpecialty.ar,
        gmailEmail: doctorGmail,
        newPassword,
        confirmPassword,
      });
      setIsSubmitting(false);

      if (!res.doctor) {
        setErrorMessage(
          isAr
            ? res.errorAr || "يرجى التحقق من جميع الحقول وتطابق كلمة المرور."
            : res.errorEn || "Please check all fields and password confirmation."
        );
        return;
      }

      onAuthenticated(res.doctor, res.doctorsTableMissing);
      return;
    }

    // Returning Doctor Sign-In
    setIsSubmitting(true);
    const res = await signInDoctorWithPassword({
      doctorName,
      specialtyEn: resolvedSpecialty.en,
      specialtyAr: resolvedSpecialty.ar,
      password: signInPassword,
    });
    setIsSubmitting(false);

    if (!res.doctor) {
      setErrorMessage(
        isAr
          ? res.errorAr || "فشل تسجيل الدخول. تحقق من الاسم وكلمة المرور."
          : res.errorEn || "Sign-in failed. Verify your name and password."
      );
      return;
    }

    onAuthenticated(res.doctor, false);
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#F3F6FA] py-12 px-4 sm:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B5683]">
              <Stethoscope className="w-4 h-4" />
              <span>
                {isAr
                  ? "بوابة الأطباء المعتمدة"
                  : "Doctor Dashboard Authentication"}
              </span>
            </div>

            <button
              type="button"
              onClick={onBackToPatientPortal}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {isAr ? "العودة لواجهة المراجع" : "Back to Patient View"}
            </button>
          </div>

          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-slate-900">
            {authMode === "signin"
              ? isAr
                ? "تسجيل دخول الطبيب"
                : "Doctor Sign-In"
              : isAr
              ? "تسجيل طبيب جديد وتعيين كلمة المرور"
              : "Doctor Sign-Up & Password Setup"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isAr
              ? "سجّل الدخول مباشرة بحساب Gmail الصحيح والموثق، أو استخدم اسم الطبيب وتخصصك وكلمة المرور للدخول إلى لوحة استفسارات المراجعين."
              : "Sign in directly with your verified @gmail.com account in one click, or authenticate with your doctor name, specialty, and password."}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F3F6FA] border border-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode("signin");
              setErrorMessage(null);
            }}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              authMode === "signin"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isAr ? "تسجيل دخول الطبيب" : "Doctor Sign-In"}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode("register");
              setErrorMessage(null);
            }}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              authMode === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isAr ? "تعيين وتأكيد كلمة مرور جديدة" : "Set & Confirm Password"}
          </button>
        </div>

        {/* DIRECT 1-CLICK GMAIL SIGN-IN */}
        <div className="space-y-2.5">
          <GoogleGmailSignInButton
            label={
              isAr
                ? "تسجيل دخول الطبيب مباشرة عبر Gmail"
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
              ? "يتم التحقق عبر Google — يُسمح بالدخول المباشر فقط لحسابات @gmail.com الصحيحة."
              : "Instant direct login when verified with a valid @gmail.com Google account."}
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-200" />
          <span className="shrink-0 px-3 text-[11px] font-medium text-slate-400">
            {isAr ? "أو عبر الاسم وكلمة المرور" : "or continue with password"}
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs font-medium text-[#DC2626]">
            {errorMessage}
          </div>
        )}

        {/* Password Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Doctor Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              {isAr ? "اسم الطبيب بالكامل *" : "Doctor Name *"}
            </label>
            <input
              type="text"
              required
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder={
                isAr ? "مثال: د. أحمد..." : "e.g., Dr. Ahmed / Dr. Daniel"
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
            />
          </div>

          {/* 2. What Doctor They Are (Specialty) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              {isAr
                ? "ما هو تخصصك الطبي؟ *"
                : "What Doctor Are You? (Medical Specialty) *"}
            </label>
            <select
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683] cursor-pointer"
            >
              {DOCTOR_SPECIALTY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {isAr ? opt.labelAr : opt.labelEn}
                </option>
              ))}
              <option value="custom">
                {isAr
                  ? "تخصص طبي آخر (اكتب تخصصك)"
                  : "Other Specialty (Enter Manually)"}
              </option>
            </select>

            {selectedSpecialtyId === "custom" && (
              <input
                type="text"
                required
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                placeholder={
                  isAr
                    ? "اكتب مسماك وتخصصك الطبي..."
                    : "Enter your medical specialty (e.g., Surgical Urologist)"
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
              />
            )}
          </div>

          {/* Optional Gmail Link on Manual Registration */}
          {authMode === "register" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                {isAr
                  ? "بريد Gmail للطبيب (اختياري للربط المباشر)"
                  : "Doctor Gmail Address (Optional @gmail.com)"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={doctorGmail}
                  onChange={(e) => setDoctorGmail(e.target.value)}
                  placeholder="doctor.name@gmail.com"
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                />
              </div>
            </div>
          )}

          {/* 3. Password Fields */}
          {authMode === "register" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  {isAr ? "كلمة المرور الجديدة *" : "New Password *"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isAr ? "6 أحرف على الأقل" : "Min. 6 characters"}
                    className="w-full ps-4 pe-10 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
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
                  {isAr ? "تأكيد كلمة المرور *" : "Confirm New Password *"}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={
                      isAr ? "أعد كتابة كلمة المرور" : "Re-enter same password"
                    }
                    className={`w-full ps-4 pe-10 py-2.5 rounded-xl bg-[#F8FAFC] border text-sm text-slate-900 focus:outline-none focus:bg-white ${
                      passwordsMismatch
                        ? "border-[#DC2626] focus:border-[#DC2626]"
                        : passwordsMatch
                        ? "border-[#059669] focus:border-[#059669]"
                        : "border-slate-200 focus:border-[#1B5683]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
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
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                {isAr ? "كلمة المرور *" : "Password *"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder={
                    isAr ? "أدخل كلمة المرور الخاصة بك" : "Enter your password"
                  }
                  className="w-full ps-4 pe-10 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1B5683]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
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

          {/* Live Password Match Feedback */}
          {authMode === "register" && confirmPassword.length > 0 && (
            <div
              className={`text-xs flex items-center gap-1.5 font-medium ${
                passwordsMatch ? "text-[#059669]" : "text-[#DC2626]"
              }`}
            >
              {passwordsMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isAr
                      ? "تم تأكيد تطابق كلمة المرور بنجاح."
                      : "Passwords match — ready to enter Doctor Dashboard."}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    {newPassword.length < 6
                      ? isAr
                        ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل."
                        : "Password must be at least 6 characters."
                      : isAr
                      ? "كلمتا المرور غير متطابقتين بعد."
                      : "Passwords do not match yet."}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting || isGmailLoading}
            className="w-full py-3 px-6 rounded-xl bg-[#1B5683] text-white text-sm font-semibold hover:bg-[#154468] disabled:opacity-60 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {isSubmitting
                ? isAr
                  ? "جارٍ التحقق والدخول..."
                  : "Authenticating Doctor..."
                : authMode === "register"
                ? isAr
                  ? "تأكيد البيانات والدخول للوحة الطبيب"
                  : "Confirm & Enter Doctor Dashboard"
                : isAr
                ? "تسجيل الدخول للوحة الطبيب"
                : "Sign In to Doctor Dashboard"}
            </span>
            {isAr ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>

          <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
            <span>
              {isAr
                ? "مصادقة موثقة عبر Google Gmail أو كلمة المرور المشفرة على Supabase."
                : "Verified Google @gmail.com OAuth & SHA-256 credentials stored on Supabase."}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
