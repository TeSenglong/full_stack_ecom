import en from "@/messages/en.json";
import kh from "@/messages/kh.json";

export type Language = "en" | "kh";
export type Messages = typeof en;

export const LANGUAGE_COOKIE = "mohaori_language";
export const dictionaries: Record<Language, Messages> = { en, kh };

export function getLanguage(value: string | undefined): Language {
  return value === "kh" ? "kh" : "en";
}
