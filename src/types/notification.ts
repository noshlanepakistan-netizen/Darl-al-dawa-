export type NotificationType =
  | 'appointment_booked'
  | 'appointment_status'
  | 'patient_registered'
  | 'lab_report_ready'
  | 'contact_message'
  | 'system';

export interface NotificationItem {
  id: string;
  userId?: string; // target user ID, or 'admin', or undefined for all
  role: 'admin' | 'patient' | 'all';
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  appointmentBooked: boolean;
  appointmentCancelled: boolean;
  patientRegistered: boolean;
  profileUpdated: boolean;
  contactMessage: boolean;
  labReportReady: boolean;
  soundEnabled: boolean;
}
