import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

interface FaqSectionProps {
  lang: 'en' | 'ur';
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const { faqs, hospitalConfig } = useAdminData();
  const allFaqs = faqs || [];
  const t = UI_TRANSLATIONS[lang].faq;
  const isUrdu = lang === 'ur';

  const [openFaqId, setOpenFaqId] = useState<string>(allFaqs[0]?.id || '');
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: isUrdu ? 'تمام سوالات' : 'All FAQs' },
    { id: 'general', label: isUrdu ? 'عمومی و اپوائنٹمنٹ' : 'General & OPD' },
    { id: 'insurance', label: isUrdu ? 'صحت کارڈ و انشورنس' : 'Sehat Card & Panels' },
    { id: 'emergency', label: isUrdu ? 'ایمرجنسی و لیب' : 'Emergency & Labs' }
  ];

  const filteredFaqs = allFaqs.filter((faq) => {
    if (activeFaqCategory === 'all') return true;
    if (activeFaqCategory === 'general') return faq.category === 'general' || faq.id === 'faq-appt' || faq.id === 'faq-hours';
    if (activeFaqCategory === 'insurance') return faq.category === 'billing' || faq.id === 'faq-sehat' || faq.id === 'faq-insurance';
    if (activeFaqCategory === 'emergency') return faq.category === 'emergency' || faq.id === 'faq-emergency' || faq.id === 'faq-lab';
    return true;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? '' : id));
  };

  const insurancePartners = hospitalConfig?.insurancePartners || [];

  return (
    <section id="faq" className="py-12 md:py-16 bg-[#F7FAFC] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>اکثر پوچھے جانے والے <span className="text-[#2E9E5B]">اہم سوالات</span></span>
            ) : (
              <span>Frequently Asked <span className="text-[#2E9E5B]">Questions</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFaqCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFaqCategory === cat.id
                  ? 'bg-[#1E5AA8] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-sm mb-10">
            {isUrdu ? 'اس وقت کوئی سوال دستیاب نہیں ہے۔' : 'No FAQs currently listed in this category.'}
          </div>
        ) : (
          <div className="space-y-3 mb-10">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    <span className={`text-sm sm:text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu text-lg' : 'font-heading'}`}>
                      {isUrdu ? faq.questionUrdu : faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-blue-50 text-[#1E5AA8]' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100/80 animate-in fade-in duration-200">
                      <p className={isUrdu ? 'font-urdu text-sm leading-loose' : ''}>
                        {isUrdu ? faq.answerUrdu : faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Accepted Insurance & Panel Companies Showcase */}
        {insurancePartners.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-center shadow-xs">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E5AA8] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#2E9E5B]" />
              <span className={isUrdu ? 'font-urdu' : ''}>
                {isUrdu ? 'صحت کارڈ پینل و انشورنس پارٹنرز' : 'Empaneled Health Insurance & Sehat Card Partners'}
              </span>
            </div>
            <p className={`text-xs text-slate-500 max-w-xl mx-auto mb-4 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'لاہور کے معروف انشورنس پینلز اور پنجاب حکومت کے صحت کارڈ پلس پر علاج کی سہولت' : 'Seamless cashless inpatient treatments on Punjab Sehat Card Plus and major corporate insurance plans'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {insurancePartners.map((partner, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#1E5AA8] transition-colors"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
