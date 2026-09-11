import React from 'react';

interface AshokaChakraIconProps {
  className?: string;
  size?: number;
}

export const AshokaChakraIcon: React.FC<AshokaChakraIconProps> = ({ className = 'text-blue-500', size = 24 }) => {
  // Generate 24 spokes for the Ashok Chakra
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    return (
      <line
        key={i}
        x1="50"
        y1="50"
        x2="50"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        transform={`rotate(${angle} 50 50)`}
      />
    );
  });

  return (
    <svg
      id="ashoka-chakra-svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ashok Chakra Emblem"
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="4.5" />
      {/* Secondary inner ring */}
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      {/* 24 Spokes */}
      {spokes}
      {/* Central hub */}
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      <circle cx="50" cy="50" r="4" fill="#080D1A" />
    </svg>
  );
};

export const NationalEmblemSeal: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div id="national-emblem-seal" className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-blue-900/40 border border-amber-500/40 shadow-inner">
        <AshokaChakraIcon size={20} className="text-amber-400" />
      </div>
      <div className="flex flex-col">
        <span className="font-serif text-[10px] tracking-widest text-amber-300 font-semibold uppercase leading-none">
          सत्यमेव जयते
        </span>
        <span className="text-[9px] tracking-wider text-slate-400 font-medium">
          Digital Evidentiary Repository of India
        </span>
      </div>
    </div>
  );
};
