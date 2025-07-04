import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import resources from "virtual:i18next-loader";

i18n
  .use(LanguageDetector) // See https://github.com/i18next/i18next-browser-languageDetector
  .use(initReactI18next) // See https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    resources: resources,
  });

export default i18n;

export const languageToFlag: Record<string, string> = {
  en: "us",
  fr: "fr",
};
