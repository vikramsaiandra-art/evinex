import React from 'react';
import { Languages, Palette, ShieldCheck } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext.js';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

export const IndianNationalRibbon: React.FC = () => {
  const { themeDetails, languageDetails, setIsLanguageModalOpen, setIsThemeModalOpen, t } =
    useThemeLanguage();

  return (
    <div
      id="indian-national-ribbon"
      className="w-full bg-[#050914] border-b border-slate-800/90 text-xs select-none"
    >
      {/* 3-color fine gradient bar */}
      <div
        className={`h-[3px] w-full bg-gradient-to-r ${themeDetails.borderGradient} transition-all duration-300`}
      ></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2 text-[11px]">
        {/* Left: National Emblem, Motto & BSA Compliance */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Indian Flag Micro Badge */}
            <div className="flex flex-col w-4 h-3 rounded-[2px] overflow-hidden border border-black/40 shadow-xs shrink-0">
              <div className="h-1 bg-[#FF9933]"></div>
              <div className="h-1 bg-[#FFFFFF] flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-[#000080]"></div>
              </div>
              <div className="h-1 bg-[#138808]"></div>
            </div>

            <AshokaChakraIcon size={14} className="text-amber-400 shrink-0" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="font-serif font-bold text-amber-300 tracking-wider hidden sm:inline">
              सत्यमेव जयते
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 font-medium truncate">
              {t('republic_of_india')}
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline font-mono text-[10px] text-amber-400/90 truncate">
              {t('statutory_compliance')}
            </span>
          </div>
        </div>

        {/* Right: Quick Language & Theme Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Selector Trigger */}
          <button
            id="open-language-selector-btn"
            onClick={() => setIsLanguageModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-750 hover:border-amber-500/50 transition-all cursor-pointer text-[11px]"
            title="Switch language (22 Indian languages + English)"
          >
            <Languages className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-bold text-amber-300 truncate max-w-[80px] sm:max-w-[120px]">
              {languageDetails.nativeName}
            </span>
            <span className="text-[9px] uppercase font-mono text-slate-400 px-1 py-0.2 rounded bg-slate-800">
              {languageDetails.code}
            </span>
          </button>

          {/* Theme Selector Trigger */}
          <button
            id="open-theme-selector-btn"
            onClick={() => setIsThemeModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-750 hover:border-amber-500/50 transition-all cursor-pointer text-[11px]"
            title="Switch Indian national theme"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xs:inline text-slate-300 font-medium">
              {themeDetails.name.split(' ')[0]}
            </span>
            {/* Color dots preview */}
            <div className="flex items-center -space-x-0.5">
              {themeDetails.previewColors.map((c, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full border border-black/40"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
