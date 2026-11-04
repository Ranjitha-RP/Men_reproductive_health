"use client";

import React, { useState } from "react";
import { Check, Copy, Database, RefreshCw, X } from "lucide-react";
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_SQL_SETUP_SCRIPT,
} from "../lib/supabase";
import { Language } from "../types/clinical";

interface SupabaseSchemaModalProps {
  lang: Language;
  isOpen: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncError: string | null;
  onClose: () => void;
  onVerifyAndSync: () => void;
}

export const SupabaseSchemaModal: React.FC<SupabaseSchemaModalProps> = ({
  lang,
  isOpen,
  pendingCount,
  isSyncing,
  syncError,
  onClose,
  onVerifyAndSync,
}) => {
  const isAr = lang === "ar";
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3F6FA] border border-slate-200 text-[#1B5683] flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                {isAr
                  ? "مزامنة جداول Supabase (المراجعين والأطباء والمواعيد)"
                  : "Sync Supabase Tables (Patients, Doctors & Appointments)"}
              </h3>
              <p className="text-xs text-slate-500 font-mono-tabular">
                Project ID: {SUPABASE_PROJECT_ID}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {isAr
            ? "لحفظ حسابات المراجعين (الاسم، سنة الميلاد، الهاتف، المدينة، كلمة المرور) وحسابات الأطباء وطلبات المقابلة داخل مشروع Supabase الخاص بك، انسخ كود SQL أدناه وشغّله في Supabase SQL Editor ثم اضغط للتحقق والمزامنة."
            : "To persist Patient Login profiles (public.patients), Doctor Login accounts (public.doctors), and patient demographic + symptom columns on public.appointments, copy and run the SQL script below in your Supabase SQL Editor (Project: ytiwdumsfdrwxszxglep), then click Verify & Sync."}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {isAr
                ? "انسخ هذا الكود وشغّله في Supabase SQL Editor:"
                : "1. Copy & Run in Supabase Dashboard → SQL Editor:"}
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {copied
                  ? isAr
                    ? "تم نسخ SQL"
                    : "SQL Copied"
                  : isAr
                  ? "نسخ كود SQL"
                  : "Copy SQL Script"}
              </span>
            </button>
          </div>

          <pre
            dir="ltr"
            className="bg-[#0F172A] text-slate-200 rounded-xl p-4 text-[11px] font-mono-tabular leading-relaxed overflow-x-auto max-h-56"
          >
            {SUPABASE_SQL_SETUP_SCRIPT}
          </pre>
        </div>

        {syncError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            {syncError}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {pendingCount > 0
              ? isAr
                ? `يوجد ${pendingCount} حجز في الانتظار سيتم رفعه فور التفعيل.`
                : `${pendingCount} queued appointment(s) ready to flush into Supabase.`
              : isAr
              ? "بعد تشغيل الكود، اضغط للتحقق والمزامنة الفورية."
              : "2. After running the query in Supabase, verify to sync live."}
          </span>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              {isAr ? "لاحقاً" : "Later"}
            </button>

            <button
              type="button"
              disabled={isSyncing}
              onClick={onVerifyAndSync}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5683] text-white text-xs font-semibold hover:bg-[#154468] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span>
                {isSyncing
                  ? isAr
                    ? "جارٍ التحقق والمزامنة..."
                    : "Verifying & Syncing..."
                  : isAr
                  ? "تم تشغيل SQL — تحقق وزامن الآن"
                  : "Verify & Sync Appointments"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
