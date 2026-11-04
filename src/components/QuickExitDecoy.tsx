"use client";

import React, { useState } from "react";
import { CloudSun, TrendingUp, Globe, Search, ArrowUpRight, Bookmark } from "lucide-react";
import { Language } from "../types/clinical";

interface QuickExitDecoyProps {
  lang: Language;
  onRestoreSession: () => void;
}

export const QuickExitDecoy: React.FC<QuickExitDecoyProps> = ({
  lang,
  onRestoreSession,
}) => {
  const isAr = lang === "ar";
  const [activeCategory, setActiveCategory] = useState<"markets" | "logistics" | "energy">("markets");

  const articles = [
    {
      id: "m1",
      cat: "markets",
      kicker: isAr ? "أسواق الخليج · تحديث الصباح" : "Gulf Markets · Morning Brief",
      title: isAr
        ? "مؤشرات أبوظبي ودبي المالية تسجل نمواً متوازناً بدعم من قطاعي البنية التحتية والتكنولوجيا"
        : "Abu Dhabi and Dubai equity benchmarks advance on steady infrastructure and logistics volume",
      summary: isAr
        ? "شهدت جلسات التداول الصباحية استقراراً في عوائد السندات الإقليمية وارتفاعاً في سيولة الشركات الصناعية غير النفطية."
        : "Regional fixed-income yields remained steady in early trading as non-oil industrial and port logistics equities led quarterly gains.",
      readTime: isAr ? "3 دقائق قراءة" : "3 min read",
    },
    {
      id: "m2",
      cat: "logistics",
      kicker: isAr ? "التجارة وسلاسل الإمداد" : "Maritime & Supply Chain",
      title: isAr
        ? "موانئ الخليج توسع ممرات الشحن الآلي لربط مراكز التوزيع في آسيا وأوروبا"
        : "Automated container corridors expand across Gulf ports, trimming transit turnaround by 14%",
      summary: isAr
        ? "الاستثمارات الجديدة في أنظمة الجدولة الذكية ترفع كفاءة مناولة الحاويات وتقلل استهلاك الطاقة في المرافق الساحلية."
        : "New terminal scheduling upgrades streamline freight customs clearance and lower berth idle times across major regional hubs.",
      readTime: isAr ? "4 دقائق قراءة" : "4 min read",
    },
    {
      id: "m3",
      cat: "energy",
      kicker: isAr ? "الطاقة النظيفة والاستدامة" : "Clean Grid & Desalination",
      title: isAr
        ? "محطات الطاقة الشمسية الجديدة تضيف 1.8 جيجاواط لشبكة الكهرباء الإقليمية قبل ذروة الصيف"
        : "Utility-scale solar storage arrays add 1.8 GW of dispatchable evening capacity across the peninsula",
      summary: isAr
        ? "تتكامل بطاريات التخزين الحراري والكهربائي مع شبكات النقل الحديثة لتعزيز استقرار الإمدادات الصناعية."
        : "Grid-scale battery installations pair with reverse-osmosis desalination plants to balance industrial peak demand.",
      readTime: isAr ? "5 دقائق قراءة" : "5 min read",
    },
  ];

  const visibleArticles =
    activeCategory === "markets"
      ? articles
      : articles.filter((a) => a.cat === activeCategory || a.id === "m1");

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col"
    >
      {/* Neutral Daily Brief Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-700" />
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              {isAr ? "الأفق الاقتصادي اليومي" : "Al-Ufuq Daily Brief"}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <button
              onClick={() => setActiveCategory("markets")}
              className={`hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === "markets" ? "text-slate-900 font-semibold" : ""
              }`}
            >
              {isAr ? "الأسواق المالية" : "Markets"}
            </button>
            <button
              onClick={() => setActiveCategory("logistics")}
              className={`hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === "logistics" ? "text-slate-900 font-semibold" : ""
              }`}
            >
              {isAr ? "النقل واللوجستيات" : "Logistics"}
            </button>
            <button
              onClick={() => setActiveCategory("energy")}
              className={`hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === "energy" ? "text-slate-900 font-semibold" : ""
              }`}
            >
              {isAr ? "الطاقة والصناعة" : "Energy & Grid"}
            </button>
          </nav>

          <div className="flex items-center gap-4 text-xs text-slate-600 tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-500" />
              {isAr ? "أبوظبي 29°C · صافٍ" : "Abu Dhabi 29°C · Clear"}
            </span>
          </div>
        </div>
      </header>

      {/* Market Ticker Row */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2.5 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono-tabular">
          <div className="flex items-center gap-6">
            <span>ADX GENERAL 9,412.80 (+0.64%)</span>
            <span>DFM INDEX 4,618.15 (+0.82%)</span>
            <span>BRENT CRUDE $74.90 (+0.31%)</span>
          </div>
          <span className="text-slate-400">
            {isAr ? "تحديث مباشر · جلسة الصباح" : "Market Desk · Morning Session"}
          </span>
        </div>
      </div>

      {/* Main News Reader Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h1 className="text-xl font-semibold text-slate-900">
              {isAr ? "أبرز التقارير الاقتصادية الصباحية" : "Top Regional Economic Dispatches"}
            </h1>
            <span className="text-xs text-slate-500">
              {isAr ? "الخميس · نشرة الأعمال" : "Thursday · Business Desk"}
            </span>
          </div>

          {visibleArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{article.kicker}</span>
                <span>{article.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 leading-snug">
                {article.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{article.summary}</p>
              <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-700">
                <span className="inline-flex items-center gap-1">
                  {isAr ? "قراءة التقرير الكامل" : "Read dispatch"}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Bookmark className="w-3.5 h-3.5" />
                  {isAr ? "حفظ للقراءة" : "Save"}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Weather & Currency Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {isAr ? "حالة الطقس الإقليمية" : "Regional Weather Forecast"}
              </h3>
              <CloudSun className="w-5 h-5 text-sky-600" />
            </div>
            <div className="space-y-3 text-sm tabular-nums">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">{isAr ? "أبوظبي" : "Abu Dhabi"}</span>
                <span className="font-medium text-slate-900">29°C / 22°C</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">{isAr ? "دبي" : "Dubai"}</span>
                <span className="font-medium text-slate-900">30°C / 23°C</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">{isAr ? "الرياض" : "Riyadh"}</span>
                <span className="font-medium text-slate-900">27°C / 18°C</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">{isAr ? "الدوحة" : "Doha"}</span>
                <span className="font-medium text-slate-900">28°C / 21°C</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {isAr ? "أسعار الصرف المرجعية" : "Currency Exchange Desk"}
              </h3>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-2.5 text-xs font-mono-tabular text-slate-700">
              <div className="flex justify-between">
                <span>USD / AED</span>
                <span>3.6725</span>
              </div>
              <div className="flex justify-between">
                <span>EUR / AED</span>
                <span>3.9840</span>
              </div>
              <div className="flex justify-between">
                <span>GBP / AED</span>
                <span>4.7610</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <label className="block text-xs font-medium text-slate-500 mb-2">
              {isAr ? "بحث في أرشيف الأخبار" : "Search Market Archives"}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 start-3" />
              <input
                type="text"
                placeholder={isAr ? "الشركات، الموانئ، السندات..." : "Equities, ports, yields..."}
                className="w-full ps-9 pe-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </aside>
      </main>

      {/* Discreet Footer with Subtle Session Return */}
      <footer className="bg-white border-t border-slate-200 py-5 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            {isAr
              ? "© 2026 الأفق للنشر الاقتصادي والمالي. جميع الحقوق محفوظة."
              : "© 2026 Al-Ufuq Financial Publishing. All rights reserved."}
          </span>
          <button
            onClick={onRestoreSession}
            className="text-slate-400 hover:text-slate-700 underline underline-offset-4 transition-colors cursor-pointer"
          >
            {isAr ? "استعادة مساحة العمل السابقة" : "Return to previous workspace"}
          </button>
        </div>
      </footer>
    </div>
  );
};
