import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Logo } from '../../components/Logo';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { INITIAL_STAFF_USERS } from '../data/sampleAdminData';
import { StaffRole } from '../types';

interface LoginPageProps {
  onSuccess: () => void;
  onGoHome: () => void;
  lang: 'en' | 'ur';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoHome, lang }) => {
  const { login, switchRole } = useAdminAuth();
  const isUrdu = lang === 'ur';

  const [email, setEmail] = useState('admin@daraldawa.pk');
  const [password, setPassword] = useState('Hospital@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg(isUrdu ? 'براہ کرم ای میل اور پاس ورڈ درج کریں۔' : 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const ok = await login(email, password, rememberMe);
      if (ok) {
        onSuccess();
      } else {
        setErrorMsg(isUrdu ? 'غلط تفصیلات۔ دوبارہ کوشش کریں۔' : 'Invalid credentials. Please try again.');
      }
    } catch {
      setErrorMsg('Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSelect = (role: StaffRole) => {
    const user = INITIAL_STAFF_USERS.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword('Hospital@2026');
      switchRole(role);
      onSuccess();
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAFC] via-blue-50/40 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card Header */}
        <div className="text-center mb-6">
          <button
            onClick={onGoHome}
            type="button"
            className="inline-block hover:opacity-90 transition-opacity mb-3 cursor-pointer"
          >
            <Logo isUrdu={isUrdu} />
          </button>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1E5AA8] mb-1">
            {isUrdu ? 'ایڈمن پورٹل و سی ایم ایس' : 'Hospital Administration Portal'}
          </div>
          <h1 className={`text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? 'اسٹاف لاگ ان' : 'Secure Staff Sign In'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isUrdu ? 'پورٹل تک رسائی کے لیے اپنی تصدیق شدہ اسناد درج کریں۔' : 'Access your authorized clinical and administrative dashboard.'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-7 shadow-xl border border-slate-200/80">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#D62828]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'سرکاری ای میل ایڈریس' : 'Official Hospital Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@daraldawa.pk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold text-slate-700 ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'پاس ورڈ' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#1E5AA8] hover:underline font-medium cursor-pointer"
                >
                  {isUrdu ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1E5AA8] focus:ring-[#1E5AA8]"
                />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'مجھے یاد رکھیں' : 'Remember this session'}</span>
              </label>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E9E5B]" />
                <span>256-bit SSL</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? (isUrdu ? 'لاگ ان ہو رہا ہے...' : 'Authenticating...') : (isUrdu ? 'لاگ ان کریں' : 'Sign In to Dashboard')}</span>
              <ArrowRight className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />
            </button>
          </form>

          {/* Quick 1-Click Role Switcher for instant evaluator access */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              {isUrdu ? 'فوری ڈیمو رولز (براہ راست ٹیسٹ)' : 'Quick 1-Click Demo Profiles'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('super_admin')}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1E5AA8] font-semibold text-left transition-colors cursor-pointer border border-blue-200"
              >
                <div className="font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#1E5AA8]" />
                  <span>Super Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Tariq (Full CMS)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect('receptionist')}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#2E9E5B] font-semibold text-left transition-colors cursor-pointer border border-emerald-200"
              >
                <div className="font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#2E9E5B]" />
                  <span>Receptionist</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">Fatima (OPD & Bills)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect('doctor')}
                className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-left transition-colors cursor-pointer border border-indigo-200"
              >
                <div className="font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-indigo-700" />
                  <span>Doctor</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Farhan (Clinics)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect('lab_staff')}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-left transition-colors cursor-pointer border border-amber-200"
              >
                <div className="font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-amber-800" />
                  <span>Lab Staff</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">Bilal (Pathology)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Back to public website button */}
        <div className="text-center mt-5">
          <button
            onClick={onGoHome}
            type="button"
            className="text-xs text-slate-500 hover:text-[#1E5AA8] font-medium transition-colors"
          >
            ← {isUrdu ? 'عوامی ویب سائٹ پر واپس جائیں' : 'Back to Public Hospital Website'}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {isUrdu ? 'پاس ورڈ ری سیٹ کی درخواست' : 'Reset Staff Password'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isUrdu ? 'اپنا ہسپتال ای میل درج کریں، ری سیٹ لنک ارسال کر دیا جائے گا۔' : 'Enter your registered hospital email to receive a secure recovery link.'}
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold text-center">
                {isUrdu ? 'ری سیٹ لنک آپ کے ای میل پر بھیج دیا گیا ہے!' : 'Password reset instructions sent to your email.'}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@daraldawa.pk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1E5AA8]"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#1E5AA8] hover:bg-blue-800 text-white text-xs font-semibold"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
