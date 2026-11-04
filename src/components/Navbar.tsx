import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PhoneCall,
  CalendarCheck,
  Globe,
  ChevronRight,
  ChevronDown,
  FileText,
  Shield
} from 'lucide-react';
import { Logo } from './Logo';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

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
  const { hospitalConfig } = useAdminData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const t = UI_TRANSLATIONS[lang].nav;
  const isUrdu = lang === 'ur';

  // Hospital phone number from Admin Panel settings (fallback to 042-111-327-227, 1122 removed completely)
  const rawEmergency = hospitalConfig?.contact?.emergencyNumber || "042-111-327-227";
  const emergencyPhone = rawEmergency.replace(/\b1122\b/g, '').replace(/\s*\/\s*/g, '').trim() || "042-111-327-227";
  const emergencyPhoneRaw = hospitalConfig?.contact?.emergencyNumberRaw
    ? hospitalConfig.contact.emergencyNumberRaw.replace(/1122/g, '')
    : emergencyPhone.replace(/[\s-]/g, '') || "042111327227";
  const dialerHref = `tel:${emergencyPhoneRaw}`;

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Section tracker on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

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

  // Primary navigation links shown directly in the desktop navbar
  const mainNavLinks = [
    { id: 'home', label: t.home, href: '#home' },
    { id: 'departments', label: t.departments, href: '#departments' },
    { id: 'doctors', label: t.doctors, href: '#doctors' },
    { id: 'services', label: t.services, href: '#services' },
    { id: 'about', label: t.about, href: '#about' }
  ];

  // Secondary navigation links housed in the clean "More" dropdown
  const moreNavLinks = [
    { id: 'packages', label: t.packages, href: '#packages' },
    { id: 'testimonials', label: isUrdu ? 'تاثرات' : 'Testimonials', href: '#testimonials' },
    { id: 'faq', label: t.faq, href: '#faq' },
    { id: 'contact', label: t.contact, href: '#contact' }
  ];

  // Complete list of links for the mobile drawer
  const allNavLinks = [
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

  const isMoreActive = moreNavLinks.some((l) => l.id === activeSection);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    const targetEl = document.querySelector(href);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-slate-200'
          : 'bg-white py-2 sm:py-3 border-b border-slate-100 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2.5 min-[360px]:px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Hospital Brand Logo */}
        <a href="#home" className="focus:outline-none shrink min-w-0 pr-1">
          <Logo isUrdu={isUrdu} />
        </a>

        {/* Desktop Navigation Links (Compact, responsive, never overflows) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
          {mainNavLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`px-2 py-1.5 xl:px-2.5 xl:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
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

          {/* "More" Dropdown Menu for secondary links (packages, testimonials, faqs, contact, lab reports, staff portal) */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              type="button"
              onClick={() => setMoreDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1 px-2 py-1.5 xl:px-2.5 xl:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isMoreActive || moreDropdownOpen
                  ? 'text-[#1E5AA8] bg-blue-50 font-bold'
                  : 'text-slate-700 hover:text-[#1E5AA8] hover:bg-slate-50'
              }`}
            >
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>{isUrdu ? 'مزید' : 'More'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {moreDropdownOpen && (
              <div
                className={`absolute top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isUrdu ? 'left-0 text-right' : 'right-0 text-left'
                }`}
              >
                {moreNavLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => {
                      handleLinkClick(e, link.href);
                      setMoreDropdownOpen(false);
                    }}
                    className={`block px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${
                      activeSection === link.id ? 'text-[#1E5AA8] bg-blue-50/60 font-bold' : 'text-slate-700 hover:text-[#1E5AA8]'
                    } ${isUrdu ? 'font-urdu text-sm' : ''}`}
                  >
                    {link.label}
                  </a>
                ))}

                <div className="my-1.5 border-t border-slate-100" />

                {onOpenReportsModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      onOpenReportsModal();
                    }}
                    className="w-full text-left rtl:text-right px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#1E5AA8] hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{isUrdu ? 'آن لائن لیب رپورٹ ڈاؤن لوڈ' : 'Download Lab Reports'}</span>
                  </button>
                )}

                {onGoToAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      onGoToAdmin();
                    }}
                    className="w-full text-left rtl:text-right px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#1E5AA8] hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{isUrdu ? 'اسٹاف ایڈمن پورٹل' : 'Staff Admin Portal'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Action Buttons: Phone Call (042-111-327-227), Book Appointment CTA, Language Toggle */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
          {/* Hospital Call Button: Full number 042-111-327-227, single line, no 1122 */}
          <a
            href={dialerHref}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl bg-red-50 hover:bg-red-100/90 text-[#D62828] border border-red-200/90 font-bold text-xs transition-all whitespace-nowrap shrink-0 shadow-xs active:scale-95"
            title={isUrdu ? "ہسپتال ہیلپ لائن کال (24/7)" : "Call Hospital Helpline (24/7)"}
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#D62828] shrink-0" />
            <span className="font-mono tracking-tight text-[11.5px] xl:text-xs font-bold whitespace-nowrap">
              {emergencyPhone}
            </span>
          </a>

          {/* Book Appointment CTA Button: Always fully visible on the right */}
          <button
            onClick={() => onNavigateToAppointment()}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
            <span className={`whitespace-nowrap ${isUrdu ? 'font-urdu text-sm' : ''}`}>
              {t.bookBtn}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 xl:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            title={isUrdu ? "Switch to English" : "اردو میں دیکھیں"}
          >
            <Globe className="w-3.5 h-3.5 text-[#1E5AA8] shrink-0" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>
        </div>

        {/* Mobile Header Controls: Always fits cleanly without overflow */}
        <div className="flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-2 lg:hidden shrink-0">
          {/* Quick Call Button on wider mobile screens (>=400px) */}
          <a
            href={dialerHref}
            className="hidden min-[400px]:flex items-center justify-center p-2 rounded-xl bg-red-50 text-[#D62828] border border-red-200 hover:bg-red-100 transition-colors shrink-0 shadow-2xs"
            title={`Call ${emergencyPhone}`}
          >
            <PhoneCall className="w-4 h-4" />
          </a>

          {/* Mobile Language Toggle */}
          <button
            onClick={onToggleLang}
            type="button"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shrink-0 cursor-pointer shadow-2xs"
            title={isUrdu ? "Switch to English" : "اردو میں دیکھیں"}
          >
            <Globe className="w-3.5 h-3.5 text-[#1E5AA8]" />
            <span className="font-semibold">{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Three Lines Menu (Hamburger) Button - Prominent, High-Contrast & Always Visible */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="flex items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-300 text-slate-900 focus:outline-none shrink-0 cursor-pointer shadow-2xs transition-all"
            aria-label={isUrdu ? "مینیو کھولیں" : "Toggle navigation menu"}
            title={isUrdu ? "مینیو" : "Menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
            ) : (
              /* Three distinct horizontal lines */
              <div className="w-5 h-4 flex flex-col justify-between items-center py-[1px]" aria-hidden="true">
                <span className="w-5 h-[2.5px] bg-[#1F2933] rounded-full" />
                <span className="w-5 h-[2.5px] bg-[#1E5AA8] rounded-full" />
                <span className="w-5 h-[2.5px] bg-[#2E9E5B] rounded-full" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col space-y-1">
            {allNavLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu text-base' : ''}>{t.bookBtn}</span>
            </button>

            <a
              href={dialerHref}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="font-mono">{emergencyPhone}</span>
              <span className="text-xs opacity-90">({isUrdu ? '24/7 فوری رابطہ' : '24/7 Helpline'})</span>
            </a>

            {onOpenReportsModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReportsModal();
                }}
                type="button"
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs text-center block transition-colors cursor-pointer"
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
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs text-center block transition-colors cursor-pointer"
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
