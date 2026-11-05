import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminAppointment,
  PatientRecord,
  LabReportRecord,
  InvoiceRecord,
  ContactMessage,
  StaffUser,
  ActivityLogItem,
  HospitalSettings,
  HomepageSettings,
  AppointmentStatus
} from '../types';
import {
  Doctor,
  Department,
  HealthPackage,
  ServiceFacility,
  GalleryItem,
  Testimonial,
  FAQItem,
  DOCTORS as INITIAL_DOCTORS,
  DEPARTMENTS as INITIAL_DEPARTMENTS,
  HEALTH_PACKAGES as INITIAL_PACKAGES,
  SERVICES_FACILITIES as INITIAL_SERVICES,
  HOSPITAL_CONFIG as INITIAL_CONFIG,
  GALLERY_ITEMS as INITIAL_GALLERY,
  TESTIMONIALS as INITIAL_TESTIMONIALS,
  FAQS as INITIAL_FAQS
} from '../../data/hospitalData';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_PATIENTS,
  INITIAL_LAB_REPORTS,
  INITIAL_INVOICES,
  INITIAL_MESSAGES,
  INITIAL_STAFF_USERS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_HOSPITAL_SETTINGS
} from '../data/sampleAdminData';
import { supabase, isSupabaseConfigured } from '../../supabase/config';
import {
  cleanWhatsAppNumber,
  formatDisplayPhone,
  cleanPhoneEmergency,
  formatTelLink
} from '../../utils/phoneUtils';


interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const INITIAL_HOMEPAGE_SETTINGS: HomepageSettings = {
  heroHeading: "Caring for You, Every Step of the Way",
  heroSubheading: "Experience world-class medical treatments in Gulberg, Lahore. Equipped with 24/7 rapid emergency, 50+ senior specialist consultants, laminar-flow theatres, and certified diagnostic laboratories.",
  heroButtonText: "Book an Appointment",
  heroSliderImages: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80"
  ],
  aboutBadge: "About Dar al Dawa",
  aboutHeading: "A Tradition of Healing, Science & Human Compassion",
  aboutSubheading: "Established in Lahore over two decades ago, Dar al Dawa Medical Center stands as a beacon of clinical excellence and compassionate healthcare.",
  aboutMission: "To provide ethical, evidence-based, and accessible tertiary healthcare of international standards to all communities of Punjab, regardless of socioeconomic background.",
  aboutVision: "To be Pakistan's most trusted hospital network, recognized for clinical excellence, state-of-the-art medical technology, and patient-first empathy.",
  aboutImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80",
  sectionsVisibility: {
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
  }
};

interface AdminDataContextType {
  // Cloud & Loading State
  isLoading: boolean;
  isSupabaseActive: boolean;
  refetchData: () => Promise<void>;
  importLocalDataToSupabase: () => Promise<{ success: boolean; count: number; error?: string }>;

  // Hospital Config (General Settings)
  hospitalConfig: typeof INITIAL_CONFIG;
  updateHospitalConfig: (newConfig: Partial<typeof INITIAL_CONFIG>) => Promise<void>;

  // Operational Settings
  settings: HospitalSettings;
  updateSettings: (newSettings: Partial<HospitalSettings>) => Promise<void>;

  // Homepage Settings
  homepageSettings: HomepageSettings;
  updateHomepageSettings: (newSettings: Partial<HomepageSettings>) => Promise<void>;

  // Appointments
  appointments: AdminAppointment[];
  addAppointment: (app: Omit<AdminAppointment, 'id' | 'createdAt'>) => string;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Doctors
  doctors: Doctor[];
  addDoctor: (doc: Omit<Doctor, 'id'>) => Promise<void>;
  updateDoctor: (id: string, doc: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  toggleDoctorActive: (id: string) => Promise<void>;

  // Departments
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  reorderDepartments: (newOrder: Department[]) => Promise<void>;

  // Packages & Services
  packages: HealthPackage[];
  addPackage: (pkg: Omit<HealthPackage, 'id'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<HealthPackage>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  services: ServiceFacility[];
  addService: (srv: Omit<ServiceFacility, 'id'>) => Promise<void>;
  updateService: (id: string, srv: Partial<ServiceFacility>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Gallery
  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;

  // Testimonials
  testimonials: Testimonial[];
  addTestimonial: (item: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, item: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;

  // FAQs
  faqs: FAQItem[];
  addFaq: (item: Omit<FAQItem, 'id'>) => Promise<void>;
  updateFaq: (id: string, item: Partial<FAQItem>) => Promise<void>;
  deleteFaq: (id: string) => Promise<void>;

  // Patients
  patients: PatientRecord[];
  addPatient: (pat: Omit<PatientRecord, 'id' | 'createdAt'>) => string;
  updatePatient: (id: string, pat: Partial<PatientRecord>) => void;

  // Lab Reports
  labReports: LabReportRecord[];
  addLabReport: (rep: Omit<LabReportRecord, 'id' | 'createdAt'>) => void;
  updateLabReport: (id: string, rep: Partial<LabReportRecord>) => void;
  deleteLabReport: (id: string) => void;
  lookupLabReport: (reportId: string, phone: string) => LabReportRecord | null;

  // Invoices
  invoices: InvoiceRecord[];
  addInvoice: (inv: Omit<InvoiceRecord, 'id' | 'createdAt'>) => void;
  updateInvoiceStatus: (id: string, status: 'paid' | 'unpaid') => void;

  // Messages
  messages: ContactMessage[];
  addMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read' | 'important'>) => void;
  markMessageRead: (id: string, read: boolean) => Promise<void>;
  toggleMessageImportant: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // Staff Users
  staffUsers: StaffUser[];
  addStaffUser: (user: Omit<StaffUser, 'id' | 'createdAt'>) => void;
  updateStaffUser: (id: string, user: Partial<StaffUser>) => void;
  deleteStaffUser: (id: string) => void;

  // Activity Logs
  activityLogs: ActivityLogItem[];
  logAction: (action: string, module: string, details: string) => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Backup & Reset
  exportAllDataJSON: () => string;
  restoreFromJSON: (jsonData: string) => boolean;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabaseActive = isSupabaseConfigured();

  // State slices
  const [isLoading, setIsLoading] = useState(true);
  const [hospitalConfig, setHospitalConfig] = useState(INITIAL_CONFIG);
  const [settings, setSettings] = useState(INITIAL_HOSPITAL_SETTINGS);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(INITIAL_HOMEPAGE_SETTINGS);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [services, setServices] = useState<ServiceFacility[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [labReports, setLabReports] = useState<LabReportRecord[]>(INITIAL_LAB_REPORTS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL_MESSAGES);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Logger
  const logAction = async (action: string, module: string, details: string) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      userEmail: 'admin@daraldawa.pk',
      userName: 'Administrator',
      userRole: 'super_admin',
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    if (isSupabaseActive) {
      try {
        await supabase.from('activity_logs').insert({
          id: newLog.id,
          user_email: newLog.userEmail,
          user_name: newLog.userName,
          user_role: newLog.userRole,
          action: newLog.action,
          module: newLog.module,
          details: newLog.details,
          timestamp: newLog.timestamp
        });
      } catch (err) {
        console.warn('Failed to log activity to Supabase:', err);
      }
    }
  };

  // ============================================================================
  // SUPABASE DATA FETCHING & HELPER
  // ============================================================================

  const mapSettingsRowToHospitalConfig = (configData: any, prev: typeof INITIAL_CONFIG): typeof INITIAL_CONFIG => {
    const contact = (configData.contact && typeof configData.contact === 'object') ? configData.contact : {};
    const social = (configData.social_links && typeof configData.social_links === 'object') ? configData.social_links : {};

    const rawEmergency = configData.phone_emergency || contact.emergencyNumber || prev.contact.emergencyNumber;
    const emergencyClean = formatDisplayPhone(rawEmergency);
    const emergencyRaw = cleanPhoneEmergency(rawEmergency);

    const rawWhatsapp = configData.whatsapp_number || contact.whatsapp || prev.contact.whatsapp;
    const whatsappClean = cleanWhatsAppNumber(rawWhatsapp);

    return {
      ...prev,
      name: configData.name || prev.name,
      nameUrdu: configData.name_urdu || prev.nameUrdu,
      tagline: configData.tagline || prev.tagline,
      taglineUrdu: configData.tagline_urdu || prev.taglineUrdu,
      logo: configData.logo || prev.logo,
      favicon: configData.favicon || prev.favicon,
      shortDesc: configData.short_desc || prev.shortDesc,
      shortDescUrdu: configData.short_desc_urdu || prev.shortDescUrdu,
      socialLinks: {
        facebook: configData.facebook_url || social.facebook || prev.socialLinks?.facebook || 'https://facebook.com/daraldawamedical',
        instagram: configData.instagram_url || social.instagram || prev.socialLinks?.instagram || 'https://instagram.com/daraldawamedical',
        youtube: configData.youtube_url || social.youtube || prev.socialLinks?.youtube || 'https://youtube.com/@daraldawamedical',
        tiktok: configData.tiktok_url || social.tiktok || prev.socialLinks?.tiktok || 'https://tiktok.com/@daraldawamedical',
        twitter: configData.twitter_url || social.twitter || prev.socialLinks?.twitter || 'https://twitter.com/daraldawamedical',
      },
      contact: {
        ...prev.contact,
        ...contact,
        emergencyNumber: emergencyClean,
        emergencyNumberRaw: emergencyRaw,
        receptionPhone: configData.phone_reception || contact.receptionPhone || prev.contact.receptionPhone,
        mobileEmergency: configData.phone_mobile || contact.mobileEmergency || prev.contact.mobileEmergency,
        whatsapp: rawWhatsapp,
        whatsappClean: whatsappClean,
        email: configData.email || contact.email || prev.contact.email,
        address: configData.address || contact.address || prev.contact.address,
        addressUrdu: configData.address_urdu || contact.addressUrdu || prev.contact.addressUrdu,
        googleMapsEmbedUrl: configData.google_maps_url || contact.googleMapsEmbedUrl || prev.contact.googleMapsEmbedUrl,
        hours: {
          ...prev.contact.hours,
          ...(contact.hours || {}),
          opd: configData.hours_opd || contact.hours?.opd || prev.contact.hours.opd,
          emergency: configData.hours_emergency || contact.hours?.emergency || prev.contact.hours.emergency,
        }
      },
      trustStats: prev.trustStats,
      accreditations: prev.accreditations,
      insurancePartners: prev.insurancePartners
    };
  };

  const fetchSupabaseData = useCallback(async () => {
    if (!isSupabaseActive) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // 1. Settings (Check 'settings' table first, fallback to 'hospital_settings')
      let loadedSettings = false;
      try {
        const { data: sData, error: sErr } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        if (sData && !sErr) {
          setHospitalConfig((prev) => mapSettingsRowToHospitalConfig(sData, prev));
          loadedSettings = true;
        }
      } catch (err) {
        console.warn('Could not query settings table:', err);
      }

      if (!loadedSettings) {
        try {
          const { data: configData } = await supabase.from('hospital_settings').select('*').limit(1).maybeSingle();
          if (configData) {
            setHospitalConfig((prev) => mapSettingsRowToHospitalConfig(configData, prev));
          }
        } catch (err) {
          console.warn('Could not query hospital_settings table:', err);
        }
      }

      // 2. Operational Settings
      const { data: opData } = await supabase.from('operational_settings').select('*').eq('id', 'main').maybeSingle();
      if (opData) {
        setSettings({
          slotDurationMinutes: opData.slot_duration_minutes ?? INITIAL_HOSPITAL_SETTINGS.slotDurationMinutes,
          workingDays: opData.working_days || INITIAL_HOSPITAL_SETTINGS.workingDays,
          opdOpenTime: opData.opd_open_time || INITIAL_HOSPITAL_SETTINGS.opdOpenTime,
          opdCloseTime: opData.opd_close_time || INITIAL_HOSPITAL_SETTINGS.opdCloseTime,
          emergencyActive: opData.emergency_active ?? INITIAL_HOSPITAL_SETTINGS.emergencyActive,
          maintenanceMode: opData.maintenance_mode ?? INITIAL_HOSPITAL_SETTINGS.maintenanceMode,
          emailNotifications: opData.email_notifications ?? INITIAL_HOSPITAL_SETTINGS.emailNotifications,
          smsNotifications: opData.sms_notifications ?? INITIAL_HOSPITAL_SETTINGS.smsNotifications,
          whatsappConfirmation: opData.whatsapp_confirmation ?? INITIAL_HOSPITAL_SETTINGS.whatsappConfirmation,
          currency: opData.currency || INITIAL_HOSPITAL_SETTINGS.currency
        });
      }

      // 3. Homepage Content / Settings (Check 'homepage_content' first, fallback to 'homepage_settings')
      let loadedHome = false;
      try {
        const { data: hcData } = await supabase.from('homepage_content').select('*').limit(1).maybeSingle();
        if (hcData) {
          setHomepageSettings({
            heroHeading: hcData.hero_heading || INITIAL_HOMEPAGE_SETTINGS.heroHeading,
            heroSubheading: hcData.hero_subheading || INITIAL_HOMEPAGE_SETTINGS.heroSubheading,
            heroButtonText: hcData.hero_button_text || INITIAL_HOMEPAGE_SETTINGS.heroButtonText,
            heroSliderImages: hcData.hero_slider_images || INITIAL_HOMEPAGE_SETTINGS.heroSliderImages,
            aboutBadge: hcData.about_badge || INITIAL_HOMEPAGE_SETTINGS.aboutBadge,
            aboutHeading: hcData.about_heading || INITIAL_HOMEPAGE_SETTINGS.aboutHeading,
            aboutSubheading: hcData.about_subheading || INITIAL_HOMEPAGE_SETTINGS.aboutSubheading,
            aboutMission: hcData.about_mission || INITIAL_HOMEPAGE_SETTINGS.aboutMission,
            aboutVision: hcData.about_vision || INITIAL_HOMEPAGE_SETTINGS.aboutVision,
            aboutImage: hcData.about_image || INITIAL_HOMEPAGE_SETTINGS.aboutImage,
            sectionsVisibility: hcData.sections_visibility || INITIAL_HOMEPAGE_SETTINGS.sectionsVisibility
          });
          loadedHome = true;
        }
      } catch (e) {
        // continue
      }

      if (!loadedHome) {
        const { data: homeData } = await supabase.from('homepage_settings').select('*').limit(1).maybeSingle();
        if (homeData) {
          setHomepageSettings({
            heroHeading: homeData.hero_heading || INITIAL_HOMEPAGE_SETTINGS.heroHeading,
            heroSubheading: homeData.hero_subheading || INITIAL_HOMEPAGE_SETTINGS.heroSubheading,
            heroButtonText: homeData.hero_button_text || INITIAL_HOMEPAGE_SETTINGS.heroButtonText,
            heroSliderImages: homeData.hero_slider_images || INITIAL_HOMEPAGE_SETTINGS.heroSliderImages,
            aboutBadge: homeData.about_badge || INITIAL_HOMEPAGE_SETTINGS.aboutBadge,
            aboutHeading: homeData.about_heading || INITIAL_HOMEPAGE_SETTINGS.aboutHeading,
            aboutSubheading: homeData.about_subheading || INITIAL_HOMEPAGE_SETTINGS.aboutSubheading,
            aboutMission: homeData.about_mission || INITIAL_HOMEPAGE_SETTINGS.aboutMission,
            aboutVision: homeData.about_vision || INITIAL_HOMEPAGE_SETTINGS.aboutVision,
            aboutImage: homeData.about_image || INITIAL_HOMEPAGE_SETTINGS.aboutImage,
            sectionsVisibility: homeData.sections_visibility || INITIAL_HOMEPAGE_SETTINGS.sectionsVisibility
          });
        }
      }


      // 4. Departments
      const { data: deptsData } = await supabase.from('departments').select('*').order('display_order', { ascending: true });
      if (deptsData) {
        setDepartments(
          deptsData.map((d: any) => ({
            id: d.id,
            title: d.title,
            titleUrdu: d.title_urdu,
            iconName: d.icon_name,
            description: d.description,
            descriptionUrdu: d.description_urdu,
            fullDescription: d.full_description,
            image: d.image,
            order: d.display_order,
            features: d.features || [],
            featuresUrdu: d.features_urdu || [],
            headDoctor: d.head_doctor || ''
          }))
        );
      }

      // 5. Doctors
      const { data: docsData } = await supabase.from('doctors').select('*').order('name', { ascending: true });
      if (docsData) {
        setDoctors(
          docsData.map((d: any) => ({
            id: d.id,
            name: d.name,
            nameUrdu: d.name_urdu,
            departmentId: d.department_id,
            specialty: d.specialty,
            specialtyUrdu: d.specialty_urdu,
            qualification: d.qualification,
            experience: d.experience,
            opdTimings: d.opd_timings,
            opdTimingsUrdu: d.opd_timings_urdu,
            days: d.days,
            daysUrdu: d.days_urdu,
            feePKR: Number(d.fee_pkr) || 0,
            image: d.image,
            about: d.about || '',
            aboutUrdu: d.about_urdu || '',
            pmdcNo: d.pmdc_no || '',
            active: d.active ?? true
          }))
        );
      }

      // 6. Appointments
      const { data: apptsData } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
      if (apptsData) {
        setAppointments(
          apptsData.map((a: any) => ({
            id: a.id,
            token: a.token,
            patientName: a.patient_name,
            phone: a.phone,
            cnic: a.cnic,
            departmentId: a.department_id,
            doctorId: a.doctor_id,
            appointmentDate: a.appointment_date,
            timeSlot: a.time_slot,
            patientType: a.patient_type || 'new',
            notes: a.notes,
            status: a.status as AppointmentStatus,
            createdAt: a.created_at
          }))
        );
      }

      // 7. Services
      const { data: srvData } = await supabase.from('services').select('*');
      if (srvData) {
        setServices(
          srvData.map((s: any) => ({
            id: s.id,
            title: s.title,
            titleUrdu: s.title_urdu,
            iconName: s.icon_name,
            description: s.description,
            descriptionUrdu: s.description_urdu,
            badge: s.badge,
            badgeUrdu: s.badge_urdu,
            image: s.image
          }))
        );
      }

      // 8. Packages
      const { data: pkgData } = await supabase.from('packages').select('*');
      if (pkgData) {
        setPackages(
          pkgData.map((p: any) => ({
            id: p.id,
            title: p.title,
            titleUrdu: p.title_urdu,
            originalPrice: Number(p.original_price),
            discountedPrice: Number(p.discounted_price),
            popular: p.popular ?? false,
            category: p.category,
            categoryUrdu: p.category_urdu,
            fastingRequired: p.fasting_required,
            fastingRequiredUrdu: p.fasting_required_urdu,
            reportTime: p.report_time,
            reportTimeUrdu: p.report_time_urdu,
            testsIncluded: p.tests_included || [],
            testsIncludedUrdu: p.tests_included_urdu || []
          }))
        );
      }

      // 9. Gallery
      const { data: galData } = await supabase.from('gallery').select('*');
      if (galData) {
        setGallery(
          galData.map((g: any) => ({
            id: g.id,
            title: g.title,
            titleUrdu: g.title_urdu,
            category: g.category,
            categoryLabel: g.category_label,
            categoryLabelUrdu: g.category_label_urdu,
            image: g.image,
            description: g.description,
            descriptionUrdu: g.description_urdu
          }))
        );
      }

      // 10. Testimonials
      const { data: testData } = await supabase.from('testimonials').select('*');
      if (testData) {
        setTestimonials(
          testData.map((t: any) => ({
            id: t.id,
            name: t.name,
            nameUrdu: t.name_urdu,
            city: t.city,
            cityUrdu: t.city_urdu,
            rating: t.rating ?? 5,
            department: t.department,
            departmentUrdu: t.department_urdu,
            comment: t.comment,
            commentUrdu: t.comment_urdu,
            date: t.date,
            avatar: t.avatar
          }))
        );
      }

      // 11. FAQs
      const { data: faqsData } = await supabase.from('faqs').select('*');
      if (faqsData) {
        setFaqs(
          faqsData.map((f: any) => ({
            id: f.id,
            question: f.question,
            questionUrdu: f.question_urdu,
            answer: f.answer,
            answerUrdu: f.answer_urdu,
            category: f.category
          }))
        );
      }

      // 12. Messages
      const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (msgData && msgData.length > 0) {
        setMessages(
          msgData.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone,
            subject: m.subject,
            message: m.message,
            read: m.read ?? false,
            important: m.important ?? false,
            createdAt: m.created_at
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
      showToast('Could not sync with Supabase cloud database. Using cached data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseActive]);

  // Initial load
  useEffect(() => {
    fetchSupabaseData();
  }, [fetchSupabaseData]);

  // Real-time listener for Appointments (live updates on all devices)
  useEffect(() => {
    if (!isSupabaseActive) return;

    const channel = supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAppt: AdminAppointment = {
              id: payload.new.id,
              token: payload.new.token,
              patientName: payload.new.patient_name,
              phone: payload.new.phone,
              cnic: payload.new.cnic,
              departmentId: payload.new.department_id,
              doctorId: payload.new.doctor_id,
              appointmentDate: payload.new.appointment_date,
              timeSlot: payload.new.time_slot,
              patientType: payload.new.patient_type || 'new',
              notes: payload.new.notes,
              status: payload.new.status,
              createdAt: payload.new.created_at
            };
            setAppointments((prev) => [newAppt, ...prev.filter((a) => a.id !== newAppt.id)]);
            showToast(`New Appointment booked: ${newAppt.patientName}`, 'info');
          } else if (payload.eventType === 'UPDATE') {
            setAppointments((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? { ...a, status: payload.new.status } : a
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAppointments((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseActive]);

  // Real-time listener for Settings and Homepage (live updates across all open mobile & desktop devices)
  useEffect(() => {
    if (!isSupabaseActive) return;

    const channel = supabase
      .channel('public:settings_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          if (payload.new) {
            setHospitalConfig((prev) => mapSettingsRowToHospitalConfig(payload.new, prev));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hospital_settings' },
        (payload) => {
          if (payload.new) {
            setHospitalConfig((prev) => mapSettingsRowToHospitalConfig(payload.new, prev));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homepage_content' },
        () => {
          fetchSupabaseData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homepage_settings' },
        () => {
          fetchSupabaseData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseActive, fetchSupabaseData]);

  // ============================================================================
  // DATABASE WRITES & MUTATIONS
  // ============================================================================

  // Hospital Config (General Settings)
  const updateHospitalConfig = async (newConfig: Partial<typeof INITIAL_CONFIG>) => {
    const updated = { ...hospitalConfig, ...newConfig };

    if (!isSupabaseActive) {
      setHospitalConfig(updated);
      showToast('Settings updated (add Supabase credentials to sync across devices)');
      return;
    }

    try {
      const rawWhatsapp = updated.contact?.whatsapp || '';
      const whatsappCleanVal = cleanWhatsAppNumber(rawWhatsapp);
      const rawEmergency = updated.contact?.emergencyNumber || '';
      const emergencyVal = formatDisplayPhone(rawEmergency);
      const emergencyRawVal = cleanPhoneEmergency(rawEmergency);

      const contactObj = {
        ...updated.contact,
        emergencyNumber: emergencyVal,
        emergencyNumberRaw: emergencyRawVal,
        whatsapp: rawWhatsapp,
        whatsappClean: whatsappCleanVal
      };

      const payload: any = {
        id: 'main',
        name: updated.name,
        name_urdu: updated.nameUrdu,
        tagline: updated.tagline,
        tagline_urdu: updated.taglineUrdu,
        logo: updated.logo,
        favicon: updated.favicon,
        short_desc: updated.shortDesc,
        short_desc_urdu: updated.shortDescUrdu,
        whatsapp_number: rawWhatsapp,
        phone_emergency: emergencyVal,
        phone_reception: updated.contact?.receptionPhone || '',
        phone_mobile: updated.contact?.mobileEmergency || '',
        email: updated.contact?.email || '',
        address: updated.contact?.address || '',
        address_urdu: updated.contact?.addressUrdu || '',
        google_maps_url: updated.contact?.googleMapsEmbedUrl || '',
        hours_opd: updated.contact?.hours?.opd || '',
        hours_emergency: updated.contact?.hours?.emergency || '',
        social_links: updated.socialLinks || {},
        contact: contactObj,
        updated_at: new Date().toISOString()
      };

      // 1. Save to primary 'settings' table
      let saved = false;
      let lastError: any = null;
      try {
        const { error: sError } = await supabase.from('settings').upsert(payload);
        if (!sError) {
          saved = true;
        } else {
          lastError = sError;
        }
      } catch (err) {
        lastError = err;
      }

      // 2. Also keep 'hospital_settings' in sync
      try {
        const { error: hsError } = await supabase.from('hospital_settings').upsert({
          id: 'main',
          name: payload.name,
          name_urdu: payload.name_urdu,
          tagline: payload.tagline,
          tagline_urdu: payload.tagline_urdu,
          logo: payload.logo,
          favicon: payload.favicon,
          short_desc: payload.short_desc,
          short_desc_urdu: payload.short_desc_urdu,
          social_links: payload.social_links,
          contact: payload.contact,
          updated_at: payload.updated_at
        });
        if (!hsError) saved = true;
      } catch (e) {
        // Continue
      }

      if (!saved && lastError) {
        throw lastError;
      }

      // Re-fetch fresh state directly from Supabase to confirm
      await fetchSupabaseData();
      showToast('Saved successfully to Supabase!');
      logAction('Updated General Settings', 'Settings', 'Hospital details, contact info, or branding updated.');
    } catch (err: any) {
      console.error('Failed to update settings in Supabase:', err);
      showToast(`Save failed: ${err?.message || 'Database error. Check Supabase connection and RLS.'}`, 'error');
    }
  };


  // Operational Settings
  const updateSettings = async (newSettings: Partial<HospitalSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('operational_settings').upsert({
          id: 'main',
          slot_duration_minutes: updated.slotDurationMinutes,
          working_days: updated.workingDays,
          opd_open_time: updated.opdOpenTime,
          opd_close_time: updated.opdCloseTime,
          emergency_active: updated.emergencyActive,
          maintenance_mode: updated.maintenanceMode,
          email_notifications: updated.emailNotifications,
          sms_notifications: updated.smsNotifications,
          whatsapp_confirmation: updated.whatsappConfirmation,
          currency: updated.currency,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
        showToast('System settings saved permanently to Supabase!');
      } catch (err: any) {
        console.error('Failed to update operational_settings:', err);
        showToast(`Save failed: ${err?.message}`, 'error');
      }
    }

    logAction('Updated System Settings', 'Settings', 'Operational settings and parameters modified.');
  };

  // Homepage Settings
  const updateHomepageSettings = async (newSettings: Partial<HomepageSettings>) => {
    const updated: HomepageSettings = {
      ...homepageSettings,
      ...newSettings,
      sectionsVisibility: {
        ...homepageSettings.sectionsVisibility,
        ...(newSettings.sectionsVisibility || {})
      }
    };
    setHomepageSettings(updated);

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('homepage_settings').upsert({
          id: 'main',
          hero_heading: updated.heroHeading,
          hero_subheading: updated.heroSubheading,
          hero_button_text: updated.heroButtonText,
          hero_slider_images: updated.heroSliderImages,
          about_badge: updated.aboutBadge,
          about_heading: updated.aboutHeading,
          about_subheading: updated.aboutSubheading,
          about_mission: updated.aboutMission,
          about_vision: updated.aboutVision,
          about_image: updated.aboutImage,
          sections_visibility: updated.sectionsVisibility,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
        showToast('Homepage settings saved permanently to Supabase!');
      } catch (err: any) {
        console.error('Failed to update homepage_settings:', err);
        showToast(`Save failed: ${err?.message}`, 'error');
      }
    }

    logAction('Updated Homepage CMS', 'Homepage Settings', 'Hero texts, banners, or section visibility updated.');
  };

  // Appointments
  const addAppointment = (app: Omit<AdminAppointment, 'id' | 'createdAt'>): string => {
    const id = `apt-${Date.now()}`;
    const token = `DAD-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date().toISOString();
    const newApp: AdminAppointment = { ...app, id, token, createdAt };

    setAppointments((prev) => [newApp, ...prev]);

    if (isSupabaseActive) {
      supabase.from('appointments').insert({
        id: newApp.id,
        token: newApp.token,
        patient_name: newApp.patientName,
        phone: newApp.phone,
        cnic: newApp.cnic || null,
        department_id: newApp.departmentId,
        doctor_id: newApp.doctorId || null,
        appointment_date: newApp.appointmentDate,
        time_slot: newApp.timeSlot,
        patient_type: newApp.patientType,
        notes: newApp.notes || null,
        status: newApp.status,
        created_at: newApp.createdAt
      }).then(({ error }) => {
        if (error) {
          console.error('Failed to insert appointment into Supabase:', error);
        }
      });
    }

    logAction('New Appointment Request', 'Appointments', `Appointment booked for ${app.patientName} (${token}).`);
    return token;
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
      } catch (err: any) {
        showToast(`Status update failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    }
    showToast(`Appointment status updated to ${status}`);
    logAction('Updated Appointment Status', 'Appointments', `Appointment ${id} changed to ${status}.`);
  };

  const deleteAppointment = async (id: string) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
      } catch (err: any) {
        showToast(`Delete failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
    showToast('Appointment removed successfully');
    logAction('Deleted Appointment', 'Appointments', `Deleted appointment record ${id}.`);
  };

  // Doctors
  const addDoctor = async (doc: Omit<Doctor, 'id'>) => {
    const id = `doc-${Date.now()}`;
    const newDoc: Doctor = { ...doc, id };

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('doctors').insert({
          id: newDoc.id,
          name: newDoc.name,
          name_urdu: newDoc.nameUrdu,
          department_id: newDoc.departmentId,
          specialty: newDoc.specialty,
          specialty_urdu: newDoc.specialtyUrdu,
          qualification: newDoc.qualification,
          experience: newDoc.experience,
          opd_timings: newDoc.opdTimings,
          opd_timings_urdu: newDoc.opdTimingsUrdu,
          days: newDoc.days,
          days_urdu: newDoc.daysUrdu,
          fee_pkr: newDoc.feePKR,
          image: newDoc.image,
          about: newDoc.about,
          about_urdu: newDoc.aboutUrdu,
          pmdc_no: newDoc.pmdcNo,
          active: newDoc.active ?? true
        });
        if (error) throw error;
        await fetchSupabaseData();
        showToast(`Doctor ${newDoc.name} added permanently to Supabase!`);
      } catch (err: any) {
        showToast(`Failed to add doctor: ${err?.message}`, 'error');
        return;
      }
    } else {
      setDoctors((prev) => [...prev, newDoc]);
      showToast(`Doctor ${newDoc.name} added!`);
    }

    logAction('Added Doctor', 'Doctors', `Added consultant ${doc.name}.`);
  };

  const updateDoctor = async (id: string, docUpdate: Partial<Doctor>) => {
    if (isSupabaseActive) {
      try {
        const dbPayload: any = { updated_at: new Date().toISOString() };
        if (docUpdate.name !== undefined) dbPayload.name = docUpdate.name;
        if (docUpdate.nameUrdu !== undefined) dbPayload.name_urdu = docUpdate.nameUrdu;
        if (docUpdate.departmentId !== undefined) dbPayload.department_id = docUpdate.departmentId;
        if (docUpdate.specialty !== undefined) dbPayload.specialty = docUpdate.specialty;
        if (docUpdate.specialtyUrdu !== undefined) dbPayload.specialty_urdu = docUpdate.specialtyUrdu;
        if (docUpdate.qualification !== undefined) dbPayload.qualification = docUpdate.qualification;
        if (docUpdate.experience !== undefined) dbPayload.experience = docUpdate.experience;
        if (docUpdate.opdTimings !== undefined) dbPayload.opd_timings = docUpdate.opdTimings;
        if (docUpdate.opdTimingsUrdu !== undefined) dbPayload.opd_timings_urdu = docUpdate.opdTimingsUrdu;
        if (docUpdate.days !== undefined) dbPayload.days = docUpdate.days;
        if (docUpdate.daysUrdu !== undefined) dbPayload.days_urdu = docUpdate.daysUrdu;
        if (docUpdate.feePKR !== undefined) dbPayload.fee_pkr = docUpdate.feePKR;
        if (docUpdate.image !== undefined) dbPayload.image = docUpdate.image;
        if (docUpdate.about !== undefined) dbPayload.about = docUpdate.about;
        if (docUpdate.aboutUrdu !== undefined) dbPayload.about_urdu = docUpdate.aboutUrdu;
        if (docUpdate.pmdcNo !== undefined) dbPayload.pmdc_no = docUpdate.pmdcNo;
        if (docUpdate.active !== undefined) dbPayload.active = docUpdate.active;

        const { error } = await supabase.from('doctors').update(dbPayload).eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Doctor details updated in Supabase!');
      } catch (err: any) {
        showToast(`Update failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...docUpdate } : d))
      );
      showToast('Doctor details updated!');
    }

    logAction('Updated Doctor', 'Doctors', `Updated doctor profile ${id}.`);
  };

  const deleteDoctor = async (id: string) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('doctors').delete().eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Doctor deleted from Supabase!');
      } catch (err: any) {
        showToast(`Delete failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      showToast('Doctor removed successfully');
    }

    logAction('Deleted Doctor', 'Doctors', `Deleted doctor ${id}.`);
  };

  const toggleDoctorActive = async (id: string) => {
    const doc = doctors.find((d) => d.id === id);
    if (!doc) return;
    const newStatus = !(doc.active ?? true);
    await updateDoctor(id, { active: newStatus });
  };

  // Departments
  const addDepartment = async (dept: Omit<Department, 'id'>) => {
    const id = `dept-${Date.now()}`;
    const newDept: Department = { ...dept, id };

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('departments').insert({
          id: newDept.id,
          title: newDept.title,
          title_urdu: newDept.titleUrdu,
          icon_name: newDept.iconName,
          description: newDept.description,
          description_urdu: newDept.descriptionUrdu,
          full_description: newDept.fullDescription,
          image: newDept.image,
          display_order: newDept.order || departments.length + 1,
          features: newDept.features || [],
          features_urdu: newDept.featuresUrdu || [],
          head_doctor: newDept.headDoctor || ''
        });
        if (error) throw error;
        await fetchSupabaseData();
        showToast(`Department ${newDept.title} added to Supabase!`);
      } catch (err: any) {
        showToast(`Add department failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setDepartments((prev) => [...prev, newDept]);
      showToast(`Department ${newDept.title} added!`);
    }

    logAction('Added Department', 'Departments', `Added department ${dept.title}.`);
  };

  const updateDepartment = async (id: string, deptUpdate: Partial<Department>) => {
    if (isSupabaseActive) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (deptUpdate.title !== undefined) payload.title = deptUpdate.title;
        if (deptUpdate.titleUrdu !== undefined) payload.title_urdu = deptUpdate.titleUrdu;
        if (deptUpdate.iconName !== undefined) payload.icon_name = deptUpdate.iconName;
        if (deptUpdate.description !== undefined) payload.description = deptUpdate.description;
        if (deptUpdate.descriptionUrdu !== undefined) payload.description_urdu = deptUpdate.descriptionUrdu;
        if (deptUpdate.fullDescription !== undefined) payload.full_description = deptUpdate.fullDescription;
        if (deptUpdate.image !== undefined) payload.image = deptUpdate.image;
        if (deptUpdate.order !== undefined) payload.display_order = deptUpdate.order;
        if (deptUpdate.features !== undefined) payload.features = deptUpdate.features;
        if (deptUpdate.featuresUrdu !== undefined) payload.features_urdu = deptUpdate.featuresUrdu;
        if (deptUpdate.headDoctor !== undefined) payload.head_doctor = deptUpdate.headDoctor;

        const { error } = await supabase.from('departments').update(payload).eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Department updated in Supabase!');
      } catch (err: any) {
        showToast(`Update department failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...deptUpdate } : d))
      );
      showToast('Department updated!');
    }

    logAction('Updated Department', 'Departments', `Updated department ${id}.`);
  };

  const deleteDepartment = async (id: string) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Department deleted from Supabase!');
      } catch (err: any) {
        showToast(`Delete department failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showToast('Department removed successfully');
    }

    logAction('Deleted Department', 'Departments', `Deleted department ${id}.`);
  };

  const reorderDepartments = async (newOrder: Department[]) => {
    const updated = newOrder.map((dept, index) => ({ ...dept, order: index + 1 }));

    if (isSupabaseActive) {
      try {
        for (const dept of updated) {
          const { error } = await supabase.from('departments').update({ display_order: dept.order }).eq('id', dept.id);
          if (error) throw error;
        }
        await fetchSupabaseData();
        showToast('Department order updated in Supabase!');
      } catch (err: any) {
        showToast(`Reorder failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setDepartments(updated);
      showToast('Department display order updated!');
    }

    logAction('Reordered Departments', 'Departments', 'Updated department order sequence.');
  };

  // Services
  const addService = async (srv: Omit<ServiceFacility, 'id'>) => {
    const id = `srv-${Date.now()}`;
    const newSrv = { ...srv, id };

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('services').insert({
          id: newSrv.id,
          title: newSrv.title,
          title_urdu: newSrv.titleUrdu,
          icon_name: newSrv.iconName,
          description: newSrv.description,
          description_urdu: newSrv.descriptionUrdu,
          badge: newSrv.badge,
          badge_urdu: newSrv.badgeUrdu,
          image: newSrv.image
        });
        if (error) throw error;
        await fetchSupabaseData();
        showToast(`Service "${newSrv.title}" added to Supabase!`);
      } catch (err: any) {
        console.error('Failed to insert service into Supabase:', err);
        showToast(`Failed to add service: ${err?.message}`, 'error');
        return;
      }
    } else {
      setServices((prev) => [...prev, newSrv]);
      showToast(`Service "${newSrv.title}" added!`);
    }
    logAction('Added Service', 'Services', `Added service ${srv.title}.`);
  };

  const updateService = async (id: string, srvUpdate: Partial<ServiceFacility>) => {
    if (isSupabaseActive) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (srvUpdate.title !== undefined) payload.title = srvUpdate.title;
        if (srvUpdate.titleUrdu !== undefined) payload.title_urdu = srvUpdate.titleUrdu;
        if (srvUpdate.iconName !== undefined) payload.icon_name = srvUpdate.iconName;
        if (srvUpdate.description !== undefined) payload.description = srvUpdate.description;
        if (srvUpdate.descriptionUrdu !== undefined) payload.description_urdu = srvUpdate.descriptionUrdu;
        if (srvUpdate.badge !== undefined) payload.badge = srvUpdate.badge;
        if (srvUpdate.badgeUrdu !== undefined) payload.badge_urdu = srvUpdate.badgeUrdu;
        if (srvUpdate.image !== undefined) payload.image = srvUpdate.image;

        const { error } = await supabase.from('services').update(payload).eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Service details updated in Supabase!');
      } catch (err: any) {
        console.error('Failed to update service in Supabase:', err);
        showToast(`Update service failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...srvUpdate } : s)));
      showToast('Service details updated!');
    }
    logAction('Updated Service', 'Services', `Updated service ${id}.`);
  };

  const deleteService = async (id: string) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Service removed from Supabase');
      } catch (err: any) {
        showToast(`Delete service failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('Service removed successfully');
    }
    logAction('Deleted Service', 'Services', `Deleted service ${id}.`);
  };

  // Packages
  const addPackage = async (pkg: Omit<HealthPackage, 'id'>) => {
    const id = `pkg-${Date.now()}`;
    const newPkg = { ...pkg, id };

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('packages').insert({
          id: newPkg.id,
          title: newPkg.title,
          title_urdu: newPkg.titleUrdu,
          original_price: newPkg.originalPrice,
          discounted_price: newPkg.discountedPrice,
          popular: newPkg.popular ?? false,
          category: newPkg.category,
          category_urdu: newPkg.categoryUrdu,
          fasting_required: newPkg.fastingRequired,
          fasting_required_urdu: newPkg.fastingRequiredUrdu,
          report_time: newPkg.reportTime,
          report_time_urdu: newPkg.reportTimeUrdu,
          tests_included: newPkg.testsIncluded,
          tests_included_urdu: newPkg.testsIncludedUrdu
        });
        if (error) throw error;
        await fetchSupabaseData();
        showToast(`Package "${newPkg.title}" created in Supabase!`);
      } catch (err: any) {
        console.error('Failed to add package to Supabase:', err);
        showToast(`Add package failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setPackages((prev) => [...prev, newPkg]);
      showToast(`Package "${newPkg.title}" created!`);
    }
    logAction('Added Package', 'Packages', `Added package ${pkg.title}.`);
  };

  const updatePackage = async (id: string, pkgUpdate: Partial<HealthPackage>) => {
    if (isSupabaseActive) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (pkgUpdate.title !== undefined) payload.title = pkgUpdate.title;
        if (pkgUpdate.titleUrdu !== undefined) payload.title_urdu = pkgUpdate.titleUrdu;
        if (pkgUpdate.originalPrice !== undefined) payload.original_price = pkgUpdate.originalPrice;
        if (pkgUpdate.discountedPrice !== undefined) payload.discounted_price = pkgUpdate.discountedPrice;
        if (pkgUpdate.popular !== undefined) payload.popular = pkgUpdate.popular;
        if (pkgUpdate.category !== undefined) payload.category = pkgUpdate.category;
        if (pkgUpdate.categoryUrdu !== undefined) payload.category_urdu = pkgUpdate.categoryUrdu;
        if (pkgUpdate.fastingRequired !== undefined) payload.fasting_required = pkgUpdate.fastingRequired;
        if (pkgUpdate.fastingRequiredUrdu !== undefined) payload.fasting_required_urdu = pkgUpdate.fastingRequiredUrdu;
        if (pkgUpdate.reportTime !== undefined) payload.report_time = pkgUpdate.reportTime;
        if (pkgUpdate.reportTimeUrdu !== undefined) payload.report_time_urdu = pkgUpdate.reportTimeUrdu;
        if (pkgUpdate.testsIncluded !== undefined) payload.tests_included = pkgUpdate.testsIncluded;
        if (pkgUpdate.testsIncludedUrdu !== undefined) payload.tests_included_urdu = pkgUpdate.testsIncludedUrdu;

        const { error } = await supabase.from('packages').update(payload).eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Package updated in Supabase!');
      } catch (err: any) {
        console.error('Failed to update package in Supabase:', err);
        showToast(`Update package failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...pkgUpdate } : p)));
      showToast('Package updated!');
    }
    logAction('Updated Package', 'Packages', `Updated package ${id}.`);
  };

  const deletePackage = async (id: string) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('packages').delete().eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Package deleted from Supabase');
      } catch (err: any) {
        showToast(`Delete package failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setPackages((prev) => prev.filter((p) => p.id !== id));
      showToast('Package deleted');
    }
    logAction('Deleted Package', 'Packages', `Deleted package ${id}.`);
  };

  // Gallery
  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
    const id = `gal-${Date.now()}`;
    const newItem = { ...item, id };

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('gallery').insert({
          id: newItem.id,
          title: newItem.title,
          title_urdu: newItem.titleUrdu,
          category: newItem.category,
          category_label: newItem.categoryLabel,
          category_label_urdu: newItem.categoryLabelUrdu,
          image: newItem.image,
          description: newItem.description,
          description_urdu: newItem.descriptionUrdu
        });
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Gallery image added to Supabase!');
      } catch (err: any) {
        console.error('Failed to add gallery item to Supabase:', err);
        showToast(`Add gallery item failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setGallery((prev) => [newItem, ...prev]);
      showToast('Gallery image added!');
    }
    logAction('Added Gallery Image', 'Gallery', `Uploaded image ${item.title}.`);
  };

  const deleteGalleryItem = async (id: string) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Gallery item removed from Supabase');
      } catch (err: any) {
        showToast(`Delete gallery item failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setGallery((prev) => prev.filter((g) => g.id !== id));
      showToast('Gallery item removed');
    }
    logAction('Deleted Gallery Image', 'Gallery', `Removed gallery image ${id}.`);
  };

  // Testimonials
  const addTestimonial = async (item: Omit<Testimonial, 'id'>) => {
    const id = `test-${Date.now()}`;
    const newItem = { ...item, id };

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('testimonials').insert({
          id: newItem.id,
          name: newItem.name,
          name_urdu: newItem.nameUrdu,
          city: newItem.city,
          city_urdu: newItem.cityUrdu,
          rating: newItem.rating,
          department: newItem.department,
          department_urdu: newItem.departmentUrdu,
          comment: newItem.comment,
          comment_urdu: newItem.commentUrdu,
          date: newItem.date,
          avatar: newItem.avatar
        });
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Testimonial published to Supabase!');
      } catch (err: any) {
        console.error('Failed to add testimonial to Supabase:', err);
        showToast(`Add testimonial failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setTestimonials((prev) => [newItem, ...prev]);
      showToast('Testimonial published!');
    }
    logAction('Added Testimonial', 'Testimonials', `Added testimonial by ${item.name}.`);
  };

  const updateTestimonial = async (id: string, itemUpdate: Partial<Testimonial>) => {
    if (isSupabaseActive) {
      try {
        const payload: any = {};
        if (itemUpdate.name !== undefined) payload.name = itemUpdate.name;
        if (itemUpdate.nameUrdu !== undefined) payload.name_urdu = itemUpdate.nameUrdu;
        if (itemUpdate.city !== undefined) payload.city = itemUpdate.city;
        if (itemUpdate.cityUrdu !== undefined) payload.city_urdu = itemUpdate.cityUrdu;
        if (itemUpdate.rating !== undefined) payload.rating = itemUpdate.rating;
        if (itemUpdate.department !== undefined) payload.department = itemUpdate.department;
        if (itemUpdate.departmentUrdu !== undefined) payload.department_urdu = itemUpdate.departmentUrdu;
        if (itemUpdate.comment !== undefined) payload.comment = itemUpdate.comment;
        if (itemUpdate.commentUrdu !== undefined) payload.comment_urdu = itemUpdate.commentUrdu;
        if (itemUpdate.avatar !== undefined) payload.avatar = itemUpdate.avatar;

        const { error } = await supabase.from('testimonials').update(payload).eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Testimonial updated in Supabase!');
      } catch (err: any) {
        console.error('Failed to update testimonial in Supabase:', err);
        showToast(`Update testimonial failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...itemUpdate } : t)));
      showToast('Testimonial updated!');
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('Testimonial deleted from Supabase');
      } catch (err: any) {
        showToast(`Delete testimonial failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      showToast('Testimonial deleted');
    }
    logAction('Deleted Testimonial', 'Testimonials', `Removed testimonial ${id}.`);
  };

  // FAQs
  const addFaq = async (item: Omit<FAQItem, 'id'>) => {
    const id = `faq-${Date.now()}`;
    const newFaq = { ...item, id };

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('faqs').insert({
          id: newFaq.id,
          question: newFaq.question,
          question_urdu: newFaq.questionUrdu,
          answer: newFaq.answer,
          answer_urdu: newFaq.answerUrdu,
          category: newFaq.category
        });
        if (error) throw error;
        await fetchSupabaseData();
        showToast('FAQ created in Supabase!');
      } catch (err: any) {
        console.error('Failed to add FAQ to Supabase:', err);
        showToast(`Add FAQ failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setFaqs((prev) => [...prev, newFaq]);
      showToast('FAQ created!');
    }
    logAction('Added FAQ', 'FAQs', `Added FAQ "${item.question.slice(0, 30)}...".`);
  };

  const updateFaq = async (id: string, itemUpdate: Partial<FAQItem>) => {
    if (isSupabaseActive) {
      try {
        const payload: any = {};
        if (itemUpdate.question !== undefined) payload.question = itemUpdate.question;
        if (itemUpdate.questionUrdu !== undefined) payload.question_urdu = itemUpdate.questionUrdu;
        if (itemUpdate.answer !== undefined) payload.answer = itemUpdate.answer;
        if (itemUpdate.answerUrdu !== undefined) payload.answer_urdu = itemUpdate.answerUrdu;
        if (itemUpdate.category !== undefined) payload.category = itemUpdate.category;

        const { error } = await supabase.from('faqs').update(payload).eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('FAQ updated in Supabase!');
      } catch (err: any) {
        console.error('Failed to update FAQ in Supabase:', err);
        showToast(`Update FAQ failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...itemUpdate } : f)));
      showToast('FAQ updated!');
    }
  };

  const deleteFaq = async (id: string) => {
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from('faqs').delete().eq('id', id);
        if (error) throw error;
        await fetchSupabaseData();
        showToast('FAQ deleted from Supabase');
      } catch (err: any) {
        showToast(`Delete FAQ failed: ${err?.message}`, 'error');
        return;
      }
    } else {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showToast('FAQ deleted');
    }
    logAction('Deleted FAQ', 'FAQs', `Deleted FAQ ${id}.`);
  };

  // Messages
  const addMessage = (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read' | 'important'>) => {
    const id = `msg-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newMsg: ContactMessage = { ...msg, id, createdAt, read: false, important: false };
    setMessages((prev) => [newMsg, ...prev]);

    if (isSupabaseActive) {
      supabase.from('messages').insert({
        id: newMsg.id,
        name: newMsg.name,
        email: newMsg.email || null,
        phone: newMsg.phone,
        subject: newMsg.subject || null,
        message: newMsg.message,
        read: false,
        important: false,
        created_at: newMsg.createdAt
      }).then(({ error }) => {
        if (error) console.error('Failed to insert message into Supabase:', error);
      });
    }
    showToast('Your message has been sent to hospital administration.');
  };

  const markMessageRead = async (id: string, read: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    if (isSupabaseActive) {
      await supabase.from('messages').update({ read }).eq('id', id);
    }
  };

  const toggleMessageImportant = async (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;
    const important = !msg.important;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, important } : m)));
    if (isSupabaseActive) {
      await supabase.from('messages').update({ important }).eq('id', id);
    }
  };

  const deleteMessage = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (isSupabaseActive) {
      await supabase.from('messages').delete().eq('id', id);
    }
    showToast('Message deleted');
  };

  // Patients
  const addPatient = (pat: Omit<PatientRecord, 'id' | 'createdAt'>): string => {
    const id = `pat-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newPat = { ...pat, id, createdAt };
    setPatients((prev) => [newPat, ...prev]);
    showToast(`Patient ${pat.name} registered!`);
    return id;
  };

  const updatePatient = (id: string, patUpdate: Partial<PatientRecord>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...patUpdate } : p)));
    showToast('Patient record updated');
  };

  // Lab Reports
  const addLabReport = (rep: Omit<LabReportRecord, 'id' | 'createdAt'>) => {
    const id = `rep-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newRep = { ...rep, id, createdAt };
    setLabReports((prev) => [newRep, ...prev]);
    showToast(`Lab report ${rep.reportId} uploaded!`);
  };

  const updateLabReport = (id: string, repUpdate: Partial<LabReportRecord>) => {
    setLabReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...repUpdate } : r)));
    showToast('Lab report updated');
  };

  const deleteLabReport = (id: string) => {
    setLabReports((prev) => prev.filter((r) => r.id !== id));
    showToast('Lab report deleted');
  };

  const lookupLabReport = (reportId: string, phone: string): LabReportRecord | null => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const cleanId = reportId.trim().toUpperCase();
    return (
      labReports.find(
        (r) =>
          r.reportId.toUpperCase() === cleanId &&
          r.patientPhone.replace(/[\s-]/g, '') === cleanPhone
      ) || null
    );
  };

  // Invoices
  const addInvoice = (inv: Omit<InvoiceRecord, 'id' | 'createdAt'>) => {
    const id = `inv-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newInv = { ...inv, id, createdAt };
    setInvoices((prev) => [newInv, ...prev]);
    showToast(`Invoice ${inv.invoiceNumber} generated!`);
  };

  const updateInvoiceStatus = (id: string, status: 'paid' | 'unpaid') => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    showToast(`Invoice marked as ${status}`);
  };

  // Staff Users
  const addStaffUser = (user: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const id = `user-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newUser = { ...user, id, createdAt };
    setStaffUsers((prev) => [...prev, newUser]);
    showToast(`Staff account created for ${user.name}`);
  };

  const updateStaffUser = (id: string, userUpdate: Partial<StaffUser>) => {
    setStaffUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userUpdate } : u)));
    showToast('Staff user updated');
  };

  const deleteStaffUser = (id: string) => {
    setStaffUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('Staff user removed');
  };

  // ============================================================================
  // ONE-TIME IMPORT LOCAL DATA TO SUPABASE CLOUD
  // ============================================================================

  const importLocalDataToSupabase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!isSupabaseActive) {
      return { success: false, count: 0, error: 'Supabase credentials not configured in environment variables.' };
    }

    try {
      setIsLoading(true);
      let count = 0;

      // 1. Hospital Settings (upsert to settings & hospital_settings)
      try {
        await supabase.from('settings').upsert({
          id: 'main',
          name: hospitalConfig.name,
          name_urdu: hospitalConfig.nameUrdu,
          tagline: hospitalConfig.tagline,
          tagline_urdu: hospitalConfig.taglineUrdu,
          logo: hospitalConfig.logo,
          favicon: hospitalConfig.favicon,
          short_desc: hospitalConfig.shortDesc,
          short_desc_urdu: hospitalConfig.shortDescUrdu,
          whatsapp_number: hospitalConfig.contact?.whatsapp || '',
          phone_emergency: formatDisplayPhone(hospitalConfig.contact?.emergencyNumber),
          phone_reception: hospitalConfig.contact?.receptionPhone || '',
          phone_mobile: hospitalConfig.contact?.mobileEmergency || '',
          email: hospitalConfig.contact?.email || '',
          address: hospitalConfig.contact?.address || '',
          address_urdu: hospitalConfig.contact?.addressUrdu || '',
          google_maps_url: hospitalConfig.contact?.googleMapsEmbedUrl || '',
          hours_opd: hospitalConfig.contact?.hours?.opd || '',
          hours_emergency: hospitalConfig.contact?.hours?.emergency || '',
          social_links: hospitalConfig.socialLinks || {},
          contact: hospitalConfig.contact || {},
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        // continue
      }

      try {
        await supabase.from('hospital_settings').upsert({
          id: 'main',
          name: hospitalConfig.name,
          name_urdu: hospitalConfig.nameUrdu,
          tagline: hospitalConfig.tagline,
          tagline_urdu: hospitalConfig.taglineUrdu,
          logo: hospitalConfig.logo,
          favicon: hospitalConfig.favicon,
          short_desc: hospitalConfig.shortDesc,
          short_desc_urdu: hospitalConfig.shortDescUrdu,
          social_links: hospitalConfig.socialLinks,
          contact: hospitalConfig.contact,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        // continue
      }
      count++;

      // 2. Operational Settings
      await supabase.from('operational_settings').upsert({
        id: 'main',
        slot_duration_minutes: settings.slotDurationMinutes,
        working_days: settings.workingDays,
        opd_open_time: settings.opdOpenTime,
        opd_close_time: settings.opdCloseTime,
        emergency_active: settings.emergencyActive,
        maintenance_mode: settings.maintenanceMode,
        email_notifications: settings.emailNotifications,
        sms_notifications: settings.smsNotifications,
        whatsapp_confirmation: settings.whatsappConfirmation,
        currency: settings.currency,
        updated_at: new Date().toISOString()
      });
      count++;

      // 3. Homepage Settings & Content
      const hpPayload = {
        id: 'main',
        hero_heading: homepageSettings.heroHeading,
        hero_subheading: homepageSettings.heroSubheading,
        hero_button_text: homepageSettings.heroButtonText,
        hero_slider_images: homepageSettings.heroSliderImages,
        about_badge: homepageSettings.aboutBadge,
        about_heading: homepageSettings.aboutHeading,
        about_subheading: homepageSettings.aboutSubheading,
        about_mission: homepageSettings.aboutMission,
        about_vision: homepageSettings.aboutVision,
        about_image: homepageSettings.aboutImage,
        sections_visibility: homepageSettings.sectionsVisibility,
        updated_at: new Date().toISOString()
      };

      try {
        await supabase.from('homepage_content').upsert(hpPayload);
      } catch (e) {
        // continue
      }
      try {
        await supabase.from('homepage_settings').upsert(hpPayload);
      } catch (e) {
        // continue
      }
      count++;


      // 4. Departments
      for (const d of departments) {
        await supabase.from('departments').upsert({
          id: d.id,
          title: d.title,
          title_urdu: d.titleUrdu,
          icon_name: d.iconName,
          description: d.description,
          description_urdu: d.descriptionUrdu,
          full_description: d.fullDescription || null,
          image: d.image || null,
          display_order: d.order || 0,
          features: d.features,
          features_urdu: d.featuresUrdu,
          head_doctor: d.headDoctor
        });
        count++;
      }

      // 5. Doctors
      for (const doc of doctors) {
        await supabase.from('doctors').upsert({
          id: doc.id,
          name: doc.name,
          name_urdu: doc.nameUrdu,
          department_id: doc.departmentId,
          specialty: doc.specialty,
          specialty_urdu: doc.specialtyUrdu,
          qualification: doc.qualification,
          experience: doc.experience,
          opd_timings: doc.opdTimings,
          opd_timings_urdu: doc.opdTimingsUrdu,
          days: doc.days,
          days_urdu: doc.daysUrdu,
          fee_pkr: doc.feePKR,
          image: doc.image,
          about: doc.about,
          about_urdu: doc.aboutUrdu,
          pmdc_no: doc.pmdcNo,
          active: doc.active ?? true
        });
        count++;
      }

      // 6. Appointments
      for (const a of appointments) {
        await supabase.from('appointments').upsert({
          id: a.id,
          token: a.token,
          patient_name: a.patientName,
          phone: a.phone,
          cnic: a.cnic || null,
          department_id: a.departmentId,
          doctor_id: a.doctorId || null,
          appointment_date: a.appointmentDate,
          time_slot: a.timeSlot,
          patient_type: a.patientType,
          notes: a.notes || null,
          status: a.status,
          created_at: a.createdAt
        });
        count++;
      }

      // 7. Services
      for (const s of services) {
        await supabase.from('services').upsert({
          id: s.id,
          title: s.title,
          title_urdu: s.titleUrdu,
          icon_name: s.iconName,
          description: s.description,
          description_urdu: s.descriptionUrdu,
          badge: s.badge || null,
          badge_urdu: s.badgeUrdu || null,
          image: s.image
        });
        count++;
      }

      // 8. Packages
      for (const p of packages) {
        await supabase.from('packages').upsert({
          id: p.id,
          title: p.title,
          title_urdu: p.titleUrdu,
          original_price: p.originalPrice,
          discounted_price: p.discountedPrice,
          popular: p.popular ?? false,
          category: p.category,
          category_urdu: p.categoryUrdu,
          fasting_required: p.fastingRequired,
          fasting_required_urdu: p.fastingRequiredUrdu,
          report_time: p.reportTime,
          report_time_urdu: p.reportTimeUrdu,
          tests_included: p.testsIncluded,
          tests_included_urdu: p.testsIncludedUrdu
        });
        count++;
      }

      // 9. Gallery
      for (const g of gallery) {
        await supabase.from('gallery').upsert({
          id: g.id,
          title: g.title,
          title_urdu: g.titleUrdu,
          category: g.category,
          category_label: g.categoryLabel,
          category_label_urdu: g.categoryLabelUrdu,
          image: g.image,
          description: g.description,
          description_urdu: g.descriptionUrdu
        });
        count++;
      }

      // 10. Testimonials
      for (const t of testimonials) {
        await supabase.from('testimonials').upsert({
          id: t.id,
          name: t.name,
          name_urdu: t.nameUrdu,
          city: t.city,
          city_urdu: t.cityUrdu,
          rating: t.rating,
          department: t.department,
          department_urdu: t.departmentUrdu,
          comment: t.comment,
          comment_urdu: t.commentUrdu,
          date: t.date,
          avatar: t.avatar
        });
        count++;
      }

      // 11. FAQs
      for (const f of faqs) {
        await supabase.from('faqs').upsert({
          id: f.id,
          question: f.question,
          question_urdu: f.questionUrdu,
          answer: f.answer,
          answer_urdu: f.answerUrdu,
          category: f.category
        });
        count++;
      }

      showToast(`Successfully uploaded ${count} records to Supabase Cloud!`, 'success');
      return { success: true, count };
    } catch (err: any) {
      console.error('Import error:', err);
      showToast(`Import error: ${err?.message || 'Check database tables and permissions'}`, 'error');
      return { success: false, count: 0, error: err?.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Backup & Restore
  const exportAllDataJSON = (): string => {
    return JSON.stringify(
      {
        hospitalConfig,
        settings,
        homepageSettings,
        departments,
        doctors,
        appointments,
        services,
        packages,
        gallery,
        testimonials,
        faqs,
        patients,
        labReports,
        invoices,
        messages,
        exportedAt: new Date().toISOString()
      },
      null,
      2
    );
  };

  const restoreFromJSON = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.hospitalConfig) setHospitalConfig(data.hospitalConfig);
      if (data.settings) setSettings(data.settings);
      if (data.homepageSettings) setHomepageSettings(data.homepageSettings);
      if (data.departments) setDepartments(data.departments);
      if (data.doctors) setDoctors(data.doctors);
      if (data.appointments) setAppointments(data.appointments);
      if (data.services) setServices(data.services);
      if (data.packages) setPackages(data.packages);
      if (data.gallery) setGallery(data.gallery);
      if (data.testimonials) setTestimonials(data.testimonials);
      if (data.faqs) setFaqs(data.faqs);
      showToast('All hospital data restored successfully!');
      return true;
    } catch {
      showToast('Invalid backup JSON file', 'error');
      return false;
    }
  };

  return (
    <AdminDataContext.Provider
      value={{
        isLoading,
        isSupabaseActive,
        refetchData: fetchSupabaseData,
        importLocalDataToSupabase,
        hospitalConfig,
        updateHospitalConfig,
        settings,
        updateSettings,
        homepageSettings,
        updateHomepageSettings,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        doctors,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        toggleDoctorActive,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        reorderDepartments,
        packages,
        addPackage,
        updatePackage,
        deletePackage,
        services,
        addService,
        updateService,
        deleteService,
        gallery,
        addGalleryItem,
        deleteGalleryItem,
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        faqs,
        addFaq,
        updateFaq,
        deleteFaq,
        patients,
        addPatient,
        updatePatient,
        labReports,
        addLabReport,
        updateLabReport,
        deleteLabReport,
        lookupLabReport,
        invoices,
        addInvoice,
        updateInvoiceStatus,
        messages,
        addMessage,
        markMessageRead,
        toggleMessageImportant,
        deleteMessage,
        staffUsers,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        activityLogs,
        logAction,
        toasts,
        showToast,
        removeToast,
        exportAllDataJSON,
        restoreFromJSON
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
};
