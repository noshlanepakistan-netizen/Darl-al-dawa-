import React, { useState, useEffect } from 'react';
import { Menu, X, PhoneCall, CalendarCheck, Globe, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { HOSPITAL_CONFIG, UI_TRANSLATIONS } from '../data/hospitalData';

interface NavbarProps {
  lang: 'en' | 'ur';
  onToggleLang: () => void;
  onNavigateToAppointment: (deptId?: string, doctorId?: string) => void;
  onOpenReportsModal?: () => void;
  onGoToAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onNavigateToAppointment,
  onOpenReportsModal,
  onGoToAdmin
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const t = UI_TRANSLATIONS[lang].nav;
  const isUrdu = lang === 'ur';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      // Section tracker
      const sections = ['home', 'about', 'departments', 'doctors', 'services', 'packages', 'appointment', 'gallery', 'blog', 'faq', 'contact'];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: t.home, href: '#home' },
    { id: 'about', label: t.about, href: '#about' },
    { id: 'departments', label: t.departments, href: '#departments' },
    { id: 'doctors', label: t.doctors, href: '#doctors' },
    { id: 'services', label: t.services, href: '#services' },
    { id: 'packages', label: t.packages, href: '#packages' },
    { id: 'appointment', label: t.appointment, href: '#appointment' },
    { id: 'gallery', label: t.gallery, href: '#gallery' },
    { id: 'blog', label: t.blog, href: '#blog' },
    { id: 'faq', label: t.faq, href: '#faq' },
    { id: 'contact', label: t.contact, href: '#contact' }
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetEl = document.querySelector(href);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-slate-200'
          : 'bg-white py-3.5 border-b border-slate-100 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="focus:outline-none">
          <Logo isUrdu={isUrdu} />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 2xl:gap-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isUrdu ? 'font-urdu text-base' : 'font-body'
                } ${
                  isActive
                    ? 'text-[#1E5AA8] bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:text-[#1E5AA8] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons: Reports, Admin, Emergency, Book, Language Toggle */}
        <div className="hidden lg:flex items-center gap-2">
          {onOpenReportsModal && (
            <button
              onClick={onOpenReportsModal}
              type="button"
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:text-[#1E5AA8] hover:border-[#1E5AA8] text-xs font-semibold cursor-pointer"
            >
              {isUrdu ? 'لیب رپورٹس' : 'Lab Reports'}
            </button>
          )}

          {onGoToAdmin && (
            <button
              onClick={onGoToAdmin}
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              {isUrdu ? 'اسٹاف پورٹل' : 'Staff Portal'}
            </button>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={onToggleLang}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:text-[#1E5AA8] hover:border-[#1E5AA8] transition-all bg-slate-50 hover:bg-white text-xs font-semibold shadow-xs"
            aria-label="Toggle language between English and Urdu"
          >
            <Globe className="w-3.5 h-3.5 text-[#1E5AA8]" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Emergency Button (Red #D62828) */}
          <a
            href={`tel:${HOSPITAL_CONFIG.contact.emergencyNumberRaw}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D62828] hover:bg-[#b71f1f] text-white text-xs font-bold tracking-wide uppercase shadow-sm hover:shadow-md transition-all active:scale-95"
            title="Call 24/7 Hospital Emergency"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span className={isUrdu ? 'font-urdu text-sm capitalize font-normal' : ''}>
              {isUrdu ? 'ایمرجنسی' : 'Emergency'}
            </span>
          </a>

          {/* Book Appointment Button (Green #2E9E5B) */}
          <button
            onClick={() => onNavigateToAppointment()}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu text-sm font-normal' : ''}>
              {t.bookBtn}
            </span>
          </button>
        </div>

        {/* Mobile controls: Lang toggle + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onToggleLang}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50"
          >
            <Globe className="w-3 h-3 text-[#1E5AA8]" />
            <span>{isUrdu ? 'EN' : 'اردو'}</span>
          </button>

          <a
            href={`tel:${HOSPITAL_CONFIG.contact.emergencyNumberRaw}`}
            className="p-2 rounded-lg bg-[#D62828] text-white"
            aria-label="Call Emergency"
          >
            <PhoneCall className="w-4 h-4" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-white border-b border-slate-200 shadow-xl max-h-[85vh] overflow-y-auto px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-base font-medium transition-colors ${
                  isUrdu ? 'font-urdu text-lg' : 'font-body'
                } ${
                  activeSection === link.id
                    ? 'bg-blue-50 text-[#1E5AA8] font-semibold'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 ${isUrdu ? 'rotate-180' : ''}`} />
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToAppointment();
              }}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-semibold shadow-md text-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu' : ''}>{t.bookBtn}</span>
            </button>

            <a
              href={`tel:${HOSPITAL_CONFIG.contact.emergencyNumberRaw}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#D62828] hover:bg-[#b71f1f] text-white font-bold text-sm shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isUrdu ? 'ایمرجنسی کال: 042-111-327-227' : '24/7 Emergency: 042-111-327-227'}</span>
            </a>

            {onOpenReportsModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReportsModal();
                }}
                type="button"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                {isUrdu ? 'آن لائن لیب رپورٹ ڈاؤن لوڈ' : 'Download Lab Report'}
              </button>
            )}

            {onGoToAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoToAdmin();
                }}
                type="button"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 text-white font-semibold text-xs"
              >
                {isUrdu ? 'اسٹاف پورٹل لاگ ان' : 'Staff Portal Login'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
