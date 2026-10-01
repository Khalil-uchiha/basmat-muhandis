import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const languages = [
  { code: "en", label: "English", short: "EN", dir: "ltr" },
  { code: "fr", label: "Français", short: "FR", dir: "ltr" },
  { code: "ar", label: "العربية", short: "AR", dir: "rtl" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export const dirFor = (code: string): "ltr" | "rtl" =>
  languages.find((l) => l.code === code)?.dir === "rtl" ? "rtl" : "ltr";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: languages.map((l) => l.code),
    // The club asked for English as the first-visit default; a stored choice wins.
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "bm-lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

/** Keep <html lang> and <html dir> in step with the active language. */
const applyDocumentLanguage = (code: string) => {
  const root = document.documentElement;
  root.lang = code;
  root.dir = dirFor(code);
};

applyDocumentLanguage(i18n.resolvedLanguage || "en");
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
