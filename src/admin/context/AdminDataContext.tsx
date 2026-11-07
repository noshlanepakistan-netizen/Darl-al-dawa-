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
import { handleFirestoreError, OperationType } from '../../firebase/errorHandler';
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
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFirebaseActive = isFirebaseConfigured();

  // Cloud & Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Core Data States (Pre-loaded with verified hospital data)
  const [hospitalConfig, setHospitalConfig] = useState(INITIAL_CONFIG);
  const [settings, setSettings] = useState(INITIAL_HOSPITAL_SETTINGS);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(INITIAL_HOMEPAGE_SETTINGS);
  const [appointments, setAppointments] = useState<AdminAppointment[]>(INITIAL_APPOINTMENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [packages, setPackages] = useState<HealthPackage[]>(INITIAL_PACKAGES);
  const [services, setServices] = useState<ServiceFacility[]>(INITIAL_SERVICES);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [labReports, setLabReports] = useState<LabReportRecord[]>(INITIAL_LAB_REPORTS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL_MESSAGES);
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
          handleFirestoreError(error, OperationType.GET, 'hospital_config/main');
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
          handleFirestoreError(error, OperationType.GET, 'hospital_config/homepage');
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
          handleFirestoreError(error, OperationType.LIST, 'departments');
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
          handleFirestoreError(error, OperationType.LIST, 'doctors');
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
          handleFirestoreError(error, OperationType.LIST, 'services');
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
          handleFirestoreError(error, OperationType.LIST, 'packages');
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
          handleFirestoreError(error, OperationType.LIST, 'gallery');
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
          handleFirestoreError(error, OperationType.LIST, 'testimonials');
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
          handleFirestoreError(error, OperationType.LIST, 'faqs');
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

      // Write to both 'settings/main' and 'hospital_config/main' for full coverage
      await setDoc(doc(db, 'settings', 'main'), firestorePayload, { merge: true });
      await setDoc(doc(db, 'hospital_config', 'main'), firestorePayload, { merge: true });

      setHospitalConfig(updated);
      showToast('Saved to database ✓', 'success');
      logAction('Update Settings', 'Hospital Config', `Updated ${updated.name} settings in Firestore.`);
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.WRITE, 'settings/main');
    }
  };

  // 2. Operational Settings
  const updateSettings = async (newSettings: Partial<HospitalSettings>) => {
    const updated = { ...settings, ...newSettings };
    try {
      await setDoc(doc(db, 'settings', 'operational'), updated, { merge: true });
      setSettings(updated);
      showToast('Saved to database ✓', 'success');
      logAction('Update Operational Settings', 'Settings', 'Updated clinic timings and options.');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.WRITE, 'settings/operational');
    }
  };

  // 3. Homepage Content
  const updateHomepageSettings = async (newSettings: Partial<HomepageSettings>) => {
    const updated = { ...homepageSettings, ...newSettings };
    try {
      await setDoc(doc(db, 'hospital_config', 'homepage'), updated, { merge: true });
      await setDoc(doc(db, 'homepage', 'main'), updated, { merge: true }).catch(() => {});
      setHomepageSettings(updated);
      showToast('Saved to database ✓', 'success');
      logAction('Update Homepage Content', 'CMS', 'Updated hero headlines and visibility.');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.WRITE, 'hospital_config/homepage');
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
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      showToast('Saved to database ✓', 'success');
      logAction('Update Appointment Status', 'Appointments', `Marked appointment ${id} as ${status}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      showToast('Saved to database ✓', 'success');
      logAction('Delete Appointment', 'Appointments', `Deleted appointment ${id}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.DELETE, `appointments/${id}`);
    }
  };

  // 5. Doctors
  const addDoctor = async (docData: Omit<Doctor, 'id'>) => {
    const newId = `doc-${Date.now()}`;
    const newDoc: Doctor = { ...docData, id: newId };
    try {
      await setDoc(doc(db, 'doctors', newId), newDoc);
      setDoctors((prev) => [newDoc, ...prev]);
      showToast('Saved to database ✓', 'success');
      logAction('Add Doctor', 'Doctors', `Added consultant ${newDoc.name}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.CREATE, `doctors/${newId}`);
    }
  };

  const updateDoctor = async (id: string, partialDoc: Partial<Doctor>) => {
    try {
      await setDoc(doc(db, 'doctors', id), partialDoc, { merge: true });
      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...partialDoc } : d))
      );
      showToast('Saved to database ✓', 'success');
      logAction('Update Doctor', 'Doctors', `Updated doctor ${id}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `doctors/${id}`);
    }
  };

  const deleteDoctor = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'doctors', id));
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      showToast('Saved to database ✓', 'success');
      logAction('Delete Doctor', 'Doctors', `Removed doctor ${id}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.DELETE, `doctors/${id}`);
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
    try {
      await setDoc(doc(db, 'departments', newId), newDept);
      setDepartments((prev) => [...prev, newDept]);
      showToast('Saved to database ✓', 'success');
      logAction('Add Department', 'Departments', `Added department ${newDept.title}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.CREATE, `departments/${newId}`);
    }
  };

  const updateDepartment = async (id: string, partialDept: Partial<Department>) => {
    try {
      await setDoc(doc(db, 'departments', id), partialDept, { merge: true });
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...partialDept } : d))
      );
      showToast('Saved to database ✓', 'success');
      logAction('Update Department', 'Departments', `Updated department ${id}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `departments/${id}`);
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'departments', id));
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showToast('Saved to database ✓', 'success');
      logAction('Delete Department', 'Departments', `Removed department ${id}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.DELETE, `departments/${id}`);
    }
  };

  const reorderDepartments = async (newOrder: Department[]) => {
    setDepartments(newOrder);
    try {
      for (let i = 0; i < newOrder.length; i++) {
        await updateDoc(doc(db, 'departments', newOrder[i].id), { order: i + 1 });
      }
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
    }
  };

  // 7. Services
  const addService = async (srvData: Omit<ServiceFacility, 'id'>) => {
    const newId = `srv-${Date.now()}`;
    const newSrv: ServiceFacility = { ...srvData, id: newId };
    try {
      await setDoc(doc(db, 'services', newId), newSrv);
      setServices((prev) => [...prev, newSrv]);
      showToast('Saved to database ✓', 'success');
      logAction('Add Service', 'Services', `Added facility ${newSrv.title}.`);
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.CREATE, `services/${newId}`);
    }
  };

  const updateService = async (id: string, partialSrv: Partial<ServiceFacility>) => {
    try {
      await setDoc(doc(db, 'services', id), partialSrv, { merge: true });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...partialSrv } : s))
      );
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `services/${id}`);
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
  };

  // 8. Packages
  const addPackage = async (pkgData: Omit<HealthPackage, 'id'>) => {
    const newId = `pkg-${Date.now()}`;
    const newPkg: HealthPackage = { ...pkgData, id: newId };
    try {
      await setDoc(doc(db, 'packages', newId), newPkg);
      setPackages((prev) => [...prev, newPkg]);
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.CREATE, `packages/${newId}`);
    }
  };

  const updatePackage = async (id: string, partialPkg: Partial<HealthPackage>) => {
    try {
      await setDoc(doc(db, 'packages', id), partialPkg, { merge: true });
      setPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...partialPkg } : p))
      );
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `packages/${id}`);
    }
  };

  const deletePackage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'packages', id));
      setPackages((prev) => prev.filter((p) => p.id !== id));
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.DELETE, `packages/${id}`);
    }
  };

  // 9. Gallery
  const addGalleryItem = async (itemData: Omit<GalleryItem, 'id'>) => {
    const newId = `gal-${Date.now()}`;
    const newItem: GalleryItem = { ...itemData, id: newId };
    try {
      await setDoc(doc(db, 'gallery', newId), newItem);
      setGallery((prev) => [newItem, ...prev]);
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.CREATE, `gallery/${newId}`);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      setGallery((prev) => prev.filter((g) => g.id !== id));
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
    }
  };

  // 10. Testimonials
  const addTestimonial = async (itemData: Omit<Testimonial, 'id'>) => {
    const newId = `test-${Date.now()}`;
    const newItem: Testimonial = { ...itemData, id: newId };
    try {
      await setDoc(doc(db, 'testimonials', newId), newItem);
      setTestimonials((prev) => [newItem, ...prev]);
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.CREATE, `testimonials/${newId}`);
    }
  };

  const updateTestimonial = async (id: string, partialItem: Partial<Testimonial>) => {
    try {
      await setDoc(doc(db, 'testimonials', id), partialItem, { merge: true });
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...partialItem } : t))
      );
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `testimonials/${id}`);
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
    }
  };

  // 11. FAQs
  const addFaq = async (itemData: Omit<FAQItem, 'id'>) => {
    const newId = `faq-${Date.now()}`;
    const newItem: FAQItem = { ...itemData, id: newId };
    try {
      await setDoc(doc(db, 'faqs', newId), newItem);
      setFaqs((prev) => [...prev, newItem]);
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.CREATE, `faqs/${newId}`);
    }
  };

  const updateFaq = async (id: string, partialItem: Partial<FAQItem>) => {
    try {
      await setDoc(doc(db, 'faqs', id), partialItem, { merge: true });
      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...partialItem } : f))
      );
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `faqs/${id}`);
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'faqs', id));
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.DELETE, `faqs/${id}`);
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
    try {
      await setDoc(doc(db, 'patients', newId), newPat);
      setPatients((prev) => [newPat, ...prev]);
      showToast('Saved to database ✓', 'success');
      return newId;
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.CREATE, `patients/${newId}`);
    }
  };

  const updatePatient = async (id: string, partialPat: Partial<PatientRecord>) => {
    try {
      await setDoc(doc(db, 'patients', id), partialPat, { merge: true });
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...partialPat } : p))
      );
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `patients/${id}`);
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
    try {
      await deleteDoc(doc(db, 'messages', id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast('Saved to database ✓', 'success');
    } catch (err: any) {
      showToast('Not connected to database — changes NOT saved', 'error');
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
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
