import React, { useState } from 'react';
import { Sparkles, Check, Clock, AlertTriangle, ArrowRight, ShieldCheck, HeartPulse, ChevronDown, ChevronUp } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

interface HealthPackagesProps {
  lang: 'en' | 'ur';
  onBookPackage: (pkgTitle: string) => void;
}

export const HealthPackages: React.FC<HealthPackagesProps> = ({ lang, onBookPackage }) => {
  const t = UI_TRANSLATIONS[lang].packages;
  const isUrdu = lang === 'ur';
  const { packages } = useAdminData();

  const [expandedPkgId, setExpandedPkgId] = useState<string | null>(null);

  const togglePackageExpand = (id: string) => {
    setExpandedPkgId((prev) => (prev === id ? null : id));
  };

  const packageList = packages || [];

  return (
    <section id="packages" className="py-12 md:py-16 bg-[#F7FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <HeartPulse className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>ہیلتھ اسکریننگ و <span className="text-[#2E9E5B]">لیب ٹیسٹ پیکیجز</span></span>
            ) : (
              <span>Health Screening & <span className="text-[#2E9E5B]">Lab Packages</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Packages Grid */}
        {packageList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-sm max-w-md mx-auto">
            {isUrdu ? 'اس وقت کوئی پیکیج دستیاب نہیں ہے۔' : 'No health packages currently available.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packageList.map((pkg) => {
              const savings = pkg.originalPrice - pkg.discountedPrice;
              const savingsPct = pkg.originalPrice > 0 ? Math.round((savings / pkg.originalPrice) * 100) : 0;
              const isExpanded = expandedPkgId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between hover:shadow-lg relative ${
                    pkg.popular
                      ? 'border-[#2E9E5B] shadow-sm ring-1 ring-emerald-200'
                      : 'border-slate-200/90 shadow-xs'
                  }`}
                >
                  {/* Popular Ribbon */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E9E5B] text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{t.popularBadge}</span>
                    </div>
                  )}

                  <div>
                    {/* Category tag */}
                    <div className="text-[11px] font-semibold text-[#1E5AA8] uppercase tracking-wider mb-1">
                      {isUrdu ? pkg.categoryUrdu : pkg.category}
                    </div>

                    {/* Title */}
                    <h3 className={`text-base sm:text-lg font-bold text-slate-900 mb-3 leading-snug ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                      {isUrdu ? pkg.titleUrdu : pkg.title}
                    </h3>

                    {/* Pricing Box in PKR */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-extrabold text-[#1E5AA8] font-mono">
                          Rs. {pkg.discountedPrice.toLocaleString()}
                        </span>
                        {pkg.originalPrice > pkg.discountedPrice && (
                          <span className="text-xs text-slate-400 font-mono line-through">
                            Rs. {pkg.originalPrice.toLocaleString()}
                          </span>
                        )}
                        {savingsPct > 0 && (
                          <span className="text-[10px] font-bold text-[#2E9E5B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 ml-auto">
                            Save {savingsPct}%
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#2E9E5B]" />
                        <span>{isUrdu ? 'مستند پیتھالوجی لیب رپورٹ' : 'ISO Certified Pathologist Review'}</span>
                      </div>
                    </div>

                    {/* Fasting & Report turnaround */}
                    <div className="space-y-1 text-[11px] text-slate-600 mb-3.5 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-700">{t.fasting} </span>
                          <span>{isUrdu ? pkg.fastingRequiredUrdu : pkg.fastingRequired}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1E5AA8] flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-700">{t.turnaround} </span>
                          <span>{isUrdu ? pkg.reportTimeUrdu : pkg.reportTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Tests Included List */}
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() => togglePackageExpand(pkg.id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-[#1E5AA8] py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <span>{t.includes}</span>
                          <span className="text-[#1E5AA8] font-mono">({(pkg.testsIncluded || []).length})</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {/* Show first 3 tests always, rest on expand */}
                      <ul className="space-y-1 mt-2 text-xs text-slate-600">
                        {(isExpanded
                          ? (isUrdu ? pkg.testsIncludedUrdu : pkg.testsIncluded) || []
                          : ((isUrdu ? pkg.testsIncludedUrdu : pkg.testsIncluded) || []).slice(0, 3)
                        ).map((test, tIdx) => (
                          <li key={tIdx} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#2E9E5B] flex-shrink-0" />
                            <span className={`truncate ${isUrdu ? 'font-urdu' : ''}`}>{test}</span>
                          </li>
                        ))}
                      </ul>

                      {!isExpanded && (pkg.testsIncluded || []).length > 3 && (
                        <button
                          type="button"
                          onClick={() => togglePackageExpand(pkg.id)}
                          className="text-[11px] text-[#1E5AA8] hover:underline font-semibold mt-1 block cursor-pointer"
                        >
                          + {(pkg.testsIncluded || []).length - 3} {isUrdu ? 'مزید ٹیسٹ دیکھیں...' : 'more tests included...'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Book Package CTA */}
                  <button
                    onClick={() => onBookPackage(pkg.title)}
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    <span className={isUrdu ? 'font-urdu text-sm' : ''}>{t.bookPackage}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
