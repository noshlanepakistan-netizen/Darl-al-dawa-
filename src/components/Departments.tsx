import React, { useState } from 'react';
import {
  ShieldAlert,
  HeartPulse,
  Baby,
  Smile,
  Activity,
  Stethoscope,
  Sparkles,
  Ear,
  Eye,
  Flame,
  Scan,
  FlaskConical,
  Pill,
  Check,
  Search,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { DEPARTMENTS, UI_TRANSLATIONS } from '../data/hospitalData';

interface DepartmentsProps {
  lang: 'en' | 'ur';
  onSelectDepartment: (deptId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ShieldAlert,
  HeartPulse,
  Baby,
  Smile,
  Activity,
  Stethoscope,
  Sparkles,
  Ear,
  Eye,
  Flame,
  Scan,
  FlaskConical,
  Pill
};

export const Departments: React.FC<DepartmentsProps> = ({ lang, onSelectDepartment }) => {
  const t = UI_TRANSLATIONS[lang].departments;
  const isUrdu = lang === 'ur';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDepts = DEPARTMENTS.filter((dept) => {
    const q = searchQuery.toLowerCase();
    return (
      dept.title.toLowerCase().includes(q) ||
      dept.titleUrdu.includes(q) ||
      dept.description.toLowerCase().includes(q)
    );
  });

  return (
    <section id="departments" className="py-16 md:py-24 bg-[#F7FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-[#1E5AA8] text-xs font-semibold uppercase tracking-wider mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {t.heading}
          </h2>
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Search Bar for Departments */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUrdu ? "شعبہ تلاش کریں (مثلاً: دل، زچگی، ایمرجنسی، ہڈی)..." : "Search departments (e.g. Cardiology, Orthopedics, Dental)..."}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white shadow-xs"
            />
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => {
            const IconComponent = ICON_MAP[dept.iconName] || Stethoscope;
            const isEmergency = dept.id === 'emergency';

            return (
              <div
                key={dept.id}
                className={`group bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
                  isEmergency
                    ? 'border-red-200 ring-1 ring-red-100 bg-gradient-to-b from-red-50/20 to-white'
                    : 'border-slate-200/80 hover:border-[#1E5AA8]/30'
                }`}
              >
                <div>
                  {/* Top: Icon + Emergency Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isEmergency
                          ? 'bg-[#D62828] text-white shadow-md'
                          : 'bg-blue-50 text-[#1E5AA8] group-hover:bg-[#1E5AA8] group-hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {isEmergency && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-[#D62828] border border-red-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        {isUrdu ? '24 گھنٹے فعال' : '24/7 Available'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg font-bold text-slate-900 mb-1 group-hover:text-[#1E5AA8] transition-colors ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                    {isUrdu ? dept.titleUrdu : dept.title}
                  </h3>
                  {!isUrdu && (
                    <div className="text-xs text-slate-400 font-urdu mb-2 font-medium">
                      {dept.titleUrdu}
                    </div>
                  )}

                  {/* Description */}
                  <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 ${isUrdu ? 'font-urdu text-sm leading-normal' : ''}`}>
                    {isUrdu ? dept.descriptionUrdu : dept.description}
                  </p>

                  {/* Feature Highlights */}
                  <ul className="space-y-1.5 mb-5 border-t border-slate-100 pt-3">
                    {(isUrdu ? dept.featuresUrdu : dept.features).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-[#2E9E5B] flex-shrink-0" />
                        <span className={isUrdu ? 'font-urdu' : ''}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer: Head Doctor & Book Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{dept.headDoctor}</span>
                  </div>

                  <button
                    onClick={() => onSelectDepartment(dept.id)}
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-[#1E5AA8] text-[#1E5AA8] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <span className={isUrdu ? 'font-urdu' : ''}>{t.bookDept}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
