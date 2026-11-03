import React, { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { GALLERY_ITEMS, UI_TRANSLATIONS, GalleryItem } from '../data/hospitalData';

interface GallerySectionProps {
  lang: 'en' | 'ur';
}

export const GallerySection: React.FC<GallerySectionProps> = ({ lang }) => {
  const t = UI_TRANSLATIONS[lang].gallery;
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filterTabs = [
    { id: 'all', label: t.all },
    { id: 'facilities', label: t.facilities },
    { id: 'theatres', label: t.theatres },
    { id: 'wards', label: t.wards },
    { id: 'diagnostics', label: t.diagnostics }
  ];

  const filteredItems = activeTab === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeTab);

  const openLightbox = (indexInFiltered: number) => {
    setLightboxIndex(indexInFiltered);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! === filteredItems.length - 1 ? 0 : prev! + 1));
  };

  const prevPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! === 0 ? filteredItems.length - 1 : prev! - 1));
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#F7FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-[#1E5AA8] text-xs font-semibold uppercase tracking-wider mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {t.heading}
          </h2>
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {filterTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E5AA8] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={isUrdu ? 'font-urdu' : ''}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer bg-slate-900 aspect-4/3"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Category Pill */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#1E5AA8] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                {isUrdu ? item.categoryLabelUrdu : item.categoryLabel}
              </div>

              {/* Zoom icon on hover */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Captions */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className={`text-sm sm:text-base font-bold leading-tight mb-1 ${isUrdu ? 'font-urdu text-base' : 'font-heading'}`}>
                  {isUrdu ? item.titleUrdu : item.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {isUrdu ? item.descriptionUrdu : item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            type="button"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            aria-label="Close photo preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Image container */}
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[lightboxIndex].image}
              alt={filteredItems[lightboxIndex].title}
              className="max-h-[68vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            <div className="text-center text-white mt-4 max-w-xl">
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                {isUrdu ? filteredItems[lightboxIndex].categoryLabelUrdu : filteredItems[lightboxIndex].categoryLabel}
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? filteredItems[lightboxIndex].titleUrdu : filteredItems[lightboxIndex].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isUrdu ? filteredItems[lightboxIndex].descriptionUrdu : filteredItems[lightboxIndex].description}
              </p>
              <div className="text-[11px] text-slate-500 mt-2 font-mono">
                {lightboxIndex + 1} / {filteredItems.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
