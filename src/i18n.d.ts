import "i18next"; // before v13.0.0 -> import 'react-i18next';

import type translation from "./assets/langs/en/translation.json";

interface I18nNamespaces {
  translation: typeof translation;
}
// before v13.0.0 -> declare module 'react-i18next'
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: I18nNamespaces;
  }
}
