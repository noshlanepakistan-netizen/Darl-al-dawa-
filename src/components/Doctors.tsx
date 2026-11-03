import React, { useState } from 'react';
import { UserCheck, Clock, Calendar, BadgeCheck, Stethoscope, ArrowRight, Shield } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

interface DoctorsProps {
  lang: 'en' | 'ur';
  onSelectDoctor: (doctorId: string, deptId: string) => void;
}

export const Doctors: React.FC<DoctorsProps> = ({ lang, onSelectDoctor }) => {
  const { doctors, departments } = useAdminData();
  const t = UI_TRANSLATIONS[lang].doctors;
  const isUrdu = lang === 'ur';
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const filteredDoctors = selectedDeptFilter === 'all'
    ? doctors
    : doctors.filter((d) => d.departmentId === selectedDeptFilter);

  // Department options that have doctors
  const deptFilterOptions = [
    { id: 'all', label: t.allDepartments, labelUrdu: 'تمام شعبہ جات' },
    ...departments.filter((d) => doctors.some((doc) => doc.departmentId === d.id)).map((d) => ({
      id: d.id,
      label: d.title.split('&')[0].trim(),
      labelUrdu: d.titleUrdu
    }))
  ];

  return (
    <section id="doctors" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {t.heading}
          </h2>
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          {deptFilterOptions.map((opt) => {
            const isSelected = selectedDeptFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedDeptFilter(opt.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E5AA8] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className={isUrdu ? 'font-urdu text-sm' : ''}>
                  {isUrdu ? opt.labelUrdu : opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doc) => {
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Badge Banner */}
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-[#1E5AA8] shadow-xs flex items-center gap-1 border border-slate-200">
                      <BadgeCheck className="w-3.5 h-3.5 text-[#2E9E5B]" />
                      <span>PMDC Verified: {doc.pmdcNo}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-[#1E5AA8]/90 text-white px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
                      {doc.experience}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className={`text-xl font-bold text-slate-900 group-hover:text-[#1E5AA8] transition-colors ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
                      {isUrdu ? doc.nameUrdu : doc.name}
                    </h3>

                    <div className="text-xs font-semibold text-[#2E9E5B] mt-1 mb-2">
                      {isUrdu ? doc.specialtyUrdu : doc.specialty}
                    </div>

                    <div className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 mb-3">
                      <span className="font-semibold text-slate-700">{t.qualifications}: </span>
                      {doc.qualification}
                    </div>

                    <p className={`text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                      {isUrdu ? doc.aboutUrdu : doc.about}
                    </p>

                    {/* Schedule & Fee Details */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#1E5AA8] flex-shrink-0" />
                        <span className="font-semibold text-slate-700">{t.timings}:</span>
                        <span className={isUrdu ? 'font-urdu' : ''}>
                          {isUrdu ? doc.opdTimingsUrdu : doc.opdTimings}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#1E5AA8] flex-shrink-0" />
                        <span className="font-semibold text-slate-700">{t.days}:</span>
                        <span className={isUrdu ? 'font-urdu' : ''}>
                          {isUrdu ? doc.daysUrdu : doc.days}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 text-[#2E9E5B] flex-shrink-0" />
                        <span className="font-semibold text-slate-700">{t.consultFee}:</span>
                        <span className="font-bold text-[#1E5AA8] font-mono">
                          Rs. {doc.feePKR.toLocaleString()} PKR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => onSelectDoctor(doc.id, doc.departmentId)}
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                  >
                    <span className={isUrdu ? 'font-urdu text-sm' : ''}>{t.bookConsultation}</span>
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
