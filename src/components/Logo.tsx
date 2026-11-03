import React from 'react';
import { useAdminData } from '../admin/context/AdminDataContext';

interface LogoProps {
  className?: string;
  isUrdu?: boolean;
  lightMode?: boolean; // for dark backgrounds like footer
}

export const Logo: React.FC<LogoProps> = ({ className = "h-11", isUrdu = false, lightMode = false }) => {
  const { hospitalConfig } = useAdminData();
  const logoSrc = hospitalConfig?.logo || "/assets/aistudio/image_424d9421.png";
  const hospitalName = hospitalConfig?.name || "Dar al Dawa";

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official Hospital Emblem Logo */}
      <div className={`relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden p-0.5 flex items-center justify-center transition-all ${
        lightMode
          ? 'bg-white shadow-xs border border-white/20'
          : 'bg-white shadow-xs border border-slate-200/90'
      }`}>
        <img
          src={logoSrc}
          alt={hospitalName}
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-lg sm:text-xl font-heading leading-tight ${lightMode ? 'text-white' : 'text-[#1E5AA8]'}`}>
            {hospitalName}
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2E9E5B]" />
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
