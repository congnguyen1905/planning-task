"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
        className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-sm border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors"
        title={t("language_switch")}
      >
        {language === "vi" ? "EN" : "VI"}
      </button>
    </div>
  );
}
