export interface PatientProfile {
  id: string; // matches auth.users uid
  email: string;
  fullName: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  city: string;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientAppointment {
  id: string;
  token: string;
  patientId?: string;
  patientName: string;
  phone: string;
  cnic?: string;
  departmentId: string;
  doctorId?: string;
  appointmentDate: string;
  timeSlot: string;
  patientType: 'new' | 'followup';
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}
