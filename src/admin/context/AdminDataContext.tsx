import React, { createContext, useContext, useState } from 'react';
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
import { db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

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
  // Hospital Config
  hospitalConfig: typeof INITIAL_CONFIG;
  updateHospitalConfig: (newConfig: Partial<typeof INITIAL_CONFIG>) => void;

  // Operational Settings
  settings: HospitalSettings;
  updateSettings: (newSettings: Partial<HospitalSettings>) => void;

  // Homepage Settings
  homepageSettings: HomepageSettings;
  updateHomepageSettings: (newSettings: Partial<HomepageSettings>) => void;

  // Appointments
  appointments: AdminAppointment[];
  addAppointment: (app: Omit<AdminAppointment, 'id' | 'createdAt'>) => string;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;

  // Doctors
  doctors: Doctor[];
  addDoctor: (doc: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, doc: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  toggleDoctorActive: (id: string) => void;

  // Departments
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  reorderDepartments: (newOrder: Department[]) => void;

  // Packages & Services
  packages: HealthPackage[];
  addPackage: (pkg: Omit<HealthPackage, 'id'>) => void;
  updatePackage: (id: string, pkg: Partial<HealthPackage>) => void;
  deletePackage: (id: string) => void;
  services: ServiceFacility[];
  addService: (srv: Omit<ServiceFacility, 'id'>) => void;
  updateService: (id: string, srv: Partial<ServiceFacility>) => void;
  deleteService: (id: string) => void;

  // Gallery
  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;

  // Testimonials
  testimonials: Testimonial[];
  addTestimonial: (item: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, item: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // FAQs
  faqs: FAQItem[];
  addFaq: (item: Omit<FAQItem, 'id'>) => void;
  updateFaq: (id: string, item: Partial<FAQItem>) => void;
  deleteFaq: (id: string) => void;

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
  markMessageRead: (id: string, read: boolean) => void;
  toggleMessageImportant: (id: string) => void;
  deleteMessage: (id: string) => void;

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
  // Helper to load from LocalStorage with fallback
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`dad_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveStored = <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(`dad_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  };

  // State slices
  const [hospitalConfig, setHospitalConfig] = useState(() => getStored('config', INITIAL_CONFIG));
  const [settings, setSettings] = useState(() => getStored('settings', INITIAL_HOSPITAL_SETTINGS));
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => getStored('homepage_settings', INITIAL_HOMEPAGE_SETTINGS));
  const [appointments, setAppointments] = useState(() => getStored('appointments', INITIAL_APPOINTMENTS));
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const stored = getStored('doctors', INITIAL_DOCTORS);
    const existingIds = new Set(stored.map((d: Doctor) => d.id));
    const missing = INITIAL_DOCTORS.filter((d) => !existingIds.has(d.id));
    return missing.length > 0 ? [...stored, ...missing] : stored;
  });
  const [departments, setDepartments] = useState(() => getStored('departments', INITIAL_DEPARTMENTS));
  const [packages, setPackages] = useState(() => getStored('packages', INITIAL_PACKAGES));
  const [services, setServices] = useState<ServiceFacility[]>(() => getStored('services', INITIAL_SERVICES));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => getStored('gallery', INITIAL_GALLERY));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getStored('testimonials', INITIAL_TESTIMONIALS));
  const [faqs, setFaqs] = useState<FAQItem[]>(() => getStored('faqs', INITIAL_FAQS));
  const [patients, setPatients] = useState(() => getStored('patients', INITIAL_PATIENTS));
  const [labReports, setLabReports] = useState(() => getStored('lab_reports', INITIAL_LAB_REPORTS));
  const [invoices, setInvoices] = useState(() => getStored('invoices', INITIAL_INVOICES));
  const [messages, setMessages] = useState(() => getStored('messages', INITIAL_MESSAGES));
  const [staffUsers, setStaffUsers] = useState(() => getStored('staff_users', INITIAL_STAFF_USERS));
  const [activityLogs, setActivityLogs] = useState(() => getStored('activity_logs', INITIAL_ACTIVITY_LOGS));

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
  const logAction = (action: string, module: string, details: string) => {
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
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    saveStored('activity_logs', updated);
  };

  // Sync to Firestore if online
  const syncToFirestore = async (collectionName: string, docId: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, docId), data, { merge: true });
    } catch {
      // Offline or permission - localStorage handles immediate reliability
    }
  };

  // Hospital Config (General Settings)
  const updateHospitalConfig = (newConfig: Partial<typeof INITIAL_CONFIG>) => {
    const updated = { ...hospitalConfig, ...newConfig };
    setHospitalConfig(updated);
    saveStored('config', updated);
    syncToFirestore('hospital_config', 'main', updated);
    logAction('Updated General Settings', 'Settings', 'Hospital details, contact info, or branding updated.');
    showToast('General hospital settings saved successfully!');
  };

  // Settings
  const updateSettings = (newSettings: Partial<HospitalSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStored('settings', updated);
    syncToFirestore('hospital_config', 'settings', updated);
    logAction('Updated System Settings', 'Settings', 'Operational settings and parameters modified.');
    showToast('Settings saved successfully!');
  };

  // Homepage Settings
  const updateHomepageSettings = (newSettings: Partial<HomepageSettings>) => {
    const updated: HomepageSettings = {
      ...homepageSettings,
      ...newSettings,
      sectionsVisibility: {
        ...homepageSettings.sectionsVisibility,
        ...(newSettings.sectionsVisibility || {})
      }
    };
    setHomepageSettings(updated);
    saveStored('homepage_settings', updated);
    syncToFirestore('hospital_config', 'homepage', updated);
    logAction('Updated Homepage Settings', 'Settings', 'Hero, About, and section visibility updated.');
    showToast('Homepage settings saved successfully!');
  };

  // Appointments
  const addAppointment = (app: Omit<AdminAppointment, 'id' | 'createdAt'>): string => {
    const id = `app-${Date.now()}`;
    const newApp: AdminAppointment = {
      ...app,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [newApp, ...appointments];
    setAppointments(updated);
    saveStored('appointments', updated);
    syncToFirestore('appointments', id, newApp);
    logAction('New Appointment Created', 'Appointments', `Appointment ${newApp.token} booked for ${newApp.patientName}.`);
    showToast(`Appointment ${newApp.token} booked successfully!`);
    return id;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a));
    setAppointments(updated);
    saveStored('appointments', updated);
    const target = appointments.find((a) => a.id === id);
    if (target) {
      syncToFirestore('appointments', id, { ...target, status });
      logAction('Appointment Status Changed', 'Appointments', `Appointment ${target.token} marked as ${status.toUpperCase()}.`);
    }
    showToast(`Appointment status updated to ${status}.`);
  };

  const deleteAppointment = (id: string) => {
    const target = appointments.find((a) => a.id === id);
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    saveStored('appointments', updated);
    logAction('Appointment Deleted', 'Appointments', `Deleted appointment ${target?.token || id}.`);
    showToast('Appointment deleted.', 'info');
  };

  // Doctors
  const addDoctor = (docItem: Omit<Doctor, 'id'>) => {
    const id = `doc-${Date.now()}`;
    const newDoctor: Doctor = { ...docItem, id, active: docItem.active !== false };
    const updated = [...doctors, newDoctor];
    setDoctors(updated);
    saveStored('doctors', updated);
    syncToFirestore('doctors', id, newDoctor);
    logAction('Added New Doctor', 'Doctors', `Added consultant ${newDoctor.name} to ${newDoctor.departmentId}.`);
    showToast(`Doctor ${newDoctor.name} added!`);
  };

  const updateDoctor = (id: string, docData: Partial<Doctor>) => {
    const updated = doctors.map((d) => (d.id === id ? { ...d, ...docData } : d));
    setDoctors(updated);
    saveStored('doctors', updated);
    syncToFirestore('doctors', id, docData);
    logAction('Updated Doctor', 'Doctors', `Updated doctor record ID: ${id}.`);
    showToast('Doctor record updated!');
  };

  const deleteDoctor = (id: string) => {
    const updated = doctors.filter((d) => d.id !== id);
    setDoctors(updated);
    saveStored('doctors', updated);
    logAction('Removed Doctor', 'Doctors', `Doctor ${id} removed from faculty.`);
    showToast('Doctor removed.', 'info');
  };

  const toggleDoctorActive = (id: string) => {
    const updated = doctors.map((d) => (d.id === id ? { ...d, active: d.active === false ? true : false } : d));
    setDoctors(updated);
    saveStored('doctors', updated);
    const docItem = updated.find((d) => d.id === id);
    logAction('Doctor Status Changed', 'Doctors', `Doctor ${docItem?.name || id} is now ${docItem?.active ? 'Active' : 'Inactive'}.`);
    showToast(`Doctor ${docItem?.name || id} is now ${docItem?.active ? 'Active' : 'Inactive'}.`);
  };

  // Departments
  const addDepartment = (deptItem: Omit<Department, 'id'>) => {
    const id = `dept-${Date.now()}`;
    const newDept: Department = { ...deptItem, id };
    const updated = [...departments, newDept];
    setDepartments(updated);
    saveStored('departments', updated);
    syncToFirestore('departments', id, newDept);
    logAction('Added Department', 'Departments', `Added department ${newDept.title}.`);
    showToast(`Department ${newDept.title} added!`);
  };

  const updateDepartment = (id: string, deptData: Partial<Department>) => {
    const updated = departments.map((d) => (d.id === id ? { ...d, ...deptData } : d));
    setDepartments(updated);
    saveStored('departments', updated);
    syncToFirestore('departments', id, deptData);
    logAction('Updated Department', 'Departments', `Updated department ${id}.`);
    showToast('Department updated!');
  };

  const deleteDepartment = (id: string) => {
    const updated = departments.filter((d) => d.id !== id);
    setDepartments(updated);
    saveStored('departments', updated);
    logAction('Removed Department', 'Departments', `Removed department ${id}.`);
    showToast('Department removed.', 'info');
  };

  const reorderDepartments = (newOrder: Department[]) => {
    setDepartments(newOrder);
    saveStored('departments', newOrder);
    showToast('Departments order saved!');
  };

  // Services
  const addService = (srv: Omit<ServiceFacility, 'id'>) => {
    const id = `srv-${Date.now()}`;
    const newSrv: ServiceFacility = { ...srv, id };
    const updated = [...services, newSrv];
    setServices(updated);
    saveStored('services', updated);
    showToast('Service added successfully!');
  };

  const updateService = (id: string, srvData: Partial<ServiceFacility>) => {
    const updated = services.map((s) => (s.id === id ? { ...s, ...srvData } : s));
    setServices(updated);
    saveStored('services', updated);
    showToast('Service updated successfully!');
  };

  const deleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    saveStored('services', updated);
    showToast('Service removed.', 'info');
  };

  // Gallery
  const addGalleryItem = (item: Omit<GalleryItem, 'id'>) => {
    const id = `gal-${Date.now()}`;
    const newItem: GalleryItem = { ...item, id };
    const updated = [...gallery, newItem];
    setGallery(updated);
    saveStored('gallery', updated);
    showToast('Gallery image added!');
  };

  const deleteGalleryItem = (id: string) => {
    const updated = gallery.filter((g) => g.id !== id);
    setGallery(updated);
    saveStored('gallery', updated);
    showToast('Gallery image removed.', 'info');
  };

  // Testimonials
  const addTestimonial = (item: Omit<Testimonial, 'id'>) => {
    const id = `test-${Date.now()}`;
    const newItem: Testimonial = { ...item, id };
    const updated = [...testimonials, newItem];
    setTestimonials(updated);
    saveStored('testimonials', updated);
    showToast('Testimonial added!');
  };

  const updateTestimonial = (id: string, itemData: Partial<Testimonial>) => {
    const updated = testimonials.map((t) => (t.id === id ? { ...t, ...itemData } : t));
    setTestimonials(updated);
    saveStored('testimonials', updated);
    showToast('Testimonial updated!');
  };

  const deleteTestimonial = (id: string) => {
    const updated = testimonials.filter((t) => t.id !== id);
    setTestimonials(updated);
    saveStored('testimonials', updated);
    showToast('Testimonial deleted.', 'info');
  };

  // FAQs
  const addFaq = (item: Omit<FAQItem, 'id'>) => {
    const id = `faq-${Date.now()}`;
    const newItem: FAQItem = { ...item, id };
    const updated = [...faqs, newItem];
    setFaqs(updated);
    saveStored('faqs', updated);
    showToast('FAQ added!');
  };

  const updateFaq = (id: string, itemData: Partial<FAQItem>) => {
    const updated = faqs.map((f) => (f.id === id ? { ...f, ...itemData } : f));
    setFaqs(updated);
    saveStored('faqs', updated);
    showToast('FAQ updated!');
  };

  const deleteFaq = (id: string) => {
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    saveStored('faqs', updated);
    showToast('FAQ removed.', 'info');
  };

  // Packages
  const addPackage = (pkgItem: Omit<HealthPackage, 'id'>) => {
    const id = `pkg-${Date.now()}`;
    const newPkg: HealthPackage = { ...pkgItem, id };
    const updated = [...packages, newPkg];
    setPackages(updated);
    saveStored('packages', updated);
    syncToFirestore('packages', id, newPkg);
    logAction('Added Package', 'Packages', `Added lab package ${newPkg.title}.`);
    showToast('Package added successfully!');
  };

  const updatePackage = (id: string, pkgData: Partial<HealthPackage>) => {
    const updated = packages.map((p) => (p.id === id ? { ...p, ...pkgData } : p));
    setPackages(updated);
    saveStored('packages', updated);
    syncToFirestore('packages', id, pkgData);
    logAction('Updated Package', 'Packages', `Updated package ${id}.`);
    showToast('Package updated!');
  };

  const deletePackage = (id: string) => {
    const updated = packages.filter((p) => p.id !== id);
    setPackages(updated);
    saveStored('packages', updated);
    logAction('Removed Package', 'Packages', `Removed package ${id}.`);
    showToast('Package removed.', 'info');
  };

  // Patients
  const addPatient = (pat: Omit<PatientRecord, 'id' | 'createdAt'>): string => {
    const id = `pat-${Date.now()}`;
    const newPat: PatientRecord = { ...pat, id, createdAt: new Date().toISOString() };
    const updated = [newPat, ...patients];
    setPatients(updated);
    saveStored('patients', updated);
    syncToFirestore('patients', id, newPat);
    logAction('Registered Patient', 'Patients', `Registered patient ${newPat.name} (${newPat.phone}).`);
    showToast(`Patient ${newPat.name} registered!`);
    return id;
  };

  const updatePatient = (id: string, patData: Partial<PatientRecord>) => {
    const updated = patients.map((p) => (p.id === id ? { ...p, ...patData } : p));
    setPatients(updated);
    saveStored('patients', updated);
    syncToFirestore('patients', id, patData);
    logAction('Updated Patient Record', 'Patients', `Updated record for patient ${id}.`);
    showToast('Patient record updated!');
  };

  // Lab Reports
  const addLabReport = (rep: Omit<LabReportRecord, 'id' | 'createdAt'>) => {
    const id = `rep-${Date.now()}`;
    const newRep: LabReportRecord = { ...rep, id, createdAt: new Date().toISOString() };
    const updated = [newRep, ...labReports];
    setLabReports(updated);
    saveStored('lab_reports', updated);
    syncToFirestore('lab_reports', id, newRep);
    logAction('Published Lab Report', 'Lab Reports', `Published report ${newRep.reportId} for ${newRep.patientName}.`);
    showToast(`Lab Report ${newRep.reportId} published!`);
  };

  const updateLabReport = (id: string, repData: Partial<LabReportRecord>) => {
    const updated = labReports.map((r) => (r.id === id ? { ...r, ...repData } : r));
    setLabReports(updated);
    saveStored('lab_reports', updated);
    syncToFirestore('lab_reports', id, repData);
    logAction('Updated Lab Report', 'Lab Reports', `Updated report ${id}.`);
    showToast('Lab report updated!');
  };

  const deleteLabReport = (id: string) => {
    const updated = labReports.filter((r) => r.id !== id);
    setLabReports(updated);
    saveStored('lab_reports', updated);
    logAction('Deleted Lab Report', 'Lab Reports', `Deleted report ${id}.`);
    showToast('Lab report deleted.', 'info');
  };

  const lookupLabReport = (reportId: string, phone: string): LabReportRecord | null => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const cleanReportId = reportId.trim().toUpperCase();
    return (
      labReports.find(
        (r) =>
          r.reportId.toUpperCase() === cleanReportId &&
          r.patientPhone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-7))
      ) || null
    );
  };

  // Invoices
  const addInvoice = (inv: Omit<InvoiceRecord, 'id' | 'createdAt'>) => {
    const id = `inv-${Date.now()}`;
    const newInv: InvoiceRecord = { ...inv, id, createdAt: new Date().toISOString() };
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    saveStored('invoices', updated);
    syncToFirestore('invoices', id, newInv);
    logAction('Generated Invoice', 'Billing', `Invoice ${newInv.invoiceNumber} (Rs. ${newInv.totalPKR}) generated.`);
    showToast(`Invoice ${newInv.invoiceNumber} created!`);
  };

  const updateInvoiceStatus = (id: string, status: 'paid' | 'unpaid') => {
    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv));
    setInvoices(updated);
    saveStored('invoices', updated);
    syncToFirestore('invoices', id, { status });
    logAction('Invoice Status Changed', 'Billing', `Invoice ${id} marked as ${status.toUpperCase()}.`);
    showToast(`Invoice marked as ${status}.`);
  };

  // Messages
  const addMessage = (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read' | 'important'>) => {
    const id = `msg-${Date.now()}`;
    const newMsg: ContactMessage = {
      ...msg,
      id,
      read: false,
      important: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    saveStored('messages', updated);
    syncToFirestore('messages', id, newMsg);
    logAction('Inquiry Received', 'Messages', `Received message from ${newMsg.name}.`);
  };

  const markMessageRead = (id: string, read: boolean) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, read } : m));
    setMessages(updated);
    saveStored('messages', updated);
  };

  const toggleMessageImportant = (id: string) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, important: !m.important } : m));
    setMessages(updated);
    saveStored('messages', updated);
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    saveStored('messages', updated);
    showToast('Message deleted.', 'info');
  };

  // Staff Users
  const addStaffUser = (user: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const id = `user-${Date.now()}`;
    const newUser: StaffUser = { ...user, id, createdAt: new Date().toISOString() };
    const updated = [...staffUsers, newUser];
    setStaffUsers(updated);
    saveStored('staff_users', updated);
    syncToFirestore('users', id, newUser);
    logAction('Created Staff Account', 'Users', `Created ${user.role} account for ${user.email}.`);
    showToast(`Staff user ${user.name} created!`);
  };

  const updateStaffUser = (id: string, userData: Partial<StaffUser>) => {
    const updated = staffUsers.map((u) => (u.id === id ? { ...u, ...userData } : u));
    setStaffUsers(updated);
    saveStored('staff_users', updated);
    syncToFirestore('users', id, userData);
    logAction('Updated Staff User', 'Users', `Updated account ID ${id}.`);
    showToast('Staff user updated!');
  };

  const deleteStaffUser = (id: string) => {
    const updated = staffUsers.filter((u) => u.id !== id);
    setStaffUsers(updated);
    saveStored('staff_users', updated);
    logAction('Deleted Staff Account', 'Users', `Deleted user account ${id}.`);
    showToast('Staff user deleted.', 'info');
  };

  // Backup & Restore
  const exportAllDataJSON = (): string => {
    const fullBackup = {
      hospitalConfig,
      settings,
      homepageSettings,
      appointments,
      doctors,
      departments,
      packages,
      services,
      gallery,
      testimonials,
      faqs,
      patients,
      labReports,
      invoices,
      messages,
      staffUsers,
      activityLogs,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const restoreFromJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.hospitalConfig) setHospitalConfig(parsed.hospitalConfig);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.homepageSettings) setHomepageSettings(parsed.homepageSettings);
      if (parsed.appointments) setAppointments(parsed.appointments);
      if (parsed.doctors) setDoctors(parsed.doctors);
      if (parsed.departments) setDepartments(parsed.departments);
      if (parsed.packages) setPackages(parsed.packages);
      if (parsed.services) setServices(parsed.services);
      if (parsed.gallery) setGallery(parsed.gallery);
      if (parsed.testimonials) setTestimonials(parsed.testimonials);
      if (parsed.faqs) setFaqs(parsed.faqs);
      if (parsed.patients) setPatients(parsed.patients);
      if (parsed.labReports) setLabReports(parsed.labReports);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.messages) setMessages(parsed.messages);
      logAction('Restored Data from Backup', 'Settings', 'Database restored from imported JSON file.');
      showToast('Database successfully restored from JSON backup!');
      return true;
    } catch {
      showToast('Invalid backup JSON file.', 'error');
      return false;
    }
  };

  return (
    <AdminDataContext.Provider
      value={{
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
