import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, TranslationSchema } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('earbalancer_lang');
      if (saved === 'en' || saved === 'ko') return saved;
      // 브라우저 언어 감지
      if (typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().startsWith('en')) {
        return 'en';
      }
      return 'ko';
    } catch {
      return 'ko';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('earbalancer_lang', newLang);
    } catch (e) {
      console.error('Failed to save language to localStorage:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value: LanguageContextType = {
    lang,
    setLang,
    t: translations[lang],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
