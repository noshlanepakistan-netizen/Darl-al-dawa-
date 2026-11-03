import React from 'react';
import {
  Truck,
  TestTubes,
  Radio,
  HeartHandshake,
  Stethoscope,
  Pill,
  Home,
  FileCheck2,
  CheckCircle,
  Building,
  Sparkles
} from 'lucide-react';
import { SERVICES_FACILITIES, UI_TRANSLATIONS } from '../data/hospitalData';

interface ServicesFacilitiesProps {
  lang: 'en' | 'ur';
  onBookHomeSampling: () => void;
}

const SERVICE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Truck,
  TestTubes,
  Radio,
  HeartHandshake,
  Stethoscope,
  Pill,
  Home,
  FileCheck2
};

export const ServicesFacilities: React.FC<ServicesFacilitiesProps> = ({
  lang,
  onBookHomeSampling
}) => {
  const t = UI_TRANSLATIONS[lang].services;
  const isUrdu = lang === 'ur';

  return (
    <section id="services" className="py-16 md:py-24 bg-[#F7FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-[#1E5AA8] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {t.heading}
          </h2>
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES_FACILITIES.map((service) => {
            const IconComponent = SERVICE_ICONS[service.iconName] || Building;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Image with overlay badge */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    
                    {service.badge && (
                      <div className="absolute top-3 left-3 bg-[#1E5AA8] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                        {isUrdu ? service.badgeUrdu : service.badge}
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-sm font-bold truncate ${isUrdu ? 'font-urdu text-base' : ''}`}>
                        {isUrdu ? service.titleUrdu : service.title}
                      </span>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="p-5">
                    <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${isUrdu ? 'font-urdu text-sm leading-normal' : ''}`}>
                      {isUrdu ? service.descriptionUrdu : service.description}
                    </p>
                  </div>
                </div>

                {/* Footer contextual actions */}
                <div className="p-5 pt-0">
                  {service.id === 'home-sampling' ? (
                    <button
                      type="button"
                      onClick={onBookHomeSampling}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-[#2E9E5B] text-[#2E9E5B] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span className={isUrdu ? 'font-urdu' : ''}>
                        {isUrdu ? 'گھر سے بلڈ ٹیسٹ بک کریں' : 'Book Home Collection'}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <CheckCircle className="w-3.5 h-3.5 text-[#2E9E5B]" />
                      <span>{isUrdu ? '24/7 فعال سروس' : '24/7 Active Facility'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
