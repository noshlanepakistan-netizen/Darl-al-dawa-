import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PhoneCall,
  CalendarCheck,
  Globe,
  ChevronRight,
  ChevronDown,
  FileText,
  Shield,
  User
} from 'lucide-react';
import { Logo } from './Logo';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';
import { usePatientAuth } from '../context/PatientAuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatWhatsAppLink, formatTelLink, formatDisplayPhone, triggerWhatsApp } from '../utils/phoneUtils';

// Official WhatsApp Vector Icon (used in drawer menu & dropdown)
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface NavbarProps {
  lang: 'en' | 'ur';
  onToggleLang: () => void;
  onNavigateToAppointment: (deptId?: string, doctorId?: string) => void;
  onOpenReportsModal?: () => void;
  onGoToAdmin?: () => void;
  onOpenPatientAuth?: () => void;
  onOpenPatientDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onNavigateToAppointment,
  onOpenReportsModal,
  onGoToAdmin,
  onOpenPatientAuth,
  onOpenPatientDashboard
}) => {
  const { hospitalConfig } = useAdminData();
  const { patient, isAuthenticated } = usePatientAuth();
  const { unreadCount } = useNotifications();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const t = UI_TRANSLATIONS[lang].nav;
  const isUrdu = lang === 'ur';

  const emergencyPhone = formatDisplayPhone(hospitalConfig?.contact?.emergencyNumber);
  const dialerHref = formatTelLink(hospitalConfig?.contact?.emergencyNumber);
  const whatsappHref = formatWhatsAppLink(
    hospitalConfig?.contact?.whatsapp,
    "Hello Dar al Dawa Medical Center Lahore, I have an inquiry"
  );

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
      <div className="max-w-7xl mx-auto px-2 min-[360px]:px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-1 min-[360px]:gap-2 sm:gap-3">
        {/* Hospital Brand Logo (Shrink-0, Never cuts off) */}
        <a href="#home" className="focus:outline-none shrink-0 min-w-0 pr-1 select-none">
          <Logo isUrdu={isUrdu} />
        </a>

        {/* Desktop Navigation Links */}
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

          {/* "More" Dropdown Menu */}
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

                <a
                  href={whatsappHref}
                  onClick={(e) => {
                    setMoreDropdownOpen(false);
                    triggerWhatsApp(hospitalConfig?.contact?.whatsapp, isUrdu ? 'اسلام علیکم، مجھے رہنمائی چاہیے' : 'Hello Dar al Dawa Medical Center, I would like to inquire about...', e);
                  }}
                  rel="noopener noreferrer"
                  className="w-full text-left rtl:text-right px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-[#25D366] shrink-0" />
                  <span>{isUrdu ? 'واٹس ایپ پر رابطہ کریں' : 'Chat on WhatsApp'}</span>
                </a>

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

        {/* Desktop Action Buttons (WhatsApp Removed from Header): Phone Call, Book Appointment, Patient Account, Language */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
          {/* Hospital Call Button */}
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

          {/* Book Appointment CTA Button */}
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

          {/* Customer / Patient Account Button (Desktop) — Shows Patient Name when logged in */}
          <button
            onClick={isAuthenticated ? onOpenPatientDashboard : onOpenPatientAuth}
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 xl:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-2xs max-w-[170px]"
            title={isAuthenticated ? (patient?.fullName || (isUrdu ? "میرا اکاؤنٹ" : "My Account")) : (isUrdu ? "لاگ ان / سائن اپ" : "Sign In / Register")}
          >
            <div className="relative flex items-center justify-center shrink-0">
              {isAuthenticated && patient?.fullName ? (
                <span className="w-4 h-4 rounded-full bg-[#1E5AA8] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  {patient.fullName.trim().charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-3.5 h-3.5 text-[#1E5AA8] shrink-0" />
              )}
              {isAuthenticated && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#2E9E5B] ring-1 ring-white" />
              )}
            </div>
            <span className={`truncate max-w-[120px] ${isUrdu ? 'font-urdu' : ''}`}>
              {isAuthenticated && patient?.fullName
                ? patient.fullName
                : (isUrdu ? 'اکاؤنٹ' : 'Account')}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 xl:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
            title={isUrdu ? "Switch to English" : "اردو میں دیکھیں"}
          >
            <Globe className="w-3.5 h-3.5 text-[#1E5AA8] shrink-0" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>
        </div>

        {/* Mobile Header Controls: Exactly 3 items in one centered row: Account -> اردو Language -> Menu */}
        <div className="flex items-center gap-1.5 min-[360px]:gap-2 lg:hidden shrink-0">
          {/* 1. Customer / Patient Account Button (Mobile) - Prominently displays Name */}
          <button
            onClick={isAuthenticated ? onOpenPatientDashboard : onOpenPatientAuth}
            type="button"
            className="relative flex items-center justify-center gap-1.5 h-8 min-[360px]:h-8.5 px-2 min-[360px]:px-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs max-w-[140px]"
            title={isAuthenticated ? (patient?.fullName || (isUrdu ? "مریض اکاؤنٹ" : "My Account")) : (isUrdu ? "لاگ ان / سائن اپ" : "Sign In / Register")}
            aria-label="Patient Account"
          >
            {isAuthenticated && patient?.fullName ? (
              <>
                <span className="w-5 h-5 rounded-full bg-[#1E5AA8] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {patient.fullName.trim().charAt(0).toUpperCase()}
                </span>
                <span className="font-bold text-[11px] text-slate-800 max-w-[70px] truncate inline-block">
                  {patient.fullName.trim().split(' ')[0]}
                </span>
              </>
            ) : (
              <User className="w-4 h-4 text-[#1E5AA8]" />
            )}
            {isAuthenticated && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#2E9E5B] ring-1.5 ring-white" />
            )}
            {unreadCount > 0 && !isAuthenticated && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-1.5 ring-white" />
            )}
          </button>

          {/* 2. Mobile Language Toggle Button */}
          <button
            onClick={onToggleLang}
            type="button"
            className="flex items-center justify-center gap-1 px-2 h-8 min-[360px]:h-8.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shrink-0 cursor-pointer shadow-2xs"
            title={isUrdu ? "Switch to English" : "اردو میں دیکھیں"}
          >
            <Globe className="w-3.5 h-3.5 text-[#1E5AA8]" />
            <span className="font-semibold text-[11px] min-[360px]:text-xs">{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* 3. Three Lines Menu (Hamburger) Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="flex items-center justify-center w-8 h-8 min-[360px]:w-8.5 min-[360px]:h-8.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-300 text-slate-900 focus:outline-none shrink-0 cursor-pointer shadow-2xs transition-all"
            aria-label={isUrdu ? "مینیو کھولیں" : "Toggle navigation menu"}
            title={isUrdu ? "مینیو" : "Menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
            ) : (
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
          {/* Prominent Patient Identity Card in Drawer when logged in */}
          {isAuthenticated && patient && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E5AA8] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 truncate flex items-center gap-1.5">
                    <span className="truncate">{patient.fullName}</span>
                    <span className="w-2 h-2 rounded-full bg-[#2E9E5B] shrink-0" title="Active Patient" />
                  </div>
                  <div className="text-xs text-slate-600 truncate font-mono">
                    {patient.email}
                  </div>
                  {patient.phone && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      📞 {patient.phone}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenPatientDashboard) onOpenPatientDashboard();
                  }}
                  type="button"
                  className="w-full py-2 px-2.5 rounded-xl bg-white border border-blue-200 text-[#1E5AA8] font-bold text-xs text-center shadow-2xs hover:bg-blue-50 cursor-pointer"
                >
                  {isUrdu ? 'میری پروفائل' : 'My Profile & Bookings'}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToAppointment();
                  }}
                  type="button"
                  className="w-full py-2 px-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs text-center shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'اپوائنٹمنٹ بکنگ' : 'Book Appt'}</span>
                </button>
              </div>
            </div>
          )}

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
            {/* Patient Account Action in Mobile Menu (When not authenticated) */}
            {!isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenPatientAuth) onOpenPatientAuth();
                }}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span className={isUrdu ? 'font-urdu text-base' : ''}>{isUrdu ? 'مریض لاگ ان / نیا اکاؤنٹ' : 'Patient Login / Sign Up'}</span>
              </button>
            )}

            {/* WhatsApp Contact in Mobile Menu (Retained for easy patient contact) */}
            <a
              href={whatsappHref}
              onClick={(e) => {
                setMobileMenuOpen(false);
                triggerWhatsApp(hospitalConfig?.contact?.whatsapp, isUrdu ? 'اسلام علیکم، مجھے فوری رہنمائی چاہیے' : 'Hello Dar al Dawa Medical Center, I need quick assistance', e);
              }}
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              <span>{isUrdu ? 'واٹس ایپ پر فوری رابطہ کریں' : 'Chat on WhatsApp'}</span>
            </a>

            {/* Book Appointment CTA */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToAppointment();
              }}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu text-base' : ''}>{t.bookBtn}</span>
            </button>

            {/* 24/7 Helpline */}
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
