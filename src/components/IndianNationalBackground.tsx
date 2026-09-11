import React from 'react';
import { useThemeLanguage, NationalTheme } from '../context/ThemeLanguageContext.js';

interface IndianNationalBackgroundProps {
  className?: string;
}

export const IndianNationalBackground: React.FC<IndianNationalBackgroundProps> = ({ className = '' }) => {
  const { theme, themeDetails, backgroundStyle } = useThemeLanguage();

  // Generate 24 spokes for the background watermark Ashoka Chakra
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    return (
      <line
        key={i}
        x1="250"
        y1="250"
        x2="250"
        y2="40"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        transform={`rotate(${angle} 250 250)`}
      />
    );
  });

  return (
    <div
      id="indian-national-background-container"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Theme-Specific Radiant Ambient Lights */}
      {theme === 'tiranga' && (
        <>
          {/* Top Saffron / Kesariya Radiance */}
          <div className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full bg-[#FF9933]/15 blur-[120px] transform-gpu"></div>
          <div className="absolute top-1/4 right-0 w-[450px] h-[450px] rounded-full bg-[#FF7700]/10 blur-[140px] transform-gpu"></div>

          {/* Central Sacred White / Ashoka Navy Radiance */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-900/15 blur-[150px] transform-gpu"></div>

          {/* Bottom India Green Radiance */}
          <div className="absolute -bottom-32 -right-20 w-[650px] h-[650px] rounded-full bg-[#138808]/15 blur-[130px] transform-gpu"></div>
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-[#0d5c06]/15 blur-[120px] transform-gpu"></div>
        </>
      )}

      {theme === 'swarna_kesari' && (
        <>
          {/* Rich Vedic Gold & Royal Saffron Ambient Blooms */}
          <div className="absolute -top-20 -left-10 w-[600px] h-[600px] rounded-full bg-amber-500/15 blur-[130px] transform-gpu"></div>
          <div className="absolute top-1/3 right-10 w-[550px] h-[550px] rounded-full bg-orange-600/15 blur-[140px] transform-gpu"></div>
          <div className="absolute -bottom-20 left-1/4 w-[600px] h-[600px] rounded-full bg-yellow-600/15 blur-[140px] transform-gpu"></div>
        </>
      )}

      {theme === 'ashoka_navy' && (
        <>
          {/* Supreme Court Midnight Navy & Golden Justice Rays */}
          <div className="absolute -top-24 left-1/3 w-[650px] h-[650px] rounded-full bg-blue-600/15 blur-[140px] transform-gpu"></div>
          <div className="absolute top-1/2 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-700/15 blur-[130px] transform-gpu"></div>
          <div className="absolute -bottom-20 right-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px] transform-gpu"></div>
        </>
      )}

      {theme === 'cyber_bharat' && (
        <>
          {/* Cybernetic Digital Bharat Matrix */}
          <div className="absolute -top-20 -left-20 w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[120px] transform-gpu"></div>
          <div className="absolute top-1/2 right-10 w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[130px] transform-gpu"></div>
          <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-[120px] transform-gpu"></div>
        </>
      )}

      {/* 2. Indian Traditional Architectural Jaali (Lattice) / Mandala Pattern */}
      {backgroundStyle !== 'ambient_glow' && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] text-amber-300"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="indian-jaali-lattice"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              {/* Central 8-Point Indian Star & Floral Petal Motif */}
              <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="0.75" />
              {/* Diagonal Cross-lines forming Mughal/Vedic geometric jaali */}
              <line x1="0" y1="0" x2="80" y2="80" stroke="currentColor" strokeWidth="0.75" />
              <line x1="80" y1="0" x2="0" y2="80" stroke="currentColor" strokeWidth="0.75" />
              <line x1="40" y1="0" x2="40" y2="80" stroke="currentColor" strokeWidth="0.75" />
              <line x1="0" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="0.75" />
              {/* Corner rosettes */}
              <circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="80" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="0" cy="80" r="12" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="80" cy="80" r="12" fill="none" stroke="currentColor" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#indian-jaali-lattice)" />
        </svg>
      )}

      {/* 3. The Grand 24-Spoke Ashoka Chakra Watermark */}
      <div
        className={`absolute -right-24 -bottom-24 sm:-right-20 sm:-bottom-20 md:right-10 md:top-1/2 md:-translate-y-1/2 w-[380px] h-[380px] sm:w-[520px] sm:h-[520px] lg:w-[680px] lg:h-[680px] transition-opacity duration-700 ${
          backgroundStyle === 'ambient_glow' ? 'opacity-0' : 'opacity-[0.045]'
        }`}
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full text-slate-100 animate-[spin_240s_linear_infinite]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main outer rings */}
          <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="8" />
          <circle cx="250" cy="250" r="215" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 4" />
          <circle cx="250" cy="250" r="195" stroke="currentColor" strokeWidth="3" />

          {/* 24 Radial Spokes */}
          {spokes}

          {/* Hub circles */}
          <circle cx="250" cy="250" r="45" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="5" />
          <circle cx="250" cy="250" r="22" stroke="currentColor" strokeWidth="3" />
          <circle cx="250" cy="250" r="8" fill="currentColor" />
        </svg>
      </div>

      {/* 4. Satyameva Jayate (सत्यमेव जयते) Watermark */}
      <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 flex flex-col pointer-events-none opacity-[0.06] select-none">
        <span className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-widest text-amber-300">
          सत्यमेव जयते
        </span>
        <span className="text-[10px] sm:text-xs font-serif tracking-[0.3em] uppercase text-slate-300 mt-1">
          TRUTH ALONE TRIUMPHS • REPUBLIC OF INDIA
        </span>
      </div>

      {/* 5. Indian Tricolor Edge Vignette (Saffron Top Bar, Green Bottom Bar) */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF9933]/30 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#138808]/30 to-transparent"></div>
    </div>
  );
};
