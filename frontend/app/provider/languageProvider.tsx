"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  dictionaries,
  LANGUAGE_COOKIE,
  type Language,
  type Messages,
} from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  messages: Messages;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: ReactNode;
}) {
  const [language, updateLanguage] = useState(initialLanguage);

  function setLanguage(nextLanguage: Language) {
    updateLanguage(nextLanguage);
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LANGUAGE_COOKIE}=${nextLanguage}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  }

  return (
    <LanguageContext.Provider
      value={{ language, messages: dictionaries[language], setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
