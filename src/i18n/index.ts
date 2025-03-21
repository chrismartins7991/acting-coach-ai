import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import fr from './locales/fr';
import es from './locales/es';
import pt from './locales/pt';
import zh from './locales/zh';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      fr,
      es,
      pt,
      zh,
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;