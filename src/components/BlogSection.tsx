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
    <section id="blog" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {t.heading}
          </h2>
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Featured Image */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-[#1E5AA8] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                    {isUrdu ? post.categoryUrdu : post.category}
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className={isUrdu ? 'font-urdu' : ''}>
                        {isUrdu ? post.authorUrdu : post.author}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className={isUrdu ? 'font-urdu' : ''}>
                        {isUrdu ? post.readTimeUrdu : post.readTime}
                      </span>
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold text-slate-900 group-hover:text-[#1E5AA8] transition-colors mb-2 leading-snug ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                    {isUrdu ? post.titleUrdu : post.title}
                  </h3>

                  <p className={`text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 ${isUrdu ? 'font-urdu text-sm leading-normal' : ''}`}>
                    {isUrdu ? post.excerptUrdu : post.excerpt}
                  </p>
                </div>
              </div>

              {/* Read button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#1E5AA8] text-[#1E5AA8] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
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
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              aria-label="Close article modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1E5AA8] mb-3">
              {isUrdu ? selectedPost.categoryUrdu : selectedPost.category}
            </div>

            <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 mb-3 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
              {isUrdu ? selectedPost.titleUrdu : selectedPost.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100 mb-6">
              <span>{isUrdu ? selectedPost.authorUrdu : selectedPost.author}</span>
              <span>•</span>
              <span>{selectedPost.date}</span>
              <span>•</span>
              <span>{isUrdu ? selectedPost.readTimeUrdu : selectedPost.readTime}</span>
            </div>

            <div className="rounded-2xl overflow-hidden mb-6 h-56">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
              {(isUrdu ? selectedPost.contentUrdu : selectedPost.content).map((paragraph, idx) => (
                <p key={idx} className={isUrdu ? 'font-urdu text-base leading-loose' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {isUrdu ? 'دار الدواء میڈیکل سنٹر شعبہ تعلیمِ صحت' : 'Dar al Dawa Medical Center Health Desk'}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                {t.closeArticle}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
