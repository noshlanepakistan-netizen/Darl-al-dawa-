import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  Phone,
  MessageSquare,
  Check,
  X,
  Trash2,
  Calendar,
  Clock,
  User,
  Copy,
  AlertCircle
} from 'lucide-react';
import { DEPARTMENTS, DOCTORS, HOSPITAL_CONFIG } from '../../data/hospitalData';
import { AdminAppointment, AppointmentStatus } from '../types';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface AppointmentsPageProps {
  lang: 'en' | 'ur';
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ lang }) => {
  const { appointments, addAppointment, updateAppointmentStatus, deleteAppointment, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminAppointment | null>(null);

  // Add Manual Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCnic, setNewCnic] = useState('');
  const [newDept, setNewDept] = useState(DEPARTMENTS[0].id);
  const [newDoc, setNewDoc] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newSlot, setNewSlot] = useState('evening');
  const [newNotes, setNewNotes] = useState('');

  // Filter logic
  const filteredAppointments = appointments.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      app.patientName.toLowerCase().includes(q) ||
      app.phone.includes(q) ||
      app.token.toLowerCase().includes(q) ||
      (app.cnic && app.cnic.includes(q));

    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchDept = deptFilter === 'all' || app.departmentId === deptFilter;
    const matchDate = !dateFilter || app.appointmentDate === dateFilter;

    return matchSearch && matchStatus && matchDept && matchDate;
  });

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showToast('Please fill patient name and mobile number', 'error');
      return;
    }

    const token = `DAD-${Math.floor(100000 + Math.random() * 900000)}`;
    addAppointment({
      token,
      patientName: newName.trim(),
      phone: newPhone.trim(),
      cnic: newCnic.trim(),
      departmentId: newDept,
      doctorId: newDoc || undefined,
      appointmentDate: newDate,
      timeSlot: newSlot,
      patientType: 'new',
      notes: newNotes,
      status: 'confirmed'
    });

    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewCnic('');
    setNewNotes('');
  };

  // WhatsApp generator
  const getWhatsAppLink = (app: AdminAppointment) => {
    const dept = DEPARTMENTS.find((d) => d.id === app.departmentId)?.title || app.departmentId;
    const doc = DOCTORS.find((d) => d.id === app.doctorId)?.name || 'Consultant Specialist';
    const text =
      `*Dar al Dawa Medical Center - Appointment Confirmation*\n` +
      `Dear ${app.patientName},\n` +
      `Your appointment has been CONFIRMED.\n` +
      `• Token: *${app.token}*\n` +
      `• Department: ${dept}\n` +
      `• Doctor: ${doc}\n` +
      `• Date: ${app.appointmentDate} (${app.timeSlot.toUpperCase()})\n` +
      `• Location: 42-A Main Boulevard, Gulberg III, Lahore.\n` +
      `Helpline: 042-111-327-227. Please arrive 15 minutes prior.`;

    const cleanPhone = app.phone.replace(/[\s-]/g, '').replace(/^0/, '92');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const copySMSTemplate = (app: AdminAppointment) => {
    const text = `Dar al Dawa Medical Center: Your appointment (Token: ${app.token}) on ${app.appointmentDate} (${app.timeSlot}) is confirmed. Location: Gulberg III Lahore. Hotline: 042-111-327-227.`;
    navigator.clipboard.writeText(text);
    showToast('SMS template copied to clipboard!');
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Token', 'Patient Name', 'Phone', 'CNIC', 'Department', 'Date', 'Time Slot', 'Status'];
    const rows = filteredAppointments.map((a) => [
      a.token,
      `"${a.patientName}"`,
      a.phone,
      a.cnic || '',
      a.departmentId,
      a.appointmentDate,
      a.timeSlot,
      a.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Appointments exported to CSV successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? 'آن لائن اور دستی اپوائنٹمنٹس مینیجر' : 'Appointments Management'}
          </h1>
          <p className="text-xs text-slate-500">
            {isUrdu ? 'لاہور کیمپس کی تمام او پی ڈی بکنگز کی جانچ، تصدیق اور واٹس ایپ نوٹیفکیشن۔' : 'Manage online requests from website form, confirm tokens, and send instant WhatsApp/SMS.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportToCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#1E5AA8]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print List</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'دستی اندراج' : 'Add Appointment'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUrdu ? "نام، فون یا ٹوکن تلاش کریں..." : "Search by name, phone, token..."}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8]"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8] bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>

          {/* Department filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8] bg-white"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {isUrdu ? d.titleUrdu : d.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8] bg-white"
            />
          </div>
        </div>

        {(searchQuery || statusFilter !== 'all' || deptFilter !== 'all' || dateFilter) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Showing {filteredAppointments.length} matching appointments</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDeptFilter('all');
                setDateFilter('');
              }}
              className="text-[#D62828] hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Token / Patient</th>
                <th className="py-3.5 px-4">Contact & CNIC</th>
                <th className="py-3.5 px-4">Department & Doctor</th>
                <th className="py-3.5 px-4">Date & Slot</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Patient Alert</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No appointments match current filters</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const deptObj = DEPARTMENTS.find((d) => d.id === app.departmentId);
                  const docObj = DOCTORS.find((d) => d.id === app.doctorId);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Token & Patient Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{app.patientName}</div>
                        <div className="inline-block px-2 py-0.5 rounded bg-blue-50 text-[#1E5AA8] font-mono font-bold text-[11px] border border-blue-200 mt-0.5">
                          {app.token}
                        </div>
                      </td>

                      {/* Contact & CNIC */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-800 font-semibold">{app.phone}</div>
                        <div className="text-[11px] text-slate-400">{app.cnic || 'CNIC: Not provided'}</div>
                      </td>

                      {/* Department & Doctor */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {deptObj ? (isUrdu ? deptObj.titleUrdu : deptObj.title) : app.departmentId}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {docObj ? (isUrdu ? docObj.nameUrdu : docObj.name) : 'First Available Doctor'}
                        </div>
                      </td>

                      {/* Date & Slot */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{app.appointmentDate}</div>
                        <div className="text-[11px] text-slate-500 capitalize">{app.timeSlot}</div>
                      </td>

                      {/* Status Dropdown Badge */}
                      <td className="py-3 px-4">
                        <select
                          value={app.status}
                          onChange={(e) => updateAppointmentStatus(app.id, e.target.value as AppointmentStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border outline-none cursor-pointer ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-50 text-[#2E9E5B] border-emerald-200'
                              : app.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : app.status === 'completed'
                              ? 'bg-blue-50 text-[#1E5AA8] border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No-Show</option>
                        </select>
                      </td>

                      {/* Patient Alert: WhatsApp & SMS copy */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={getWhatsAppLink(app)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-[#2E9E5B] text-[#2E9E5B] hover:text-white transition-colors"
                            title="Send WhatsApp confirmation"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => copySMSTemplate(app)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Copy SMS Template"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(app)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#D62828] hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete appointment"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Manual Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className={`text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {isUrdu ? 'نئی دستی اپوائنٹمنٹ درج کریں' : 'New OPD Walk-in Appointment'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (03XX-XXXXXXX) *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:border-[#1E5AA8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNIC (Optional)</label>
                  <input
                    type="text"
                    value={newCnic}
                    onChange={(e) => setNewCnic(e.target.value)}
                    placeholder="35202-XXXXXXX-X"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:border-[#1E5AA8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={newDept}
                    onChange={(e) => {
                      setNewDept(e.target.value);
                      setNewDoc('');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultant Doctor</label>
                  <select
                    value={newDoc}
                    onChange={(e) => setNewDoc(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    <option value="">First Available Doctor</option>
                    {DOCTORS.filter((d) => d.departmentId === newDept).map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    <option value="morning">Morning (9AM - 12PM)</option>
                    <option value="afternoon">Afternoon (1PM - 4PM)</option>
                    <option value="evening">Evening (5PM - 9PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit / Symptoms</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold shadow-md"
                >
                  Create & Confirm Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Appointment Token?"
        message={`Are you sure you want to permanently delete appointment token ${deleteTarget?.token} for ${deleteTarget?.patientName}?`}
        itemName={`${deleteTarget?.token} - ${deleteTarget?.patientName}`}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAppointment(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
