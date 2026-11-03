import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ChevronRight,
  Heart
} from 'lucide-react';
import { Logo } from './Logo';
import { HOSPITAL_CONFIG, DEPARTMENTS, UI_TRANSLATIONS } from '../data/hospitalData';

interface FooterProps {
  lang: 'en' | 'ur';
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  const t = UI_TRANSLATIONS[lang].footer;
  const isUrdu = lang === 'ur';

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <footer className="bg-[#1F2933] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-700/80">
          
          {/* Col 1: Brand, Tagline & Socials (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Logo lightMode={true} isUrdu={isUrdu} />

            <p className={`text-xs sm:text-sm text-slate-400 leading-relaxed ${isUrdu ? 'font-urdu text-sm leading-loose' : 'font-body'}`}>
              {t.aboutText}
            </p>

            {/* Accreditation tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-emerald-400 border border-emerald-900/40">
                PHC Category-1 Regular
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-blue-400 border border-blue-900/40">
                PMDC Recognized
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-amber-300 border border-amber-900/40">
                Sehat Card Plus
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#1E5AA8] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links (2.5 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className={`text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 ${isUrdu ? 'font-urdu text-base' : 'font-heading'}`}>
              <span className="w-1.5 h-3.5 bg-[#2E9E5B] rounded-full inline-block" />
              <span>{t.quickLinks}</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { id: 'home', label: 'Home / صفحہ اول' },
                { id: 'about', label: 'About Us / ہمارے متعلق' },
                { id: 'departments', label: 'Departments / شعبہ جات' },
                { id: 'doctors', label: 'Our Doctors / ڈاکٹرز' },
                { id: 'services', label: 'Services / سہولیات' },
                { id: 'packages', label: 'Lab Packages / پیکیجز' },
                { id: 'appointment', label: 'Book Appointment / وقت لیں' },
                { id: 'gallery', label: 'Gallery / تصاویر' },
                { id: 'faq', label: 'FAQs / سوالات' }
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:text-emerald-400"
                  >
                    <ChevronRight className={`w-3.5 h-3.5 text-[#2E9E5B] ${isUrdu ? 'rotate-180' : ''}`} />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Key Departments (2.5 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className={`text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 ${isUrdu ? 'font-urdu text-base' : 'font-heading'}`}>
              <span className="w-1.5 h-3.5 bg-[#2E9E5B] rounded-full inline-block" />
              <span>{t.departmentsList}</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              {DEPARTMENTS.slice(0, 7).map((dept) => (
                <li key={dept.id}>
                  <a
                    href="#departments"
                    onClick={(e) => handleNavClick(e, 'departments')}
                    className="hover:text-emerald-400 transition-colors flex items-center justify-between"
                  >
                    <span>{isUrdu ? dept.titleUrdu : dept.title}</span>
                    {dept.id === 'emergency' && (
                      <span className="text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded">24/7</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Hours (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className={`text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 ${isUrdu ? 'font-urdu text-base' : 'font-heading'}`}>
              <span className="w-1.5 h-3.5 bg-[#2E9E5B] rounded-full inline-block" />
              <span>{t.contactInfo}</span>
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#2E9E5B] mt-1 flex-shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>
                  {isUrdu ? HOSPITAL_CONFIG.contact.addressUrdu : HOSPITAL_CONFIG.contact.address}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D62828] flex-shrink-0" />
                <div>
                  <span className="text-white font-mono font-bold block">{HOSPITAL_CONFIG.contact.emergencyNumber}</span>
                  <span className="text-[11px] text-slate-400">{isUrdu ? '24/7 ایمرجنسی ہاٹ لائن' : '24/7 Emergency & Trauma'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1E5AA8] flex-shrink-0" />
                <a href={`mailto:${HOSPITAL_CONFIG.contact.email}`} className="text-slate-300 hover:text-white font-mono text-xs">
                  {HOSPITAL_CONFIG.contact.email}
                </a>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUrdu ? 'اوقاتِ کار:' : 'Service Availability:'}</span>
                </div>
                <p>{isUrdu ? HOSPITAL_CONFIG.contact.hours.emergencyUrdu : HOSPITAL_CONFIG.contact.hours.emergency}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{HOSPITAL_CONFIG.contact.hours.opd}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 text-xs text-slate-500 space-y-4">
          <p className="leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            {t.disclaimer}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left pt-2">
            <div>
              © {new Date().getFullYear()} {HOSPITAL_CONFIG.name}. {t.rightsReserved}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span>Made with care for Lahore & Punjab</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
