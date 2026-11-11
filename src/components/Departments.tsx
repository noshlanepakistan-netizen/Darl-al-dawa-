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
  PhoneCall,
  X,
  CheckCircle2,
  Award,
  MessageSquare,
  CalendarCheck
} from 'lucide-react';
import { Doctor, UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';
import { formatWhatsAppLink, triggerWhatsApp } from '../utils/phoneUtils';

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
  const { departments, doctors, hospitalConfig } = useAdminData();
  const t = UI_TRANSLATIONS[lang].departments;
  const isUrdu = lang === 'ur';

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>('cardiology');
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

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

                  {/* Doctor Avatars Preview in Collapsed State */}
                  {deptDoctors.length > 0 && !isExpanded && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center -space-x-2 rtl:space-x-reverse overflow-hidden">
                        {deptDoctors.slice(0, 4).map((d) => (
                          <img
                            key={d.id}
                            src={d.image}
                            alt={d.name}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover object-top"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-[#1E5AA8] flex items-center gap-0.5">
                        <span>{isUrdu ? 'ڈاکٹرز پروفائلز کھولیں' : 'View Doctor Profiles'}</span>
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </div>
                  )}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
                        {deptDoctors.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => setSelectedDoctorModal(doc)}
                            className="w-full h-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#1E5AA8]/60 transition-all flex flex-col justify-between cursor-pointer group relative"
                            title={isUrdu ? 'مکمل پروفائل دیکھنے کے لیے کلک کریں' : 'Click to view full doctor profile'}
                          >
                            <div className="flex-1">
                              {/* 1-Click Profile Hint Badge */}
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E5AA8] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                  <Eye className="w-3 h-3 text-[#1E5AA8]" />
                                  <span>{isUrdu ? 'پروفائل دیکھیں' : '1-Click Profile'}</span>
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  PMDC #{doc.pmdcNo}
                                </span>
                              </div>

                              <div className="flex items-start gap-3 mb-3">
                                <div className="relative shrink-0">
                                  <img
                                    src={doc.image}
                                    alt={doc.name}
                                    className="w-14 h-14 rounded-2xl object-cover object-top border border-slate-200 group-hover:ring-2 group-hover:ring-[#1E5AA8]/40 transition-all shadow-2xs"
                                    loading="lazy"
                                  />
                                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2E9E5B] border border-white flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className={`text-sm font-bold text-slate-900 group-hover:text-[#1E5AA8] transition-colors truncate ${isUrdu ? 'font-urdu text-base' : ''}`}>
                                    {isUrdu ? doc.nameUrdu : doc.name}
                                  </h5>
                                  <div className="text-[11px] font-semibold text-[#2E9E5B] truncate mt-0.5">
                                    {isUrdu ? doc.specialtyUrdu : doc.specialty}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                                    {doc.qualification}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 mb-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#1E5AA8]" />
                                    <span>{isUrdu ? 'اوقات:' : 'Timings:'}</span>
                                  </span>
                                  <span className="font-semibold text-slate-800">
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
                                  <span className="text-slate-500">{isUrdu ? 'او پی ڈی فیس:' : 'Consult Fee:'}</span>
                                  <span className="font-bold text-[#1E5AA8]">Rs. {doc.feePKR.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Card Action Buttons */}
                            <div className="mt-auto pt-1 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDoctorModal(doc);
                                }}
                                className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E5AA8] font-bold text-xs transition-colors flex items-center justify-center gap-1 border border-blue-200 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isUrdu ? 'پروفائل' : 'Profile'}</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectDoctor(doc.id, doc.departmentId);
                                }}
                                type="button"
                                className="py-2 px-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <CalendarCheck className="w-3.5 h-3.5" />
                                <span>{isUrdu ? 'وقت لیں' : 'Book'}</span>
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

      {/* 1-Click Complete Doctor Profile Modal */}
      {selectedDoctorModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedDoctorModal(null)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1F2933] via-[#1E5AA8] to-slate-900 text-white p-5 sm:p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedDoctorModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={selectedDoctorModal.image}
                    alt={selectedDoctorModal.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover object-top border-3 border-white/80 shadow-lg"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#2E9E5B] border-2 border-white flex items-center justify-center shadow-xs" title="Verified Specialist">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>

                <div className="text-center sm:text-left rtl:sm:text-right min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wide mb-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isUrdu ? 'پی ایم ڈی سی تصدیق شدہ کنسلٹنٹ' : 'PMDC Verified Specialist'}</span>
                  </div>

                  <h3 className={`text-lg sm:text-xl font-bold text-white ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
                    {isUrdu ? selectedDoctorModal.nameUrdu : selectedDoctorModal.name}
                  </h3>

                  <div className="text-xs font-semibold text-emerald-300 mt-0.5">
                    {isUrdu ? selectedDoctorModal.specialtyUrdu : selectedDoctorModal.specialty}
                  </div>

                  <div className="text-[11px] text-blue-200 font-mono mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span>PMDC Reg: {selectedDoctorModal.pmdcNo}</span>
                    <span>•</span>
                    <span>{selectedDoctorModal.experience}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Qualifications */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {isUrdu ? 'طبی اسناد و ڈگریاں (Qualifications):' : 'Qualifications & Fellowships:'}
                </span>
                <p className="font-mono text-xs font-bold text-slate-800">{selectedDoctorModal.qualification}</p>
              </div>

              {/* Clinical Biography */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  {isUrdu ? 'طبی تعارف، فیلڈ اور مہارت (Clinical Profile):' : 'About Doctor & Medical Expertise:'}
                </span>
                <p className={`text-slate-600 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-200/80 ${isUrdu ? 'font-urdu text-sm leading-normal' : ''}`}>
                  {isUrdu ? selectedDoctorModal.aboutUrdu : selectedDoctorModal.about}
                </p>
              </div>

              {/* OPD Schedule & Consultation Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#1E5AA8]" />
                    <span>{isUrdu ? 'اوقاتِ معائنہ:' : 'OPD Timings:'}</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {isUrdu ? selectedDoctorModal.opdTimingsUrdu : selectedDoctorModal.opdTimings}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    <span>{isUrdu ? 'مقررہ ایام:' : 'Consultation Days:'}</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {isUrdu ? selectedDoctorModal.daysUrdu : selectedDoctorModal.days}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block mb-0.5">
                    {isUrdu ? 'او پی ڈی فیس:' : 'Consultation Fee:'}
                  </span>
                  <span className="font-extrabold text-[#1E5AA8] font-mono text-sm">
                    Rs. {selectedDoctorModal.feePKR.toLocaleString()} PKR
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const docId = selectedDoctorModal.id;
                  const deptId = selectedDoctorModal.departmentId;
                  setSelectedDoctorModal(null);
                  onSelectDoctor(docId, deptId);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span className={isUrdu ? 'font-urdu text-base' : ''}>
                  {isUrdu ? 'اس ڈاکٹر سے اپوائنٹمنٹ بک کریں' : `Book Appointment with Dr. ${selectedDoctorModal.name.split(' ')[1] || selectedDoctorModal.name}`}
                </span>
              </button>

              <a
                href={formatWhatsAppLink(
                  hospitalConfig?.contact?.whatsapp,
                  `Hello Dar al Dawa, I would like to inquire about consultation with Dr. ${selectedDoctorModal.name} (${selectedDoctorModal.specialty}).`
                )}
                onClick={(e) =>
                  triggerWhatsApp(
                    hospitalConfig?.contact?.whatsapp,
                    `Hello Dar al Dawa, I would like to inquire about consultation with Dr. ${selectedDoctorModal.name} (${selectedDoctorModal.specialty}).`,
                    e
                  )
                }
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#2E9E5B] border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isUrdu ? 'واٹس ایپ رابطہ' : 'WhatsApp Inquire'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
