import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminData } from '../context/AdminDataContext';
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
  Search,
  Globe,
  LogOut,
  ChevronDown,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
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
  const { currentUser, logout, canAccess, switchRole, inactivityRemainingSeconds } = useAdminAuth();
  const { appointments, messages, labReports } = useAdminData();
  const isUrdu = lang === 'ur';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

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
  ];

  const filteredNavItems = navItems.filter((item) => canAccess(item.id));

  // Role labels
  const roleDisplayNames: Record<StaffRole, string> = {
    super_admin: 'Super Admin',
    receptionist: 'Receptionist',
    doctor: 'Consultant Doctor',
    lab_staff: 'Lab Technologist'
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
            onClick={logout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>}
          </button>
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
                onClick={logout}
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

          {/* Right Controls: Search, Lang, Notifications, Profile */}
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
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {pendingAppointmentsCount + unreadMessagesCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#D62828] ring-2 ring-white" />
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-900">Recent Alerts & Requests</span>
                    <span className="text-[10px] text-slate-400">Live Hospital Feed</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                    {appointments.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onSelectModule('appointments');
                          setShowNotifications(false);
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 cursor-pointer transition-colors border border-slate-100"
                      >
                        <div className="font-semibold text-slate-800">{a.patientName}</div>
                        <div className="text-[11px] text-slate-500">
                          {a.token} • {a.appointmentDate} ({a.status})
                        </div>
                      </div>
                    ))}

                    {messages.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelectModule('messages');
                          setShowNotifications(false);
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 cursor-pointer transition-colors border border-slate-100"
                      >
                        <div className="font-semibold text-slate-800">{m.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{m.subject}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                      {currentUser?.role ? roleDisplayNames[currentUser.role] : 'Staff'}
                    </div>
                  </div>

                  {/* Switch Role Fast Tester */}
                  <div className="py-2 border-b border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                      Switch Role (Testing)
                    </div>
                    {(['super_admin', 'receptionist', 'doctor', 'lab_staff'] as StaffRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          switchRole(r);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          currentUser?.role === r ? 'bg-blue-50 text-[#1E5AA8] font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{roleDisplayNames[r]}</span>
                        {currentUser?.role === r && <CheckCircle2 className="w-3 h-3 text-[#1E5AA8]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
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

        {/* Inactivity warning banner if near expiration (< 2 minutes) */}
        {inactivityRemainingSeconds < 120 && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4" />
              <span>
                Session expiring in {inactivityRemainingSeconds}s due to inactivity. Move mouse to stay logged in.
              </span>
            </div>
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
