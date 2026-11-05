import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle, MessageSquareQuote } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

interface TestimonialsProps {
  lang: 'en' | 'ur';
}

export const Testimonials: React.FC<TestimonialsProps> = ({ lang }) => {
  const { testimonials } = useAdminData();
  const allTestimonials = testimonials || [];
  const t = UI_TRANSLATIONS[lang].testimonials;
  const isUrdu = lang === 'ur';

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    if (allTestimonials.length === 0) return;
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? allTestimonials.length - 1 : prevIdx - 1));
  };

  const next = () => {
    if (allTestimonials.length === 0) return;
    setCurrentIndex((prevIdx) => (prevIdx === allTestimonials.length - 1 ? 0 : prevIdx + 1));
  };

  // Auto advance every 7 seconds
  useEffect(() => {
    if (allTestimonials.length <= 1) return;
    const timer = setInterval(() => {
      next();
    }, 7000);
    return () => clearInterval(timer);
  }, [allTestimonials.length]);

  if (allTestimonials.length === 0) {
    return null;
  }

  const activeTestimonial = allTestimonials[currentIndex] || allTestimonials[0];

  return (
    <section id="testimonials" className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>مریضوں کا <span className="text-[#2E9E5B]">اعتماد اور تاثرات</span></span>
            ) : (
              <span>Words of <span className="text-[#2E9E5B]">Trust & Gratitude</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Carousel Card */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative">
          <Quote className="w-10 h-10 text-blue-200/50 absolute top-4 right-6 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Avatar & Patient Info */}
            <div className="md:col-span-4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
              <div className="relative mb-2.5">
                <img
                  src={activeTestimonial.avatar}
                  alt={activeTestimonial.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm border-2 border-white ring-2 ring-emerald-400"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#2E9E5B] text-white p-0.5 rounded-full shadow-xs">
                  <CheckCircle className="w-3 h-3" />
                </div>
              </div>

              <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu text-lg' : 'font-heading'}`}>
                {isUrdu ? activeTestimonial.nameUrdu : activeTestimonial.name}
              </h3>
              <p className={`text-xs text-slate-500 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? activeTestimonial.cityUrdu : activeTestimonial.city}
              </p>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-[#1E5AA8]">
                {isUrdu ? activeTestimonial.departmentUrdu : activeTestimonial.department}
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 mt-2">
                {[...Array(activeTestimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-3">
              <p className={`text-sm sm:text-base text-slate-700 italic leading-relaxed ${isUrdu ? 'font-urdu text-base leading-loose not-italic' : 'font-body'}`}>
                "{isUrdu ? activeTestimonial.commentUrdu : activeTestimonial.comment}"
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                <div className="text-xs text-slate-400 font-medium">
                  {isUrdu ? 'تصدیق شدہ مریض' : 'Verified Hospital Patient'} • {activeTestimonial.date}
                </div>

                {/* Slider Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    type="button"
                    aria-label="Previous patient story"
                    className="p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={next}
                    type="button"
                    aria-label="Next patient story"
                    className="p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          {allTestimonials.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-5">
              {allTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-5 bg-[#1E5AA8]' : 'w-1.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
