import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  LayoutTemplate,
  Save,
  Globe,
  FileText,
  Camera,
  MessageSquareQuote,
  HelpCircle,
  Phone,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import { GALLERY_ITEMS, TESTIMONIALS, BLOG_POSTS, FAQS, GalleryItem, Testimonial, BlogPost, FAQItem } from '../../data/hospitalData';

interface ContentManagerPageProps {
  lang: 'en' | 'ur';
}

export const ContentManagerPage: React.FC<ContentManagerPageProps> = ({ lang }) => {
  const { hospitalConfig, updateHospitalConfig, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'faqs' | 'gallery'>('hero');

  // Hero States
  const [heroTagline, setHeroTagline] = useState(hospitalConfig.tagline);
  const [heroTaglineUrdu, setHeroTaglineUrdu] = useState(hospitalConfig.taglineUrdu);
  const [heroDesc, setHeroDesc] = useState(hospitalConfig.shortDesc);
  const [heroDescUrdu, setHeroDescUrdu] = useState(hospitalConfig.shortDescUrdu);

  // Contact States
  const [emergencyPhone, setEmergencyPhone] = useState(hospitalConfig.contact.emergencyNumber);
  const [receptionPhone, setReceptionPhone] = useState(hospitalConfig.contact.receptionPhone);
  const [whatsapp, setWhatsapp] = useState(hospitalConfig.contact.whatsapp);
  const [email, setEmail] = useState(hospitalConfig.contact.email);
  const [address, setAddress] = useState(hospitalConfig.contact.address);
  const [addressUrdu, setAddressUrdu] = useState(hospitalConfig.contact.addressUrdu);

  // FAQs list in state
  const [faqsList, setFaqsList] = useState<FAQItem[]>(FAQS);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Gallery items in state
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalImage, setNewGalImage] = useState('');

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalConfig({
      tagline: heroTagline,
      taglineUrdu: heroTaglineUrdu,
      shortDesc: heroDesc,
      shortDescUrdu: heroDescUrdu
    });
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalConfig({
      contact: {
        ...hospitalConfig.contact,
        emergencyNumber: emergencyPhone,
        emergencyNumberRaw: emergencyPhone.replace(/[\s-]/g, ''),
        receptionPhone,
        whatsapp,
        whatsappClean: whatsapp.replace(/[\s+-]/g, ''),
        email,
        address,
        addressUrdu
      }
    });
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      question: newQuestion,
      questionUrdu: newQuestion,
      answer: newAnswer,
      answerUrdu: newAnswer,
      category: 'general'
    };
    setFaqsList((prev) => [newItem, ...prev]);
    setNewQuestion('');
    setNewAnswer('');
    showToast('FAQ added successfully!');
  };

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle.trim() || !newGalImage.trim()) return;
    const item: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newGalTitle,
      titleUrdu: newGalTitle,
      category: 'facilities',
      categoryLabel: 'Hospital Facilities',
      categoryLabelUrdu: 'ہسپتال کی سہولیات',
      image: newGalImage,
      description: 'Hospital campus photographic view',
      descriptionUrdu: 'ہسپتال کے اندرونی مناظر'
    };
    setGalleryList((prev) => [item, ...prev]);
    setNewGalTitle('');
    setNewGalImage('');
    showToast('Gallery image added!');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
          {isUrdu ? 'ویب سائٹ مواد مینیجر (CMS)' : 'Website Content Manager (CMS)'}
        </h1>
        <p className="text-xs text-slate-500">
          {isUrdu ? 'ہسپتال کا بنیادی مواد، ہیڈلائنز، رابطہ نمبرز، تصاویر اور سوالات میں فوری ردوبدل کریں۔' : 'Control live public website content, hero banner copy, phone numbers, FAQ accordion, and gallery.'}
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {[
          { id: 'hero', label: 'Hero Banner & Slogans', icon: Globe },
          { id: 'contact', label: 'Contact Directory & Hotlines', icon: Phone },
          { id: 'faqs', label: `FAQs (${faqsList.length})`, icon: HelpCircle },
          { id: 'gallery', label: `Gallery Media (${galleryList.length})`, icon: Camera }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#1E5AA8] text-[#1E5AA8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Hero Banner */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 max-w-3xl">
          <h3 className="font-bold text-slate-900 text-sm">Main Headline & Subtitles</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Slogan (English) *</label>
            <input
              type="text"
              required
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-[#1E5AA8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Slogan (Urdu) *</label>
            <input
              type="text"
              required
              value={heroTaglineUrdu}
              onChange={(e) => setHeroTaglineUrdu(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-urdu outline-none focus:border-[#1E5AA8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Subtitle Paragraph (English) *</label>
            <textarea
              rows={3}
              required
              value={heroDesc}
              onChange={(e) => setHeroDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-[#1E5AA8] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Subtitle Paragraph (Urdu) *</label>
            <textarea
              rows={3}
              required
              value={heroDescUrdu}
              onChange={(e) => setHeroDescUrdu(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-urdu outline-none focus:border-[#1E5AA8] resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Publish Changes</span>
          </button>
        </form>
      )}

      {/* Tab: Contact Directory */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 max-w-3xl text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Emergency Hotlines & Hospital Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">24/7 Emergency Hotline *</label>
              <input
                type="text"
                required
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[#D62828] font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">OPD Reception Phone *</label>
              <input
                type="text"
                required
                value={receptionPhone}
                onChange={(e) => setReceptionPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Official Number *</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[#2E9E5B] font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Physical Address (Gulberg Lahore) *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Physical Address (Urdu) *</label>
            <input
              type="text"
              required
              value={addressUrdu}
              onChange={(e) => setAddressUrdu(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update Contact Info</span>
          </button>
        </form>
      )}

      {/* Tab: FAQs */}
      {activeTab === 'faqs' && (
        <div className="space-y-6 max-w-4xl">
          {/* Add FAQ form */}
          <form onSubmit={handleAddFaq} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Add New Public FAQ</h4>
            <div>
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Question (e.g. What are the rules for Sehat Card Plus admission?)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <textarea
                rows={2}
                required
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Answer to display in the accordion..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 resize-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#1E5AA8] text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </form>

          {/* List */}
          <div className="space-y-3">
            {faqsList.map((faq) => (
              <div key={faq.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-start gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-sm mb-1">{faq.question}</div>
                  <div className="text-xs text-slate-600">{faq.answer}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFaqsList(faqsList.filter((f) => f.id !== faq.id))}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Gallery */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <form onSubmit={handleAddGalleryItem} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 text-xs">
            <input
              type="text"
              required
              value={newGalTitle}
              onChange={(e) => setNewGalTitle(e.target.value)}
              placeholder="Photo title (e.g. Modern CT Scanner Suite)"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300"
            />
            <input
              type="url"
              required
              value={newGalImage}
              onChange={(e) => setNewGalImage(e.target.value)}
              placeholder="Image URL (https://images.unsplash.com/...)"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2E9E5B] text-white font-bold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Image</span>
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryList.map((img) => (
              <div key={img.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative group">
                <img src={img.image} alt={img.title} className="w-full h-36 object-cover" />
                <div className="p-3">
                  <div className="font-bold text-slate-900 text-xs truncate">{img.title}</div>
                  <div className="text-[10px] text-slate-400">{img.categoryLabel}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setGalleryList(galleryList.filter((g) => g.id !== img.id))}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
