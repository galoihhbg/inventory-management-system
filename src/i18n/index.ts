import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import viTranslation from './locales/vi.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

// Lưu ngôn ngữ đã chọn vào localStorage
const savedLanguage = localStorage.getItem('language') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // ngôn ngữ mặc định
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    debug: false,
  });

// Lưu ngôn ngữ khi thay đổi
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;