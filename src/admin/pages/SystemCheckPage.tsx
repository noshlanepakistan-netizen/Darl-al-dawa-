import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Sparkles,
  Camera,
  Clock,
  Server,
  Zap,
  Check,
  UploadCloud,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { db, isFirebaseConfigured, testFirebaseConnection, firebaseConfig } from '../../firebase/config';
import { useAdminData } from '../context/AdminDataContext';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { cleanWhatsAppNumber, formatDisplayPhone } from '../../utils/phoneUtils';

interface SystemCheckPageProps {
  lang: 'en' | 'ur';
}

interface TableCount {
  departments: number;
  doctors: number;
  services: number;
  gallery: number;
  appointments: number;
}

export const SystemCheckPage: React.FC<SystemCheckPageProps> = ({ lang }) => {
  const isUrdu = lang === 'ur';
  const { refetchData, importOldDataToFirebase } = useAdminData();

  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live values from direct Firestore document query
  const [dbWhatsapp, setDbWhatsapp] = useState<string>('—');
  const [dbPhone, setDbPhone] = useState<string>('—');
  const [dbEmail, setDbEmail] = useState<string>('—');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('—');

  // Firestore collection counts
  const [counts, setCounts] = useState<TableCount>({
    departments: 0,
    doctors: 0,
    services: 0,
    gallery: 0,
    appointments: 0
  });

  // Interactive Test Save state
  const [isTestingSave, setIsTestingSave] = useState(false);
  const [testSaveResult, setTestSaveResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    latencyMs?: number;
    details?: string;
  }>({ status: 'idle', message: '' });

  // Import Old Data state
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const runFullCheck = useCallback(async () => {
    setIsChecking(true);
    setErrorMessage(null);

    if (!isFirebaseConfigured()) {
      setConnectionStatus('error');
      setErrorMessage(
        isUrdu
          ? 'فائر بیس ڈیٹا بیس ابھی تک منسلک نہیں ہے۔'
          : 'Firebase configuration is incomplete.'
      );
      setIsChecking(false);
      return;
    }

    try {
      // 1. Read live settings document from Firestore
      let settingsSnap = await getDoc(doc(db, 'hospital_config', 'main')).catch(() => null);
      if (!settingsSnap || !settingsSnap.exists()) {
        settingsSnap = await getDoc(doc(db, 'settings', 'main')).catch(() => null);
      }

      if (settingsSnap && settingsSnap.exists()) {
        const sData = settingsSnap.data();
        setDbWhatsapp(sData.whatsapp_number || sData.whatsapp || sData.contact?.whatsapp || '—');
        setDbPhone(formatDisplayPhone(sData.phone_emergency || sData.emergencyNumber || sData.contact?.emergencyNumber) || '—');
        setDbEmail(sData.email || sData.contact?.email || '—');
        setLastSavedTimestamp(sData.updatedAt ? new Date(sData.updatedAt).toLocaleString() : '—');
      }

      // 2. Fetch live collection sizes
      const [deptSnap, docSnap, srvSnap, galSnap, appSnap] = await Promise.all([
        getDocs(collection(db, 'departments')),
        getDocs(collection(db, 'doctors')),
        getDocs(collection(db, 'services')),
        getDocs(collection(db, 'gallery')),
        getDocs(collection(db, 'appointments'))
      ]);

      setCounts({
        departments: deptSnap.size,
        doctors: docSnap.size,
        services: srvSnap.size,
        gallery: galSnap.size,
        appointments: appSnap.size
      });

      setConnectionStatus('connected');
    } catch (err: any) {
      console.error('Firebase system check failure:', err);
      setConnectionStatus('error');
      setErrorMessage(err?.message || 'Failed to communicate with Cloud Firestore.');
    } finally {
      setIsChecking(false);
    }
  }, [isUrdu]);

  useEffect(() => {
    runFullCheck();
  }, [runFullCheck]);

  // Interactive Test Save
  const handleTestSave = async () => {
    setIsTestingSave(true);
    setTestSaveResult({ status: 'idle', message: isUrdu ? 'کلاؤڈ میں ٹیسٹ ڈیٹا لکھا جا رہا ہے...' : 'Testing Firestore write and read-back...' });

    const result = await testFirebaseConnection();

    if (result.success) {
      setTestSaveResult({
        status: 'success',
        message: isUrdu ? 'ڈیٹا بیس بالکل درست کام کر رہا ہے ✓' : 'Database working correctly ✓',
        latencyMs: result.latencyMs,
        details: isUrdu
          ? `فائر بیس پر لائیو ڈیٹا لکھنا اور پڑھنا ${result.latencyMs}ms میں کامیاب رہا!`
          : `Firestore write and immediate read-back verified in ${result.latencyMs}ms. Real-time multi-device sync is operational.`
      });
      await runFullCheck();
    } else {
      setTestSaveResult({
        status: 'error',
        message: isUrdu ? 'فائر بیس ٹیسٹ سیو ناکام رہا' : 'Database test failed',
        details: result.error || 'Please check your Firebase configuration and Firestore security rules.'
      });
    }
    setIsTestingSave(false);
  };

  // Import Old Data to Firestore
  const handleImportOldData = async () => {
    setIsImporting(true);
    setImportResult({ status: 'loading', message: isUrdu ? 'موجودہ ڈیٹا فائر بیس کلاؤڈ میں منتقل ہو رہا ہے...' : 'Uploading hospital data to Firestore...' });

    const res = await importOldDataToFirebase();
    if (res.success) {
      setImportResult({
        status: 'success',
        message: isUrdu
          ? `کامیابی! ${res.count} ریکارڈز (ڈاکٹرز، شعبہ جات، سروسز) فائر بیس کلاؤڈ میں محفوظ ہو گئے۔`
          : `Success! ${res.count} records saved to Cloud Firestore. Changes are now synced across all devices.`
      });
      await runFullCheck();
      await refetchData();
    } else {
      setImportResult({
        status: 'error',
        message: res.error || (isUrdu ? 'ڈیٹا منتقل کرنے میں ناکامی۔' : 'Failed to import data.')
      });
    }
    setIsImporting(false);
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'فائر بیس کلاؤڈ سنکرونائزیشن مانیٹر' : 'Cloud Firestore Real-Time Monitor'}</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
            {isUrdu ? 'سسٹم ہیلتھ و ڈیٹا بیس چیک' : 'System Check & Database Health'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isUrdu
              ? 'فائر بیس کلاؤڈ کنکشن، ریئل ٹائم سیو اور تمام ڈیوائسز پر فوری اپ ڈیٹس کی تصدیق کریں'
              : 'Verify real-time Firebase Cloud Firestore sync, live settings, and test instant multi-device writes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runFullCheck}
            disabled={isChecking}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : (isUrdu ? 'دوبارہ چیک کریں' : 'Refresh Check')}</span>
          </button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className={`rounded-2xl p-6 border transition-all ${
        connectionStatus === 'connected'
          ? 'bg-emerald-50/70 border-emerald-200 shadow-xs'
          : connectionStatus === 'checking'
          ? 'bg-blue-50/70 border-blue-200 shadow-xs'
          : 'bg-rose-50/70 border-rose-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500 text-white shadow-md'
                : connectionStatus === 'checking'
                ? 'bg-[#1E5AA8] text-white shadow-md'
                : 'bg-rose-500 text-white shadow-md'
            }`}>
              {connectionStatus === 'connected' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : connectionStatus === 'checking' ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {isUrdu ? 'ڈیٹا بیس کنکشن کی صورتحال:' : 'Firebase Firestore Status:'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : connectionStatus === 'checking'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {connectionStatus === 'connected'
                    ? 'Connected to Firebase ✓'
                    : connectionStatus === 'checking'
                    ? 'Checking Connection...'
                    : 'Not Connected'}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1 font-mono break-all">
                Project ID: <span className="font-semibold text-slate-800">{firebaseConfig.projectId}</span>
                {firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' && (
                  <span className="ml-2 text-slate-500">({firebaseConfig.firestoreDatabaseId})</span>
                )}
              </p>

              {errorMessage && (
                <div className="mt-2 text-xs font-medium text-rose-700 bg-white/90 p-3 rounded-lg border border-rose-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {isUrdu ? 'آخری محفوظ شدہ سیٹنگز' : 'Last Saved Settings Update'}
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#1E5AA8]" />
                <span>{lastSavedTimestamp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Live Values Stored in Firestore */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1E5AA8]" />
              <span>{isUrdu ? 'فائر بیس ڈیٹا بیس میں محفوظ لائیو ویلیوز' : 'Current Values Stored Directly in Cloud Firestore'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'تمام ڈیوائسز (موبائل، ٹیبلٹ، لیپ ٹاپ) پر ریئل ٹائم یہی ویلیوز نظر آتی ہیں'
                : 'Exact live values read in real-time from settings/main document in Cloud Firestore'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* WhatsApp Number */}
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2E9E5B] text-white flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                {isUrdu ? 'واٹس ایپ نمبر' : 'WhatsApp Number'}
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 truncate mt-0.5">
                {dbWhatsapp}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Clean: {cleanWhatsAppNumber(dbWhatsapp) || 'N/A'}
              </div>
            </div>
          </div>

          {/* Hospital Emergency Phone */}
          <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D62828] text-white flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-red-800 uppercase tracking-wider">
                {isUrdu ? 'ایمرجنسی و کال بٹن نمبر' : 'Call & Emergency Number'}
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 truncate mt-0.5">
                {dbPhone}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Rendered on header & dialer
              </div>
            </div>
          </div>

          {/* Hospital Official Email */}
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1E5AA8] text-white flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
                {isUrdu ? 'سرکاری ای میل ایڈریس' : 'Official Email'}
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 truncate mt-0.5">
                {dbEmail}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Synced with footer & contact
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Row Counts in Firestore */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#2E9E5B]" />
            <span>{isUrdu ? 'کلاؤڈ کلیکشنز میں ریکارڈز کی لائیو تعداد' : 'Live Document Counts in Cloud Firestore'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isUrdu
              ? 'براہِ راست فائر بیس کلاؤڈ فائر اسٹور کے درست ریکارڈز'
              : 'Exact document counts queried directly from your Cloud Firestore collections'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#1E5AA8] mx-auto flex items-center justify-center mb-1.5">
              <BuildingIcon className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{counts.departments}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Departments</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#2E9E5B] mx-auto flex items-center justify-center mb-1.5">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{counts.doctors}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Doctors</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 mx-auto flex items-center justify-center mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{counts.services}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Services</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-1.5">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{counts.gallery}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Gallery Images</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 col-span-2 sm:col-span-1">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 mx-auto flex items-center justify-center mb-1.5">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{counts.appointments}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Appointments</div>
          </div>
        </div>

        {/* Import Old Data to Firestore Button (Requirement 6) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              {isUrdu ? 'ڈیٹا مائیگریشن ٹول:' : 'One-Time Data Migration:'}
            </span>{' '}
            {isUrdu
              ? 'تمام ڈاکٹرز، شعبہ جات، سروسز اور سیٹنگز کو ایک کلک میں فائر بیس کلاؤڈ میں منتقل کریں۔'
              : 'Upload all doctors, departments, facilities, and settings directly to Cloud Firestore.'}
          </div>
          <button
            type="button"
            onClick={handleImportOldData}
            disabled={isImporting || !isFirebaseConfigured()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2 flex-shrink-0 self-start sm:self-auto"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${isImporting ? 'animate-spin' : ''}`} />
            <span>{isImporting ? (isUrdu ? 'منتقل ہو رہا ہے...' : 'Importing...') : (isUrdu ? 'موجودہ ڈیٹا فائر بیس میں لوڈ کریں' : 'Import Old Data to Firestore')}</span>
          </button>
        </div>

        {importResult.status !== 'idle' && (
          <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            importResult.status === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : importResult.status === 'loading'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {importResult.status === 'loading' && <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />}
            {importResult.status === 'success' && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            {importResult.status === 'error' && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            <span>{importResult.message}</span>
          </div>
        )}
      </div>

      {/* Interactive Test Save Button Card (Requirement 7) */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isUrdu ? 'فائر بیس ٹیسٹ سیو (Test Save)' : 'Interactive Firestore Test Save'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'فائر بیس پر ٹیسٹ ڈیٹا لکھ کر فوری پڑھتا ہے اور ملٹی ڈیوائس سنک کی تصدیق کرتا ہے'
                : 'Writes a test value to Firestore, reads it back, verifies latency, and confirms multi-device storage integrity'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestSave}
            disabled={isTestingSave || !isFirebaseConfigured()}
            className="px-5 py-2.5 rounded-xl bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingSave ? 'animate-spin' : ''}`} />
            <span>{isTestingSave ? 'Writing & Verifying...' : (isUrdu ? 'ٹیسٹ سیو چلائیں' : 'Test Save to Database')}</span>
          </button>
        </div>

        {/* Test Save Status Output Box */}
        {testSaveResult.status !== 'idle' && (
          <div className={`p-4 rounded-xl border transition-all animate-in fade-in ${
            testSaveResult.status === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-start gap-3">
              {testSaveResult.status === 'success' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base">
                    {testSaveResult.message}
                  </span>
                  {testSaveResult.latencyMs !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-200/60 text-emerald-900">
                      {testSaveResult.latencyMs} ms
                    </span>
                  )}
                </div>
                {testSaveResult.details && (
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {testSaveResult.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
);
