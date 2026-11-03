import React from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  CalendarCheck,
  Users,
  UserCheck,
  CreditCard,
  Mail,
  FileCheck2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { DEPARTMENTS } from '../../data/hospitalData';

interface DashboardPageProps {
  onNavigate: (module: string) => void;
  lang: 'en' | 'ur';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, lang }) => {
  const { appointments, patients, doctors, invoices, messages, labReports, updateAppointmentStatus } = useAdminData();
  const { currentUser } = useAdminAuth();
  const isUrdu = lang === 'ur';

  // Metrics
  const todayStr = '2026-11-02';
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr || a.appointmentDate === '2026-11-03');
  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const todayRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.totalPKR, 0);

  // Department distribution for Donut Chart
  const deptCounts: Record<string, number> = {};
  appointments.forEach((a) => {
    deptCounts[a.departmentId] = (deptCounts[a.departmentId] || 0) + 1;
  });

  const deptChartData = Object.entries(deptCounts).map(([deptId, count]) => {
    const found = DEPARTMENTS.find((d) => d.id === deptId);
    return {
      name: found ? (isUrdu ? found.titleUrdu : found.title.split('&')[0].trim()) : deptId,
      count,
      pct: Math.round((count / Math.max(1, appointments.length)) * 100)
    };
  });

  // Daily appointments (last 10 days simulation)
  const dailyTrends = [
    { day: 'Oct 24', count: 18 },
    { day: 'Oct 26', count: 24 },
    { day: 'Oct 28', count: 31 },
    { day: 'Oct 30', count: 27 },
    { day: 'Nov 01', count: 38 },
    { day: 'Nov 02', count: 42 },
    { day: 'Nov 03', count: 35 }
  ];

  // Monthly Revenue (PKR Thousands)
  const monthlyRevenue = [
    { month: 'Jun', amount: 840 },
    { month: 'Jul', amount: 920 },
    { month: 'Aug', amount: 1150 },
    { month: 'Sep', amount: 1280 },
    { month: 'Oct', amount: 1450 },
    { month: 'Nov (Proj)', amount: 1600 }
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount));

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? `خوش آمدید، ${currentUser?.name}` : `Welcome back, ${currentUser?.name}`}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isUrdu ? 'لاہور کیمپس کی تمام او پی ڈی، لیب اور ریونیو کی تازہ ترین صورتحال۔' : 'Real-time overview of OPD bookings, diagnostics, patient admissions, and collections.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('appointments')}
            className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{isUrdu ? 'نئی اپوائنٹمنٹ درج کریں' : '+ New Appointment'}</span>
          </button>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {isUrdu ? 'آج کی اپوائنٹمنٹس' : "Today's OPD"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              {todayAppointments.length}
            </div>
            <div className="text-[11px] text-[#2E9E5B] font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Confirmations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {isUrdu ? 'زیرِ التواء' : 'Pending Review'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-600 font-heading">
              {pendingAppointments.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Requires OPD call
            </div>
          </div>
        </div>

        {/* Card 3: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {isUrdu ? 'مریضوں کا ریکارڈ' : 'Total Patients'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E9E5B] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              {patients.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Registered in MR
            </div>
          </div>
        </div>

        {/* Card 4: Total Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {isUrdu ? 'کنسلٹنٹ ڈاکٹرز' : 'Doctors On Duty'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              {doctors.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Specialist faculty
            </div>
          </div>
        </div>

        {/* Card 5: Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {isUrdu ? 'آج کا ریونیو' : "Today's Revenue"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E9E5B] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-extrabold text-[#1E5AA8] font-mono">
              Rs. {todayRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Counter + JazzCash
            </div>
          </div>
        </div>

        {/* Card 6: Inquiries & Messages */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {isUrdu ? 'نئے پیغامات' : 'Inquiries'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#D62828] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#D62828] font-heading">
              {messages.filter((m) => !m.read).length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Unread inquiries
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Appointments Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {isUrdu ? 'روزانہ مریضوں کی تعداد کا رجحان' : 'Daily Patient Appointments Trend'}
              </h3>
              <p className="text-xs text-slate-500">Past days volume across Lahore OPD Clinics</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1E5AA8]">
              OPD Growth
            </span>
          </div>

          {/* SVG Trend Line / Bar representation */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {dailyTrends.map((t, idx) => {
              const heightPct = Math.round((t.count / 50) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.count}
                  </span>
                  <div className="w-full max-w-[36px] bg-blue-100 group-hover:bg-[#1E5AA8] rounded-t-lg transition-colors relative" style={{ height: `${heightPct}%` }}>
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-[#1E5AA8] rounded-t-lg" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{t.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Department-wise Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {isUrdu ? 'شعبہ جات کے مطابق تناسب' : 'Department Distribution'}
              </h3>
              <p className="text-xs text-slate-500">Breakdown of patient consultations</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {deptChartData.slice(0, 5).map((dept, idx) => {
              const colors = ['bg-[#1E5AA8]', 'bg-[#2E9E5B]', 'bg-indigo-600', 'bg-amber-500', 'bg-rose-500'];
              const color = colors[idx % colors.length];

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{dept.name}</span>
                    <span className="font-mono text-slate-500">{dept.count} cases ({dept.pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(10, dept.pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row 3: Monthly Revenue Bar Chart & Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Revenue Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {isUrdu ? 'ماہانہ آمدنی (ہزار روپے)' : 'Monthly Revenue (Rs. in Thousands)'}
              </h3>
              <p className="text-xs text-slate-500">Fiscal collections from consultations & diagnostics</p>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {monthlyRevenue.map((m, idx) => {
              const heightPct = Math.round((m.amount / maxRevenue) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-[#2E9E5B] opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.amount}k
                  </span>
                  <div className="w-full max-w-[32px] bg-emerald-100 group-hover:bg-[#2E9E5B] rounded-t-lg transition-colors relative" style={{ height: `${heightPct}%` }}>
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-[#2E9E5B] rounded-t-lg" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Appointments Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {isUrdu ? 'حالیہ آن لائن بکنگز' : 'Recent Patient Appointments'}
              </h3>
              <p className="text-xs text-slate-500">Quickly confirm or manage recent OPD bookings</p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs text-[#1E5AA8] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2.5 font-semibold">Token / Patient</th>
                  <th className="pb-2.5 font-semibold">Date & Slot</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.slice(0, 4).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5">
                      <div className="font-bold text-slate-900">{app.patientName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{app.token} • {app.phone}</div>
                    </td>
                    <td className="py-2.5 text-slate-600">
                      <div>{app.appointmentDate}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{app.timeSlot}</div>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'confirmed'
                            ? 'bg-emerald-100 text-[#2E9E5B]'
                            : app.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {app.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#2E9E5B] hover:bg-[#2E9E5B] hover:text-white font-semibold text-[11px] transition-colors"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigate('appointments')}
                          className="text-slate-400 hover:text-slate-600 text-[11px]"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
