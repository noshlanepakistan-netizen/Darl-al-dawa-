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
  UserCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  BadgeCheck,
  PhoneCall
} from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

interface DepartmentsProps {
  lang: 'en' | 'ur';
  onSelectDepartment: (deptId: string) => void;
  onSelectDoctor: (doctorId: string, deptId: string) => void;
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

export const Departments: React.FC<DepartmentsProps> = ({
  lang,
  onSelectDepartment,
  onSelectDoctor
}) => {
  const { departments, doctors } = useAdminData();
  const t = UI_TRANSLATIONS[lang].departments;
  const isUrdu = lang === 'ur';

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);

  const filteredDepts = departments.filter((dept) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      dept.title.toLowerCase().includes(q) ||
      dept.titleUrdu.includes(q) ||
      dept.description.toLowerCase().includes(q)
    );
  });

  const toggleDepartmentExpand = (deptId: string) => {
    setExpandedDeptId((prev) => (prev === deptId ? null : deptId));
  };

  return (
    <section id="departments" className="py-12 md:py-16 bg-[#F7FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Stethoscope className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>جامع میڈیکل اور سرجیکل <span className="text-[#2E9E5B]">شعبہ جات</span></span>
            ) : (
              <span>Comprehensive Clinical <span className="text-[#2E9E5B]">Departments</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Search Bar & Quick Hint */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUrdu ? "شعبہ تلاش کریں (مثلاً: دل، زچگی، ایمرجنسی، ہڈی)..." : "Search departments (e.g. Cardiology, Orthopedics, Dental)..."}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm bg-white shadow-xs"
            />
          </div>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            {isUrdu ? 'کسی بھی شعبہ کے کارڈ پر کلک کر کے اس کے ماہر ڈاکٹرز کی تفصیلات اور اوقات کار دیکھیں' : 'Click any department card to view its dedicated specialist doctors & timings'}
          </p>
        </div>

        {/* Responsive Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((dept) => {
            const IconComponent = ICON_MAP[dept.iconName] || Stethoscope;
            const isEmergency = dept.id === 'emergency';
            const isExpanded = expandedDeptId === dept.id;

            // ONLY doctors belonging to this exact department
            const deptDoctors = doctors.filter((doc) => doc.departmentId === dept.id);

            return (
              <div
                key={dept.id}
                className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isExpanded
                    ? 'border-[#1E5AA8] ring-2 ring-blue-100 col-span-1 md:col-span-2 lg:col-span-3'
                    : isEmergency
                    ? 'border-red-200 ring-1 ring-red-50 bg-gradient-to-b from-red-50/20 to-white'
                    : 'border-slate-200/90 hover:border-[#1E5AA8]/40'
                }`}
              >
                {/* Clickable Department Card Header */}
                <div
                  onClick={() => toggleDepartmentExpand(dept.id)}
                  className="p-5 cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDepartmentExpand(dept.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                          isEmergency
                            ? 'bg-[#D62828] text-white shadow-sm'
                            : isExpanded
                            ? 'bg-[#1E5AA8] text-white'
                            : 'bg-blue-50 text-[#1E5AA8]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div>
                        <h3 className={`text-base sm:text-lg font-bold text-slate-900 leading-snug ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                          {isUrdu ? dept.titleUrdu : dept.title}
                        </h3>
                        {!isUrdu && (
                          <div className="text-[11px] text-slate-400 font-urdu">
                            {dept.titleUrdu}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isEmergency && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#D62828] border border-red-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                          {isUrdu ? '24/7 فعال' : '24/7 Live'}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {deptDoctors.length} {deptDoctors.length === 1 ? (isUrdu ? 'ڈاکٹر' : 'Doctor') : (isUrdu ? 'ڈاکٹرز' : 'Doctors')}
                      </span>

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isExpanded ? 'bg-blue-100 text-[#1E5AA8] rotate-180' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* 1-Line Clean Description */}
                  <p className={`text-xs text-slate-600 line-clamp-2 leading-relaxed ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                    {isUrdu ? dept.descriptionUrdu : dept.description}
                  </p>
                </div>

                {/* Expanded State: Doctors of this Department */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6 animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className={`text-sm font-bold text-slate-800 ${isUrdu ? 'font-urdu text-base' : ''}`}>
                          {isUrdu ? `شعبہ ${dept.titleUrdu} کے ماہر ڈاکٹرز` : `Specialist Doctors in ${dept.title}`}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {isUrdu ? 'مستند سینئر کنسلٹنٹس سے چیک اپ کے لیے اپوائنٹمنٹ بک کریں' : 'Book a consultation with our verified senior specialists'}
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectDepartment(dept.id)}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#1E5AA8] border border-blue-200 hover:bg-[#1E5AA8] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>{isUrdu ? 'شعبہ کے لیے بک کریں' : 'Book in this Department'}</span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {deptDoctors.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                        {deptDoctors.map((doc) => (
                          <div
                            key={doc.id}
                            className="w-full h-full bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-3">
                                <img
                                  src={doc.image}
                                  alt={doc.name}
                                  className="w-14 h-14 rounded-xl object-cover object-top border border-slate-200 flex-shrink-0"
                                  loading="lazy"
                                />
                                <div className="min-w-0 flex-1">
                                  <h5 className={`text-sm font-bold text-slate-900 truncate ${isUrdu ? 'font-urdu text-base' : ''}`}>
                                    {isUrdu ? doc.nameUrdu : doc.name}
                                  </h5>
                                  <div className="text-[11px] font-medium text-[#2E9E5B] truncate">
                                    {isUrdu ? doc.specialtyUrdu : doc.specialty}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate font-mono">
                                    {doc.qualification}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#1E5AA8]" />
                                    <span>{isUrdu ? 'اوقات:' : 'Timings:'}</span>
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    {isUrdu ? doc.opdTimingsUrdu : doc.opdTimings}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#1E5AA8]" />
                                    <span>{isUrdu ? 'ایام:' : 'Days:'}</span>
                                  </span>
                                  <span className="text-slate-700">
                                    {isUrdu ? doc.daysUrdu : doc.days}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
                                  <span className="text-slate-500">{isUrdu ? 'فیس:' : 'Fee:'}</span>
                                  <span className="font-bold text-[#1E5AA8]">Rs. {doc.feePKR.toLocaleString()} PKR</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto pt-1">
                              <button
                                onClick={() => onSelectDoctor(doc.id, doc.departmentId)}
                                type="button"
                                className="w-full py-2 px-3 rounded-lg bg-[#2E9E5B] hover:bg-[#25824b] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <span>{isUrdu ? 'اپوائنٹمنٹ بک کریں' : 'Book Appointment'}</span>
                                <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl p-4 border border-slate-200 text-center text-xs text-slate-500">
                        <span>{isUrdu ? 'اس شعبے کے لیے جنرل کنسلٹیشن 24 گھنٹے دستیاب ہے۔' : 'General OPD consultations available for this department.'}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Action when not expanded */}
                {!isExpanded && (
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{dept.headDoctor}</span>
                    </span>

                    <button
                      onClick={() => toggleDepartmentExpand(dept.id)}
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] text-[#1E5AA8] hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      <span>{isUrdu ? 'ڈاکٹرز دیکھیں' : 'View Doctors'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
