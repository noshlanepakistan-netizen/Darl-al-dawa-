import React, { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';
import { GALLERY_ITEMS, UI_TRANSLATIONS, GalleryItem } from '../data/hospitalData';

interface GallerySectionProps {
  lang: 'en' | 'ur';
}

export const GallerySection: React.FC<GallerySectionProps> = ({ lang }) => {
  const t = UI_TRANSLATIONS[lang].gallery;
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

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

  const displayedItems = showAllPhotos ? filteredItems : filteredItems.slice(0, 4);

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
    <section id="gallery" className="py-12 md:py-16 bg-[#F7FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Camera className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>دار الدواء میڈیکل سنٹر کی <span className="text-[#2E9E5B]">تصاویر و جائزہ</span></span>
            ) : (
              <span>Inside <span className="text-[#2E9E5B]">Dar al Dawa Medical Center</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-6">
          {filterTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowAllPhotos(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E5AA8] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={isUrdu ? 'font-urdu text-sm' : ''}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4-Column Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {displayedItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer bg-slate-900 aspect-4/3"
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
              <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[#1E5AA8] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {isUrdu ? item.categoryLabelUrdu : item.categoryLabel}
              </div>

              {/* Zoom icon on hover */}
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              {/* Captions */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <h4 className={`text-xs sm:text-sm font-bold leading-tight mb-0.5 truncate ${isUrdu ? 'font-urdu text-base' : 'font-heading'}`}>
                  {isUrdu ? item.titleUrdu : item.title}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-1">
                  {isUrdu ? item.descriptionUrdu : item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Toggle */}
        {filteredItems.length > 4 && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#1E5AA8] hover:border-blue-200 font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
              <span>
                {showAllPhotos
                  ? (isUrdu ? 'کم دکھائیں' : 'Show Less')
                  : (isUrdu ? `تمام ${filteredItems.length} تصاویر دیکھیں` : `View All ${filteredItems.length} Photos`)}
              </span>
              {showAllPhotos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close photo preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Caption */}
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[lightboxIndex].image}
              alt={filteredItems[lightboxIndex].title}
              className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl mb-4"
            />
            <div className="text-center text-white max-w-xl px-4">
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E5AA8] mb-1.5">
                {isUrdu
                  ? filteredItems[lightboxIndex].categoryLabelUrdu
                  : filteredItems[lightboxIndex].categoryLabel}
              </div>
              <h3 className={`text-base sm:text-lg font-bold mb-1 ${isUrdu ? 'font-urdu text-xl' : ''}`}>
                {isUrdu
                  ? filteredItems[lightboxIndex].titleUrdu
                  : filteredItems[lightboxIndex].title}
              </h3>
              <p className="text-xs text-slate-300">
                {isUrdu
                  ? filteredItems[lightboxIndex].descriptionUrdu
                  : filteredItems[lightboxIndex].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
