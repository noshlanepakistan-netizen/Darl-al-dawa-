/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderTopBar } from './components/HeaderTopBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutUs } from './components/AboutUs';
import { Departments } from './components/Departments';
import { Doctors } from './components/Doctors';
import { ServicesFacilities } from './components/ServicesFacilities';
import { HealthPackages } from './components/HealthPackages';
import { AppointmentSection } from './components/AppointmentSection';
import { Testimonials } from './components/Testimonials';
import { GallerySection } from './components/GallerySection';
import { BlogSection } from './components/BlogSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';

export default function App() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  // Appointment preselection states
  const [selectedDeptId, setSelectedDeptId] = useState<string | undefined>(undefined);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);
  const [prefillName, setPrefillName] = useState<string>('');
  const [prefillPhone, setPrefillPhone] = useState<string>('');
  const [prefillDate, setPrefillDate] = useState<string>('');

  // Handle RTL vs LTR attribute on <html> element
  useEffect(() => {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const scrollToAppointment = () => {
    const el = document.getElementById('appointment');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickBook = (name: string, phone: string, deptId: string, date: string) => {
    setPrefillName(name);
    setPrefillPhone(phone);
    setSelectedDeptId(deptId);
    setPrefillDate(date);
    scrollToAppointment();
  };

  const handleSelectDepartment = (deptId: string) => {
    setSelectedDeptId(deptId);
    setSelectedDoctorId(undefined);
    scrollToAppointment();
  };

  const handleSelectDoctor = (doctorId: string, deptId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedDeptId(deptId);
    scrollToAppointment();
  };

  const handleBookPackage = (pkgTitle: string) => {
    setSelectedDeptId('laboratory');
    setSelectedDoctorId(undefined);
    scrollToAppointment();
  };

  const handleBookHomeSampling = () => {
    setSelectedDeptId('laboratory');
    setSelectedDoctorId(undefined);
    scrollToAppointment();
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen bg-[#F7FAFC] text-[#1F2933] ${lang === 'ur' ? 'font-urdu' : 'font-body'}`}>
      {/* 1. Top Bar */}
      <HeaderTopBar lang={lang} />

      {/* 2. Sticky Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={toggleLang}
        onNavigateToAppointment={scrollToAppointment}
      />

      <main>
        {/* 3. Hero Section with Trust Stats & Quick Booking */}
        <Hero
          lang={lang}
          onQuickBook={handleQuickBook}
          onNavigateToAppointment={scrollToAppointment}
        />

        {/* 4. About Us Section & Accreditations */}
        <AboutUs lang={lang} />

        {/* 5. Clinical Departments Grid */}
        <Departments
          lang={lang}
          onSelectDepartment={handleSelectDepartment}
        />

        {/* 6. Senior Consultant Doctors */}
        <Doctors
          lang={lang}
          onSelectDoctor={handleSelectDoctor}
        />

        {/* 7. Services & Diagnostic Facilities */}
        <ServicesFacilities
          lang={lang}
          onBookHomeSampling={handleBookHomeSampling}
        />

        {/* 8. Health Packages & Lab Pricing in PKR */}
        <HealthPackages
          lang={lang}
          onBookPackage={handleBookPackage}
        />

        {/* 9. Online Appointment Booking Form */}
        <AppointmentSection
          lang={lang}
          preselectedDeptId={selectedDeptId}
          preselectedDoctorId={selectedDoctorId}
          prefillName={prefillName}
          prefillPhone={prefillPhone}
          prefillDate={prefillDate}
        />

        {/* 10. Patient Testimonials Carousel */}
        <Testimonials lang={lang} />

        {/* 11. Hospital Photo Gallery & Lightbox */}
        <GallerySection lang={lang} />

        {/* 12. Public Health Tips & Medical Blog */}
        <BlogSection lang={lang} />

        {/* 13. FAQ Accordion & Insurance Panels */}
        <FaqSection lang={lang} />

        {/* 14. Contact & Location Map */}
        <ContactSection lang={lang} />
      </main>

      {/* 15. Hospital Charcoal Footer */}
      <Footer
        lang={lang}
        onNavigate={handleNavigateSection}
      />

      {/* 16. Floating WhatsApp, Emergency Call & Back-to-Top Actions */}
      <FloatingActions lang={lang} />
    </div>
  );
}
