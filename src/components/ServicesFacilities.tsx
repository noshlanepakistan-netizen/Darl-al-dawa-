import React, { useState } from 'react';
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
  Sparkles,
  ArrowRight,
  Clock,
  PhoneCall
} from 'lucide-react';
import { SERVICES_FACILITIES, UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

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
  const { services } = useAdminData();
  const allServices = services && services.length > 0 ? services : SERVICES_FACILITIES;
  const t = UI_TRANSLATIONS[lang].services;
  const isUrdu = lang === 'ur';

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: isUrdu ? 'تمام سہولیات' : 'All Facilities' },
    { id: 'emergency', label: isUrdu ? 'ایمرجنسی و آئی سی یو' : 'Emergency & Critical Care' },
    { id: 'diagnostics', label: isUrdu ? 'لیب و اسکیننگ' : 'Diagnostic Imaging & Lab' },
    { id: 'inpatient', label: isUrdu ? 'آپریشن تھیٹرز و فارمیسی' : 'Theatres & Pharmacy' }
  ];

  const filteredServices = allServices.filter((service) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'emergency') return service.id === 'icu';
    if (activeCategory === 'diagnostics') return service.id === 'lab' || service.id === 'imaging' || service.id === 'homesampling' || service.id === 'online-reports';
    if (activeCategory === 'inpatient') return service.id === 'theatres' || service.id === 'pharmacy';
    return true;
  });

  return (
    <section id="services" className="py-12 md:py-16 bg-[#F7FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>ہسپتال کی سروسز اور <span className="text-[#2E9E5B]">تشخیصی سہولیات</span></span>
            ) : (
              <span>Services & <span className="text-[#2E9E5B]">Diagnostic Facilities</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#1E5AA8] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Compact 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {filteredServices.map((service) => {
            const IconComponent = SERVICE_ICONS[service.iconName] || Building;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div>
                  {/* Image with overlay badge */}
                  <div className="relative h-36 overflow-hidden bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                    
                    {service.badge && (
                      <div className="absolute top-2.5 left-2.5 bg-[#1E5AA8] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                        {isUrdu ? service.badgeUrdu : service.badge}
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className={`text-xs sm:text-sm font-bold truncate ${isUrdu ? 'font-urdu text-base' : ''}`}>
                        {isUrdu ? service.titleUrdu : service.title}
                      </span>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="p-4">
                    <p className={`text-xs text-slate-600 line-clamp-3 leading-relaxed ${isUrdu ? 'font-urdu text-sm leading-normal' : ''}`}>
                      {isUrdu ? service.descriptionUrdu : service.description}
                    </p>
                  </div>
                </div>

                {service.id === 'lab' || service.id === 'homesampling' ? (
                  <div className="p-4 pt-0">
                    <button
                      onClick={onBookHomeSampling}
                      type="button"
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-[#2E9E5B] text-[#2E9E5B] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Home className="w-3 h-3" />
                      <span>{isUrdu ? 'ہوم سیمپلنگ بک کریں' : 'Book Home Sampling'}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* 24/7 Home Sample Collection Banner Strip */}
        <div className="bg-gradient-to-r from-[#1E5AA8] to-[#143e75] rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                {isUrdu ? 'لاہور بھر میں گھر سے خون کے نمونے حاصل کرنے کی مفت سروس' : '24/7 Lahore-Wide Free Home Blood Sample Collection'}
              </h3>
              <p className={`text-xs text-blue-100 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {isUrdu ? 'فون یا آن لائن آرڈر کریں، پیشہ ور فلیبوٹومسٹ 60 منٹ میں آپ کی دہلیز پر' : 'Order online or via phone. Certified phlebotomists arrive at your doorstep in under 60 minutes with sterile vacuum kits.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onBookHomeSampling}
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>
                {isUrdu ? 'ہوم سیمپلنگ بک کریں' : 'Book Home Sampling'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
