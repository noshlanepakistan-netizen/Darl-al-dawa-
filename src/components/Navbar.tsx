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

      // Section tracker in the exact new page order
      const sections = [
        'home',
        'appointment',
        'departments',
        'doctors',
        'services',
        'about',
        'packages',
        'testimonials',
        'gallery',
        'blog',
        'faq',
        'contact'
      ];
      const scrollPosition = window.scrollY + 140;

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

  // Reordered navigation links matching the new layout
  const navLinks = [
    { id: 'home', label: t.home, href: '#home' },
    { id: 'appointment', label: t.appointment, href: '#appointment' },
    { id: 'departments', label: t.departments, href: '#departments' },
    { id: 'doctors', label: t.doctors, href: '#doctors' },
    { id: 'services', label: t.services, href: '#services' },
    { id: 'about', label: t.about, href: '#about' },
    { id: 'packages', label: t.packages, href: '#packages' },
    { id: 'testimonials', label: isUrdu ? 'تاثرات' : 'Testimonials', href: '#testimonials' },
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
          : 'bg-white py-3 border-b border-slate-100 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="focus:outline-none">
          <Logo isUrdu={isUrdu} />
        </a>

        {/* Desktop Navigation Links (New Order) */}
        <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isUrdu ? 'font-urdu text-sm' : 'font-body'
                } ${
                  isActive
                    ? 'text-[#1E5AA8] bg-blue-50 font-bold'
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
              className="text-xs font-semibold text-slate-700 hover:text-[#1E5AA8] px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer whitespace-nowrap"
            >
              <span>{isUrdu ? 'آن لائن رپورٹ' : 'Lab Reports'}</span>
            </button>
          )}

          {onGoToAdmin && (
            <button
              onClick={onGoToAdmin}
              type="button"
              className="text-xs font-semibold text-slate-700 hover:text-[#1E5AA8] px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer whitespace-nowrap"
            >
              <span>{isUrdu ? 'اسٹاف لاگ ان' : 'Staff Portal'}</span>
            </button>
          )}

          {/* 24/7 Emergency Quick Call */}
          <a
            href={`tel:${HOSPITAL_CONFIG.contact.emergencyNumberRaw}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-[#D62828] border border-red-200 hover:bg-red-100 font-bold text-xs transition-colors whitespace-nowrap shadow-xs"
            title="Call 24/7 Emergency Hotline"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="font-mono">1122 / 042</span>
          </a>

          {/* Book Appointment CTA */}
          <button
            onClick={() => onNavigateToAppointment()}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu text-sm' : ''}>{t.bookBtn}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title={isUrdu ? "Switch to English" : "اردو میں دیکھیں"}
          >
            <Globe className="w-3.5 h-3.5 text-[#1E5AA8]" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>
        </div>

        {/* Mobile Menu & Language Toggle Button */}
        <div className="flex items-center gap-2 xl:hidden">
          <button
            onClick={onToggleLang}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Globe className="w-3 h-3 text-[#1E5AA8]" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                  isUrdu ? 'font-urdu text-base' : ''
                } ${
                  activeSection === link.id
                    ? 'bg-blue-50 text-[#1E5AA8] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 ${isUrdu ? 'rotate-180' : ''}`} />
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToAppointment();
              }}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1E5AA8] text-white font-bold text-sm shadow-xs"
            >
              <CalendarCheck className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu text-base' : ''}>{t.bookBtn}</span>
            </button>

            <a
              href={`tel:${HOSPITAL_CONFIG.contact.emergencyNumberRaw}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold text-sm shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isUrdu ? 'فوری ایمرجنسی کال (24/7)' : '24/7 Emergency Call'}</span>
            </a>

            {onOpenReportsModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReportsModal();
                }}
                type="button"
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs text-center block"
              >
                <span>{isUrdu ? 'آن لائن لیب رپورٹ ڈاؤن لوڈ' : 'Download Lab Report'}</span>
              </button>
            )}

            {onGoToAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoToAdmin();
                }}
                type="button"
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs text-center block"
              >
                <span>{isUrdu ? 'اسٹاف ایڈمن پورٹل' : 'Staff Admin Portal'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
