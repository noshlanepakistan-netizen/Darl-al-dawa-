export type StaffRole = 'super_admin' | 'receptionist' | 'doctor' | 'lab_staff';

export interface StaffUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: StaffRole;
  department?: string;
  avatar?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface AdminAppointment {
  id: string;
  token: string;
  patientName: string;
  phone: string;
  cnic?: string;
  departmentId: string;
  doctorId?: string;
  appointmentDate: string;
  timeSlot: string;
  patientType: 'new' | 'followup';
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  cnic?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  bloodGroup?: string;
  allergies?: string;
  visitHistory?: {
    date: string;
    doctorName: string;
    department: string;
    diagnosis?: string;
  }[];
  documents?: {
    id: string;
    title: string;
    type: string;
    date: string;
    url: string;
  }[];
  createdAt: string;
}

export interface LabReportRecord {
  id: string;
  reportId: string; // e.g. DAD-LAB-1042
  patientName: string;
  patientPhone: string;
  testName: string;
  department: string;
  referringDoctor?: string;
  reportDate: string;
  status: 'ready' | 'pending' | 'processing';
  pdfUrl?: string;
  remarks?: string;
  resultSummary?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPricePKR: number;
  amountPKR: number;
}

export type PaymentMethod = 'Cash' | 'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'Card';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0891
  patientName: string;
  patientPhone: string;
  patientCnic?: string;
  items: InvoiceItem[];
  subtotalPKR: number;
  discountPKR: number;
  totalPKR: number;
  paymentMethod: PaymentMethod;
  status: 'paid' | 'unpaid';
  date: string;
  notes?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  important: boolean;
  replied?: boolean;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  userEmail: string;
  userName: string;
  userRole: StaffRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface HospitalSettings {
  slotDurationMinutes: number;
  workingDays: string[];
  opdOpenTime: string;
  opdCloseTime: string;
  emergencyActive: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappConfirmation: boolean;
  currency: string;
}

export interface HomepageSettings {
  heroHeading: string;
  heroSubheading: string;
  heroButtonText: string;
  heroSliderImages: string[];
  aboutBadge: string;
  aboutHeading: string;
  aboutSubheading: string;
  aboutMission: string;
  aboutVision: string;
  aboutImage: string;
  sectionsVisibility: {
    hero: boolean;
    appointment: boolean;
    departments: boolean;
    doctors: boolean;
    services: boolean;
    packages: boolean;
    about: boolean;
    testimonials: boolean;
    gallery: boolean;
    blog: boolean;
    faq: boolean;
    contact: boolean;
  };
}


