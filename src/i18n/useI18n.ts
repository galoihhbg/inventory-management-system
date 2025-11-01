import { useTranslation } from 'react-i18next';

// Hook tiện ích để sử dụng i18n trong toàn bộ ứng dụng
export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const isVietnamese = () => {
    return i18n.language === 'vi';
  };

  const isEnglish = () => {
    return i18n.language === 'en';
  };

  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    isVietnamese,
    isEnglish,
  };
};

export default useI18n;