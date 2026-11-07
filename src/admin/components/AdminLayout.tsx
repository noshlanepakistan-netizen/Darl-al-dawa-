import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminData } from '../context/AdminDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { tagAdminDevice } from '../../utils/oneSignal';
import { Logo } from '../../components/Logo';
import {
  LayoutDashboard,
  CalendarCheck,
  UserCheck,
  Building,
  Sparkles,
  Users,
  FileCheck2,
  Receipt,
  LayoutTemplate,
  Mail,
  ShieldAlert,
  Settings,
  Menu,
  X,
  Bell,
  Globe,
  LogOut,
  ChevronDown,
  ExternalLink,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase/config';
import { StaffRole } from '../types';

interface AdminLayoutProps {
  currentModule: string;
  onSelectModule: (moduleName: string) => void;
  onGoHome: () => void;
  lang: 'en' | 'ur';
  onToggleLang: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentModule,
  onSelectModule,
  onGoHome,
  lang,
  onToggleLang,
  children
}) => {
  const { currentUser, logout, canAccess, inactivityRemainingSeconds } = useAdminAuth();
  const { appointments, messages, labReports } = useAdminData();
  const { notifications, unreadCount, markAsRead, markAllAsRead, sendTestNotification } = useNotifications();
  const isUrdu = lang === 'ur';

  // Tag device as admin for push notifications
  useEffect(() => {
    tagAdminDevice();
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Unread / pending badges
  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'pending').length;
  const unreadMessagesCount = messages.filter((m) => !m.read).length;
  const processingReportsCount = labReports.filter((r) => r.status === 'processing').length;

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: isUrdu ? 'ڈیش بورڈ' : 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: isUrdu ? 'اپوائنٹمنٹس' : 'Appointments', icon: CalendarCheck, badge: pendingAppointmentsCount },
    { id: 'doctors', label: isUrdu ? 'ڈاکٹرز مینیجر' : 'Doctors', icon: UserCheck },
    { id: 'departments', label: isUrdu ? 'شعبہ جات' : 'Departments', icon: Building },
    { id: 'services_packages', label: isUrdu ? 'سہولیات و پیکیجز' : 'Services & Packages', icon: Sparkles },
    { id: 'patients', label: isUrdu ? 'مریضوں کا ریکارڈ' : 'Patients Registry', icon: Users },
    { id: 'lab_reports', label: isUrdu ? 'لیب رپورٹس پورٹل' : 'Lab Reports Portal', icon: FileCheck2, badge: processingReportsCount },
    { id: 'billing', label: isUrdu ? 'بلنگ و انوائسز' : 'Billing & Invoices', icon: Receipt },
    { id: 'content', label: isUrdu ? 'ویب سائٹ مواد (CMS)' : 'Website Content (CMS)', icon: LayoutTemplate },
    { id: 'messages', label: isUrdu ? 'پیغامات و انکوائریز' : 'Messages / Inbox', icon: Mail, badge: unreadMessagesCount },
    { id: 'users', label: isUrdu ? 'صارفین و رولز' : 'Users & Roles', icon: ShieldAlert },
    { id: 'settings', label: isUrdu ? 'سیٹنگز' : 'Settings', icon: Settings },
    { id: 'system_check', label: isUrdu ? 'سسٹم چیک' : 'System Check', icon: Activity },
  ];

  const filteredNavItems = navItems.filter((item) => canAccess(item.id));

  // Role labels
  const roleDisplayNames: Record<StaffRole, string> = {
    super_admin: 'Super Admin',
    receptionist: 'Receptionist',
    doctor: 'Consultant Doctor',
    lab_staff: 'Lab Technologist'
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
  };

  return (
    <div className={`min-h-screen bg-[#F7FAFC] flex ${isUrdu ? 'font-urdu' : 'font-body'}`}>
      
      {/* Desktop Left Sidebar (Charcoal #1F2933) */}
      <aside
        className={`hidden lg:flex flex-col bg-[#1F2933] text-slate-300 border-r border-slate-800 transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!sidebarCollapsed ? (
            <button onClick={onGoHome} type="button" className="text-left cursor-pointer">
              <Logo lightMode={true} isUrdu={isUrdu} />
            </button>
          ) : (
            <button onClick={onGoHome} type="button" className="w-10 h-10 rounded-xl overflow-hidden bg-white p-1 border border-slate-700 flex items-center justify-center cursor-pointer shadow-xs">
              <img src="/assets/aistudio/image_424d9421.png" alt="Logo" className="w-full h-full object-contain" />
            </button>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Quick Info Banner */}
        {!sidebarCollapsed && currentUser && (
          <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-600"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#1E5AA8] text-white uppercase tracking-wider">
                {roleDisplayNames[currentUser.role]}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1E5AA8] text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!sidebarCollapsed && item.badge ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D62828] text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions: View Public Site & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            type="button"
            onClick={onGoHome}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Open Public Website"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>{isUrdu ? 'عوامی ویب سائٹ دیکھیں' : 'View Public Site'}</span>}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>}
          </button>
          {!sidebarCollapsed && (
            <div className="pt-2 text-[10px] text-slate-500 text-center font-mono border-t border-slate-800/80">
              v2.5.0 • Firebase Cloud Live
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 bg-[#1F2933] text-slate-300 flex flex-col p-4 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <Logo lightMode={true} isUrdu={isUrdu} />
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectModule(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-[#1E5AA8] text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D62828] text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={onGoHome}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 text-emerald-400 text-xs font-semibold flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isUrdu ? 'عوامی ویب سائٹ' : 'Public Website'}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-lg bg-red-950/60 text-red-400 text-xs font-semibold flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          {/* Left: Mobile trigger & breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {isUrdu ? 'دار الدواء ایڈمن پینل' : 'Dar al Dawa Admin CMS'}
              </div>
              <h2 className={`text-base sm:text-lg font-bold text-slate-900 capitalize ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {navItems.find((n) => n.id === currentModule)?.label || currentModule}
              </h2>
            </div>
          </div>

          {/* Right Controls: Search, Lang, Notifications, Header Logout Button, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language toggle */}
            <button
              onClick={onToggleLang}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#1E5AA8]" />
              <span>{isUrdu ? 'English' : 'اردو'}</span>
            </button>

            {/* View Public Website */}
            <button
              onClick={onGoHome}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'عوامی ویب سائٹ' : 'Public Site'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#D62828] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : (pendingAppointmentsCount + unreadMessagesCount > 0 ? (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                ) : null)}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Live Hospital Notifications</span>
                      <span className="text-[10px] text-slate-400">Appointments, Registrations & Alerts</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllAsRead()}
                        className="text-[11px] font-semibold text-[#1E5AA8] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.type.includes('appointment')) onSelectModule('appointments');
                            else if (n.type.includes('patient')) onSelectModule('patients');
                            else if (n.type.includes('message')) onSelectModule('messages');
                            setShowNotifications(false);
                          }}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            n.read
                              ? 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                              : 'bg-blue-50/80 border-blue-200 hover:bg-blue-100/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 text-[11px] truncate">{n.title}</span>
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        sendTestNotification('admin');
                      }}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-3 h-3 text-emerald-600" />
                      <span>Test Audio & Push Chime</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectModule('settings');
                        setShowNotifications(false);
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Settings
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prominent Header Logout Button */}
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#D62828] border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              title={isUrdu ? 'پورٹل سے لاگ آؤٹ کریں' : 'Sign Out of Admin Portal'}
            >
              <LogOut className="w-3.5 h-3.5 text-[#D62828]" />
              <span className="hidden xs:inline">{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in">
                  <div className="p-2 border-b border-slate-100">
                    <div className="font-bold text-sm text-slate-900 truncate">{currentUser?.name}</div>
                    <div className="text-xs text-slate-500 truncate">{currentUser?.email}</div>
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E5AA8] text-white">
                      {currentUser?.role ? roleDisplayNames[currentUser.role] : 'Administrator'}
                    </div>
                  </div>

                  <div className="py-2 border-b border-slate-100 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectModule('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isUrdu ? 'سسٹم سیٹنگز' : 'Settings & Password'}</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Inactivity warning banner if near expiration (< 5 minutes) */}
        {inactivityRemainingSeconds < 300 && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4" />
              <span>
                Session will expire in {Math.floor(inactivityRemainingSeconds / 60)}m {inactivityRemainingSeconds % 60}s due to inactivity. Move mouse or click to stay logged in.
              </span>
            </div>
          </div>
        )}

        {/* Unconfigured Firebase warning banner */}
        {!isFirebaseConfigured() && currentModule !== 'system_check' && (
          <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-4 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                {isUrdu
                  ? 'توجہ: فائر بیس کلاؤڈ ڈیٹا بیس منسلک نہیں ہے۔ تمام ڈیوائسز پر لائیو ڈیٹا سنک کرنے کے لیے سسٹم چیک میں جائیں۔'
                  : 'Notice: Firebase Cloud Database is not connected. Open System Check to verify credentials for instant multi-device sync.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectModule('system_check')}
              className="px-3 py-1 rounded-md bg-white text-rose-700 font-bold hover:bg-rose-50 transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
            >
              {isUrdu ? 'ابھی جوڑیں (Connect Now)' : 'Connect Now'}
            </button>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
};
