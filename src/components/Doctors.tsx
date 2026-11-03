import React, { useState } from 'react';
import {
  UserCheck,
  Clock,
  Calendar,
  BadgeCheck,
  Stethoscope,
  ArrowRight,
  Shield,
  X,
  FileText,
  DollarSign
} from 'lucide-react';
import { Doctor, UI_TRANSLATIONS } from '../data/hospitalData';
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
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

  // Department options that have doctors
  const deptFilterOptions = [
    { id: 'all', label: t.allDepartments, labelUrdu: 'تمام شعبہ جات' },
    ...departments
      .filter((d) => doctors.some((doc) => doc.departmentId === d.id))
      .map((d) => ({
        id: d.id,
        label: d.title.split('&')[0].trim(),
        labelUrdu: d.titleUrdu
      }))
  ];

  // Filtered doctors list based on selected department tab
  const filteredDoctors = selectedDeptFilter === 'all'
    ? doctors
    : doctors.filter((d) => d.departmentId === selectedDeptFilter);

  const handleBookClick = (docId: string, deptId: string) => {
    if (selectedDoctorModal) setSelectedDoctorModal(null);
    onSelectDoctor(docId, deptId);
  };

  return (
    <section id="doctors" className="py-12 md:py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>ہمارے مستند <span className="text-[#2E9E5B]">کنسلٹنٹ ڈاکٹرز</span></span>
            ) : (
              <span>Meet Our <span className="text-[#2E9E5B]">Senior Consultants</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Responsive Department Filter Tabs */}
        <div className="flex items-center sm:justify-center overflow-x-auto pb-3 gap-2 mb-6 no-scrollbar scroll-smooth">
          {deptFilterOptions.map((opt) => {
            const isSelected = selectedDeptFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedDeptFilter(opt.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#1E5AA8] text-white shadow-xs ring-2 ring-blue-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span className={isUrdu ? 'font-urdu text-sm' : ''}>
                  {isUrdu ? opt.labelUrdu : opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Summary & Total Count */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'دستیاب کنسلٹنٹس:' : 'Available Consultants:'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1E5AA8] border border-blue-200">
              {filteredDoctors.length} {isUrdu ? 'ڈاکٹرز' : 'Doctors'}
            </span>
          </div>
          {selectedDeptFilter !== 'all' && (
            <button
              onClick={() => setSelectedDeptFilter('all')}
              className="text-xs text-[#1E5AA8] hover:underline font-semibold cursor-pointer"
            >
              {isUrdu ? 'تمام ڈاکٹرز دیکھیں' : 'Show All Doctors'}
            </button>
          )}
        </div>

        {/* Column-wise Doctors Grid (4 cols on lg, 3 on md, 2 on sm, 1 on mobile) */}
        {filteredDoctors.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm">
              {isUrdu ? 'اس شعبے کے لیے فی الحال کوئی ڈاکٹر درج نہیں ہے۔' : 'No doctors found for this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {filteredDoctors.map((doc) => {
              const dept = departments.find((d) => d.id === doc.departmentId);
              const hasLongBio = (doc.about && doc.about.length > 90) || (doc.aboutUrdu && doc.aboutUrdu.length > 90);

              return (
                <div
                  key={doc.id}
                  className="w-full h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
                >
                  <div className="flex-1 flex flex-col">
                    {/* Photo Banner with PMDC and Experience Badges */}
                    <div className="relative h-56 overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-[#1E5AA8] shadow-xs flex items-center gap-1 border border-slate-200">
                        <BadgeCheck className="w-3 h-3 text-[#2E9E5B]" />
                        <span>PMDC: {doc.pmdcNo}</span>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-[#1E5AA8]/95 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {doc.experience}
                      </div>
                    </div>

                    {/* Doctor Information */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Department Badge */}
                        <div className="mb-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#1E5AA8] border border-blue-200/70">
                            {isUrdu ? (dept?.titleUrdu || doc.specialtyUrdu) : (dept?.title || doc.specialty)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-base font-bold text-slate-900 group-hover:text-[#1E5AA8] transition-colors leading-tight ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                            {isUrdu ? doc.nameUrdu : doc.name}
                          </h4>
                        </div>

                        <div className="text-xs font-semibold text-[#2E9E5B] mb-2 leading-tight">
                          {isUrdu ? doc.specialtyUrdu : doc.specialty}
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 mb-2 font-mono truncate">
                          <span className="font-semibold text-slate-700">{t.qualifications}: </span>
                          {doc.qualification}
                        </div>

                        {/* Short bio with "View Profile" button */}
                        <div className="mb-3">
                          <p className={`text-xs text-slate-600 line-clamp-2 leading-relaxed ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                            {isUrdu ? doc.aboutUrdu : doc.about}
                          </p>
                          {hasLongBio && (
                            <button
                              type="button"
                              onClick={() => setSelectedDoctorModal(doc)}
                              className="text-[11px] text-[#1E5AA8] hover:underline font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isUrdu ? 'مکمل پروفائل دیکھیں' : 'View Full Profile'}</span>
                              <ArrowRight className={`w-3 h-3 ${isUrdu ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Timings, Days, and Consultation Fee */}
                      <div className="space-y-1 border-t border-slate-100 pt-2.5 text-xs text-slate-600 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#1E5AA8]" />
                            <span className="font-medium">{t.timings}:</span>
                          </span>
                          <span className={`font-semibold text-slate-800 ${isUrdu ? 'font-urdu' : ''}`}>
                            {isUrdu ? doc.opdTimingsUrdu : doc.opdTimings}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#1E5AA8]" />
                            <span className="font-medium">{t.days}:</span>
                          </span>
                          <span className={`text-slate-700 ${isUrdu ? 'font-urdu' : ''}`}>
                            {isUrdu ? doc.daysUrdu : doc.days}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-[#2E9E5B]" />
                            <span className="font-medium">{t.consultFee}:</span>
                          </span>
                          <span className="font-bold text-[#1E5AA8] font-mono">
                            Rs. {doc.feePKR.toLocaleString()} PKR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card CTA: Book Appointment */}
                  <div className="p-4 sm:p-5 pt-0 mt-auto">
                    <button
                      onClick={() => handleBookClick(doc.id, doc.departmentId)}
                      type="button"
                      className="w-full py-2 px-3 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                    >
                      <span className={isUrdu ? 'font-urdu text-sm' : ''}>{t.bookConsultation}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Doctor Profile Modal / Detail View */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDoctorModal(null)}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedDoctorModal.image}
                alt={selectedDoctorModal.name}
                className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-[#1E5AA8] shadow-xs"
              />
              <div>
                <h4 className={`text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                  {isUrdu ? selectedDoctorModal.nameUrdu : selectedDoctorModal.name}
                </h4>
                <div className="text-xs font-semibold text-[#2E9E5B]">
                  {isUrdu ? selectedDoctorModal.specialtyUrdu : selectedDoctorModal.specialty}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  PMDC: {selectedDoctorModal.pmdcNo} • {selectedDoctorModal.experience}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.qualifications}:
                </span>
                <p className="text-xs text-slate-600 font-mono">{selectedDoctorModal.qualification}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  {isUrdu ? 'طبی تجربہ و تعارف:' : 'About Doctor & Clinical Expertise:'}
                </span>
                <p className={`text-xs text-slate-600 leading-relaxed ${isUrdu ? 'font-urdu text-sm leading-normal' : ''}`}>
                  {isUrdu ? selectedDoctorModal.aboutUrdu : selectedDoctorModal.about}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t.timings}:</span>
                  <span className="font-bold text-slate-800">
                    {isUrdu ? selectedDoctorModal.opdTimingsUrdu : selectedDoctorModal.opdTimings}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t.consultFee}:</span>
                  <span className="font-bold text-[#1E5AA8] font-mono">
                    Rs. {selectedDoctorModal.feePKR.toLocaleString()} PKR
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleBookClick(selectedDoctorModal.id, selectedDoctorModal.departmentId)}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span className={isUrdu ? 'font-urdu text-base' : ''}>{t.bookConsultation}</span>
              <ArrowRight className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
