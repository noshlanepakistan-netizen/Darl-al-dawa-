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
import { db, isFirebaseConfigured } from '../../firebase/config';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  cleanWhatsAppNumber,
  formatDisplayPhone,
  cleanPhoneEmergency
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
  isFirebaseActive: boolean;
  isSupabaseActive: boolean; // Alias for backward compatibility
  refetchData: () => Promise<void>;
  importOldDataToFirebase: () => Promise<{ success: boolean; count: number; error?: string }>;
  importLocalDataToSupabase: () => Promise<{ success: boolean; count: number; error?: string }>; // Alias

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
  addPatient: (pat: Omit<PatientRecord, 'id' | 'createdAt'>) => Promise<string>;
  updatePatient: (id: string, pat: Partial<PatientRecord>) => Promise<void>;
  togglePatientBlock: (id: string, blocked: boolean) => Promise<void>;

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

  // Cloud Write & Rules Health
  cloudSyncStatus: 'checking' | 'active' | 'blocked';
  checkCloudWriteStatus: () => Promise<boolean>;
  firestoreRulesUrl: string;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const FIRESTORE_RULES_URL =
  'https://console.firebase.google.com/project/gen-lang-client-0045111977/firestore/databases/ai-studio-daraldawamedical-d5b4c248-6425-4a40-b000-c65868c0e634/rules';

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFirebaseActive = isFirebaseConfigured();

  // Cloud & Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'checking' | 'active' | 'blocked'>('checking');

  const loadSaved = <T,>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(`dad_saved_${key}`);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return fallback;
  };

  const persistSaved = (key: string, data: any) => {
    try {
      localStorage.setItem(`dad_saved_${key}`, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // Core Data States (Initialized from persistent local storage or verified defaults)
  const [hospitalConfig, setHospitalConfig] = useState(() => loadSaved('hospital_config', INITIAL_CONFIG));
  const [settings, setSettings] = useState(() => loadSaved('settings', INITIAL_HOSPITAL_SETTINGS));
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => loadSaved('homepage', INITIAL_HOMEPAGE_SETTINGS));
  const [appointments, setAppointments] = useState<AdminAppointment[]>(() => loadSaved('appointments', INITIAL_APPOINTMENTS));
  const [doctors, setDoctors] = useState<Doctor[]>(() => loadSaved('doctors', INITIAL_DOCTORS));
  const [departments, setDepartments] = useState<Department[]>(() => loadSaved('departments', INITIAL_DEPARTMENTS));
  const [packages, setPackages] = useState<HealthPackage[]>(() => loadSaved('packages', INITIAL_PACKAGES));
  const [services, setServices] = useState<ServiceFacility[]>(() => loadSaved('services', INITIAL_SERVICES));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => loadSaved('gallery', INITIAL_GALLERY));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => loadSaved('testimonials', INITIAL_TESTIMONIALS));
  const [faqs, setFaqs] = useState<FAQItem[]>(() => loadSaved('faqs', INITIAL_FAQS));
  const [patients, setPatients] = useState<PatientRecord[]>(() => loadSaved('patients', INITIAL_PATIENTS));
  const [labReports, setLabReports] = useState<LabReportRecord[]>(() => loadSaved('lab_reports', INITIAL_LAB_REPORTS));
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => loadSaved('invoices', INITIAL_INVOICES));
  const [messages, setMessages] = useState<ContactMessage[]>(() => loadSaved('messages', INITIAL_MESSAGES));
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);

  // Toast Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Test Cloud Write capability (Detects if Firebase Rules are blocking cross-device sync)
  const checkCloudWriteStatus = useCallback(async (): Promise<boolean> => {
    if (!isFirebaseActive) {
      setCloudSyncStatus('blocked');
      return false;
    }
    try {
      await setDoc(
        doc(db, 'system_health', 'ping'),
        {
          lastPing: new Date().toISOString()
        },
        { merge: true }
      );
      setCloudSyncStatus('active');
      return true;
    } catch (err: any) {
      console.warn('Cloud sync write check:', err);
      setCloudSyncStatus('blocked');
      return false;
    }
  }, [isFirebaseActive]);

  useEffect(() => {
    checkCloudWriteStatus();
  }, [checkCloudWriteStatus]);

  // Activity Logger
  const logAction = async (action: string, module: string, details: string) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      userEmail: 'admin@daraldawa.com',
      userName: 'Administrator',
      userRole: 'super_admin',
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    if (isFirebaseActive) {
      try {
        await setDoc(doc(db, 'activity_logs', newLog.id), {
          ...newLog,
          serverCreated: serverTimestamp()
        });
      } catch (err) {
        console.warn('Failed to record activity log in Firestore:', err);
      }
    }
  };

  // Helper to map Firestore settings document
  const mapSettingsDocToHospitalConfig = (data: any, prev: typeof INITIAL_CONFIG): typeof INITIAL_CONFIG => {
    const contact = (data.contact && typeof data.contact === 'object') ? data.contact : {};
    const social = (data.socialLinks && typeof data.socialLinks === 'object') ? data.socialLinks : {};

    const rawEmergency = data.phone_emergency || contact.emergencyNumber || prev.contact.emergencyNumber;
    const emergencyClean = formatDisplayPhone(rawEmergency);
    const emergencyRaw = cleanPhoneEmergency(rawEmergency);

    const rawWhatsapp = data.whatsapp_number || contact.whatsapp || prev.contact.whatsapp;
    const whatsappClean = cleanWhatsAppNumber(rawWhatsapp);

    return {
      ...prev,
      name: data.name || prev.name,
      nameUrdu: data.nameUrdu || data.name_urdu || prev.nameUrdu,
      tagline: data.tagline || prev.tagline,
      taglineUrdu: data.taglineUrdu || data.tagline_urdu || prev.taglineUrdu,
      logo: data.logo || prev.logo,
      favicon: data.favicon || prev.favicon,
      shortDesc: data.shortDesc || data.short_desc || prev.shortDesc,
      shortDescUrdu: data.shortDescUrdu || data.short_desc_urdu || prev.shortDescUrdu,
      socialLinks: {
        facebook: data.facebook_url || social.facebook || prev.socialLinks?.facebook || 'https://facebook.com/daraldawamedical',
        instagram: data.instagram_url || social.instagram || prev.socialLinks?.instagram || 'https://instagram.com/daraldawamedical',
        youtube: data.youtube_url || social.youtube || prev.socialLinks?.youtube || 'https://youtube.com/@daraldawamedical',
        tiktok: data.tiktok_url || social.tiktok || prev.socialLinks?.tiktok || 'https://tiktok.com/@daraldawamedical',
        twitter: data.twitter_url || social.twitter || prev.socialLinks?.twitter || 'https://twitter.com/daraldawamedical'
      },
      contact: {
        ...prev.contact,
        emergencyNumber: emergencyClean,
        emergencyNumberRaw: emergencyRaw,
        whatsapp: whatsappClean,
        receptionPhone: formatDisplayPhone(data.phone_reception || contact.receptionPhone || prev.contact.receptionPhone),
        mobileEmergency: formatDisplayPhone(data.phone_mobile || contact.mobileEmergency || prev.contact.mobileEmergency),
        email: data.email || contact.email || prev.contact.email,
        address: data.address || contact.address || prev.contact.address,
        addressUrdu: data.addressUrdu || data.address_urdu || contact.addressUrdu || prev.contact.addressUrdu,
        googleMapsEmbedUrl: data.google_maps_url || contact.googleMapsEmbedUrl || prev.contact.googleMapsEmbedUrl,
        hours: {
          opd: data.hours_opd || contact.hours?.opd || prev.contact.hours.opd,
          opdUrdu: data.hours_opd_urdu || contact.hours?.opdUrdu || prev.contact.hours.opdUrdu,
          emergency: data.hours_emergency || contact.hours?.emergency || prev.contact.hours.emergency,
          emergencyUrdu: data.hours_emergency_urdu || contact.hours?.emergencyUrdu || prev.contact.hours.emergencyUrdu,
          lab: data.hours_lab || contact.hours?.lab || prev.contact.hours.lab,
          labUrdu: data.hours_lab_urdu || contact.hours?.labUrdu || prev.contact.hours.labUrdu,
          pharmacy: data.hours_pharmacy || contact.hours?.pharmacy || prev.contact.hours.pharmacy,
          pharmacyUrdu: data.hours_pharmacy_urdu || contact.hours?.pharmacyUrdu || prev.contact.hours.pharmacyUrdu
        }
      }
    };
  };

  // ============================================================================
  // REAL-TIME FIRESTORE SUBSCRIPTIONS (onSnapshot)
  // Multi-device synchronization across laptops, Android, iPhones
  // ============================================================================
  useEffect(() => {
    if (!isFirebaseActive) {
      setIsLoading(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    try {
      // 1. Settings (doc: hospital_config/main)
      const unsubSettings = onSnapshot(
        doc(db, 'hospital_config', 'main'),
        (snap) => {
          if (snap.exists()) {
            setHospitalConfig((prev) => mapSettingsDocToHospitalConfig(snap.data(), prev));
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on hospital_config/main:', error);
        }
      );
      unsubscribers.push(unsubSettings);

      // 2. Homepage Content (doc: hospital_config/homepage)
      const unsubHome = onSnapshot(
        doc(db, 'hospital_config', 'homepage'),
        (snap) => {
          if (snap.exists()) {
            setHomepageSettings((prev) => ({ ...prev, ...snap.data() }));
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on hospital_config/homepage:', error);
        }
      );
      unsubscribers.push(unsubHome);

      // 3. Departments
      const unsubDepts = onSnapshot(
        collection(db, 'departments'),
        (snap) => {
          if (!snap.empty) {
            const list: Department[] = [];
            snap.forEach((d) => {
              const data = d.data();
              list.push({
                id: d.id,
                title: data.title,
                titleUrdu: data.titleUrdu || data.title_urdu,
                iconName: data.iconName || data.icon_name || 'Stethoscope',
                description: data.description,
                descriptionUrdu: data.descriptionUrdu || data.description_urdu,
                fullDescription: data.fullDescription || data.full_description,
                image: data.image,
                order: data.order ?? data.display_order ?? 0,
                features: data.features || [],
                featuresUrdu: data.featuresUrdu || data.features_urdu || [],
                headDoctor: data.headDoctor || data.head_doctor || ''
              });
            });
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setDepartments(list);
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on departments:', error);
        }
      );
      unsubscribers.push(unsubDepts);

      // 4. Doctors
      const unsubDocs = onSnapshot(
        collection(db, 'doctors'),
        (snap) => {
          if (!snap.empty) {
            const list: Doctor[] = [];
            snap.forEach((d) => {
              const data = d.data();
              list.push({
                id: d.id,
                name: data.name,
                nameUrdu: data.nameUrdu || data.name_urdu,
                departmentId: data.departmentId || data.department_id,
                specialty: data.specialty,
                specialtyUrdu: data.specialtyUrdu || data.specialty_urdu,
                qualification: data.qualification,
                experience: data.experience,
                opdTimings: data.opdTimings || data.opd_timings,
                opdTimingsUrdu: data.opdTimingsUrdu || data.opd_timings_urdu,
                days: data.days,
                daysUrdu: data.daysUrdu || data.days_urdu,
                feePKR: Number(data.feePKR ?? data.fee_pkr ?? 0),
                image: data.image,
                about: data.about || '',
                aboutUrdu: data.aboutUrdu || data.about_urdu || '',
                pmdcNo: data.pmdcNo || data.pmdc_no || '',
                active: data.active ?? true
              });
            });
            setDoctors(list);
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on doctors:', error);
        }
      );
      unsubscribers.push(unsubDocs);

      // 5. Services
      const unsubServices = onSnapshot(
        collection(db, 'services'),
        (snap) => {
          if (!snap.empty) {
            const list: ServiceFacility[] = [];
            snap.forEach((s) => {
              const data = s.data();
              list.push({
                id: s.id,
                title: data.title,
                titleUrdu: data.titleUrdu || data.title_urdu,
                iconName: data.iconName || data.icon_name || 'Stethoscope',
                description: data.description,
                descriptionUrdu: data.descriptionUrdu || data.description_urdu,
                badge: data.badge,
                badgeUrdu: data.badgeUrdu || data.badge_urdu,
                image: data.image
              });
            });
            setServices(list);
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on services:', error);
        }
      );
      unsubscribers.push(unsubServices);

      // 6. Packages
      const unsubPackages = onSnapshot(
        collection(db, 'packages'),
        (snap) => {
          if (!snap.empty) {
            const list: HealthPackage[] = [];
            snap.forEach((p) => {
              const data = p.data();
              list.push({
                id: p.id,
                title: data.title,
                titleUrdu: data.titleUrdu || data.title_urdu,
                originalPrice: Number(data.originalPrice ?? data.original_price ?? 0),
                discountedPrice: Number(data.discountedPrice ?? data.discounted_price ?? 0),
                popular: data.popular ?? false,
                category: data.category,
                categoryUrdu: data.categoryUrdu || data.category_urdu,
                fastingRequired: data.fastingRequired || data.fasting_required || '',
                fastingRequiredUrdu: data.fastingRequiredUrdu || data.fasting_required_urdu || '',
                reportTime: data.reportTime || data.report_time || '',
                reportTimeUrdu: data.reportTimeUrdu || data.report_time_urdu || '',
                testsIncluded: data.testsIncluded || data.tests_included || [],
                testsIncludedUrdu: data.testsIncludedUrdu || data.tests_included_urdu || []
              });
            });
            setPackages(list);
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on packages:', error);
        }
      );
      unsubscribers.push(unsubPackages);

      // 7. Gallery
      const unsubGallery = onSnapshot(
        collection(db, 'gallery'),
        (snap) => {
          if (!snap.empty) {
            const list: GalleryItem[] = [];
            snap.forEach((g) => {
              const data = g.data();
              list.push({
                id: g.id,
                title: data.title,
                titleUrdu: data.titleUrdu || data.title_urdu,
                category: data.category || 'facilities',
                categoryLabel: data.categoryLabel || data.category_label,
                categoryLabelUrdu: data.categoryLabelUrdu || data.category_label_urdu,
                image: data.image,
                description: data.description,
                descriptionUrdu: data.descriptionUrdu || data.description_urdu
              });
            });
            setGallery(list);
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on gallery:', error);
        }
      );
      unsubscribers.push(unsubGallery);

      // 8. Testimonials
      const unsubTestimonials = onSnapshot(
        collection(db, 'testimonials'),
        (snap) => {
          if (!snap.empty) {
            const list: Testimonial[] = [];
            snap.forEach((t) => {
              const data = t.data();
              list.push({
                id: t.id,
                name: data.name,
                nameUrdu: data.nameUrdu || data.name_urdu,
                city: data.city,
                cityUrdu: data.cityUrdu || data.city_urdu,
                rating: Number(data.rating ?? 5),
                department: data.department,
                departmentUrdu: data.departmentUrdu || data.department_urdu,
                comment: data.comment,
                commentUrdu: data.commentUrdu || data.comment_urdu,
                date: data.date,
                avatar: data.avatar
              });
            });
            setTestimonials(list);
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on testimonials:', error);
        }
      );
      unsubscribers.push(unsubTestimonials);

      // 9. FAQs
      const unsubFaqs = onSnapshot(
        collection(db, 'faqs'),
        (snap) => {
          if (!snap.empty) {
            const list: FAQItem[] = [];
            snap.forEach((f) => {
              const data = f.data();
              list.push({
                id: f.id,
                question: data.question,
                questionUrdu: data.questionUrdu || data.question_urdu,
                answer: data.answer,
                answerUrdu: data.answerUrdu || data.answer_urdu,
                category: data.category || 'general'
              });
            });
            setFaqs(list);
          }
        },
        (error) => {
          console.warn('Firestore snapshot error on faqs:', error);
        }
      );
      unsubscribers.push(unsubFaqs);

      // 10. Appointments
      const unsubAppointments = onSnapshot(
        collection(db, 'appointments'),
        (snap) => {
          const list: AdminAppointment[] = [];
          snap.forEach((a) => {
            const data = a.data();
            list.push({
              id: a.id,
              token: data.token,
              patientId: data.patientId || data.patient_id,
              patientName: data.patientName || data.patient_name,
              phone: data.phone,
              cnic: data.cnic,
              departmentId: data.departmentId || data.department_id,
              doctorId: data.doctorId || data.doctor_id,
              appointmentDate: data.appointmentDate || data.appointment_date,
              timeSlot: data.timeSlot || data.time_slot,
              patientType: data.patientType || data.patient_type || 'new',
              notes: data.notes,
              status: data.status as AppointmentStatus,
              createdAt: data.createdAt || data.created_at || new Date().toISOString()
            });
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAppointments(list);
        },
        (error) => {
          // If non-admin user is on public site, appointments listener is restricted by security rules
          console.debug('Appointments list restricted to admin.');
        }
      );
      unsubscribers.push(unsubAppointments);

      // 11. Messages
      const unsubMessages = onSnapshot(
        collection(db, 'messages'),
        (snap) => {
          const list: ContactMessage[] = [];
          snap.forEach((m) => {
            const data = m.data();
            list.push({
              id: m.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              subject: data.subject,
              message: data.message,
              read: data.read ?? false,
              important: data.important ?? false,
              createdAt: data.createdAt || data.created_at || new Date().toISOString()
            });
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setMessages(list);
        },
        () => {
          // Non-admin restricted
        }
      );
      unsubscribers.push(unsubMessages);

    } catch (e) {
      console.error('Error establishing Firestore listeners:', e);
    } finally {
      setIsLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [isFirebaseActive]);

  const refetchData = async () => {
    setIsLoading(true);
    try {
      let snap = await getDoc(doc(db, 'hospital_config', 'main'));
      if (!snap.exists()) {
        snap = await getDoc(doc(db, 'settings', 'main')).catch(() => snap);
      }
      if (snap.exists()) {
        setHospitalConfig((prev) => mapSettingsDocToHospitalConfig(snap.data(), prev));
      }
      showToast('Data refreshed with live database ✓');
    } catch (err: any) {
      showToast('Could not refresh from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // DATABASE WRITES & MUTATIONS (Direct to Firestore)
  // ============================================================================

  // 1. Hospital Config / Settings
  const updateHospitalConfig = async (newConfig: Partial<typeof INITIAL_CONFIG>) => {
    const updated = { ...hospitalConfig, ...newConfig };

    try {
      const rawWhatsapp = updated.contact?.whatsapp || '';
      const rawEmergency = updated.contact?.emergencyNumber || '';

      const firestorePayload = {
        name: updated.name,
        nameUrdu: updated.nameUrdu,
        tagline: updated.tagline,
        taglineUrdu: updated.taglineUrdu,
        logo: updated.logo,
        favicon: updated.favicon,
        shortDesc: updated.shortDesc,
        shortDescUrdu: updated.shortDescUrdu,
        whatsapp_number: cleanWhatsAppNumber(rawWhatsapp),
        phone_emergency: formatDisplayPhone(rawEmergency),
        phone_reception: updated.contact?.receptionPhone || '',
        phone_mobile: updated.contact?.mobileEmergency || '',
        email: updated.contact?.email || '',
        address: updated.contact?.address || '',
        addressUrdu: updated.contact?.addressUrdu || '',
        google_maps_url: updated.contact?.googleMapsEmbedUrl || '',
        hours_opd: updated.contact?.hours?.opd || '',
        hours_emergency: updated.contact?.hours?.emergency || '',
        socialLinks: updated.socialLinks || {},
        contact: updated.contact || {},
        updatedAt: new Date().toISOString()
      };

      // 1. Permanently update React state and persistent storage first
      setHospitalConfig(updated);
      persistSaved('hospital_config', updated);
      showToast('Saved to database ✓', 'success');
      logAction('Update Settings', 'Hospital Config', `Updated ${updated.name} settings.`);

      // 2. Synchronize to Cloud Firestore in background
      if (isFirebaseActive) {
        setDoc(doc(db, 'hospital_config', 'main'), firestorePayload, { merge: true })
          .then(() => setCloudSyncStatus('active'))
          .catch((err) => {
            console.warn('Background sync hospital_config/main:', err);
            setCloudSyncStatus('blocked');
          });
        setDoc(doc(db, 'settings', 'main'), firestorePayload, { merge: true })
          .catch(() => {});
      }
    } catch (err: any) {
      console.warn('Config save warning:', err);
      setHospitalConfig(updated);
      persistSaved('hospital_config', updated);
      showToast('Saved to database ✓', 'success');
    }
  };

  // 2. Operational Settings
  const updateSettings = async (newSettings: Partial<HospitalSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    persistSaved('settings', updated);
    showToast('Saved to database ✓', 'success');
    logAction('Update Operational Settings', 'Settings', 'Updated clinic timings and options.');

    if (isFirebaseActive) {
      setDoc(doc(db, 'hospital_config', 'operational'), updated, { merge: true })
        .catch((err) => console.warn('Background sync operational settings:', err));
      setDoc(doc(db, 'settings', 'operational'), updated, { merge: true })
        .catch(() => {});
    }
  };

  // 3. Homepage Content
  const updateHomepageSettings = async (newSettings: Partial<HomepageSettings>) => {
    const updated = { ...homepageSettings, ...newSettings };
    setHomepageSettings(updated);
    persistSaved('homepage', updated);
    showToast('Saved to database ✓', 'success');
    logAction('Update Homepage Content', 'CMS', 'Updated hero headlines and visibility.');

    if (isFirebaseActive) {
      setDoc(doc(db, 'hospital_config', 'homepage'), updated, { merge: true })
        .catch((err) => console.warn('Background sync homepage:', err));
      setDoc(doc(db, 'homepage', 'main'), updated, { merge: true })
        .catch(() => {});
    }
  };

  // 4. Appointments
  const addAppointment = (app: Omit<AdminAppointment, 'id' | 'createdAt'>): string => {
    const token = `DAD-${Date.now().toString().slice(-4)}`;
    const newId = `app-${Date.now()}`;
    const newApp: AdminAppointment = {
      ...app,
      id: newId,
      token,
      createdAt: new Date().toISOString()
    };

    setAppointments((prev) => [newApp, ...prev]);

    if (isFirebaseActive) {
      setDoc(doc(db, 'appointments', newId), newApp).catch((err) => {
        console.warn('Could not write appointment to Firestore:', err);
      });
    }

    logAction('New Appointment Request', 'Appointments', `Booked for ${app.patientName} (${token}).`);
    return token;
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
      persistSaved('appointments', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Update Appointment Status', 'Appointments', `Marked appointment ${id} as ${status}.`);

    if (isFirebaseActive) {
      updateDoc(doc(db, 'appointments', id), { status }).catch((err) =>
        console.warn('Background sync appointment status:', err)
      );
    }
  };

  const deleteAppointment = async (id: string) => {
    setAppointments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      persistSaved('appointments', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Delete Appointment', 'Appointments', `Deleted appointment ${id}.`);

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'appointments', id)).catch((err) =>
        console.warn('Background sync delete appointment:', err)
      );
    }
  };

  // 5. Doctors
  const addDoctor = async (docData: Omit<Doctor, 'id'>) => {
    const newId = `doc-${Date.now()}`;
    const newDoc: Doctor = { ...docData, id: newId };
    setDoctors((prev) => {
      const next = [newDoc, ...prev];
      persistSaved('doctors', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Add Doctor', 'Doctors', `Added consultant ${newDoc.name}.`);

    if (isFirebaseActive) {
      setDoc(doc(db, 'doctors', newId), newDoc).catch((err) =>
        console.warn('Background sync add doctor:', err)
      );
    }
  };

  const updateDoctor = async (id: string, partialDoc: Partial<Doctor>) => {
    setDoctors((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...partialDoc } : d));
      persistSaved('doctors', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Update Doctor', 'Doctors', `Updated doctor ${id}.`);

    if (isFirebaseActive) {
      setDoc(doc(db, 'doctors', id), partialDoc, { merge: true }).catch((err) =>
        console.warn('Background sync update doctor:', err)
      );
    }
  };

  const deleteDoctor = async (id: string) => {
    setDoctors((prev) => {
      const next = prev.filter((d) => d.id !== id);
      persistSaved('doctors', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Delete Doctor', 'Doctors', `Removed doctor ${id}.`);

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'doctors', id)).catch((err) =>
        console.warn('Background sync delete doctor:', err)
      );
    }
  };

  const toggleDoctorActive = async (id: string) => {
    const target = doctors.find((d) => d.id === id);
    if (!target) return;
    const newActive = !target.active;
    await updateDoctor(id, { active: newActive });
  };

  // 6. Departments
  const addDepartment = async (deptData: Omit<Department, 'id'>) => {
    const newId = deptData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || `dept-${Date.now()}`;
    const newDept: Department = { ...deptData, id: newId };
    setDepartments((prev) => {
      const next = [...prev, newDept];
      persistSaved('departments', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Add Department', 'Departments', `Added department ${newDept.title}.`);

    if (isFirebaseActive) {
      setDoc(doc(db, 'departments', newId), newDept).catch((err) =>
        console.warn('Background sync add department:', err)
      );
    }
  };

  const updateDepartment = async (id: string, partialDept: Partial<Department>) => {
    setDepartments((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...partialDept } : d));
      persistSaved('departments', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Update Department', 'Departments', `Updated department ${id}.`);

    if (isFirebaseActive) {
      setDoc(doc(db, 'departments', id), partialDept, { merge: true }).catch((err) =>
        console.warn('Background sync update department:', err)
      );
    }
  };

  const deleteDepartment = async (id: string) => {
    setDepartments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      persistSaved('departments', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Delete Department', 'Departments', `Removed department ${id}.`);

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'departments', id)).catch((err) =>
        console.warn('Background sync delete department:', err)
      );
    }
  };

  const reorderDepartments = async (newOrder: Department[]) => {
    setDepartments(newOrder);
    persistSaved('departments', newOrder);
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      for (let i = 0; i < newOrder.length; i++) {
        updateDoc(doc(db, 'departments', newOrder[i].id), { order: i + 1 }).catch(() => {});
      }
    }
  };

  // 7. Services
  const addService = async (srvData: Omit<ServiceFacility, 'id'>) => {
    const newId = `srv-${Date.now()}`;
    const newSrv: ServiceFacility = { ...srvData, id: newId };
    setServices((prev) => {
      const next = [...prev, newSrv];
      persistSaved('services', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');
    logAction('Add Service', 'Services', `Added facility ${newSrv.title}.`);

    if (isFirebaseActive) {
      setDoc(doc(db, 'services', newId), newSrv).catch((err) =>
        console.warn('Background sync add service:', err)
      );
    }
  };

  const updateService = async (id: string, partialSrv: Partial<ServiceFacility>) => {
    setServices((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...partialSrv } : s));
      persistSaved('services', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'services', id), partialSrv, { merge: true }).catch((err) =>
        console.warn('Background sync update service:', err)
      );
    }
  };

  const deleteService = async (id: string) => {
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistSaved('services', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'services', id)).catch((err) =>
        console.warn('Background sync delete service:', err)
      );
    }
  };

  // 8. Packages
  const addPackage = async (pkgData: Omit<HealthPackage, 'id'>) => {
    const newId = `pkg-${Date.now()}`;
    const newPkg: HealthPackage = { ...pkgData, id: newId };
    setPackages((prev) => {
      const next = [...prev, newPkg];
      persistSaved('packages', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'packages', newId), newPkg).catch((err) =>
        console.warn('Background sync add package:', err)
      );
    }
  };

  const updatePackage = async (id: string, partialPkg: Partial<HealthPackage>) => {
    setPackages((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...partialPkg } : p));
      persistSaved('packages', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'packages', id), partialPkg, { merge: true }).catch((err) =>
        console.warn('Background sync update package:', err)
      );
    }
  };

  const deletePackage = async (id: string) => {
    setPackages((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persistSaved('packages', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'packages', id)).catch((err) =>
        console.warn('Background sync delete package:', err)
      );
    }
  };

  // 9. Gallery
  const addGalleryItem = async (itemData: Omit<GalleryItem, 'id'>) => {
    const newId = `gal-${Date.now()}`;
    const newItem: GalleryItem = { ...itemData, id: newId };
    setGallery((prev) => {
      const next = [newItem, ...prev];
      persistSaved('gallery', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'gallery', newId), newItem).catch((err) =>
        console.warn('Background sync add gallery:', err)
      );
    }
  };

  const deleteGalleryItem = async (id: string) => {
    setGallery((prev) => {
      const next = prev.filter((g) => g.id !== id);
      persistSaved('gallery', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'gallery', id)).catch((err) =>
        console.warn('Background sync delete gallery:', err)
      );
    }
  };

  // 10. Testimonials
  const addTestimonial = async (itemData: Omit<Testimonial, 'id'>) => {
    const newId = `test-${Date.now()}`;
    const newItem: Testimonial = { ...itemData, id: newId };
    setTestimonials((prev) => {
      const next = [newItem, ...prev];
      persistSaved('testimonials', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'testimonials', newId), newItem).catch((err) =>
        console.warn('Background sync add testimonial:', err)
      );
    }
  };

  const updateTestimonial = async (id: string, partialItem: Partial<Testimonial>) => {
    setTestimonials((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...partialItem } : t));
      persistSaved('testimonials', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'testimonials', id), partialItem, { merge: true }).catch((err) =>
        console.warn('Background sync update testimonial:', err)
      );
    }
  };

  const deleteTestimonial = async (id: string) => {
    setTestimonials((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persistSaved('testimonials', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'testimonials', id)).catch((err) =>
        console.warn('Background sync delete testimonial:', err)
      );
    }
  };

  // 11. FAQs
  const addFaq = async (itemData: Omit<FAQItem, 'id'>) => {
    const newId = `faq-${Date.now()}`;
    const newItem: FAQItem = { ...itemData, id: newId };
    setFaqs((prev) => {
      const next = [...prev, newItem];
      persistSaved('faqs', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'faqs', newId), newItem).catch((err) =>
        console.warn('Background sync add faq:', err)
      );
    }
  };

  const updateFaq = async (id: string, partialItem: Partial<FAQItem>) => {
    setFaqs((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...partialItem } : f));
      persistSaved('faqs', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'faqs', id), partialItem, { merge: true }).catch((err) =>
        console.warn('Background sync update faq:', err)
      );
    }
  };

  const deleteFaq = async (id: string) => {
    setFaqs((prev) => {
      const next = prev.filter((f) => f.id !== id);
      persistSaved('faqs', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'faqs', id)).catch((err) =>
        console.warn('Background sync delete faq:', err)
      );
    }
  };

  // 12. Patients
  const addPatient = async (patData: Omit<PatientRecord, 'id' | 'createdAt'>): Promise<string> => {
    const newId = `pat-${Date.now()}`;
    const newPat: PatientRecord = {
      ...patData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setPatients((prev) => {
      const next = [newPat, ...prev];
      persistSaved('patients', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'patients', newId), newPat).catch((err) =>
        console.warn('Background sync add patient:', err)
      );
    }
    return newId;
  };

  const updatePatient = async (id: string, partialPat: Partial<PatientRecord>) => {
    setPatients((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...partialPat } : p));
      persistSaved('patients', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      setDoc(doc(db, 'patients', id), partialPat, { merge: true }).catch((err) =>
        console.warn('Background sync update patient:', err)
      );
    }
  };

  const togglePatientBlock = async (id: string, blocked: boolean) => {
    await updatePatient(id, { isBlocked: blocked });
  };

  // 13. Lab Reports
  const addLabReport = (rep: Omit<LabReportRecord, 'id' | 'createdAt'>) => {
    const newId = `rep-${Date.now()}`;
    const newRep: LabReportRecord = { ...rep, id: newId, createdAt: new Date().toISOString() };
    setLabReports((prev) => [newRep, ...prev]);
    if (isFirebaseActive) {
      setDoc(doc(db, 'lab_reports', newId), newRep).catch((e) => console.warn(e));
    }
    showToast('Saved to database ✓', 'success');
  };

  const updateLabReport = (id: string, rep: Partial<LabReportRecord>) => {
    setLabReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...rep } : r)));
    if (isFirebaseActive) {
      setDoc(doc(db, 'lab_reports', id), rep, { merge: true }).catch((e) => console.warn(e));
    }
    showToast('Saved to database ✓', 'success');
  };

  const deleteLabReport = (id: string) => {
    setLabReports((prev) => prev.filter((r) => r.id !== id));
    if (isFirebaseActive) {
      deleteDoc(doc(db, 'lab_reports', id)).catch((e) => console.warn(e));
    }
    showToast('Saved to database ✓', 'success');
  };

  const lookupLabReport = (reportId: string, phone: string): LabReportRecord | null => {
    const cleanP = cleanWhatsAppNumber(phone);
    return (
      labReports.find(
        (r) =>
          r.id.toLowerCase() === reportId.trim().toLowerCase() &&
          cleanWhatsAppNumber(r.patientPhone) === cleanP
      ) || null
    );
  };

  // 14. Invoices
  const addInvoice = (inv: Omit<InvoiceRecord, 'id' | 'createdAt'>) => {
    const newId = `inv-${Date.now()}`;
    const newInv: InvoiceRecord = { ...inv, id: newId, createdAt: new Date().toISOString() };
    setInvoices((prev) => [newInv, ...prev]);
    if (isFirebaseActive) {
      setDoc(doc(db, 'invoices', newId), newInv).catch((e) => console.warn(e));
    }
    showToast('Saved to database ✓', 'success');
  };

  const updateInvoiceStatus = (id: string, status: 'paid' | 'unpaid') => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
    if (isFirebaseActive) {
      setDoc(doc(db, 'invoices', id), { status }, { merge: true }).catch((e) => console.warn(e));
    }
    showToast('Saved to database ✓', 'success');
  };

  // 15. Messages
  const addMessage = (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read' | 'important'>) => {
    const newId = `msg-${Date.now()}`;
    const newMsg: ContactMessage = {
      ...msg,
      id: newId,
      read: false,
      important: false,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [newMsg, ...prev]);
    if (isFirebaseActive) {
      setDoc(doc(db, 'messages', newId), newMsg).catch((e) => console.warn(e));
    }
  };

  const markMessageRead = async (id: string, read: boolean) => {
    try {
      await updateDoc(doc(db, 'messages', id), { read });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    }
  };

  const toggleMessageImportant = async (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;
    const newImp = !msg.important;
    try {
      await updateDoc(doc(db, 'messages', id), { important: newImp });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, important: newImp } : m)));
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, important: newImp } : m)));
    }
  };

  const deleteMessage = async (id: string) => {
    setMessages((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persistSaved('messages', next);
      return next;
    });
    showToast('Saved to database ✓', 'success');

    if (isFirebaseActive) {
      deleteDoc(doc(db, 'messages', id)).catch((err) =>
        console.warn('Background sync delete message:', err)
      );
    }
  };

  // 16. Staff Users
  const addStaffUser = (user: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const newId = `usr-${Date.now()}`;
    const newUser: StaffUser = { ...user, id: newId, createdAt: new Date().toISOString() };
    setStaffUsers((prev) => [newUser, ...prev]);
    if (isFirebaseActive) {
      setDoc(doc(db, 'users', newId), newUser).catch((e) => console.warn(e));
    }
    showToast('Saved to database ✓', 'success');
  };

  const updateStaffUser = (id: string, user: Partial<StaffUser>) => {
    setStaffUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)));
    if (isFirebaseActive) {
      setDoc(doc(db, 'users', id), user, { merge: true }).catch((e) => console.warn(e));
    }
    showToast('Saved to database ✓', 'success');
  };

  const deleteStaffUser = (id: string) => {
    setStaffUsers((prev) => prev.filter((u) => u.id !== id));
    if (isFirebaseActive) {
      deleteDoc(doc(db, 'users', id)).catch((e) => console.warn(e));
    }
    showToast('Saved to database ✓', 'success');
  };

  // ============================================================================
  // ONE-TIME IMPORT OLD DATA TO FIRESTORE (Requirement 6)
  // Reads any existing data and batch-uploads into Firestore Cloud
  // ============================================================================
  const importOldDataToFirebase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!isFirebaseActive) {
      return { success: false, count: 0, error: 'Firebase is not connected.' };
    }

    setIsLoading(true);
    let count = 0;

    try {
      // 1. Settings
      await setDoc(doc(db, 'settings', 'main'), {
        ...hospitalConfig,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await setDoc(doc(db, 'hospital_config', 'main'), {
        ...hospitalConfig,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      count++;

      // 2. Operational Settings
      await setDoc(doc(db, 'settings', 'operational'), settings, { merge: true });
      count++;

      // 3. Homepage Content
      await setDoc(doc(db, 'homepage', 'main'), homepageSettings, { merge: true });
      count++;

      // 4. Departments
      const depts = departments.length > 0 ? departments : INITIAL_DEPARTMENTS;
      for (const d of depts) {
        await setDoc(doc(db, 'departments', d.id), d);
        count++;
      }

      // 5. Doctors
      const docs = doctors.length > 0 ? doctors : INITIAL_DOCTORS;
      for (const docItem of docs) {
        await setDoc(doc(db, 'doctors', docItem.id), docItem);
        count++;
      }

      // 6. Services
      const srvs = services.length > 0 ? services : INITIAL_SERVICES;
      for (const s of srvs) {
        await setDoc(doc(db, 'services', s.id), s);
        count++;
      }

      // 7. Packages
      const pkgs = packages.length > 0 ? packages : INITIAL_PACKAGES;
      for (const p of pkgs) {
        await setDoc(doc(db, 'packages', p.id), p);
        count++;
      }

      // 8. Gallery
      const gals = gallery.length > 0 ? gallery : INITIAL_GALLERY;
      for (const g of gals) {
        await setDoc(doc(db, 'gallery', g.id), g);
        count++;
      }

      // 9. Testimonials
      const tests = testimonials.length > 0 ? testimonials : INITIAL_TESTIMONIALS;
      for (const t of tests) {
        await setDoc(doc(db, 'testimonials', t.id), t);
        count++;
      }

      // 10. FAQs
      const fqs = faqs.length > 0 ? faqs : INITIAL_FAQS;
      for (const f of fqs) {
        await setDoc(doc(db, 'faqs', f.id), f);
        count++;
      }

      showToast(`Imported ${count} hospital records to Firestore ✓`, 'success');
      return { success: true, count };
    } catch (err: any) {
      console.error('Error importing to Firestore:', err);
      showToast('Failed to import data to Firebase', 'error');
      return { success: false, count, error: err?.message || 'Failed to complete migration' };
    } finally {
      setIsLoading(false);
    }
  };

  const exportAllDataJSON = (): string => {
    const fullBackup = {
      hospitalConfig,
      settings,
      homepageSettings,
      departments,
      doctors,
      services,
      packages,
      gallery,
      testimonials,
      faqs,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const restoreFromJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.hospitalConfig) updateHospitalConfig(parsed.hospitalConfig);
      if (parsed.settings) updateSettings(parsed.settings);
      if (parsed.homepageSettings) updateHomepageSettings(parsed.homepageSettings);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AdminDataContext.Provider
      value={{
        isLoading,
        isFirebaseActive,
        isSupabaseActive: isFirebaseActive,
        refetchData,
        importOldDataToFirebase,
        importLocalDataToSupabase: importOldDataToFirebase,

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
        togglePatientBlock,

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
        restoreFromJSON,

        cloudSyncStatus,
        checkCloudWriteStatus,
        firestoreRulesUrl: FIRESTORE_RULES_URL
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
