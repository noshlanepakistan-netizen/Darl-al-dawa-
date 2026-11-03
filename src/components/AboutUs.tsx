import React, { useState } from 'react';
import { Target, Eye, History, Award, CheckCircle, Shield, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { HOSPITAL_CONFIG, UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

interface AboutUsProps {
  lang: 'en' | 'ur';
}

export const AboutUs: React.FC<AboutUsProps> = ({ lang }) => {
  const t = UI_TRANSLATIONS[lang].about;
  const isUrdu = lang === 'ur';
  const { homepageSettings } = useAdminData();

  const aboutBadge = homepageSettings?.aboutBadge || t.badge;
  const aboutHeading = homepageSettings?.aboutHeading || t.heading;
  const aboutSubheading = homepageSettings?.aboutSubheading || t.subheading;
  const aboutMission = homepageSettings?.aboutMission || t.missionText;
  const aboutVision = homepageSettings?.aboutVision || t.visionText;
  const aboutImage = homepageSettings?.aboutImage || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80";

  const [activeAboutTab, setActiveAboutTab] = useState<'story' | 'mission' | 'accreditations'>('story');
  const [isExpandedStory, setIsExpandedStory] = useState(false);

  return (
    <section id="about" className="py-12 md:py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#2E9E5B] text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Building2 className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{aboutBadge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {homepageSettings?.aboutHeading ? (
              <span className="text-slate-900">
                {aboutHeading.split(' ').slice(0, -2).join(' ')}{' '}
                <span className="text-[#2E9E5B]">{aboutHeading.split(' ').slice(-2).join(' ')}</span>
              </span>
            ) : isUrdu ? (
              <span>شفا، جدید میڈیکل سائنس اور <span className="text-[#2E9E5B]">انسانی ہمدردی کی روایت</span></span>
            ) : (
              <span>A Tradition of Healing, Science & <span className="text-[#2E9E5B]">Compassion</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {aboutSubheading}
          </p>
        </div>

        {/* Compact Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveAboutTab('story')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAboutTab === 'story'
                ? 'bg-[#1E5AA8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu text-sm' : ''}>{isUrdu ? 'ہمارا سفر و تعارف' : 'Our Story & Ethos'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAboutTab('mission')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAboutTab === 'mission'
                ? 'bg-[#1E5AA8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu text-sm' : ''}>{isUrdu ? 'مشن و وژن' : 'Mission & Vision'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAboutTab('accreditations')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAboutTab === 'accreditations'
                ? 'bg-[#1E5AA8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu text-sm' : ''}>{isUrdu ? 'لائسنس و تصدیق' : 'Licenses & Recognition'}</span>
          </button>
        </div>

        {/* Tab 1: Story & Photo */}
        {activeAboutTab === 'story' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
            <div className="lg:col-span-5 space-y-3">
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-100">
                <img
                  src={aboutImage}
                  alt="Dar al Dawa Medical Center interior care"
                  className="w-full h-56 sm:h-64 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white">
                    <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
                      {isUrdu ? 'گلبرگ 3، لاہور' : 'Gulberg III, Lahore'}
                    </div>
                    <div className="text-sm sm:text-base font-bold">
                      {isUrdu ? '25 سالہ قابلِ اعتماد طبی نگہداشت' : '25+ Years of Compassionate Healing'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ethical Care & Certified Nursing sub-badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E5AA8] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isUrdu ? '100% شفافیت' : '100% Ethical Care'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isUrdu ? 'بغیر غیر ضروری ادویات' : 'Zero unnecessary tests'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#2E9E5B] flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isUrdu ? 'مستند نرسنگ عملہ' : 'Certified Nursing'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isUrdu ? '24 گھنٹے نگہداشت' : '24/7 Bedside empathy'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 text-[#1E5AA8] font-bold text-sm">
                <History className="w-4 h-4" />
                <span className={isUrdu ? 'font-urdu' : ''}>{t.storyTitle}</span>
              </div>
              
              <div className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                <p className={`${!isExpandedStory ? 'line-clamp-4' : ''} ${isUrdu ? 'font-urdu text-sm leading-loose' : 'font-body'}`}>
                  {t.storyText}
                </p>
                <button
                  type="button"
                  onClick={() => setIsExpandedStory(!isExpandedStory)}
                  className="text-xs text-[#1E5AA8] hover:underline font-bold mt-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpandedStory ? (isUrdu ? 'مختصر کریں' : 'Read Less') : (isUrdu ? 'مکمل تاریخ پڑھیں...' : 'Read Full History...')}</span>
                  {isExpandedStory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Quick stats counter */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200">
                {HOSPITAL_CONFIG.trustStats.map((stat, sIdx) => (
                  <div key={sIdx} className="text-center p-2 rounded-lg bg-white border border-slate-100">
                    <div className="text-base sm:text-lg font-bold text-[#1E5AA8] font-mono">{stat.value}</div>
                    <div className="text-[10px] text-slate-500 truncate">{isUrdu ? stat.labelUrdu : stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mission & Vision */}
        {activeAboutTab === 'mission' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#1E5AA8] text-white flex items-center justify-center mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold text-slate-900 mb-2 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {t.missionTitle}
              </h3>
              <p className={`text-xs sm:text-sm text-slate-700 leading-relaxed ${isUrdu ? 'font-urdu text-sm leading-relaxed' : ''}`}>
                {aboutMission}
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#2E9E5B] text-white flex items-center justify-center mb-3">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold text-slate-900 mb-2 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {t.visionTitle}
              </h3>
              <p className={`text-xs sm:text-sm text-slate-700 leading-relaxed ${isUrdu ? 'font-urdu text-sm leading-relaxed' : ''}`}>
                {aboutVision}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Accreditations Grid */}
        {activeAboutTab === 'accreditations' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="text-center max-w-lg mx-auto">
              <h3 className={`text-base sm:text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
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
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#2E9E5B] border border-emerald-200 mb-2">
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
        )}

      </div>
    </section>
  );
};
