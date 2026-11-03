import {
  StaffUser,
  AdminAppointment,
  PatientRecord,
  LabReportRecord,
  InvoiceRecord,
  ContactMessage,
  ActivityLogItem,
  HospitalSettings
} from '../types';

export const INITIAL_STAFF_USERS: StaffUser[] = [
  {
    id: 'user-admin',
    uid: 'super-admin-uid-1',
    email: 'admin@daraldawa.pk',
    name: 'Dr. Tariq Mahmood (Administrator)',
    role: 'super_admin',
    department: 'Hospital Administration',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    phone: '+92 300 1234567',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    lastLogin: '2026-11-02T22:30:00Z'
  },
  {
    id: 'user-recep',
    uid: 'reception-uid-2',
    email: 'reception@daraldawa.pk',
    name: 'Fatima Noor (Front Desk Lead)',
    role: 'receptionist',
    department: 'Outpatient Reception & OPD',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    phone: '+92 321 4455667',
    active: true,
    createdAt: '2026-02-15T09:00:00Z',
    lastLogin: '2026-11-02T21:15:00Z'
  },
  {
    id: 'user-doctor',
    uid: 'doctor-uid-3',
    email: 'dr.farhan@daraldawa.pk',
    name: 'Dr. Farhan Ali Cheema (Consultant)',
    role: 'doctor',
    department: 'Orthopedics & Spine',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
    phone: '+92 333 5566778',
    active: true,
    createdAt: '2026-02-20T11:00:00Z',
    lastLogin: '2026-11-02T19:40:00Z'
  },
  {
    id: 'user-lab',
    uid: 'lab-uid-4',
    email: 'lab@daraldawa.pk',
    name: 'M. Bilal Raza (Senior Technologist)',
    role: 'lab_staff',
    department: 'Pathology & Diagnostic Laboratory',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
    phone: '+92 345 8899001',
    active: true,
    createdAt: '2026-03-01T08:30:00Z',
    lastLogin: '2026-11-02T18:20:00Z'
  }
];

export const INITIAL_APPOINTMENTS: AdminAppointment[] = [
  {
    id: 'app-1',
    token: 'DAD-819201',
    patientName: 'Muhammad Aslam Sheikh',
    phone: '0300-4123890',
    cnic: '35202-1928374-1',
    departmentId: 'cardiology',
    doctorId: 'doc-tariq',
    appointmentDate: '2026-11-03',
    timeSlot: 'evening',
    patientType: 'new',
    notes: 'Severe chest heaviness after brisk walk, BP monitoring required.',
    status: 'confirmed',
    createdAt: '2026-11-02T14:20:00Z'
  },
  {
    id: 'app-2',
    token: 'DAD-739102',
    patientName: 'Mrs. Shazia Rasheed',
    phone: '0321-9876543',
    cnic: '35201-8273645-2',
    departmentId: 'gynecology',
    doctorId: 'doc-ayesha',
    appointmentDate: '2026-11-03',
    timeSlot: 'morning',
    patientType: 'followup',
    notes: '28-week routine antenatal fetal wellbeing ultrasound follow-up.',
    status: 'confirmed',
    createdAt: '2026-11-02T15:10:00Z'
  },
  {
    id: 'app-3',
    token: 'DAD-629104',
    patientName: 'Chaudhry Tariq Butt',
    phone: '0333-5511223',
    cnic: '34101-7261543-5',
    departmentId: 'orthopedics',
    doctorId: 'doc-farhan',
    appointmentDate: '2026-11-04',
    timeSlot: 'evening',
    patientType: 'new',
    notes: 'Right knee osteoarthritis stage 3, evaluating for joint replacement.',
    status: 'pending',
    createdAt: '2026-11-02T16:45:00Z'
  },
  {
    id: 'app-4',
    token: 'DAD-519203',
    patientName: 'Zainab Bibi',
    phone: '0301-8899221',
    cnic: '35202-6655443-4',
    departmentId: 'pediatrics',
    doctorId: 'doc-zainab',
    appointmentDate: '2026-11-03',
    timeSlot: 'morning',
    patientType: 'new',
    notes: 'High grade fever with persistent cough for 3 days.',
    status: 'pending',
    createdAt: '2026-11-02T17:30:00Z'
  },
  {
    id: 'app-5',
    token: 'DAD-410928',
    patientName: 'Dr. Arshad Khan',
    phone: '0345-4433221',
    cnic: '35201-9988776-3',
    departmentId: 'general-medicine',
    doctorId: 'doc-imran',
    appointmentDate: '2026-11-02',
    timeSlot: 'afternoon',
    patientType: 'followup',
    notes: 'HbA1c test review and adjustment of morning insulin dosage.',
    status: 'completed',
    createdAt: '2026-11-01T11:00:00Z'
  },
  {
    id: 'app-6',
    token: 'DAD-392817',
    patientName: 'Amina Farooq',
    phone: '0312-3344556',
    cnic: '35202-1122334-8',
    departmentId: 'dermatology',
    doctorId: 'doc-sadia',
    appointmentDate: '2026-11-02',
    timeSlot: 'evening',
    patientType: 'new',
    notes: 'Cystic acne flare-up on cheeks, requesting chemical peel.',
    status: 'no-show',
    createdAt: '2026-11-01T13:40:00Z'
  }
];

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat-1',
    name: 'Muhammad Aslam Sheikh',
    phone: '0300-4123890',
    cnic: '35202-1928374-1',
    age: 58,
    gender: 'Male',
    address: 'House 42, Block C, Model Town, Lahore',
    bloodGroup: 'B+',
    allergies: 'Penicillin allergy',
    visitHistory: [
      { date: '2026-10-12', doctorName: 'Dr. Tariq Mahmood', department: 'Cardiology', diagnosis: 'Angina pectoris, Mild hypertension' },
      { date: '2026-08-04', doctorName: 'Dr. Muhammad Imran', department: 'General Medicine', diagnosis: 'Seasonal bronchitis' }
    ],
    documents: [
      { id: 'doc-1', title: 'Resting ECG Report.pdf', type: 'PDF', date: '2026-10-12', url: '#' },
      { id: 'doc-2', title: 'Lipid Profile Report.pdf', type: 'PDF', date: '2026-10-12', url: '#' }
    ],
    createdAt: '2026-08-04T09:00:00Z'
  },
  {
    id: 'pat-2',
    name: 'Mrs. Shazia Rasheed',
    phone: '0321-9876543',
    cnic: '35201-8273645-2',
    age: 29,
    gender: 'Female',
    address: 'Sector J, Phase 5, DHA Lahore',
    bloodGroup: 'O+',
    allergies: 'None reported',
    visitHistory: [
      { date: '2026-10-05', doctorName: 'Dr. Ayesha Siddiqa', department: 'Gynecology & Obstetrics', diagnosis: '24-week antenatal checkup' },
      { date: '2026-08-18', doctorName: 'Dr. Ayesha Siddiqa', department: 'Gynecology & Obstetrics', diagnosis: 'First trimester anomaly scan' }
    ],
    createdAt: '2026-08-18T14:30:00Z'
  },
  {
    id: 'pat-3',
    name: 'Chaudhry Tariq Butt',
    phone: '0333-5511223',
    cnic: '34101-7261543-5',
    age: 64,
    gender: 'Male',
    address: 'Near Session Courts, Civil Lines, Gujranwala',
    bloodGroup: 'A+',
    allergies: 'Aspirin sensitive',
    visitHistory: [
      { date: '2026-09-22', doctorName: 'Dr. Farhan Ali Cheema', department: 'Orthopedics', diagnosis: 'Bilateral knee osteoarthritis' }
    ],
    createdAt: '2026-09-22T10:15:00Z'
  }
];

export const INITIAL_LAB_REPORTS: LabReportRecord[] = [
  {
    id: 'rep-1',
    reportId: 'DAD-LAB-8921',
    patientName: 'Muhammad Aslam Sheikh',
    patientPhone: '0300-4123890',
    testName: 'Complete Lipid Profile & Troponin-I',
    department: 'Pathology & Chemical Chemistry',
    referringDoctor: 'Dr. Tariq Mahmood',
    reportDate: '2026-11-02',
    status: 'ready',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    remarks: 'Cholesterol elevated at 235 mg/dL. Troponin-I within normal limits (<0.01 ng/mL).',
    resultSummary: 'Total Cholesterol: 235 mg/dL | Triglycerides: 180 mg/dL | HDL: 42 mg/dL | LDL: 157 mg/dL',
    createdAt: '2026-11-02T11:00:00Z'
  },
  {
    id: 'rep-2',
    reportId: 'DAD-LAB-8922',
    patientName: 'Dr. Arshad Khan',
    patientPhone: '0345-4433221',
    testName: 'HbA1c & Fasting Glucose',
    department: 'Clinical Biochemistry',
    referringDoctor: 'Dr. Muhammad Imran',
    reportDate: '2026-11-02',
    status: 'ready',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    remarks: 'HbA1c is 7.2%, reflecting moderate glycaemic control.',
    resultSummary: 'HbA1c: 7.2% | Fasting Plasma Glucose: 134 mg/dL',
    createdAt: '2026-11-02T12:30:00Z'
  },
  {
    id: 'rep-3',
    reportId: 'DAD-LAB-8923',
    patientName: 'Fatima Zahra',
    patientPhone: '0302-7711223',
    testName: 'Dengue NS1 Antigen & Platelet Count (CBC)',
    department: 'Hematology & Serology',
    referringDoctor: 'Emergency Department',
    reportDate: '2026-11-02',
    status: 'ready',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    remarks: 'Dengue NS1 Antigen: NEGATIVE. Platelet Count: 245,000 /uL (Normal).',
    resultSummary: 'Platelet count adequate. No evidence of active dengue viral infection.',
    createdAt: '2026-11-02T16:15:00Z'
  },
  {
    id: 'rep-4',
    reportId: 'DAD-LAB-8924',
    patientName: 'Zainab Bibi',
    patientPhone: '0301-8899221',
    testName: 'Urine Detailed Report (Urine R/E)',
    department: 'Clinical Microscopy',
    referringDoctor: 'Dr. Zainab Malik',
    reportDate: '2026-11-03',
    status: 'processing',
    remarks: 'Sample under automated microscopic review.',
    createdAt: '2026-11-02T18:00:00Z'
  }
];

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-1041',
    patientName: 'Muhammad Aslam Sheikh',
    patientPhone: '0300-4123890',
    patientCnic: '35202-1928374-1',
    items: [
      { id: 'itm-1', description: 'Consultant Cardiology OPD Consultation (Dr. Tariq Mahmood)', quantity: 1, unitPricePKR: 3000, amountPKR: 3000 },
      { id: 'itm-2', description: 'Digital 12-Lead Electrocardiogram (ECG)', quantity: 1, unitPricePKR: 1200, amountPKR: 1200 },
      { id: 'itm-3', description: 'Cardiac Enzyme Profile (Troponin-I + CK-MB)', quantity: 1, unitPricePKR: 3500, amountPKR: 3500 }
    ],
    subtotalPKR: 7700,
    discountPKR: 700,
    totalPKR: 7000,
    paymentMethod: 'JazzCash',
    status: 'paid',
    date: '2026-11-02',
    notes: 'Paid via JazzCash mobile transaction ID #89281726.',
    createdAt: '2026-11-02T12:00:00Z'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-1042',
    patientName: 'Dr. Arshad Khan',
    patientPhone: '0345-4433221',
    patientCnic: '35201-9988776-3',
    items: [
      { id: 'itm-4', description: 'Comprehensive Diabetes Screening Package', quantity: 1, unitPricePKR: 4800, amountPKR: 4800 },
      { id: 'itm-5', description: 'Senior Physician Consultation (Dr. Muhammad Imran)', quantity: 1, unitPricePKR: 2500, amountPKR: 2500 }
    ],
    subtotalPKR: 7300,
    discountPKR: 500,
    totalPKR: 6800,
    paymentMethod: 'Cash',
    status: 'paid',
    date: '2026-11-02',
    notes: 'Cash counter receipt #4491.',
    createdAt: '2026-11-02T14:15:00Z'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-1043',
    patientName: 'Chaudhry Tariq Butt',
    patientPhone: '0333-5511223',
    patientCnic: '34101-7261543-5',
    items: [
      { id: 'itm-6', description: 'Digital X-Ray Bilateral Knees (Weight Bearing AP/LAT)', quantity: 2, unitPricePKR: 1800, amountPKR: 3600 },
      { id: 'itm-7', description: 'Orthopedic Specialist Consultation (Dr. Farhan Ali Cheema)', quantity: 1, unitPricePKR: 2800, amountPKR: 2800 }
    ],
    subtotalPKR: 6400,
    discountPKR: 0,
    totalPKR: 6400,
    paymentMethod: 'Card',
    status: 'paid',
    date: '2026-11-02',
    notes: 'Visa POS debit terminal auth #99281.',
    createdAt: '2026-11-02T16:00:00Z'
  }
];

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Hamza Malik',
    email: 'hamza.m@gmail.com',
    phone: '0300-8812345',
    subject: 'Inquiry regarding Sehat Card Plus admission for gall bladder surgery',
    message: 'Hello, my mother requires laparoscopic cholecystectomy. Do you accept Punjab Sehat Card Plus for this surgery and what documents are required at admission counter?',
    read: false,
    important: true,
    replied: false,
    createdAt: '2026-11-02T20:10:00Z'
  },
  {
    id: 'msg-2',
    name: 'Syed Ali Bukhari',
    email: 'ali.bukhari@lahore.edu.pk',
    phone: '0321-7654321',
    subject: 'Home sample collection for elderly grandfather in Johar Town',
    message: 'We need blood tests for CBC and kidney function done at home for our 82-year-old grandfather in Johar Town tomorrow at 8:00 AM. Kindly confirm availability.',
    read: true,
    important: true,
    replied: true,
    createdAt: '2026-11-02T15:20:00Z'
  },
  {
    id: 'msg-3',
    name: 'Khadija Rehman',
    email: 'khadija_rehman@yahoo.com',
    phone: '0334-9988776',
    subject: 'Inquiry about Sunday OPD for Child Specialist',
    message: 'Is Dr. Zainab Malik available on Sundays or is child emergency running with another pediatrician? Thank you.',
    read: true,
    important: false,
    replied: true,
    createdAt: '2026-11-01T17:45:00Z'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    userEmail: 'admin@daraldawa.pk',
    userName: 'Dr. Tariq Mahmood',
    userRole: 'super_admin',
    action: 'Confirmed Appointment',
    module: 'Appointments',
    details: 'Confirmed appointment DAD-819201 for patient Muhammad Aslam Sheikh with Cardiology.',
    timestamp: '2026-11-02T22:15:00Z'
  },
  {
    id: 'log-2',
    userEmail: 'lab@daraldawa.pk',
    userName: 'M. Bilal Raza',
    userRole: 'lab_staff',
    action: 'Uploaded Lab Report',
    module: 'Lab Reports',
    details: 'Generated and published verified report DAD-LAB-8921 (Lipid Profile) for Muhammad Aslam Sheikh.',
    timestamp: '2026-11-02T21:40:00Z'
  },
  {
    id: 'log-3',
    userEmail: 'reception@daraldawa.pk',
    userName: 'Fatima Noor',
    userRole: 'receptionist',
    action: 'Generated Invoice',
    module: 'Billing',
    details: 'Created Invoice INV-2026-1041 of Rs. 7,000 paid via JazzCash.',
    timestamp: '2026-11-02T20:50:00Z'
  },
  {
    id: 'log-4',
    userEmail: 'admin@daraldawa.pk',
    userName: 'Dr. Tariq Mahmood',
    userRole: 'super_admin',
    action: 'Updated Doctor Timings',
    module: 'Doctors',
    details: 'Updated OPD timings for Dr. Ayesha Siddiqa to Mon-Sat 10:00 AM - 03:00 PM.',
    timestamp: '2026-11-02T19:30:00Z'
  }
];

export const INITIAL_HOSPITAL_SETTINGS: HospitalSettings = {
  slotDurationMinutes: 20,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opdOpenTime: '08:00',
  opdCloseTime: '22:00',
  emergencyActive: true,
  maintenanceMode: false,
  emailNotifications: true,
  smsNotifications: true,
  whatsappConfirmation: true,
  currency: 'PKR (Rs.)'
};
