import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Building2 } from 'lucide-react';
import { FAQS, HOSPITAL_CONFIG, UI_TRANSLATIONS } from '../data/hospitalData';

interface FaqSectionProps {
  lang: 'en' | 'ur';
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const t = UI_TRANSLATIONS[lang].faq;
  const isUrdu = lang === 'ur';

  const [openFaqId, setOpenFaqId] = useState<string>(FAQS[0].id);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? '' : id));
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#F7FAFC] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-[#1E5AA8] text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {t.heading}
          </h2>
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4 mb-16">
          {FAQS.map((faq) => {
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
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <span className={`text-base sm:text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                    {isUrdu ? faq.questionUrdu : faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-[#1E5AA8]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100/80 animate-in fade-in duration-200">
                    <p className={isUrdu ? 'font-urdu text-base leading-loose' : ''}>
                      {isUrdu ? faq.answerUrdu : faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Accepted Insurance & Panel Companies Showcase */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E5AA8] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#2E9E5B]" />
            <span>{isUrdu ? 'تسلیم شدہ پینلز و انشورنس پارٹنرز' : 'Approved Insurance & Panel Companies'}</span>
          </div>
          <h3 className={`text-lg sm:text-xl font-bold text-slate-900 mb-6 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
            {isUrdu ? 'کیش لیس علاج اور صحت کارڈ پلس کی بلا معاوضہ سہولت' : 'Cashless Healthcare for Insured Patients'}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HOSPITAL_CONFIG.insurancePartners.map((partner, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-center text-xs font-semibold text-slate-700 hover:border-[#1E5AA8] transition-colors"
              >
                <span className="truncate">{partner}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
