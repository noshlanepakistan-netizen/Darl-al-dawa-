import React, { useState } from 'react';
import { usePatientAuth } from '../../context/PatientAuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ur';
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const PatientAuthModal: React.FC<PatientAuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'login'
}) => {
  const { login, signUp, loginWithGoogle, forgotPassword } = usePatientAuth();
  const isUrdu = lang === 'ur';

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sign in fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('Lahore');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccess(
          isUrdu
            ? 'گوگل اکاؤنٹ سے کامیابی کے ساتھ لاگ ان ہو گیا!'
            : 'Signed in with Google successfully!'
        );
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(res.error || 'Google sign-in failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const renderGoogleButton = (label: string) => (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading || googleLoading}
      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 disabled:opacity-60"
    >
      {googleLoading ? (
        <div className="w-4 h-4 border-2 border-[#1E5AA8] border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>
        {googleLoading
          ? (isUrdu ? 'گوگل سے تصدیق ہو رہی ہے...' : 'Connecting to Google...')
          : label}
      </span>
    </button>
  );

  const renderOrDivider = (dividerText: string) => (
    <div className="relative flex items-center justify-center my-3.5">
      <div className="border-t border-slate-200 w-full" />
      <span className="bg-white px-2.5 text-[11px] font-medium text-slate-400 shrink-0">
        {dividerText}
      </span>
    </div>
  );

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(isUrdu ? 'پاس ورڈ مماثل نہیں ہیں۔' : 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError(isUrdu ? 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp({
        fullName,
        phone,
        email,
        password,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        city
      });

      if (res.success) {
        setSuccess(
          isUrdu
            ? 'اکاؤنٹ کامیابی سے بن گیا ہے! پورٹل لاگ ان ہو رہا ہے۔'
            : 'Patient account created successfully! You are now logged in.'
        );
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await forgotPassword(forgotEmail);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto ${isUrdu ? 'font-urdu' : 'font-body'}`}>
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1E5AA8] to-[#154685] p-6 text-white relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase block">
                {isUrdu ? 'دار الدواء میڈیکل سنٹر' : 'Dar al Dawa Medical Center'}
              </span>
              <h3 className="text-lg font-bold">
                {mode === 'login' && (isUrdu ? 'مریض پورٹل لاگ ان' : 'Patient Portal Sign In')}
                {mode === 'signup' && (isUrdu ? 'نیا مریض اکاؤنٹ بنائیں' : 'Create Patient Account')}
                {mode === 'forgot' && (isUrdu ? 'پاس ورڈ ری سیٹ کریں' : 'Reset Patient Password')}
              </h3>
            </div>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            {isUrdu
              ? 'آن لائن اپوائنٹمنٹس، تشخیصی رپورٹس اور ہسپتال نوٹیفکیشنز تک براہ راست رسائی۔'
              : 'Direct access to your appointments, lab reports, and live hospital notifications.'}
          </p>

          {/* Navigation Pill Tabs */}
          {mode !== 'forgot' && (
            <div className="flex rounded-xl bg-black/20 p-1 mt-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#1E5AA8] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {isUrdu ? 'لاگ ان کریں' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#1E5AA8] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {isUrdu ? 'نیا اکاؤنٹ (رجسٹر)' : 'Sign Up (Register)'}
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            error.startsWith('UNAUTHORIZED_DOMAIN:') || error.includes('unauthorized-domain') ? (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 text-xs space-y-2.5">
                <div className="flex items-start gap-2 text-amber-900">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold block text-[13px]">
                      {isUrdu ? 'نیٹلی فائی پر گوگل لاگ ان کی منظوری درکار ہے' : 'Google Auth: Domain Authorization Required'}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {isUrdu
                        ? `گوگل کے حفاظتی اصول کے مطابق اس نیٹلی فائی ڈومین (${error.split(':')[1] || (typeof window !== 'undefined' ? window.location.hostname : 'Netlify')}) کو فائر بیس کی "Authorized domains" لسٹ میں شامل کرنا ضروری ہے۔`
                        : `Google security requires '${error.split(':')[1] || (typeof window !== 'undefined' ? window.location.hostname : 'Netlify')}' to be added to Firebase Authorized Domains.`}
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      const domain = error.split(':')[1] || (typeof window !== 'undefined' ? window.location.hostname : 'daraldawa.netlify.app');
                      navigator.clipboard.writeText(domain);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2500);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-semibold text-slate-700 hover:bg-amber-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedDomain ? (isUrdu ? 'کاپی ہو گیا ✓' : 'Copied ✓') : (isUrdu ? `کاپی ڈومین نام` : `Copy Domain`)}</span>
                  </button>

                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0019179268/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'فائر بیس اتھورائزڈ سیٹنگز کھولیں' : 'Open Firebase Console Settings'}</span>
                  </a>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                  <span className="font-bold">{isUrdu ? '💡 فوری حل:' : '💡 Instant Access:'}</span>{' '}
                  {isUrdu
                    ? 'آپ نیچے دیے گئے فارم میں ای میل اور پاس ورڈ سے براہِ راست فوری سائن ان یا نیا اکاؤنٹ رجسٹر کر سکتے ہیں، یہ 100% فعال ہے!'
                    : 'You can sign in or register with Email & Password below right now, it works 100% without domain restrictions!'}
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <div className="space-y-4">
              {renderGoogleButton(isUrdu ? 'گوگل کے ساتھ جاری رکھیں' : 'Continue with Google')}
              {renderOrDivider(isUrdu ? 'یا ای میل کے ذریعے' : 'or continue with email')}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isUrdu ? 'ای میل ایڈریس' : 'Email Address'} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      {isUrdu ? 'پاس ورڈ' : 'Password'} *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-[11px] text-[#1E5AA8] hover:underline font-semibold cursor-pointer"
                    >
                      {isUrdu ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#1E5AA8] outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{loading ? (isUrdu ? 'لاگ ان ہو رہا ہے...' : 'Signing in...') : (isUrdu ? 'مریض اکاؤنٹ میں داخل ہوں' : 'Sign In to Portal')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center text-slate-500 text-[11px]">
                  <span>{isUrdu ? 'پہلی بار تشریف لائے ہیں؟ ' : "Don't have an account? "}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="text-[#2E9E5B] font-bold hover:underline cursor-pointer"
                  >
                    {isUrdu ? 'یہاں رجسٹر ہوں' : 'Register Here'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <div className="space-y-3">
              {renderGoogleButton(isUrdu ? 'گوگل کے ساتھ سائن اپ کریں' : 'Continue with Google')}
              {renderOrDivider(isUrdu ? 'یا فارم پُر کر کے رجسٹر ہوں' : 'or register with form')}

              <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isUrdu ? 'مکمل نام' : 'Full Name'} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isUrdu ? 'محمد احمد' : 'e.g. Muhammad Ahmed'}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isUrdu ? 'موبائل نمبر' : 'Phone Number'} *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:border-[#1E5AA8] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isUrdu ? 'ای میل ایڈریس' : 'Email Address'} *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#1E5AA8] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isUrdu ? 'پاس ورڈ' : 'Password'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:border-[#1E5AA8] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isUrdu ? 'پاس ورڈ کی تصدیق' : 'Confirm Password'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:border-[#1E5AA8] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isUrdu ? 'جنس' : 'Gender'} *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                    >
                      <option value="Male">{isUrdu ? 'مرد' : 'Male'}</option>
                      <option value="Female">{isUrdu ? 'خاتون' : 'Female'}</option>
                      <option value="Other">{isUrdu ? 'دیگر' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isUrdu ? 'تاریخ پیدائش' : 'Date of Birth'}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isUrdu ? 'شہر' : 'City'} *
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lahore"
                        className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{loading ? (isUrdu ? 'اکاؤنٹ بن رہا ہے...' : 'Creating Account...') : (isUrdu ? 'مریض اکاؤنٹ رجسٹر کریں' : 'Complete Registration')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center text-slate-500 text-[11px]">
                  <span>{isUrdu ? 'پہلے سے اکاؤنٹ موجود ہے؟ ' : 'Already have an account? '}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-[#1E5AA8] font-bold hover:underline cursor-pointer"
                  >
                    {isUrdu ? 'یہاں لاگ ان کریں' : 'Sign In'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600 text-xs">
                {isUrdu
                  ? 'اپنا رجسٹرڈ ای میل ایڈریس درج کریں۔ ہم آپ کو پاس ورڈ ری سیٹ کا محفوظ لنک ارسال کریں گے۔'
                  : 'Enter your registered email address and we will send a password reset link to your inbox.'}
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isUrdu ? 'ای میل ایڈریس' : 'Email Address'} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#1E5AA8] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? (isUrdu ? 'ارسال ہو رہا ہے...' : 'Sending link...') : (isUrdu ? 'ری سیٹ لنک بھیجیں' : 'Send Reset Link')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-xs text-slate-600 hover:text-[#1E5AA8] font-semibold cursor-pointer"
                >
                  ← {isUrdu ? 'واپس لاگ ان کی طرف' : 'Back to Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
