import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Logo } from '../../components/Logo';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Clock } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onGoHome: () => void;
  lang: 'en' | 'ur';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoHome, lang }) => {
  const { login, lockoutRemainingSeconds } = useAdminAuth();
  const isUrdu = lang === 'ur';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isLockedOut = lockoutRemainingSeconds > 0;

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg(isUrdu ? 'براہ کرم صارف نام اور پاس ورڈ درج کریں۔' : 'Invalid username or password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password, rememberMe);
      if (result.success) {
        onSuccess();
      } else {
        setErrorMsg(result.error || (isUrdu ? 'صارف کا نام یا پاس ورڈ غلط ہے۔' : 'Invalid username or password'));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isUrdu ? 'لاگ ان ناکام ہو گیا۔' : 'Invalid username or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAFC] via-blue-50/50 to-slate-100 flex items-center justify-center p-4 selection:bg-[#1E5AA8] selection:text-white">
      <div className="max-w-md w-full">
        {/* Card Header & Branding */}
        <div className="text-center mb-6">
          <button
            onClick={onGoHome}
            type="button"
            className="inline-block hover:opacity-90 transition-opacity mb-4 cursor-pointer"
            title="Dar al Dawa Medical Center"
          >
            <Logo isUrdu={isUrdu} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-[#1E5AA8] mb-2 border border-blue-200/60 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E9E5B]" />
            <span>{isUrdu ? 'محفوظ ایڈمنسٹریشن پورٹل' : 'Authorized Access Only'}</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-extrabold text-[#1F2933] ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
            {isUrdu ? 'ایڈمن لاگ ان' : 'Admin Login'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isUrdu
              ? 'ہسپتال کے ایڈمن پینل تک رسائی کے لیے صارف نام اور پاس ورڈ درج کریں۔'
              : 'Sign in with your authorized credentials to manage hospital records, doctors, appointments and website content.'}
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative overflow-hidden">
          {/* Subtle top decorative bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E5AA8] via-blue-500 to-[#2E9E5B]" />

          {/* Lockout Warning Banner */}
          {isLockedOut ? (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3 animate-in fade-in">
              <Clock className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-amber-900">
                  {isUrdu ? 'لاگ ان عارضی طور پر بند ہے' : 'Login Temporarily Locked'}
                </div>
                <div className="mt-1 text-amber-800 leading-relaxed">
                  {isUrdu
                    ? `5 غلط کوششوں کی وجہ سے یہ ڈیوائس 5 منٹ کے لیے لاک ہو گئی ہے۔ دوبارہ کوشش کریں: ${formatLockoutTime(lockoutRemainingSeconds)}`
                    : `Too many failed attempts. Login is blocked for 5 minutes on this device. Please wait: ${formatLockoutTime(lockoutRemainingSeconds)}`}
                </div>
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {errorMsg && !isLockedOut && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#D62828]" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className={`block text-xs font-bold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'صارف نام (Username)' : 'Username'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  disabled={isLockedOut || loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="DAR AL DAWA"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isUrdu ? 'نام بڑے یا چھوٹے حروف میں لکھا جا سکتا ہے' : 'Enter username: DAR AL DAWA'}
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-xs font-bold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'پاس ورڈ (Password)' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLockedOut || loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:bg-slate-100"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isLockedOut}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isLockedOut}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1E5AA8] focus:ring-[#1E5AA8] w-4 h-4 border-slate-300 cursor-pointer"
                />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'مجھے یاد رکھیں' : 'Remember session'}</span>
              </label>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E9E5B]" />
                <span>Supabase Protected</span>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || isLockedOut}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {loading
                  ? (isUrdu ? 'لاگ ان ہو رہا ہے...' : 'Authenticating...')
                  : isLockedOut
                  ? (isUrdu ? `لاک ہے (${formatLockoutTime(lockoutRemainingSeconds)})` : `Locked (${formatLockoutTime(lockoutRemainingSeconds)})`)
                  : (isUrdu ? 'لاگ ان کریں' : 'Login to Admin Panel')}
              </span>
              {!loading && !isLockedOut && <ArrowRight className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />}
            </button>
          </form>
        </div>

        {/* Back to public website button */}
        <div className="text-center mt-5">
          <button
            onClick={onGoHome}
            type="button"
            className="text-xs text-slate-500 hover:text-[#1E5AA8] font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-100"
          >
            <span>←</span>
            <span>{isUrdu ? 'عوامی ویب سائٹ پر واپس جائیں' : 'Back to Public Hospital Website'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
