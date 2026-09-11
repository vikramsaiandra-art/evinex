import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INDIAN_LANGUAGES, IndianLanguage } from '../i18n/languages.js';
import { TRANSLATIONS, TranslationKey, translate } from '../i18n/translations.js';

export type NationalTheme = 'tiranga' | 'swarna_kesari' | 'ashoka_navy' | 'cyber_bharat';
export type BackgroundStyle = 'vibrant_national' | 'subtle_watermark' | 'ambient_glow';

export interface ThemeDetails {
  id: NationalTheme;
  name: string;
  nativeName: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgClass: string;
  cardClass: string;
  borderGradient: string;
  previewColors: [string, string, string];
}

export const NATIONAL_THEMES: Record<NationalTheme, ThemeDetails> = {
  tiranga: {
    id: 'tiranga',
    name: 'Tiranga Rashtriya',
    nativeName: 'राष्ट्रीय तिरंगा (केसरिया, श्वेत, हरित)',
    tagline: 'The Pride of the Republic of India',
    description: 'Deep Indian Saffron (#FF9933), Sacred White, and India Green (#138808) with the 24-spoke Navy Ashoka Chakra.',
    primaryColor: '#FF9933',
    accentColor: '#138808',
    bgClass: 'bg-[#070B16]',
    cardClass: 'bg-[#0B1222] border-slate-700/80',
    borderGradient: 'from-amber-500 via-slate-100 to-emerald-600',
    previewColors: ['#FF9933', '#FFFFFF', '#138808'],
  },
  swarna_kesari: {
    id: 'swarna_kesari',
    name: 'Swarna & Kesari',
    nativeName: 'स्वर्ण एवं केसरी (शाही विरासत)',
    tagline: 'Classical Heritage Gold & Royal Saffron',
    description: 'Auspicious temple gold, vibrant marigold amber, and deep royal saffron reminiscent of Bharat’s majestic heritage.',
    primaryColor: '#EA580C',
    accentColor: '#D97706',
    bgClass: 'bg-[#0E0905]',
    cardClass: 'bg-[#150F08] border-amber-900/60',
    borderGradient: 'from-amber-500 via-yellow-400 to-orange-600',
    previewColors: ['#EA580C', '#F59E0B', '#78350F'],
  },
  ashoka_navy: {
    id: 'ashoka_navy',
    name: 'Ashoka Nyaya',
    nativeName: 'अशोक न्याय (न्यायिक गहरा नीला)',
    tagline: 'Supreme Court & Judicial Dignity',
    description: 'Deep midnight navy blue inspired by the Supreme Court of India and High Courts, adorned with the Ashoka pillar insignia.',
    primaryColor: '#1D4ED8',
    accentColor: '#EAB308',
    bgClass: 'bg-[#050A19]',
    cardClass: 'bg-[#0A132C] border-blue-900/60',
    borderGradient: 'from-blue-600 via-sky-400 to-amber-500',
    previewColors: ['#1E3A8A', '#38BDF8', '#EAB308'],
  },
  cyber_bharat: {
    id: 'cyber_bharat',
    name: 'Cyber Bharat',
    nativeName: 'साइबर भारत (डिजिटल ढाल)',
    tagline: 'Digital India Cyber Defense Matrix',
    description: 'High-tech cybersecurity dark theme with illuminated Indian tricolor telemetry, neon cryptographic seals, and live ledger audits.',
    primaryColor: '#06B6D4',
    accentColor: '#10B981',
    bgClass: 'bg-[#040813]',
    cardClass: 'bg-[#081024] border-cyan-900/60',
    borderGradient: 'from-cyan-500 via-amber-400 to-emerald-500',
    previewColors: ['#06B6D4', '#F97316', '#10B981'],
  },
};

interface ThemeLanguageContextType {
  theme: NationalTheme;
  themeDetails: ThemeDetails;
  setTheme: (theme: NationalTheme) => void;
  language: string;
  languageDetails: IndianLanguage;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (open: boolean) => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
  backgroundStyle: BackgroundStyle;
  setBackgroundStyle: (style: BackgroundStyle) => void;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'evinex_national_theme';
const LANG_STORAGE_KEY = 'evinex_indian_language';
const BG_STORAGE_KEY = 'evinex_background_style';

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<NationalTheme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as NationalTheme) || 'tiranga';
  });

  const [language, setLanguageState] = useState<string>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved || 'en';
  });

  const [backgroundStyle, setBackgroundStyleState] = useState<BackgroundStyle>(() => {
    const saved = localStorage.getItem(BG_STORAGE_KEY);
    return (saved as BackgroundStyle) || 'vibrant_national';
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const setTheme = (newTheme: NationalTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setLanguage = (newLang: string) => {
    setLanguageState(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    document.documentElement.setAttribute('lang', newLang);
  };

  const setBackgroundStyle = (style: BackgroundStyle) => {
    setBackgroundStyleState(style);
    localStorage.setItem(BG_STORAGE_KEY, style);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', language);
  }, [theme, language]);

  const themeDetails = useMemo(() => {
    return NATIONAL_THEMES[theme] || NATIONAL_THEMES.tiranga;
  }, [theme]);

  const languageDetails = useMemo(() => {
    const found = INDIAN_LANGUAGES.find((l) => l.code === language);
    return found || INDIAN_LANGUAGES[0];
  }, [language]);

  const t = (key: TranslationKey, fallback?: string): string => {
    return translate(key, language, fallback);
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        themeDetails,
        setTheme,
        language,
        languageDetails,
        setLanguage,
        t,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        isThemeModalOpen,
        setIsThemeModalOpen,
        backgroundStyle,
        setBackgroundStyle,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = (): ThemeLanguageContextType => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
