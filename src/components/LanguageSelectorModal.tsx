import React, { useState, useMemo } from 'react';
import { X, Search, Globe, Check, Sparkles, Languages } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext.js';
import { INDIAN_LANGUAGES, IndianLanguage } from '../i18n/languages.js';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useThemeLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  const regions = useMemo(() => {
    return [
      { id: 'ALL', label: 'All 23 Languages' },
      { id: 'National / Pan-India', label: 'National' },
      { id: 'South', label: 'South' },
      { id: 'North', label: 'North' },
      { id: 'East & North-East', label: 'East & NE' },
      { id: 'West & Central', label: 'West & Central' },
      { id: 'Classical', label: 'Classical' },
    ];
  }, []);

  const filteredLanguages = useMemo(() => {
    return INDIAN_LANGUAGES.filter((lang) => {
      const matchesSearch =
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.script.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion =
        selectedRegion === 'ALL' ||
        lang.region === selectedRegion ||
        (selectedRegion === 'Classical' &&
          ['te', 'ta', 'kn', 'ml', 'sa', 'or', 'bn', 'mr', 'as'].includes(lang.code));

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  if (!isOpen) return null;

  return (
    <div
      id="language-selector-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-full sm:max-w-3xl max-h-modal flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#090E1D] border border-slate-700 shadow-2xl text-slate-100 overflow-hidden overscroll-contain">
        {/* Header with Tricolor accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500"></div>

        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#070B16]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                  {t('language_selector')} • Indian Languages of Bharat
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  22 Official + English
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                8th Schedule of the Constitution of India & Official Judicial Languages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
            aria-label="Close language selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Region Filter */}
        <div className="p-4 sm:px-6 border-b border-slate-800 bg-[#060914] space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language name (e.g. Hindi, Telugu, தமிழ், Bengali, Marathi, Sanskrit)..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {regions.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedRegion === r.id
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-950'
                    : 'bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredLanguages.map((lang) => {
              const isSelected = language === lang.code;

              return (
                <div
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-950/70 via-slate-900 to-emerald-950/50 border-amber-500/80 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors block">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-slate-400 font-medium block">
                        {lang.name} • <span className="text-slate-500 font-mono text-[10px]">{lang.script}</span>
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-800">
                        {lang.code}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-amber-400/90 font-serif truncate pr-1">
                      {lang.motto}
                    </span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                      {lang.region}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No Indian languages match your search query &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-slate-800 bg-[#070B16] text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <AshokaChakraIcon size={16} className="text-amber-400" />
            <span>Currently Active: <strong className="text-amber-300">{filteredLanguages.find(l => l.code === language)?.nativeName || 'English'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer min-h-[38px]"
          >
            {t('btn_close')}
          </button>
        </div>
      </div>
    </div>
  );
};
