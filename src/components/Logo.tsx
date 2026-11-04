import React from 'react';
import { useAdminData } from '../admin/context/AdminDataContext';

interface LogoProps {
  className?: string;
  isUrdu?: boolean;
  lightMode?: boolean; // for dark backgrounds like footer
}

export const Logo: React.FC<LogoProps> = ({ className = "", isUrdu = false, lightMode = false }) => {
  const { hospitalConfig } = useAdminData();
  const logoSrc = hospitalConfig?.logo || "/assets/aistudio/image_424d9421.png";
  
  // Hospital brand name (Medical Center shown only ONCE on Line 1)
  const englishName = "Dar al Dawa Medical Center";
  
  // Urdu hospital name on Line 2 (using standard Urdu spelling)
  const urduName = hospitalConfig?.nameUrdu?.replace(/\s+/g, '') === 'دارالدواءمیڈیکلسنٹر'
    ? hospitalConfig.nameUrdu
    : "دارالدواء میڈیکل سنٹر";

  return (
    <div className={`flex items-center gap-1.5 min-[340px]:gap-2 sm:gap-3 select-none min-w-0 ${className}`}>
      {/* Official Hospital Emblem Logo Icon (Responsive scaling for mobile & desktop) */}
      <div className={`relative shrink-0 w-7 h-7 min-[340px]:w-8 min-[340px]:h-8 min-[400px]:w-9 min-[400px]:h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl overflow-hidden p-0.5 flex items-center justify-center transition-all ${
        lightMode
          ? 'bg-white shadow-xs border border-white/20'
          : 'bg-white shadow-xs border border-slate-200/90'
      }`}>
        <img
          src={logoSrc}
          alt={englishName}
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      {/* Hospital Logo Typography: Clean 2-Line Structure */}
      <div className="flex flex-col justify-center items-start text-start min-w-0 leading-none">
        {/* Line 1: Dar al Dawa Medical Center — bold, single line, nowrap */}
        <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
          <span className={`font-bold tracking-tight font-heading whitespace-nowrap text-[10px] min-[330px]:text-[11px] min-[360px]:text-[12px] min-[400px]:text-[13px] sm:text-base md:text-lg lg:text-xl leading-tight ${
            lightMode ? 'text-white' : 'text-[#1E5AA8]'
          }`}>
            Dar al Dawa <span className={lightMode ? 'text-emerald-300' : 'text-[#2E9E5B]'}>Medical Center</span>
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#2E9E5B] shrink-0" />
        </div>

        {/* Line 2: دارالدواء میڈیکل سنٹر — smaller size, single line, Noto Nastaliq Urdu, RTL, aligned directly under Line 1 */}
        <div
          dir="rtl"
          className="self-start text-start whitespace-nowrap overflow-visible mt-0.5 sm:mt-1 leading-[1.6] sm:leading-[1.7]"
        >
          <span
            className={`font-urdu font-semibold whitespace-nowrap text-[8.5px] min-[330px]:text-[9px] min-[360px]:text-[10px] min-[400px]:text-[11px] sm:text-sm tracking-normal ${
              lightMode ? 'text-emerald-400' : 'text-[#2E9E5B]'
            }`}
          >
            {urduName}
          </span>
        </div>
      </div>
    </div>
  );
};
