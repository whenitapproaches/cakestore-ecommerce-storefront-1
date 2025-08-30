"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resource";

i18next.use(initReactI18next).init({
  resources,
  lng: "vi",
  fallbackLng: "vi",
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false, // This is important for SSR
  },
});

export default i18next;
