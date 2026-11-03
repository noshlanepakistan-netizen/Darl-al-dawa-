/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderTopBar } from './components/HeaderTopBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AppointmentSection } from './components/AppointmentSection';
import { Departments } from './components/Departments';
import { Doctors } from './components/Doctors';
import { ServicesFacilities } from './components/ServicesFacilities';
import { AboutUs } from './components/AboutUs';
import { HealthPackages } from './components/HealthPackages';
import { Testimonials } from './components/Testimonials';
import { GallerySection } from './components/GallerySection';
import { BlogSection } from './components/BlogSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { ReportDownloadModal } from './components/ReportDownloadModal';
import { ToastContainer } from './admin/components/ToastContainer';
import { useAdminAuth } from './admin/context/AdminAuthContext';
import { useAdminData } from './admin/context/AdminDataContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { LoginPage } from './admin/pages/LoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { AppointmentsPage } from './admin/pages/AppointmentsPage';
import { DoctorsPage } from './admin/pages/DoctorsPage';
import { DepartmentsPage } from './admin/pages/DepartmentsPage';
import { ServicesPackagesPage } from './admin/pages/ServicesPackagesPage';
import { PatientsPage } from './admin/pages/PatientsPage';
import { LabReportsPage } from './admin/pages/LabReportsPage';
import { BillingPage } from './admin/pages/BillingPage';
import { ContentManagerPage } from './admin/pages/ContentManagerPage';
import { MessagesPage } from './admin/pages/MessagesPage';
import { UsersPage } from './admin/pages/UsersPage';
import { SettingsPage } from './admin/pages/SettingsPage';

export default function App() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [viewMode, setViewMode] = useState<'website' | 'admin'>('website');
  const [adminModule, setAdminModule] = useState<string>('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { isAuthenticated } = useAdminAuth();
  const { homepageSettings } = useAdminData();
  const secVis = homepageSettings?.sectionsVisibility || {
    hero: true,
    appointment: true,
    departments: true,
    doctors: true,
    services: true,
    packages: true,
    about: true,
    testimonials: true,
    gallery: true,
    blog: true,
    faq: true,
    contact: true
  };

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
    if (viewMode !== 'website') {
      setViewMode('website');
      setTimeout(() => {
        const el = document.getElementById('appointment');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
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

  const handleBookPackage = (_pkgTitle: string) => {
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
    if (viewMode !== 'website') {
      setViewMode('website');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render Admin Content based on current module
  const renderAdminContent = () => {
    switch (adminModule) {
      case 'dashboard':
        return <DashboardPage onNavigate={setAdminModule} lang={lang} />;
      case 'appointments':
        return <AppointmentsPage lang={lang} />;
      case 'doctors':
        return <DoctorsPage lang={lang} />;
      case 'departments':
        return <DepartmentsPage lang={lang} />;
      case 'services_packages':
        return <ServicesPackagesPage lang={lang} />;
      case 'patients':
        return <PatientsPage lang={lang} />;
      case 'lab_reports':
        return <LabReportsPage lang={lang} />;
      case 'billing':
        return <BillingPage lang={lang} />;
      case 'content':
        return <ContentManagerPage lang={lang} />;
      case 'messages':
        return <MessagesPage lang={lang} />;
      case 'users':
        return <UsersPage lang={lang} />;
      case 'settings':
        return <SettingsPage lang={lang} />;
      default:
        return <DashboardPage onNavigate={setAdminModule} lang={lang} />;
    }
  };

  // If in admin mode, show Login or Admin Layout
  if (viewMode === 'admin') {
    return (
      <div className={`min-h-screen bg-[#F7FAFC] text-[#1F2933] ${lang === 'ur' ? 'font-urdu' : 'font-body'}`}>
        <ToastContainer />
        {!isAuthenticated ? (
          <LoginPage
            onSuccess={() => setViewMode('admin')}
            onGoHome={() => setViewMode('website')}
            lang={lang}
          />
        ) : (
          <AdminLayout
            currentModule={adminModule}
            onSelectModule={setAdminModule}
            onGoHome={() => setViewMode('website')}
            lang={lang}
            onToggleLang={toggleLang}
          >
            {renderAdminContent()}
          </AdminLayout>
        )}
      </div>
    );
  }

  // Public Hospital Website with exact new section order:
  // 1) Header / Navbar
  // 2) Hero section
  // 3) Appointment Booking Form
  // 4) Departments section
  // 5) Doctor Profiles section
  // 6) All remaining sections (Services, About, Packages, Testimonials, Gallery, Blog, FAQs, Contact)
  // 7) Footer
  return (
    <div className={`min-h-screen bg-[#F7FAFC] text-[#1F2933] ${lang === 'ur' ? 'font-urdu' : 'font-body'}`}>
      {/* Notifications / Toast */}
      <ToastContainer />

      {/* Online Lab Report Download Modal */}
      <ReportDownloadModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        lang={lang}
      />

      {/* 1. Header / Navbar */}
      <HeaderTopBar
        lang={lang}
        onOpenReportsModal={() => setIsReportModalOpen(true)}
        onGoToAdmin={() => setViewMode('admin')}
      />
      <Navbar
        lang={lang}
        onToggleLang={toggleLang}
        onNavigateToAppointment={scrollToAppointment}
        onOpenReportsModal={() => setIsReportModalOpen(true)}
        onGoToAdmin={() => setViewMode('admin')}
      />

      <main>
        {/* 2. Hero Section */}
        {secVis.hero && (
          <Hero
            lang={lang}
            onQuickBook={handleQuickBook}
            onNavigateToAppointment={scrollToAppointment}
          />
        )}

        {/* 3. Appointment Booking Form (Moved right after Hero) */}
        {secVis.appointment && (
          <AppointmentSection
            lang={lang}
            preselectedDeptId={selectedDeptId}
            preselectedDoctorId={selectedDoctorId}
            prefillName={prefillName}
            prefillPhone={prefillPhone}
            prefillDate={prefillDate}
          />
        )}

        {/* 4. Departments Section (Moved right after Appointment) */}
        {secVis.departments && (
          <Departments
            lang={lang}
            onSelectDepartment={handleSelectDepartment}
            onSelectDoctor={handleSelectDoctor}
          />
        )}

        {/* 5. Doctor Profiles Section (Moved right after Departments) */}
        {secVis.doctors && (
          <Doctors
            lang={lang}
            onSelectDoctor={handleSelectDoctor}
          />
        )}

        {/* 6. All Remaining Sections */}
        {/* 6a. Services & Facilities */}
        {secVis.services && (
          <ServicesFacilities
            lang={lang}
            onBookHomeSampling={handleBookHomeSampling}
          />
        )}

        {/* 6b. About Us Section & Accreditations */}
        {secVis.about && <AboutUs lang={lang} />}

        {/* 6c. Health Packages & Lab Pricing in PKR */}
        {secVis.packages && (
          <HealthPackages
            lang={lang}
            onBookPackage={handleBookPackage}
          />
        )}

        {/* 6d. Patient Testimonials Carousel */}
        {secVis.testimonials && <Testimonials lang={lang} />}

        {/* 6e. Hospital Photo Gallery & Lightbox */}
        {secVis.gallery && <GallerySection lang={lang} />}

        {/* 6f. Public Health Tips & Medical Blog */}
        {secVis.blog && <BlogSection lang={lang} />}

        {/* 6g. FAQ Accordion & Insurance Panels */}
        {secVis.faq && <FaqSection lang={lang} />}

        {/* 6h. Contact & Location Map */}
        {secVis.contact && <ContactSection lang={lang} />}
      </main>

      {/* 7. Footer */}
      <Footer
        lang={lang}
        onNavigate={handleNavigateSection}
      />

      {/* 8. Floating WhatsApp, Emergency Call & Back-to-Top Actions */}
      <FloatingActions lang={lang} />
    </div>
  );
}
