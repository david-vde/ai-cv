import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from '../public/locales/fr/translation.json';
import translationEN from '../public/locales/en/translation.json';
import translationNL from '../public/locales/nl/translation.json';

const resources = {
  fr: { translation: translationFR },
  en: { translation: translationEN },
  nl: { translation: translationNL }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    },
    load: 'languageOnly',
  });

export default i18n;