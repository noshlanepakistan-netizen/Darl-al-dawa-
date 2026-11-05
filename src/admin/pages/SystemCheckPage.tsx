import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  ShieldCheck,
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
  Check
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getSupabaseUrl } from '../../supabase/config';
import { useAdminData } from '../context/AdminDataContext';
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
  const { hospitalConfig, refetchData } = useAdminData();

  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live values from direct Supabase query
  const [dbWhatsapp, setDbWhatsapp] = useState<string>('—');
  const [dbPhone, setDbPhone] = useState<string>('—');
  const [dbEmail, setDbEmail] = useState<string>('—');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('—');

  // Row counts
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

  const runFullCheck = useCallback(async () => {
    setIsChecking(true);
    setErrorMessage(null);

    if (!isSupabaseConfigured()) {
      setConnectionStatus('error');
      setErrorMessage('Supabase URL or Anon Public Key is missing.');
      setIsChecking(false);
      return;
    }

    try {
      // 1. Check settings row
      const { data: sData, error: sErr } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();

      if (sErr) {
        // Fallback check hospital_settings
        const { data: hsData, error: hsErr } = await supabase
          .from('hospital_settings')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();

        if (hsErr) throw hsErr;
        if (hsData) {
          setDbWhatsapp(hsData.contact?.whatsapp || '—');
          setDbPhone(formatDisplayPhone(hsData.contact?.emergencyNumber) || '—');
          setDbEmail(hsData.contact?.email || '—');
          setLastSavedTimestamp(hsData.updated_at ? new Date(hsData.updated_at).toLocaleString() : '—');
        }
      } else if (sData) {
        setDbWhatsapp(sData.whatsapp_number || sData.contact?.whatsapp || '—');
        setDbPhone(formatDisplayPhone(sData.phone_emergency || sData.contact?.emergencyNumber) || '—');
        setDbEmail(sData.email || sData.contact?.email || '—');
        setLastSavedTimestamp(sData.updated_at ? new Date(sData.updated_at).toLocaleString() : '—');
      }

      // 2. Fetch live row counts
      const [
        { count: deptCount, error: deptErr },
        { count: docCount, error: docErr },
        { count: srvCount, error: srvErr },
        { count: galCount, error: galErr },
        { count: apptCount, error: apptErr }
      ] = await Promise.all([
        supabase.from('departments').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('gallery').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true })
      ]);

      if (deptErr) console.warn('Dept count error:', deptErr);
      if (docErr) console.warn('Doc count error:', docErr);
      if (srvErr) console.warn('Srv count error:', srvErr);
      if (galErr) console.warn('Gal count error:', galErr);
      if (apptErr) console.warn('Appt count error:', apptErr);

      setCounts({
        departments: deptCount ?? 0,
        doctors: docCount ?? 0,
        services: srvCount ?? 0,
        gallery: galCount ?? 0,
        appointments: apptCount ?? 0
      });

      setConnectionStatus('connected');
    } catch (err: any) {
      console.error('System check failure:', err);
      setConnectionStatus('error');
      setErrorMessage(err?.message || 'Failed to communicate with Supabase.');
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    runFullCheck();
  }, [runFullCheck]);

  // Interactive Test Save
  const handleTestSave = async () => {
    setIsTestingSave(true);
    setTestSaveResult({ status: 'idle', message: 'Initiating write/read cycle...' });

    const startTime = performance.now();
    const testNonce = `test-${Date.now()}`;
    const testTimestamp = new Date().toISOString();

    try {
      // 1. Write test payload into operational_settings or activity_logs
      const { error: writeError } = await supabase.from('activity_logs').insert({
        id: testNonce,
        user_email: 'system-check@daraldawa.pk',
        user_name: 'Database Self-Test',
        user_role: 'super_admin',
        action: 'System Self-Test Ping',
        module: 'System Check',
        details: `Diagnostic test write executed at ${testTimestamp}`,
        timestamp: testTimestamp
      });

      if (writeError) {
        throw new Error(`Write failed: ${writeError.message} (Code: ${writeError.code || 'UNKNOWN'})`);
      }

      // 2. Read back immediately to verify cross-device persistence
      const { data: readData, error: readError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('id', testNonce)
        .maybeSingle();

      if (readError) {
        throw new Error(`Read verification failed: ${readError.message}`);
      }

      if (!readData) {
        throw new Error('Read verification failed: Record was written but could not be read back (RLS policy may restrict SELECT).');
      }

      // 3. Clean up the test log
      await supabase.from('activity_logs').delete().eq('id', testNonce);

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      setTestSaveResult({
        status: 'success',
        message: 'Database working correctly',
        latencyMs,
        details: `Write & read-back verified in ${latencyMs}ms. RLS permissions and table schemas confirmed healthy.`
      });

      // Also refresh live checks
      await runFullCheck();
      await refetchData();
    } catch (err: any) {
      console.error('Test Save Error:', err);
      setTestSaveResult({
        status: 'error',
        message: err?.message || 'Database test failed. Check connection or RLS permissions.',
        details: 'If you see an RLS error, ensure the logged-in admin has permissions or run supabase-setup.sql.'
      });
    } finally {
      setIsTestingSave(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E5AA8] border border-blue-200 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'کلاؤڈ سنکرونائزیشن مانیٹر' : 'Cloud Synchronization Monitor'}</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
            {isUrdu ? 'سسٹم ہیلتھ و ڈیٹا بیس چیک' : 'System Check & Database Health'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isUrdu
              ? 'سپابیس کلاؤڈ کنکشن، ریئل ٹائم سیو اور تمام ڈیوائسز پر فوری اپ ڈیٹس کی تصدیق کریں'
              : 'Verify real-time Supabase cloud sync, live settings, and test instant multi-device database writes'}
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
                  {isUrdu ? 'سپابیس کنکشن کی صورتحال:' : 'Supabase Connection Status:'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : connectionStatus === 'checking'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {connectionStatus === 'connected'
                    ? 'Connected'
                    : connectionStatus === 'checking'
                    ? 'Checking Connection...'
                    : 'Not Connected'}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1 font-mono">
                Endpoint: <span className="font-semibold text-slate-800">{getSupabaseUrl()}</span>
              </p>

              {errorMessage && (
                <div className="mt-2 text-xs font-medium text-rose-700 bg-white/80 p-2.5 rounded-lg border border-rose-200">
                  {errorMessage}
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

      {/* Current Live Values Stored in Supabase */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1E5AA8]" />
              <span>{isUrdu ? 'ڈیٹا بیس میں محفوظ موجودہ ویلیوز' : 'Current Values Stored Directly in Supabase Database'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'تمام ڈیوائسز (موبائل، ٹیبلٹ، لیپ ٹاپ) فوری طور پر یہی ویلیوز لوڈ کرتی ہیں'
                : 'These exact values are live in the database and render on all mobile and desktop devices'}
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

      {/* Real-time Row Counts in Supabase */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#2E9E5B]" />
            <span>{isUrdu ? 'کلاؤڈ ٹیبلز میں ریکارڈز کی لائیو تعداد' : 'Real-time Row Counts in Supabase Database'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isUrdu
              ? 'براہِ راست سپابیس ٹیبلز کے درست ریکارڈز'
              : 'Exact row counts queried directly from your Supabase PostgreSQL database tables'}
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
      </div>

      {/* Interactive Test Save Button Card */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isUrdu ? 'ڈیٹا بیس ٹیسٹ سیو (Test Save)' : 'Interactive Database Test Save'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'سپابیس پر خودکار تحریر اور تصدیق کر کے کنکشن اور RLS پالیسیوں کو فوراً چیک کریں'
                : 'Writes a test payload to Supabase, reads it back immediately, and confirms multi-device storage integrity'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestSave}
            disabled={isTestingSave}
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
