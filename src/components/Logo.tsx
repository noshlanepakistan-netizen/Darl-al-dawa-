import React from 'react';

interface LogoProps {
  className?: string;
  isUrdu?: boolean;
  lightMode?: boolean; // for dark backgrounds like footer
}

export const Logo: React.FC<LogoProps> = ({ className = "h-11", isUrdu = false, lightMode = false }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon: Modern Crescent + Medical Cross Hybrid Badge */}
      <div className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E5AA8] via-[#174886] to-[#0f3460] p-1.5 shadow-md flex items-center justify-center border border-white/20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
          {/* Medical Crescent (Hilal) */}
          <path
            d="M 68 18 C 42 22 26 44 26 66 C 26 82 38 94 54 96 C 36 94 20 78 20 58 C 20 34 38 14 62 10 C 65 9.5 67 10 68 18 Z"
            fill="#2E9E5B"
          />
          {/* Central Medical Cross */}
          <path
            d="M 46 32 H 58 V 44 H 70 V 56 H 58 V 68 H 46 V 56 H 34 V 44 H 46 Z"
            fill="#D62828"
          />
          {/* Subtle heartbeat pulse line */}
          <path
            d="M 30 50 L 40 50 L 44 42 L 48 58 L 52 46 L 56 50 L 70 50"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-lg sm:text-xl font-heading leading-tight ${lightMode ? 'text-white' : 'text-[#1E5AA8]'}`}>
            Dar al Dawa
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D62828]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] sm:text-xs font-semibold tracking-wider uppercase font-body ${lightMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Medical Center
          </span>
          <span className="text-[10px] text-slate-400 font-normal">|</span>
          <span className={`text-[11px] font-urdu ${lightMode ? 'text-emerald-400' : 'text-[#2E9E5B] font-semibold'}`}>
            دار الدواء میڈیکل سنٹر
          </span>
        </div>
      </div>
    </div>
  );
};
