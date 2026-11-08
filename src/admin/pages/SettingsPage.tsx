import React, { useState, useEffect } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { cleanWhatsAppNumber, cleanPhoneEmergency, formatDisplayPhone } from '../../utils/phoneUtils';

import {
  Settings,
  Building2,
  Home,
  Users,
  Calendar,
  Layers,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Search,
  Filter,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Sparkles,
  Lock,
  LogOut,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  Database,
  UploadCloud,
  RefreshCw,
  AlertTriangle,
  Bell,
  Send,
  Volume2,
  VolumeX,
  Smartphone,
  Copy,
  ExternalLink,
  Check,
  Download,
  Upload
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { requestPushPermission, ONESIGNAL_APP_ID } from '../../utils/oneSignal';
import { ImageUploadField, MultipleImageUploadField } from '../components/ImageUploadField';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Doctor, Department, ServiceFacility, GalleryItem, Testimonial, FAQItem } from '../../data/hospitalData';
import { AppointmentStatus, AdminAppointment } from '../types';

interface SettingsPageProps {
  lang: 'en' | 'ur';
}

type SettingsTab =
  | 'general'
  | 'homepage'
  | 'departments'
  | 'doctors'
  | 'appointments'
  | 'content'
  | 'security'
  | 'notifications';

export const SettingsPage: React.FC<SettingsPageProps> = ({ lang }) => {
  const isUrdu = lang === 'ur';
  const {
    hospitalConfig,
    updateHospitalConfig,
    homepageSettings,
    updateHomepageSettings,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    reorderDepartments,
    doctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    toggleDoctorActive,
    appointments,
    updateAppointmentStatus,
    deleteAppointment,
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
    showToast,
    isFirebaseActive,
    isLoading,
    refetchData,
    importOldDataToFirebase,
    cloudSyncStatus,
    checkCloudWriteStatus,
    firestoreRulesUrl,
    exportAllDataJSON,
    restoreFromJSON
  } = useAdminData();

  const { currentUser, updateProfile, changePassword, logout } = useAdminAuth();
  const { notificationSettings, updateNotificationSettings, sendTestNotification } = useNotifications();
  const [pushPermissionState, setPushPermissionState] = useState<string | null>(null);
  const [isSendingTestNotif, setIsSendingTestNotif] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Firebase Import & Sync state
  const [isImporting, setIsImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [isDeviceTransferModalOpen, setIsDeviceTransferModalOpen] = useState(false);
  const [restoreJsonInput, setRestoreJsonInput] = useState('');

  const FIRESTORE_RULES_SNIPPET = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
    setCopiedRules(true);
    showToast('Rules code copied! Paste in Firebase Console & click Publish.');
    setTimeout(() => setCopiedRules(false), 3500);
  };

  const handleTestCloudWrite = async () => {
    setIsTestingCloud(true);
    const ok = await checkCloudWriteStatus();
    setIsTestingCloud(false);
    if (ok) {
      showToast('Cloud Write is Active & Working! Multi-device sync is LIVE ✓', 'success');
    } else {
      showToast('Cloud Write is still blocked. Please publish the rules in Firebase Console.', 'error');
    }
  };

  const handleCopyBackupData = () => {
    const json = exportAllDataJSON();
    navigator.clipboard.writeText(json);
    showToast('All hospital settings copied! You can paste this on another device.');
  };

  const handleDownloadBackup = () => {
    const json = exportAllDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dar-al-dawa-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Settings backup downloaded ✓');
  };

  const handleApplyRestore = () => {
    if (!restoreJsonInput.trim()) {
      showToast('Please paste the backup JSON data first', 'error');
      return;
    }
    const success = restoreFromJSON(restoreJsonInput.trim());
    if (success) {
      showToast('Settings successfully applied on this device! ✓', 'success');
      setIsDeviceTransferModalOpen(false);
      setRestoreJsonInput('');
    } else {
      showToast('Invalid backup data. Please check and try again.', 'error');
    }
  };

  const handleImportLocalData = async () => {
    setIsImporting(true);
    setImportNotice(null);
    try {
      const res = await importOldDataToFirebase();
      if (res.success) {
        setImportNotice(`Migration completed! ${res.count} records imported to Cloud Firestore.`);
        showToast(`Data migration successful! ${res.count} records loaded.`);
      } else {
        setImportNotice(`Import notice: ${res.error || 'Failed to complete migration'}`);
        showToast(res.error || 'Migration failed. Check Firebase connection.', 'error');
      }
    } catch (err: any) {
      setImportNotice(`Error during migration: ${err.message || 'Unknown error'}`);
      showToast(err.message || 'Data import failed', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleRefreshCloud = async () => {
    setIsRefreshing(true);
    try {
      await refetchData();
      showToast('Data refreshed with latest cloud state!');
    } catch (err: any) {
      showToast('Could not refresh cloud data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // ==========================================
  // a) GENERAL SETTINGS STATE & SYNC
  // ==========================================
  const [genHospitalName, setGenHospitalName] = useState(hospitalConfig.name);
  const [genHospitalNameUrdu, setGenHospitalNameUrdu] = useState(hospitalConfig.nameUrdu || '');
  const [genTagline, setGenTagline] = useState(hospitalConfig.tagline);
  const [genLogo, setGenLogo] = useState(hospitalConfig.logo || '');
  const [genFavicon, setGenFavicon] = useState(hospitalConfig.favicon || '');
  const [genPhoneEmergency, setGenPhoneEmergency] = useState(hospitalConfig.contact.emergencyNumber);
  const [genPhoneLandline, setGenPhoneLandline] = useState(hospitalConfig.contact.receptionPhone);
  const [genPhoneMobile, setGenPhoneMobile] = useState(hospitalConfig.contact.mobileEmergency);
  const [genWhatsapp, setGenWhatsapp] = useState(hospitalConfig.contact.whatsapp);
  const [genEmailInfo, setGenEmailInfo] = useState(hospitalConfig.contact.email);
  const [genAddress, setGenAddress] = useState(hospitalConfig.contact.address);
  const [genMapEmbed, setGenMapEmbed] = useState(hospitalConfig.contact.googleMapsEmbedUrl);
  const [genOpdHours, setGenOpdHours] = useState(hospitalConfig.contact.hours.opd);
  const [genEmergencyHours, setGenEmergencyHours] = useState(hospitalConfig.contact.hours.emergency);
  
  // Social links
  const [socFacebook, setSocFacebook] = useState(hospitalConfig.socialLinks?.facebook || 'https://facebook.com/daraldawamedical');
  const [socInstagram, setSocInstagram] = useState(hospitalConfig.socialLinks?.instagram || 'https://instagram.com/daraldawamedical');
  const [socYoutube, setSocYoutube] = useState(hospitalConfig.socialLinks?.youtube || 'https://youtube.com/@daraldawamedical');
  const [socTiktok, setSocTiktok] = useState(hospitalConfig.socialLinks?.tiktok || 'https://tiktok.com/@daraldawamedical');

  // Synchronize state when hospitalConfig loads or updates from Cloud Firestore
  useEffect(() => {
    if (hospitalConfig) {
      setGenHospitalName(hospitalConfig.name || '');
      setGenHospitalNameUrdu(hospitalConfig.nameUrdu || '');
      setGenTagline(hospitalConfig.tagline || '');
      setGenLogo(hospitalConfig.logo || '');
      setGenFavicon(hospitalConfig.favicon || '');
      setGenPhoneEmergency(hospitalConfig.contact?.emergencyNumber || '');
      setGenPhoneLandline(hospitalConfig.contact?.receptionPhone || '');
      setGenPhoneMobile(hospitalConfig.contact?.mobileEmergency || '');
      setGenWhatsapp(hospitalConfig.contact?.whatsapp || '');
      setGenEmailInfo(hospitalConfig.contact?.email || '');
      setGenAddress(hospitalConfig.contact?.address || '');
      setGenMapEmbed(hospitalConfig.contact?.googleMapsEmbedUrl || '');
      setGenOpdHours(hospitalConfig.contact?.hours?.opd || '');
      setGenEmergencyHours(hospitalConfig.contact?.hours?.emergency || '');
      setSocFacebook(hospitalConfig.socialLinks?.facebook || '');
      setSocInstagram(hospitalConfig.socialLinks?.instagram || '');
      setSocYoutube(hospitalConfig.socialLinks?.youtube || '');
      setSocTiktok(hospitalConfig.socialLinks?.tiktok || '');
    }
  }, [hospitalConfig]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHospitalConfig({
      name: genHospitalName,
      nameUrdu: genHospitalNameUrdu,
      tagline: genTagline,
      logo: genLogo,
      favicon: genFavicon,
      socialLinks: {
        facebook: socFacebook,
        instagram: socInstagram,
        youtube: socYoutube,
        tiktok: socTiktok,
        twitter: hospitalConfig.socialLinks?.twitter || 'https://twitter.com/daraldawamedical'
      },
      contact: {
        ...hospitalConfig.contact,
        emergencyNumber: formatDisplayPhone(genPhoneEmergency),
        emergencyNumberRaw: cleanPhoneEmergency(genPhoneEmergency),
        receptionPhone: genPhoneLandline,
        mobileEmergency: genPhoneMobile,
        phoneNumbers: [genPhoneEmergency, genPhoneLandline, genPhoneMobile].filter(Boolean),
        whatsapp: genWhatsapp,
        whatsappClean: cleanWhatsAppNumber(genWhatsapp),
        email: genEmailInfo,
        address: genAddress,
        googleMapsEmbedUrl: genMapEmbed,
        hours: {
          ...hospitalConfig.contact.hours,
          opd: genOpdHours,
          emergency: genEmergencyHours
        }
      }
    });
  };

  // ==========================================
  // b) HOMEPAGE SETTINGS STATE & SYNC
  // ==========================================
  const [hpHeading, setHpHeading] = useState(homepageSettings.heroHeading);
  const [hpSubheading, setHpSubheading] = useState(homepageSettings.heroSubheading);
  const [hpButtonText, setHpButtonText] = useState(homepageSettings.heroButtonText);
  const [hpSliderImages, setHpSliderImages] = useState<string[]>(homepageSettings.heroSliderImages || []);
  const [hpAboutBadge, setHpAboutBadge] = useState(homepageSettings.aboutBadge);
  const [hpAboutHeading, setHpAboutHeading] = useState(homepageSettings.aboutHeading);
  const [hpAboutSubheading, setHpAboutSubheading] = useState(homepageSettings.aboutSubheading);
  const [hpAboutMission, setHpAboutMission] = useState(homepageSettings.aboutMission);
  const [hpAboutVision, setHpAboutVision] = useState(homepageSettings.aboutVision);
  const [hpAboutImage, setHpAboutImage] = useState(homepageSettings.aboutImage);
  const [sectionsVis, setSectionsVis] = useState(homepageSettings.sectionsVisibility);

  // Synchronize state when homepageSettings loads from Cloud Firestore
  useEffect(() => {
    if (homepageSettings) {
      setHpHeading(homepageSettings.heroHeading || '');
      setHpSubheading(homepageSettings.heroSubheading || '');
      setHpButtonText(homepageSettings.heroButtonText || '');
      setHpSliderImages(homepageSettings.heroSliderImages || []);
      setHpAboutBadge(homepageSettings.aboutBadge || '');
      setHpAboutHeading(homepageSettings.aboutHeading || '');
      setHpAboutSubheading(homepageSettings.aboutSubheading || '');
      setHpAboutMission(homepageSettings.aboutMission || '');
      setHpAboutVision(homepageSettings.aboutVision || '');
      setHpAboutImage(homepageSettings.aboutImage || '');
      if (homepageSettings.sectionsVisibility) {
        setSectionsVis(homepageSettings.sectionsVisibility);
      }
    }
  }, [homepageSettings]);

  const handleToggleSection = (sectionKey: keyof typeof homepageSettings.sectionsVisibility) => {
    setSectionsVis((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHomepageSettings({
      heroHeading: hpHeading,
      heroSubheading: hpSubheading,
      heroButtonText: hpButtonText,
      heroSliderImages: hpSliderImages,
      aboutBadge: hpAboutBadge,
      aboutHeading: hpAboutHeading,
      aboutSubheading: hpAboutSubheading,
      aboutMission: hpAboutMission,
      aboutVision: hpAboutVision,
      aboutImage: hpAboutImage,
      sectionsVisibility: sectionsVis
    });
  };



  // ==========================================
  // c) DEPARTMENTS MANAGEMENT STATE
  // ==========================================
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState<{
    title: string;
    titleUrdu: string;
    description: string;
    fullDescription: string;
    image: string;
    iconName: string;
    headDoctor: string;
  }>({
    title: '',
    titleUrdu: '',
    description: '',
    fullDescription: '',
    image: '',
    iconName: 'Activity',
    headDoctor: ''
  });

  const handleOpenAddDept = () => {
    setEditingDeptId(null);
    setDeptForm({
      title: '',
      titleUrdu: '',
      description: '',
      fullDescription: '',
      image: '',
      iconName: 'Activity',
      headDoctor: ''
    });
    setDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptForm({
      title: dept.title,
      titleUrdu: dept.titleUrdu || '',
      description: dept.description,
      fullDescription: dept.fullDescription || dept.description,
      image: dept.image || '',
      iconName: dept.iconName || 'Activity',
      headDoctor: dept.headDoctor || ''
    });
    setDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.title.trim()) {
      showToast('Department name is required', 'error');
      return;
    }

    if (editingDeptId) {
      updateDepartment(editingDeptId, {
        title: deptForm.title,
        titleUrdu: deptForm.titleUrdu,
        description: deptForm.description,
        fullDescription: deptForm.fullDescription,
        image: deptForm.image,
        headDoctor: deptForm.headDoctor
      });
    } else {
      addDepartment({
        title: deptForm.title,
        titleUrdu: deptForm.titleUrdu,
        description: deptForm.description,
        descriptionUrdu: deptForm.titleUrdu || deptForm.description,
        fullDescription: deptForm.fullDescription,
        image: deptForm.image,
        iconName: deptForm.iconName,
        features: ['24/7 Specialist Availability', 'Advanced Diagnostic Integration'],
        featuresUrdu: ['24 گھنٹے ماہر ڈاکٹرز', 'جدید تشخیصی سہولیات'],
        headDoctor: deptForm.headDoctor
      });
    }
    setDeptModalOpen(false);
  };

  const handleMoveDept = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= departments.length) return;
    const newOrder = [...departments];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(newIdx, 0, moved);
    reorderDepartments(newOrder);
  };

  // ==========================================
  // d) DOCTORS MANAGEMENT STATE
  // ==========================================
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docForm, setDocForm] = useState<{
    name: string;
    qualification: string;
    departmentId: string;
    specialty: string;
    experience: string;
    days: string;
    opdTimings: string;
    feePKR: number;
    image: string;
    about: string;
    active: boolean;
  }>({
    name: '',
    qualification: '',
    departmentId: departments[0]?.id || '',
    specialty: '',
    experience: '',
    days: 'Mon - Fri',
    opdTimings: '05:00 PM - 09:00 PM',
    feePKR: 2000,
    image: '',
    about: '',
    active: true
  });

  const handleOpenAddDoc = () => {
    setEditingDocId(null);
    setDocForm({
      name: '',
      qualification: '',
      departmentId: departments[0]?.id || '',
      specialty: '',
      experience: '10+ Years',
      days: 'Monday to Saturday',
      opdTimings: '05:00 PM – 09:00 PM',
      feePKR: 2500,
      image: '',
      about: '',
      active: true
    });
    setDocModalOpen(true);
  };

  const handleOpenEditDoc = (doc: Doctor) => {
    setEditingDocId(doc.id);
    setDocForm({
      name: doc.name,
      qualification: doc.qualification,
      departmentId: doc.departmentId,
      specialty: doc.specialty,
      experience: doc.experience,
      days: doc.days,
      opdTimings: doc.opdTimings,
      feePKR: doc.feePKR,
      image: doc.image,
      about: doc.about,
      active: doc.active !== false
    });
    setDocModalOpen(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.name.trim()) {
      showToast('Doctor name is required', 'error');
      return;
    }

    if (editingDocId) {
      updateDoctor(editingDocId, {
        name: docForm.name,
        qualification: docForm.qualification,
        departmentId: docForm.departmentId,
        specialty: docForm.specialty,
        experience: docForm.experience,
        days: docForm.days,
        opdTimings: docForm.opdTimings,
        feePKR: Number(docForm.feePKR),
        image: docForm.image,
        about: docForm.about,
        active: docForm.active
      });
    } else {
      addDoctor({
        name: docForm.name,
        nameUrdu: docForm.name,
        qualification: docForm.qualification,
        departmentId: docForm.departmentId,
        specialty: docForm.specialty,
        specialtyUrdu: docForm.specialty,
        experience: docForm.experience,
        days: docForm.days,
        daysUrdu: docForm.days,
        opdTimings: docForm.opdTimings,
        opdTimingsUrdu: docForm.opdTimings,
        feePKR: Number(docForm.feePKR),
        image: docForm.image,
        about: docForm.about,
        aboutUrdu: docForm.about,
        pmdcNo: `PMC-${Math.floor(10000 + Math.random() * 90000)}-P`,
        active: docForm.active
      });
    }
    setDocModalOpen(false);
  };

  // ==========================================
  // e) APPOINTMENTS MANAGEMENT STATE
  // ==========================================
  const [appSearch, setAppSearch] = useState('');
  const [appDeptFilter, setAppDeptFilter] = useState('all');
  const [appDoctorFilter, setAppDoctorFilter] = useState('all');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appDateFilter, setAppDateFilter] = useState('');

  const filteredAppointments = appointments.filter((app) => {
    if (appDeptFilter !== 'all' && app.departmentId !== appDeptFilter) return false;
    if (appDoctorFilter !== 'all' && app.doctorId !== appDoctorFilter) return false;
    if (appStatusFilter !== 'all' && app.status !== appStatusFilter) return false;
    if (appDateFilter && app.appointmentDate !== appDateFilter) return false;
    if (appSearch) {
      const q = appSearch.toLowerCase();
      const matchName = app.patientName.toLowerCase().includes(q);
      const matchPhone = app.phone.includes(q);
      const matchToken = app.token.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchToken) return false;
    }
    return true;
  });

  // ==========================================
  // f) CONTENT SUB-TABS (Services, Gallery, Testimonials, FAQs)
  // ==========================================
  const [contentSubTab, setContentSubTab] = useState<'services' | 'gallery' | 'testimonials' | 'faqs'>('services');

  // Service Modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    titleUrdu: '',
    description: '',
    image: '',
    badge: ''
  });

  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceForm({ title: '', titleUrdu: '', description: '', image: '', badge: '' });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceFacility) => {
    setEditingServiceId(srv.id);
    setServiceForm({
      title: srv.title,
      titleUrdu: srv.titleUrdu || '',
      description: srv.description,
      image: srv.image,
      badge: srv.badge || ''
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      showToast('Service title is required', 'error');
      return;
    }
    if (editingServiceId) {
      updateService(editingServiceId, {
        title: serviceForm.title,
        titleUrdu: serviceForm.titleUrdu,
        description: serviceForm.description,
        image: serviceForm.image,
        badge: serviceForm.badge
      });
    } else {
      addService({
        title: serviceForm.title,
        titleUrdu: serviceForm.titleUrdu,
        description: serviceForm.description,
        descriptionUrdu: serviceForm.description,
        iconName: 'Activity',
        image: serviceForm.image,
        badge: serviceForm.badge
      });
    }
    setServiceModalOpen(false);
  };

  // Gallery Modal
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState<{
    title: string;
    category: 'facilities' | 'theatres' | 'wards' | 'diagnostics';
    categoryLabel: string;
    images: string[];
    description: string;
  }>({
    title: '',
    category: 'facilities',
    categoryLabel: 'Hospital Facilities',
    images: [],
    description: ''
  });

  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (galleryForm.images.length === 0) {
      showToast('Please upload at least one image', 'error');
      return;
    }
    // Add each uploaded image as a gallery item
    galleryForm.images.forEach((img, idx) => {
      addGalleryItem({
        title: galleryForm.title || `Gallery Image ${gallery.length + idx + 1}`,
        titleUrdu: galleryForm.title || `ہسپتال کی تصویر`,
        category: galleryForm.category,
        categoryLabel: galleryForm.categoryLabel,
        categoryLabelUrdu: galleryForm.categoryLabel,
        image: img,
        description: galleryForm.description,
        descriptionUrdu: galleryForm.description
      });
    });
    setGalleryModalOpen(false);
  };

  // Testimonial Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testForm, setTestForm] = useState({
    name: '',
    city: 'Lahore',
    department: 'Cardiology',
    rating: 5,
    comment: '',
    avatar: ''
  });

  const handleOpenAddTest = () => {
    setEditingTestId(null);
    setTestForm({
      name: '',
      city: 'Gulberg, Lahore',
      department: departments[0]?.title || 'Cardiology',
      rating: 5,
      comment: '',
      avatar: ''
    });
    setTestModalOpen(true);
  };

  const handleOpenEditTest = (t: Testimonial) => {
    setEditingTestId(t.id);
    setTestForm({
      name: t.name,
      city: t.city,
      department: t.department,
      rating: t.rating,
      comment: t.comment,
      avatar: t.avatar
    });
    setTestModalOpen(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.name.trim() || !testForm.comment.trim()) {
      showToast('Name and comment are required', 'error');
      return;
    }
    if (editingTestId) {
      updateTestimonial(editingTestId, {
        name: testForm.name,
        city: testForm.city,
        department: testForm.department,
        rating: testForm.rating,
        comment: testForm.comment,
        avatar: testForm.avatar
      });
    } else {
      addTestimonial({
        name: testForm.name,
        nameUrdu: testForm.name,
        city: testForm.city,
        cityUrdu: testForm.city,
        department: testForm.department,
        departmentUrdu: testForm.department,
        rating: testForm.rating,
        comment: testForm.comment,
        commentUrdu: testForm.comment,
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avatar: testForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      });
    }
    setTestModalOpen(false);
  };

  // FAQ Modal
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'general'
  });

  const handleOpenAddFaq = () => {
    setEditingFaqId(null);
    setFaqForm({ question: '', answer: '', category: 'general' });
    setFaqModalOpen(true);
  };

  const handleOpenEditFaq = (f: FAQItem) => {
    setEditingFaqId(f.id);
    setFaqForm({
      question: f.question,
      answer: f.answer,
      category: f.category
    });
    setFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      showToast('Question and answer are required', 'error');
      return;
    }
    if (editingFaqId) {
      updateFaq(editingFaqId, {
        question: faqForm.question,
        answer: faqForm.answer,
        category: faqForm.category
      });
    } else {
      addFaq({
        question: faqForm.question,
        questionUrdu: faqForm.question,
        answer: faqForm.answer,
        answerUrdu: faqForm.answer,
        category: faqForm.category
      });
    }
    setFaqModalOpen(false);
  };

  // ==========================================
  // g) ACCOUNT / SECURITY SETTINGS STATE
  // ==========================================
  const [adminName, setAdminName] = useState(currentUser?.name || 'Administrator');
  const [adminEmail, setAdminEmail] = useState(currentUser?.email || 'admin@daraldawa.pk');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      showToast('Name and email cannot be blank', 'error');
      return;
    }
    updateProfile(adminName.trim(), adminEmail.trim());
    showToast('Admin profile details updated successfully!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      showToast(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
            {isUrdu ? 'مکمل سسٹم و ویب سائٹ سیٹنگز' : 'Hospital Settings & Management Center'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'ویب سائٹ کے تمام حصوں، ڈاکٹرز، شعبہ جات، اپوائنٹمنٹس اور سیکیورٹی کا مکمل کنٹرول'
              : 'Complete control of branding, homepage, faculty, appointments, content, and security.'}
          </p>
        </div>
      </div>

      {/* Universal Cloud Connection & Sync Status Banner */}
      {cloudSyncStatus === 'blocked' ? (
        <div className="p-4 sm:p-5 rounded-2xl border transition-all bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/80 text-white border-amber-500/50 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {isUrdu ? 'آف لائن موڈ — ڈیٹا لوکل میموری میں محفوظ ہے' : 'Offline / Local Mode Active'}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Local Storage
                  </span>
                </div>
                <p className="text-xs mt-1.5 leading-relaxed text-amber-100/90 max-w-2xl">
                  {isUrdu
                    ? 'ڈیٹا آپ کے فون میں محفوظ ہو گیا ہے۔ انٹرنیٹ کنکشن بحال ہوتے ہی کلاؤڈ ڈیٹا بیس خود بخود سنک ہو جائے گا۔'
                    : 'Changes are safely stored on this device. Re-check your internet connection to sync with the universal cloud database.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              <button
                type="button"
                onClick={handleTestCloudWrite}
                disabled={isTestingCloud}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-spin' : ''}`} />
                <span>{isTestingCloud ? 'Checking...' : (isUrdu ? 'دوبارہ ٹیسٹ کریں' : 'Re-check Cloud Sync')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeviceTransferModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-teal-200 border border-teal-500/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'ڈیوائس ٹرانسفر' : 'Device Transfer'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl border transition-all bg-gradient-to-r from-teal-900 to-emerald-950 text-white border-teal-700 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/10 text-emerald-300">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {isUrdu ? 'لائیو کلاؤڈ ڈیٹا بیس اور ملٹی ڈیوائس سنک فعال ہے' : 'Live Cloud Database & Multi-Device Sync Active'}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Cloud Sync
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed text-teal-100/90">
                  {isUrdu
                    ? 'ہسپتال کی تمام سیٹنگز، ڈاکٹرز، شعبہ جات، گیلری اور اپوائنٹمنٹس نیٹلی فائی اور تمام فونز اور کمپیوٹرز پر خود بخود لمحہ بہ لمحہ اپڈیٹ ہو رہے ہیں۔'
                    : 'All hospital settings, doctors, departments, gallery images, and patient appointments sync in real time across Netlify, phones, and computers via the universal cloud database.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <button
                type="button"
                onClick={handleImportLocalData}
                disabled={isImporting}
                className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                title="Uploads and initializes the standard hospital catalog to the cloud database"
              >
                <UploadCloud className={`w-4 h-4 ${isImporting ? 'animate-bounce' : ''}`} />
                <span>{isImporting ? (isUrdu ? 'سنک ہو رہا ہے...' : 'Syncing...') : (isUrdu ? 'کلاؤڈ پر محفوظ کریں' : 'Sync All to Cloud')}</span>
              </button>

              <button
                type="button"
                onClick={handleRefreshCloud}
                disabled={isRefreshing}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? (isUrdu ? 'اپڈیٹ ہو رہا ہے...' : 'Syncing...') : (isUrdu ? 'ابھی ریفریش کریں' : 'Sync Now')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeviceTransferModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-teal-200 border border-teal-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'بیک اپ ٹرانسفر' : 'Device Transfer'}</span>
              </button>
            </div>
          </div>

          {importNotice && (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs font-medium text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{importNotice}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>General Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('homepage')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'homepage'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Homepage Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'doctors'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Doctors ({doctors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments ({appointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Services & Media</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Account & Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>
      </div>

      {/* ========================================================
          TAB A: GENERAL SETTINGS
         ======================================================== */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hospital Identity & Branding</h2>
                  <p className="text-xs text-slate-500">Public name, tagline, logo, and favicon.</p>
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save General Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Name (English)</label>
                <input
                  type="text"
                  value={genHospitalName}
                  onChange={(e) => setGenHospitalName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Name (Urdu)</label>
                <input
                  type="text"
                  value={genHospitalNameUrdu}
                  onChange={(e) => setGenHospitalNameUrdu(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-urdu"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Tagline</label>
                <input
                  type="text"
                  value={genTagline}
                  onChange={(e) => setGenTagline(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Logo Upload (No URL) */}
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <ImageUploadField
                  label="Hospital Logo"
                  value={genLogo}
                  onChange={setGenLogo}
                  aspectRatio="wide"
                  helpText="Pick from device / gallery (PNG or SVG recommended)"
                />
              </div>

              {/* Favicon Upload (No URL) */}
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <ImageUploadField
                  label="Hospital Favicon"
                  value={genFavicon}
                  onChange={setGenFavicon}
                  aspectRatio="square"
                  helpText="Pick small square icon from device (PNG/ICO)"
                />
              </div>
            </div>

            {/* Contact Numbers & Emergency */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>Contact Numbers & WhatsApp</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">24/7 Emergency Line</label>
                  <input
                    type="text"
                    value={genPhoneEmergency}
                    onChange={(e) => setGenPhoneEmergency(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">OPD / Landline</label>
                  <input
                    type="text"
                    value={genPhoneLandline}
                    onChange={(e) => setGenPhoneLandline(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Inquiries</label>
                  <input
                    type="text"
                    value={genPhoneMobile}
                    onChange={(e) => setGenPhoneMobile(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Hotline</label>
                  <input
                    type="text"
                    value={genWhatsapp}
                    onChange={(e) => setGenWhatsapp(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Address & Google Maps */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Hospital Location & Working Hours</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={genEmailInfo}
                    onChange={(e) => setGenEmailInfo(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Maps Embed URL / Link</label>
                  <input
                    type="text"
                    value={genMapEmbed}
                    onChange={(e) => setGenMapEmbed(e.target.value)}
                    placeholder="https://www.google.com/maps/embed?..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={genAddress}
                    onChange={(e) => setGenAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">OPD Working Hours</label>
                  <input
                    type="text"
                    value={genOpdHours}
                    onChange={(e) => setGenOpdHours(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Department Timings</label>
                  <input
                    type="text"
                    value={genEmergencyHours}
                    onChange={(e) => setGenEmergencyHours(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Social Media Profiles</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={socFacebook}
                    onChange={(e) => setSocFacebook(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={socInstagram}
                    onChange={(e) => setSocInstagram(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={socYoutube}
                    onChange={(e) => setSocYoutube(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">TikTok URL</label>
                  <input
                    type="text"
                    value={socTiktok}
                    onChange={(e) => setSocTiktok(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All General Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================
          TAB B: HOMEPAGE SETTINGS
         ======================================================== */}
      {activeTab === 'homepage' && (
        <form onSubmit={handleSaveHomepage} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hero Section, Slider & About</h2>
                  <p className="text-xs text-slate-500">Customize the top banner and about section on the live site.</p>
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Homepage</span>
              </button>
            </div>

            {/* Hero Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Hero Banner Texts</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Heading</label>
                  <input
                    type="text"
                    value={hpHeading}
                    onChange={(e) => setHpHeading(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Subheading</label>
                  <textarea
                    rows={2}
                    value={hpSubheading}
                    onChange={(e) => setHpSubheading(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Button Text</label>
                  <input
                    type="text"
                    value={hpButtonText}
                    onChange={(e) => setHpButtonText(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Multi-Image Hero Banners Upload (No URL) */}
              <div className="pt-2">
                <MultipleImageUploadField
                  label="Hero Banner Slider Images"
                  values={hpSliderImages}
                  onChange={setHpSliderImages}
                  maxCount={6}
                  helpText="Choose images from gallery/files. Multiple selection supported."
                />
              </div>
            </div>

            {/* Section Visibility Toggles */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Homepage Sections Show / Hide
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Toggle any section on or off. Changes appear live on the front page immediately after saving.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(
                  [
                    { key: 'hero', label: '1. Hero Section' },
                    { key: 'appointment', label: '2. Appointment Form' },
                    { key: 'departments', label: '3. Departments Grid' },
                    { key: 'doctors', label: '4. Doctor Profiles' },
                    { key: 'services', label: '5. Services & Facilities' },
                    { key: 'packages', label: '6. Health Packages' },
                    { key: 'about', label: '7. About Hospital' },
                    { key: 'testimonials', label: '8. Patient Reviews' },
                    { key: 'gallery', label: '9. Photo Gallery' },
                    { key: 'blog', label: '10. Health Tips' },
                    { key: 'faq', label: '11. FAQ Accordion' },
                    { key: 'contact', label: '12. Contact & Map' }
                  ] as const
                ).map(({ key, label }) => {
                  const isVisible = sectionsVis[key];
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleToggleSection(key)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isVisible
                          ? 'bg-teal-50/50 border-teal-200 text-teal-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      }`}
                    >
                      <span className="text-xs font-semibold">{label}</span>
                      {isVisible ? (
                        <Eye className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* About Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                About Section Content & Image
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">About Badge / Category</label>
                  <input
                    type="text"
                    value={hpAboutBadge}
                    onChange={(e) => setHpAboutBadge(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">About Heading</label>
                  <input
                    type="text"
                    value={hpAboutHeading}
                    onChange={(e) => setHpAboutHeading(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">About Subheading</label>
                  <textarea
                    rows={2}
                    value={hpAboutSubheading}
                    onChange={(e) => setHpAboutSubheading(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Our Mission</label>
                  <textarea
                    rows={3}
                    value={hpAboutMission}
                    onChange={(e) => setHpAboutMission(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Our Vision</label>
                  <textarea
                    rows={3}
                    value={hpAboutVision}
                    onChange={(e) => setHpAboutVision(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* About Image Upload (No URL) */}
                <div className="md:col-span-2 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                  <ImageUploadField
                    label="About Us Feature Photo"
                    value={hpAboutImage}
                    onChange={setHpAboutImage}
                    aspectRatio="wide"
                    helpText="Pick a hospital facility or faculty picture from your device"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Homepage Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================
          TAB C: DEPARTMENTS MANAGEMENT
         ======================================================== */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Departments Management</h2>
              <p className="text-xs text-slate-500">
                Add, edit, reorder or delete departments. Each department shows on the live homepage grid.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddDept}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {departments.map((dept, index) => {
              const deptDocs = doctors.filter((d) => d.departmentId === dept.id);
              return (
                <div
                  key={dept.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-teal-50 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                      {dept.image ? (
                        <img src={dept.image} alt={dept.title} className="w-full h-full object-cover" />
                      ) : (
                        <Layers className="w-5 h-5 text-teal-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{dept.title}</h4>
                        <span className="text-[10px] bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                          {deptDocs.length} Doctors
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                      {dept.headDoctor && (
                        <p className="text-[10px] text-slate-600 mt-1">
                          <span className="font-semibold text-slate-700">Head:</span> {dept.headDoctor}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveDept(index, 'up')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === departments.length - 1}
                        onClick={() => handleMoveDept(index, 'down')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDept(dept)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            title: 'Delete Department?',
                            message: `Are you sure you want to delete "${dept.title}"? Associated doctors will remain but will need department reassignment.`,
                            itemName: dept.title,
                            onConfirm: () => deleteDepartment(dept.id)
                          })
                        }
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB D: DOCTORS MANAGEMENT
         ======================================================== */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Doctors Management</h2>
              <p className="text-xs text-slate-500">
                Manage consultants, assign to departments, toggle active status, and upload photos.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddDoc}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {doctors.map((doc) => {
              const dept = departments.find((d) => d.id === doc.departmentId);
              const isActive = doc.active !== false;
              return (
                <div
                  key={doc.id}
                  className={`bg-white p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive ? 'border-slate-200 shadow-xs' : 'border-amber-200/80 bg-amber-50/20 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      {doc.image ? (
                        <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-teal-700 bg-teal-50 text-sm">
                          {doc.name.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                        <button
                          type="button"
                          onClick={() => toggleDoctorActive(doc.id)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <p className="text-[11px] text-teal-700 font-medium truncate">{doc.qualification}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">Dept:</span> {dept?.title || doc.departmentId}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700">Timings:</span> {doc.days} ({doc.opdTimings})
                      </p>
                      {doc.feePKR > 0 && (
                        <p className="text-[10px] text-slate-600 mt-1 font-semibold">
                          Fee: Rs. {doc.feePKR.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDoc(doc)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          title: 'Remove Doctor?',
                          message: `Are you sure you want to remove "${doc.name}" from the hospital faculty list?`,
                          itemName: doc.name,
                          onConfirm: () => deleteDoctor(doc.id)
                        })
                      }
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB E: APPOINTMENTS MANAGEMENT
         ======================================================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Appointments Desk</h2>
              <p className="text-xs text-slate-500">
                Filter by date, department, doctor, and update status directly.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 self-start sm:self-auto">
              Showing {filteredAppointments.length} of {appointments.length} Requests
            </span>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient / token..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <select
                value={appDeptFilter}
                onChange={(e) => setAppDeptFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={appDoctorFilter}
                onChange={(e) => setAppDoctorFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="all">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                value={appDateFilter}
                onChange={(e) => setAppDateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3">Token</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Department & Doctor</th>
                    <th className="p-3">Date & Slot</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No appointments found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => {
                      const dept = departments.find((d) => d.id === app.departmentId);
                      const doc = doctors.find((d) => d.id === app.doctorId);
                      return (
                        <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-teal-800 whitespace-nowrap">
                            {app.token}
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{app.patientName}</div>
                            <div className="text-[11px] text-slate-500">{app.phone}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">{dept?.title || app.departmentId}</div>
                            <div className="text-[11px] text-teal-700">{doc?.name || 'Any Consultant'}</div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{app.appointmentDate}</div>
                            <div className="text-[11px] text-slate-500">{app.timeSlot}</div>
                          </td>
                          <td className="p-3">
                            <select
                              value={app.status}
                              onChange={(e) => updateAppointmentStatus(app.id, e.target.value as AppointmentStatus)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer ${
                                app.status === 'confirmed'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : app.status === 'completed'
                                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                                  : app.status === 'cancelled'
                                  ? 'bg-red-50 border-red-300 text-red-800'
                                  : 'bg-amber-50 border-amber-300 text-amber-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  title: 'Delete Appointment?',
                                  message: `Are you sure you want to permanently delete appointment ${app.token} for ${app.patientName}?`,
                                  itemName: `${app.token} - ${app.patientName}`,
                                  onConfirm: () => deleteAppointment(app.id)
                                })
                              }
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Appointment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB F: SERVICES, GALLERY, TESTIMONIALS & FAQS
         ======================================================== */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Sub-nav */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setContentSubTab('services')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                contentSubTab === 'services' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Services ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setContentSubTab('gallery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                contentSubTab === 'gallery' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Gallery ({gallery.length})
            </button>
            <button
              type="button"
              onClick={() => setContentSubTab('testimonials')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                contentSubTab === 'testimonials' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Testimonials ({testimonials.length})
            </button>
            <button
              type="button"
              onClick={() => setContentSubTab('faqs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                contentSubTab === 'faqs' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              FAQs ({faqs.length})
            </button>
          </div>

          {/* Sub Tab: Services */}
          {contentSubTab === 'services' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Manage specialized medical units and hospital facilities.</p>
                <button
                  type="button"
                  onClick={handleOpenAddService}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((srv) => (
                  <div key={srv.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3">
                        <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{srv.title}</h4>
                        {srv.badge && (
                          <span className="text-[10px] bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                            {srv.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditService(srv)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            title: 'Delete Service?',
                            message: `Are you sure you want to delete "${srv.title}"?`,
                            itemName: srv.title,
                            onConfirm: () => deleteService(srv.id)
                          })
                        }
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Tab: Gallery */}
          {contentSubTab === 'gallery' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Upload multiple photos from your device into the hospital gallery.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setGalleryForm({
                      title: '',
                      category: 'facilities',
                      categoryLabel: 'Hospital Facilities',
                      images: [],
                      description: ''
                    });
                    setGalleryModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Images</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gallery.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden group">
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            title: 'Delete Gallery Image?',
                            message: `Are you sure you want to remove this photo from the hospital gallery?`,
                            itemName: item.title,
                            onConfirm: () => deleteGalleryItem(item.id)
                          })
                        }
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md cursor-pointer transition-transform group-hover:scale-105"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      <span className="text-[10px] text-teal-700 font-semibold">{item.categoryLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Tab: Testimonials */}
          {contentSubTab === 'testimonials' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Patient testimonials and recovery stories.</p>
                <button
                  type="button"
                  onClick={handleOpenAddTest}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Testimonial</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                          <p className="text-[10px] text-slate-500">{t.city} • {t.department}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 italic leading-relaxed">"{t.comment}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <span className="text-amber-500 text-xs">{'★'.repeat(t.rating)}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTest(t)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              title: 'Delete Testimonial?',
                              message: `Are you sure you want to remove feedback from ${t.name}?`,
                              itemName: t.name,
                              onConfirm: () => deleteTestimonial(t.id)
                            })
                          }
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Tab: FAQs */}
          {contentSubTab === 'faqs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Frequently Asked Questions shown in the accordion on the homepage.</p>
                <button
                  type="button"
                  onClick={handleOpenAddFaq}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {faqs.map((f) => (
                  <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <h4 className="text-xs font-bold text-slate-900">{f.question}</h4>
                      </div>
                      <p className="text-xs text-slate-600 pl-6 leading-relaxed">{f.answer}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditFaq(f)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            title: 'Delete FAQ?',
                            message: `Are you sure you want to delete this FAQ question?`,
                            itemName: f.question,
                            onConfirm: () => deleteFaq(f.id)
                          })
                        }
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB G: ACCOUNT & SECURITY SETTINGS
         ======================================================== */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Profile */}
          <form onSubmit={handleSaveAdminProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Admin Account Credentials</h3>
                <p className="text-xs text-slate-500">Update administrative contact name & email.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Full Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Update Account Information</span>
              </button>
            </div>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
                <p className="text-xs text-slate-500">Ensure a strong passkey of 6+ characters.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Save New Password</span>
              </button>
            </div>
          </form>

          {/* Session & Logout */}
          <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Active Administrative Session</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in as <span className="font-semibold text-slate-800">{currentUser?.email}</span> ({currentUser?.role})
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Admin Session</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB H: NOTIFICATION SETTINGS & ONESIGNAL PUSH
         ======================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hospital Notification Preferences</h2>
                  <p className="text-xs text-slate-500">
                    Configure real-time in-app alerts, audio chime, and Web Push notifications.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSendingTestNotif}
                  onClick={async () => {
                    setIsSendingTestNotif(true);
                    await sendTestNotification('admin');
                    showToast('Test notification dispatched with audio chime ✓');
                    setIsSendingTestNotif(false);
                  }}
                  className="px-4 py-2 bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTestNotif ? 'Sending Test...' : 'Send Test Notification'}</span>
                </button>
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Appointment Booked */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">New Appointment Booked</span>
                  <span className="text-[11px] text-slate-500">
                    Alert administrative staff whenever a patient books an OPD slot online.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({ appointmentBooked: !notificationSettings.appointmentBooked })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notificationSettings.appointmentBooked ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      notificationSettings.appointmentBooked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Appointment Cancelled */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Appointment Cancelled</span>
                  <span className="text-[11px] text-slate-500">
                    Notify reception immediately if a patient cancels their pending token.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({ appointmentCancelled: !notificationSettings.appointmentCancelled })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notificationSettings.appointmentCancelled ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      notificationSettings.appointmentCancelled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Patient Registered */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">New Patient Registration</span>
                  <span className="text-[11px] text-slate-500">
                    Alert when a patient signs up for an online portal account.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({ patientRegistered: !notificationSettings.patientRegistered })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notificationSettings.patientRegistered ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      notificationSettings.patientRegistered ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Profile Updated */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Patient Profile Updates</span>
                  <span className="text-[11px] text-slate-500">
                    Alert when a patient updates their mobile phone or residential address.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({ profileUpdated: !notificationSettings.profileUpdated })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notificationSettings.profileUpdated ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      notificationSettings.profileUpdated ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Contact Messages */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Public Contact Inquiries</span>
                  <span className="text-[11px] text-slate-500">
                    Notify when a visitor submits a contact form message.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({ contactMessage: !notificationSettings.contactMessage })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notificationSettings.contactMessage ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      notificationSettings.contactMessage ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Audio Chime */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationSettings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Audio Chime On Incoming Alert</span>
                    <span className="text-[11px] text-slate-500">
                      Plays a pleasant hospital chime when new appointments or alerts arrive.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({ soundEnabled: !notificationSettings.soundEnabled })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notificationSettings.soundEnabled ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      notificationSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* OneSignal Web Push Integration Info */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">OneSignal Web Push Integration</h3>
                    <p className="text-xs text-slate-300">
                      Deliver real-time push notifications to admin laptops and patient mobile devices.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const granted = await requestPushPermission();
                    if (granted) {
                      setPushPermissionState('Push notifications allowed for this browser ✓');
                      showToast('Browser push notifications enabled!');
                    } else {
                      setPushPermissionState('Permission not granted or blocked by browser.');
                      showToast('Push permission not granted', 'error');
                    }
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Enable Push On This Device
                </button>
              </div>

              {pushPermissionState && (
                <div className="p-2.5 rounded-lg bg-white/10 text-emerald-300 text-xs font-mono">
                  {pushPermissionState}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300 border-t border-white/10">
                <div>
                  <span className="text-slate-400 block text-[11px]">OneSignal App ID:</span>
                  <span className="font-mono text-white text-[11px] truncate block">
                    {ONESIGNAL_APP_ID}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Worker Status:</span>
                  <span className="font-mono text-emerald-400 text-[11px] block">
                    /OneSignalSDKWorker.js Active ✓
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODALS: Add/Edit Department Modal
         ======================================================== */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingDeptId ? 'Edit Department' : 'Add New Department'}
            </h3>

            <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name (English) *</label>
                <input
                  type="text"
                  value={deptForm.title}
                  onChange={(e) => setDeptForm({ ...deptForm, title: e.target.value })}
                  placeholder="e.g. Cardiology & Heart Center"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name (Urdu)</label>
                <input
                  type="text"
                  value={deptForm.titleUrdu}
                  onChange={(e) => setDeptForm({ ...deptForm, titleUrdu: e.target.value })}
                  placeholder="e.g. شعبہ امراضِ قلب"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-urdu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description (1-Line) *</label>
                <input
                  type="text"
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="e.g. 24/7 cardiac emergency, cath lab, and non-invasive testing."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={2}
                  value={deptForm.fullDescription}
                  onChange={(e) => setDeptForm({ ...deptForm, fullDescription: e.target.value })}
                  placeholder="Detailed departmental overview..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Head of Department / Senior Doctor</label>
                <input
                  type="text"
                  value={deptForm.headDoctor}
                  onChange={(e) => setDeptForm({ ...deptForm, headDoctor: e.target.value })}
                  placeholder="e.g. Dr. Tariq Mahmood"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Department Image (Device Upload only) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ImageUploadField
                  label="Department Banner / Photo"
                  value={deptForm.image}
                  onChange={(img) => setDeptForm({ ...deptForm, image: img })}
                  aspectRatio="wide"
                  helpText="Choose image from device / gallery"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS: Add/Edit Doctor Modal
         ======================================================== */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-900">
              {editingDocId ? 'Edit Doctor Profile' : 'Add New Consultant / Doctor'}
            </h3>

            <form onSubmit={handleSaveDoc} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    value={docForm.name}
                    onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                    placeholder="e.g. Dr. Tariq Mahmood"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department *</label>
                  <select
                    value={docForm.departmentId}
                    onChange={(e) => setDocForm({ ...docForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty / Role *</label>
                  <input
                    type="text"
                    value={docForm.specialty}
                    onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                    placeholder="e.g. Consultant Interventional Cardiologist"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications *</label>
                  <input
                    type="text"
                    value={docForm.qualification}
                    onChange={(e) => setDocForm({ ...docForm, qualification: e.target.value })}
                    placeholder="e.g. MBBS, FCPS (Cardiology), Fellowship (USA)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Experience</label>
                  <input
                    type="text"
                    value={docForm.experience}
                    onChange={(e) => setDocForm({ ...docForm, experience: e.target.value })}
                    placeholder="e.g. 18+ Years"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">OPD Days</label>
                  <input
                    type="text"
                    value={docForm.days}
                    onChange={(e) => setDocForm({ ...docForm, days: e.target.value })}
                    placeholder="e.g. Monday to Friday"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">OPD Timings</label>
                  <input
                    type="text"
                    value={docForm.opdTimings}
                    onChange={(e) => setDocForm({ ...docForm, opdTimings: e.target.value })}
                    placeholder="e.g. 05:00 PM – 09:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (PKR)</label>
                  <input
                    type="number"
                    value={docForm.feePKR}
                    onChange={(e) => setDocForm({ ...docForm, feePKR: Number(e.target.value) })}
                    placeholder="2500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Status</label>
                  <select
                    value={docForm.active ? 'active' : 'inactive'}
                    onChange={(e) => setDocForm({ ...docForm, active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="active">Active (Visible on Website)</option>
                    <option value="inactive">Inactive (Hidden from Website)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Biography / Profile</label>
                  <textarea
                    rows={2}
                    value={docForm.about}
                    onChange={(e) => setDocForm({ ...docForm, about: e.target.value })}
                    placeholder="Full biography, medical background and clinical focus..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Doctor Photo (Upload only) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ImageUploadField
                  label="Doctor Photo"
                  value={docForm.image}
                  onChange={(img) => setDocForm({ ...docForm, image: img })}
                  aspectRatio="avatar"
                  helpText="Pick profile portrait directly from device/gallery"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS: Add/Edit Service Modal
         ======================================================== */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingServiceId ? 'Edit Hospital Service' : 'Add New Hospital Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. Advanced Cardiac Cath Lab"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Badge (Optional)</label>
                <input
                  type="text"
                  value={serviceForm.badge}
                  onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
                  placeholder="e.g. 24/7 Available"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Service description..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ImageUploadField
                  label="Service Image"
                  value={serviceForm.image}
                  onChange={(img) => setServiceForm({ ...serviceForm, image: img })}
                  aspectRatio="wide"
                  helpText="Pick image from device/gallery"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS: Upload Gallery Modal (Multi-image)
         ======================================================== */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload Gallery Photos</h3>

            <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Title / Caption</label>
                <input
                  type="text"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="e.g. Surgical Suite & Patient Rooms"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => {
                    const cat = e.target.value as typeof galleryForm.category;
                    const labels: Record<typeof cat, string> = {
                      facilities: 'Hospital Facilities & Lobby',
                      theatres: 'Operation Theatres & ICU',
                      wards: 'Inpatient Rooms & Wards',
                      diagnostics: 'Diagnostics & Laboratory'
                    };
                    setGalleryForm({
                      ...galleryForm,
                      category: cat,
                      categoryLabel: labels[cat]
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                >
                  <option value="facilities">Hospital Facilities & Lobby</option>
                  <option value="theatres">Operation Theatres & ICU</option>
                  <option value="wards">Inpatient Rooms & Wards</option>
                  <option value="diagnostics">Diagnostics & Laboratory</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <MultipleImageUploadField
                  label="Select Photos From Device"
                  values={galleryForm.images}
                  onChange={(imgs) => setGalleryForm({ ...galleryForm, images: imgs })}
                  maxCount={12}
                  helpText="Select one or multiple images directly from your gallery"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Upload To Gallery ({galleryForm.images.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS: Add/Edit Testimonial Modal
         ======================================================== */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingTestId ? 'Edit Testimonial' : 'Add Patient Testimonial'}
            </h3>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  placeholder="e.g. Fatima Zahra"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Area</label>
                  <input
                    type="text"
                    value={testForm.city}
                    onChange={(e) => setTestForm({ ...testForm, city: e.target.value })}
                    placeholder="Gulberg, Lahore"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Treated Department</label>
                  <input
                    type="text"
                    value={testForm.department}
                    onChange={(e) => setTestForm({ ...testForm, department: e.target.value })}
                    placeholder="Cardiology"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                <select
                  value={testForm.rating}
                  onChange={(e) => setTestForm({ ...testForm, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Review Comment *</label>
                <textarea
                  rows={3}
                  value={testForm.comment}
                  onChange={(e) => setTestForm({ ...testForm, comment: e.target.value })}
                  placeholder="Share patient feedback and treatment experience..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ImageUploadField
                  label="Patient Photo (Optional)"
                  value={testForm.avatar}
                  onChange={(img) => setTestForm({ ...testForm, avatar: img })}
                  aspectRatio="avatar"
                  helpText="Pick avatar from device/gallery"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS: Add/Edit FAQ Modal
         ======================================================== */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingFaqId ? 'Edit FAQ Item' : 'Add FAQ Question'}
            </h3>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question *</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. What are the visiting hours?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                >
                  <option value="general">General Visiting & Timings</option>
                  <option value="billing">Panel Insurance & Sehat Card</option>
                  <option value="reports">Online Lab Reports</option>
                  <option value="emergency">Emergency Procedures</option>
                  <option value="services">Home Sampling & Appointments</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Answer *</label>
                <textarea
                  rows={4}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Provide helpful, comprehensive answer..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DEVICE-TO-DEVICE DIRECT TRANSFER & BACKUP MODAL
         ======================================================== */}
      {isDeviceTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {isUrdu ? 'ڈیوائس سے ڈیوائس ترامیم منتقل کریں' : 'Instant Device-to-Device Transfer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeviceTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {isUrdu
                  ? 'آپ اپنی تمام ہسپتال سیٹنگز، ڈاکٹرز اور مواد کو ایک ڈیوائس سے کاپی کر کے دوسرے فون یا کمپیوٹر پر بغیر فائر بیس کے فوراً لاگو کر سکتے ہیں:'
                  : 'Instantly transfer all hospital branding, faculty, and settings between your phones and computers:'}
              </p>

              {/* Option 1: Export from this device */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  {isUrdu ? '1. اس ڈیوائس سے سیٹنگز لیں (Export):' : '1. Export from this device:'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBackupData}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'سیٹنگز کاپی کریں (Clipboard)' : 'Copy Settings to Clipboard'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'بیک اپ فائل ڈاؤن لوڈ کریں' : 'Download JSON File'}</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Import into this device */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  {isUrdu ? '2. دوسرے ڈیوائس کا ڈیٹا یہاں پیسٹ کریں (Import):' : '2. Apply settings from another device:'}
                </h4>
                <textarea
                  rows={4}
                  value={restoreJsonInput}
                  onChange={(e) => setRestoreJsonInput(e.target.value)}
                  placeholder={isUrdu ? 'یہاں کاپی شدہ JSON ڈیٹا پیسٹ کریں...' : 'Paste exported JSON data here...'}
                  className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplyRestore}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'اس ڈیوائس پر لاگو کریں (Apply to this Device)' : 'Apply to this Device'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL (All deletions)
         ======================================================== */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
        onConfirm={deleteModal.onConfirm}
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false })}
      />
    </div>
  );
};
