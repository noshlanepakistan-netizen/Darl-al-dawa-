import React from 'react';
import { Sparkles, Check, Clock, AlertTriangle, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { HEALTH_PACKAGES, HOSPITAL_CONFIG, UI_TRANSLATIONS } from '../data/hospitalData';

interface HealthPackagesProps {
  lang: 'en' | 'ur';
  onBookPackage: (pkgTitle: string) => void;
}

export const HealthPackages: React.FC<HealthPackagesProps> = ({ lang, onBookPackage }) => {
  const t = UI_TRANSLATIONS[lang].packages;
  const isUrdu = lang === 'ur';

  return (
    <section id="packages" className="py-16 md:py-24 bg-[#F7FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#2E9E5B] text-xs font-semibold uppercase tracking-wider mb-3">
            <HeartPulse className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {t.heading}
          </h2>
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {HEALTH_PACKAGES.map((pkg) => {
            const savings = pkg.originalPrice - pkg.discountedPrice;
            const savingsPct = Math.round((savings / pkg.originalPrice) * 100);

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl relative ${
                  pkg.popular
                    ? 'border-[#2E9E5B] shadow-md ring-2 ring-emerald-100'
                    : 'border-slate-200/90 shadow-xs'
                }`}
              >
                {/* Popular Ribbon */}
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2E9E5B] text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{t.popularBadge}</span>
                  </div>
                )}

                <div>
                  {/* Category tag */}
                  <div className="text-xs font-semibold text-[#1E5AA8] uppercase tracking-wider mb-2">
                    {isUrdu ? pkg.categoryUrdu : pkg.category}
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold text-slate-900 mb-3 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
                    {isUrdu ? pkg.titleUrdu : pkg.title}
                  </h3>

                  {/* Pricing Box in PKR */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#1E5AA8] font-mono">
                        Rs. {pkg.discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono line-through">
                        Rs. {pkg.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-[#2E9E5B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 ml-auto">
                        Save {savingsPct}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2E9E5B]" />
                      <span>{isUrdu ? 'مستند پیتھالوجی لیب رپورٹ' : 'ISO Certified Pathologist Review'}</span>
                    </div>
                  </div>

                  {/* Fasting & Report turnaround */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-5 bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-700">{t.fasting} </span>
                        <span>{isUrdu ? pkg.fastingRequiredUrdu : pkg.fastingRequired}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#1E5AA8] flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-700">{t.turnaround} </span>
                        <span>{isUrdu ? pkg.reportTimeUrdu : pkg.reportTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Included Tests list */}
                  <div className="mb-6">
                    <div className="text-xs font-bold text-slate-800 mb-2.5">
                      {t.includes}
                    </div>
                    <ul className="space-y-2">
                      {(isUrdu ? pkg.testsIncludedUrdu : pkg.testsIncluded).map((test, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-[#2E9E5B] mt-0.5 flex-shrink-0" />
                          <span className={isUrdu ? 'font-urdu' : ''}>{test}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onBookPackage(isUrdu ? pkg.titleUrdu : pkg.title)}
                    type="button"
                    className="w-full py-3 px-4 rounded-xl bg-[#1E5AA8] hover:bg-[#164785] text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className={isUrdu ? 'font-urdu text-sm' : ''}>{t.bookPackage}</span>
                    <ArrowRight className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />
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
