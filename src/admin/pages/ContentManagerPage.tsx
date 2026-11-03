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
import { ImageUploadField } from '../components/ImageUploadField';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { FAQItem, GalleryItem } from '../../data/hospitalData';

interface ContentManagerPageProps {
  lang: 'en' | 'ur';
}

export const ContentManagerPage: React.FC<ContentManagerPageProps> = ({ lang }) => {
  const {
    hospitalConfig,
    updateHospitalConfig,
    homepageSettings,
    updateHomepageSettings,
    gallery,
    addGalleryItem,
    deleteGalleryItem,
    faqs,
    addFaq,
    deleteFaq,
    showToast
  } = useAdminData();
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'faqs' | 'gallery'>('hero');

  // Hero States
  const [heroHeading, setHeroHeading] = useState(homepageSettings?.heroHeading || hospitalConfig.tagline);
  const [heroDesc, setHeroDesc] = useState(homepageSettings?.heroSubheading || hospitalConfig.shortDesc);
  const [heroBtnText, setHeroBtnText] = useState(homepageSettings?.heroButtonText || 'Book an Appointment');

  // About States
  const [aboutBadge, setAboutBadge] = useState(homepageSettings?.aboutBadge || 'About Dar al Dawa');
  const [aboutHeading, setAboutHeading] = useState(homepageSettings?.aboutHeading || 'A Tradition of Healing');
  const [aboutSubheading, setAboutSubheading] = useState(homepageSettings?.aboutSubheading || '');
  const [aboutMission, setAboutMission] = useState(homepageSettings?.aboutMission || '');
  const [aboutVision, setAboutVision] = useState(homepageSettings?.aboutVision || '');
  const [aboutImage, setAboutImage] = useState(homepageSettings?.aboutImage || '');

  // Contact States
  const [emergencyPhone, setEmergencyPhone] = useState(hospitalConfig.contact.emergencyNumber);
  const [receptionPhone, setReceptionPhone] = useState(hospitalConfig.contact.receptionPhone);
  const [whatsapp, setWhatsapp] = useState(hospitalConfig.contact.whatsapp);
  const [email, setEmail] = useState(hospitalConfig.contact.email);
  const [address, setAddress] = useState(hospitalConfig.contact.address);

  // FAQs form
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('general');

  // Gallery form
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalImage, setNewGalImage] = useState('');
  const [newGalCategory, setNewGalCategory] = useState<'facilities' | 'theatres' | 'wards' | 'diagnostics'>('facilities');

  // Confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateHomepageSettings({
      heroHeading,
      heroSubheading: heroDesc,
      heroButtonText: heroBtnText
    });
    showToast('Hero section updated on homepage!');
  };

  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    updateHomepageSettings({
      aboutBadge,
      aboutHeading,
      aboutSubheading,
      aboutMission,
      aboutVision,
      aboutImage
    });
    showToast('About section content updated on homepage!');
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
        address
      }
    });
    showToast('Contact details updated on website!');
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    addFaq({
      question: newQuestion,
      questionUrdu: newQuestion,
      answer: newAnswer,
      answerUrdu: newAnswer,
      category: newCategory
    });
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle.trim() || !newGalImage.trim()) {
      showToast('Photo title and device image are required', 'error');
      return;
    }
    const catLabels = {
      facilities: 'Hospital Facilities',
      theatres: 'Operation Theatres & ICU',
      wards: 'Patient Wards',
      diagnostics: 'Diagnostics & Lab'
    };
    addGalleryItem({
      title: newGalTitle,
      titleUrdu: newGalTitle,
      category: newGalCategory,
      categoryLabel: catLabels[newGalCategory],
      categoryLabelUrdu: catLabels[newGalCategory],
      image: newGalImage,
      description: newGalTitle,
      descriptionUrdu: newGalTitle
    });
    setNewGalTitle('');
    setNewGalImage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
          {isUrdu ? 'ویب سائٹ مواد اور میڈیا مینجر' : 'Website CMS & Media Manager'}
        </h1>
        <p className="text-xs text-slate-500">
          {isUrdu
            ? 'ہوم پیج، اباؤٹ سنٹر، ہسپتال گیلری اور اکثر پوچھے جانے والے سوالات کو لائیو اپ ڈیٹ کریں۔'
            : 'Update banners, About section, FAQs, contact details, and hospital gallery.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-2">
        {[
          { key: 'hero', label: 'Hero Banner', icon: LayoutTemplate },
          { key: 'about', label: 'About Hospital', icon: FileText },
          { key: 'contact', label: 'Contact Details', icon: Phone },
          { key: 'faqs', label: `FAQs (${faqs.length})`, icon: HelpCircle },
          { key: 'gallery', label: `Gallery (${gallery.length})`, icon: Camera }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Hero */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Hero Top Banner Settings</h3>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hero Heading</label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hero Subheading</label>
            <textarea
              rows={3}
              value={heroDesc}
              onChange={(e) => setHeroDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary CTA Button Label</label>
            <input
              type="text"
              value={heroBtnText}
              onChange={(e) => setHeroBtnText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Hero Banner</span>
          </button>
        </form>
      )}

      {/* Tab: About */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">About Hospital Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Badge</label>
              <input
                type="text"
                value={aboutBadge}
                onChange={(e) => setAboutBadge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Main Heading</label>
              <input
                type="text"
                value={aboutHeading}
                onChange={(e) => setAboutHeading(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Subheading Description</label>
              <textarea
                rows={2}
                value={aboutSubheading}
                onChange={(e) => setAboutSubheading(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mission Statement</label>
              <textarea
                rows={3}
                value={aboutMission}
                onChange={(e) => setAboutMission(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vision Statement</label>
              <textarea
                rows={3}
                value={aboutVision}
                onChange={(e) => setAboutVision(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* About Image upload from device (no URL) */}
            <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <ImageUploadField
                label="About Section Hospital Photo"
                value={aboutImage}
                onChange={setAboutImage}
                aspectRatio="wide"
                helpText="Choose hospital photo directly from device / gallery"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save About Section</span>
          </button>
        </form>
      )}

      {/* Tab: Contact */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Public Contact Numbers & Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">24/7 Emergency Hotline</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reception & OPD Landline</label>
              <input
                type="text"
                value={receptionPhone}
                onChange={(e) => setReceptionPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Contact Info</span>
          </button>
        </form>
      )}

      {/* Tab: FAQs */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <form onSubmit={handleAddFaq} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Add New Public FAQ</h4>
            <div>
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Question (e.g. What are the rules for Sehat Card Plus admission?)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <textarea
                rows={2}
                required
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Answer to display in the accordion..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 resize-none focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </form>

          {/* List */}
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-start gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-sm mb-1">{faq.question}</div>
                  <div className="text-xs text-slate-600">{faq.answer}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({
                      isOpen: true,
                      title: 'Delete FAQ?',
                      message: `Are you sure you want to delete this FAQ question?`,
                      itemName: faq.question,
                      onConfirm: () => deleteFaq(faq.id)
                    })
                  }
                  className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                  title="Delete FAQ"
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
          <form onSubmit={handleAddGalleryItem} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Add Image To Hospital Gallery</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo Title / Caption</label>
                <input
                  type="text"
                  required
                  value={newGalTitle}
                  onChange={(e) => setNewGalTitle(e.target.value)}
                  placeholder="Photo title (e.g. Modern CT Scanner Suite)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newGalCategory}
                  onChange={(e) => setNewGalCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-500"
                >
                  <option value="facilities">Hospital Facilities & Exterior</option>
                  <option value="theatres">Operation Theatres & ICU</option>
                  <option value="wards">Patient Rooms & Wards</option>
                  <option value="diagnostics">Diagnostics & Pathology Lab</option>
                </select>
              </div>
            </div>

            {/* Device Image upload only - No URL */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <ImageUploadField
                label="Select Photo From Device"
                value={newGalImage}
                onChange={setNewGalImage}
                aspectRatio="wide"
                helpText="Choose image directly from device / gallery"
                required
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Image to Gallery</span>
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((img) => (
              <div key={img.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative group">
                <img src={img.image} alt={img.title} className="w-full h-36 object-cover" />
                <div className="p-3">
                  <div className="font-bold text-slate-900 text-xs truncate">{img.title}</div>
                  <div className="text-[10px] text-teal-700 font-semibold">{img.categoryLabel}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({
                      isOpen: true,
                      title: 'Delete Photo?',
                      message: `Are you sure you want to remove "${img.title}" from the hospital gallery?`,
                      itemName: img.title,
                      onConfirm: () => deleteGalleryItem(img.id)
                    })
                  }
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer transition-opacity opacity-0 group-hover:opacity-100"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
        onConfirm={deleteModal.onConfirm}
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false })}
      />
    </div>
  );
};
