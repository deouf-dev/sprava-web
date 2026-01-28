"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { translations, Language, TranslationKeys } from "./translations";

type I18nContextValue = {
  language: Language;
  t: TranslationKeys;
  setLanguage: (lang: Language) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getPreferredLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  // Check localStorage for saved preference
  const saved = localStorage.getItem("sprava_lang");
  if (saved === "en" || saved === "fr") return saved;

  // Detect from navigator.language (browser/OS language)
  const browserLang = navigator.language?.toLowerCase() || "";

  // If starts with 'fr' (e.g., 'fr', 'fr-FR', 'fr-CA'), use French
  if (browserLang.startsWith("fr")) return "fr";

  // Default to English for everything else
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize with proper language on client
    if (typeof window !== "undefined") {
      return getPreferredLanguage();
    }
    return "fr";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("sprava_lang", lang);
  }, []);

  const t = translations[language];

  // Prevent hydration mismatch by using default language on server
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ language: "fr", t: translations.fr, setLanguage }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
