import React, { useState } from 'react';
import { BookOpen, Clock, User, ArrowRight, X, Heart, ShieldAlert } from 'lucide-react';
import { BLOG_POSTS, UI_TRANSLATIONS, BlogPost } from '../data/hospitalData';

interface BlogSectionProps {
  lang: 'en' | 'ur';
}

export const BlogSection: React.FC<BlogSectionProps> = ({ lang }) => {
  const t = UI_TRANSLATIONS[lang].blog;
  const isUrdu = lang === 'ur';

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="py-12 md:py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2.5 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>طبی مشورے اور <span className="text-[#2E9E5B]">صحت کی آگاہی</span></span>
            ) : (
              <span>Health Tips & <span className="text-[#2E9E5B]">Medical Insights</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-2.5" />
          <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                {/* Featured Image */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#1E5AA8] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {isUrdu ? post.categoryUrdu : post.category}
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className={isUrdu ? 'font-urdu' : ''}>
                        {isUrdu ? post.authorUrdu : post.author}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className={isUrdu ? 'font-urdu' : ''}>
                        {isUrdu ? post.readTimeUrdu : post.readTime}
                      </span>
                    </span>
                  </div>

                  <h3 className={`text-base font-bold text-slate-900 group-hover:text-[#1E5AA8] transition-colors mb-2 leading-snug ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                    {isUrdu ? post.titleUrdu : post.title}
                  </h3>

                  <p className={`text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3 ${isUrdu ? 'font-urdu text-sm leading-normal' : ''}`}>
                    {isUrdu ? post.excerptUrdu : post.excerpt}
                  </p>
                </div>
              </div>

              {/* Read button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#1E5AA8] text-[#1E5AA8] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <span className={isUrdu ? 'font-urdu text-sm' : ''}>{t.readMore}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Full Article Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close article"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1E5AA8] mb-3">
              {isUrdu ? selectedPost.categoryUrdu : selectedPost.category}
            </div>

            <h3 className={`text-xl sm:text-2xl font-bold text-slate-900 mb-3 ${isUrdu ? 'font-urdu text-2xl sm:text-3xl' : 'font-heading'}`}>
              {isUrdu ? selectedPost.titleUrdu : selectedPost.title}
            </h3>

            <div className="flex items-center gap-4 text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
              <span className="font-medium text-slate-700">
                {isUrdu ? selectedPost.authorUrdu : selectedPost.author}
              </span>
              <span>•</span>
              <span>{selectedPost.date}</span>
              <span>•</span>
              <span>{isUrdu ? selectedPost.readTimeUrdu : selectedPost.readTime}</span>
            </div>

            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-6 shadow-xs"
            />

            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
              {(isUrdu ? selectedPost.contentUrdu : selectedPost.content).map((paragraph, pIdx) => (
                <p key={pIdx} className={isUrdu ? 'font-urdu text-base leading-loose' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {isUrdu ? 'ڈاکٹرز ریویو شدہ معلوماتی آرٹیکل' : 'Medically Reviewed Educational Content'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                {isUrdu ? 'بند کریں' : 'Close Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
