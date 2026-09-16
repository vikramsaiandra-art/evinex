import React from 'react';
import { X, Check, Palette, Sparkles, Shield, Image, Eye } from 'lucide-react';
import {
  useThemeLanguage,
  NATIONAL_THEMES,
  NationalTheme,
  BackgroundStyle,
} from '../context/ThemeLanguageContext.js';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, backgroundStyle, setBackgroundStyle, t } = useThemeLanguage();

  if (!isOpen) return null;

  const themesList = Object.values(NATIONAL_THEMES);

  const backgroundOptions: { id: BackgroundStyle; label: string; desc: string }[] = [
    {
      id: 'vibrant_national',
      label: 'Vibrant National Art',
      desc: 'Tricolor glowing blooms + 24-spoke Ashoka Chakra watermark + Indian Jaali lattice + Satyameva Jayate insignia',
    },
    {
      id: 'subtle_watermark',
      label: 'Subtle Ashoka Watermark',
      desc: 'Gentle rotating 24-spoke Ashoka Chakra and fine geometric Indian lattice pattern',
    },
    {
      id: 'ambient_glow',
      label: 'Ambient National Glow',
      desc: 'Clean national lighting with subtle Saffron & India Green corner auroras',
    },
  ];

  return (
    <div
      id="theme-selector-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-full sm:max-w-2xl max-h-modal flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#090E1D] border border-slate-700 shadow-2xl text-slate-100 overflow-hidden overscroll-contain">
        {/* Header Tricolor Band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#070B16]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-white/10 to-emerald-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                  {t('theme_selector')} • Indian Themes & Backgrounds
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  National Motifs
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Authentic visual motifs of Bharat: Tiranga, Vedic Gold, Judicial Blue & Cyber Bharat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
            aria-label="Close theme selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes & Background Options Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: Themes */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Select Indian National Theme
              </span>
              <span className="text-[10px] text-amber-400/90 font-serif">
                सत्यमेव जयते
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themesList.map((th) => {
                const isSelected = theme === th.id;

                return (
                  <div
                    key={th.id}
                    onClick={() => setTheme(th.id as NationalTheme)}
                    className={`group relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-slate-900 to-black/90 border-amber-500 ring-2 ring-amber-500/50 shadow-xl shadow-amber-950/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      {/* Color Swatch Bar */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {th.previewColors.map((c, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-black/50 shadow-inner"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>

                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono uppercase group-hover:text-amber-400 transition-colors">
                            Select
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {th.name}
                      </h4>
                      <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                        {th.nativeName}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        {th.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono">{th.tagline}</span>
                      <AshokaChakraIcon size={12} className={isSelected ? 'text-amber-400' : 'text-slate-600'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Indian Background Visual Style */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5 mb-2.5">
              <Image className="w-3.5 h-3.5 text-sky-400" />
              Indian Background Motif & Watermark
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {backgroundOptions.map((opt) => {
                const isSelected = backgroundStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setBackgroundStyle(opt.id)}
                    type="button"
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 text-slate-100 ring-1 ring-amber-500/50'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-200">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-t border-slate-800 bg-[#070B16] text-xs text-slate-400">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Background motifs and colors adapt instantly across all dashboards and modals.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer min-h-[38px]"
          >
            {t('btn_close')}
          </button>
        </div>
      </div>
    </div>
  );
};
