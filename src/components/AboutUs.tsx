import React from 'react';
import { Target, Eye, History, Award, CheckCircle, Shield, Building2 } from 'lucide-react';
import { HOSPITAL_CONFIG, UI_TRANSLATIONS } from '../data/hospitalData';

interface AboutUsProps {
  lang: 'en' | 'ur';
}

export const AboutUs: React.FC<AboutUsProps> = ({ lang }) => {
  const t = UI_TRANSLATIONS[lang].about;
  const isUrdu = lang === 'ur';

  return (
    <section id="about" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1E5AA8] text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {t.heading}
          </h2>
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Story & Image Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          {/* Visual Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80"
                alt="Dar al Dawa Medical Center interior care"
                className="w-full h-72 sm:h-84 object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">
                    {isUrdu ? 'گلبرگ، لاہور' : 'Gulberg, Lahore'}
                  </div>
                  <div className="text-lg font-bold">
                    {isUrdu ? '25 سالہ طبی خدمات کا سفر' : 'Over 25 Years of Healing Punjab'}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-badge strip */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1E5AA8] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {isUrdu ? '100% شفافیت' : '100% Ethical Care'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isUrdu ? 'بغیر غیر ضروری ادویات' : 'Zero unnecessary tests'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#2E9E5B] flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {isUrdu ? 'مستند نرسنگ عملہ' : 'Certified Nursing'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isUrdu ? '24 گھنٹے نگہداشت' : '24/7 Bedside empathy'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Story & Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#1E5AA8] font-semibold text-sm">
                <History className="w-4 h-4" />
                <span className={isUrdu ? 'font-urdu' : ''}>{t.storyTitle}</span>
              </div>
              <p className={`text-slate-700 leading-relaxed text-sm sm:text-base ${isUrdu ? 'font-urdu text-base leading-loose' : 'font-body'}`}>
                {t.storyText}
              </p>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5 hover:border-blue-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#1E5AA8] text-white flex items-center justify-center mb-3">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-bold text-slate-900 mb-2 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                  {t.missionTitle}
                </h3>
                <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${isUrdu ? 'font-urdu leading-normal' : ''}`}>
                  {t.missionText}
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#2E9E5B] text-white flex items-center justify-center mb-3">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-bold text-slate-900 mb-2 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                  {t.visionTitle}
                </h3>
                <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${isUrdu ? 'font-urdu leading-normal' : ''}`}>
                  {t.visionText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accreditations & Regulatory Recognition Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className={`text-lg sm:text-xl font-bold text-slate-900 mb-1 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
              {t.accreditationTitle}
            </h3>
            <p className={`text-xs text-slate-500 ${isUrdu ? 'font-urdu' : ''}`}>
              {t.accreditationSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOSPITAL_CONFIG.accreditations.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-[#2E9E5B] border border-emerald-200 mb-2">
                    {isUrdu ? item.badgeUrdu : item.badge}
                  </div>
                  <h4 className={`text-sm font-bold text-slate-900 mb-1.5 ${isUrdu ? 'font-urdu text-base' : ''}`}>
                    {isUrdu ? item.nameUrdu : item.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-[#1E5AA8] font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-[#2E9E5B]" />
                  <span>{isUrdu ? 'تصدیق شدہ و فعال' : 'Verified & Licensed'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
