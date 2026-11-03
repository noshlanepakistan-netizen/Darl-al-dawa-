import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  ShieldAlert,
  Plus,
  Search,
  UserCheck,
  Clock,
  Edit2,
  Trash2,
  X,
  History,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StaffUser, StaffRole } from '../types';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface UsersPageProps {
  lang: 'en' | 'ur';
}

export const UsersPage: React.FC<UsersPageProps> = ({ lang }) => {
  const { staffUsers, addStaffUser, updateStaffUser, deleteStaffUser, activityLogs, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('receptionist');
  const [department, setDepartment] = useState('Outpatient Services');
  const [phone, setPhone] = useState('+92 300 0000000');
  const [active, setActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setRole('receptionist');
    setDepartment('Outpatient Services');
    setPhone('+92 300 1234567');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department || '');
    setPhone(user.phone || '');
    setActive(user.active);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUserId) {
      updateStaffUser(editingUserId, {
        name,
        email,
        role,
        department,
        phone,
        active
      });
    } else {
      addStaffUser({
        uid: `uid-${Date.now()}`,
        name,
        email,
        role,
        department,
        phone,
        active,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      });
    }
    setIsModalOpen(false);
  };

  const roleColors: Record<StaffRole, string> = {
    super_admin: 'bg-red-50 text-[#D62828] border-red-200',
    receptionist: 'bg-emerald-50 text-[#2E9E5B] border-emerald-200',
    doctor: 'bg-blue-50 text-[#1E5AA8] border-blue-200',
    lab_staff: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? 'اسٹاف صارفین، رولز اور سیکیورٹی لاگز' : 'Staff Accounts, RBAC & Audit Trail'}
          </h1>
          <p className="text-xs text-slate-500">
            {isUrdu ? 'اسٹاف کے اختیارات (Super Admin, Receptionist, Doctor, Lab Staff) اور تبدیلیوں کا مکمل ریکارڈ۔' : 'Manage authorized hospital accounts, role permissions, and immutable system activity logs.'}
          </p>
        </div>

        {activeTab === 'users' && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'نیا اسٹاف اکاؤنٹ' : 'Add Staff User'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-[#1E5AA8] text-[#1E5AA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Staff Accounts ({staffUsers.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-[#1E5AA8] text-[#1E5AA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Security & Change Audit Trail ({activityLogs.length})</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        /* Users Table */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role / Access</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${roleColors[user.role]}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {user.department || 'General Staff'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {user.phone || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => updateStaffUser(user.id, { active: !user.active })}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                          user.active ? 'bg-emerald-100 text-[#2E9E5B]' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {user.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {user.lastLogin ? user.lastLogin.replace('T', ' ').slice(0, 16) : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#1E5AA8] hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {user.role !== 'super_admin' && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete staff account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Trail Log */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6">
          <div className="text-xs text-slate-500 mb-4 flex items-center justify-between">
            <span>Showing verified system event log (Immutable audit trail)</span>
            <span className="font-mono text-[11px]">Total Entries: {activityLogs.length}</span>
          </div>

          <div className="space-y-3 font-sans">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-[#1E5AA8] text-[10px] font-bold uppercase">
                      {log.module}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                    <span className="text-[11px] text-slate-500">by {log.userName} ({log.userEmail})</span>
                  </div>
                  <p className="text-xs text-slate-600">{log.details}</p>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                  {log.timestamp.replace('T', ' ').slice(0, 19)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingUserId ? 'Edit Staff Account' : 'Create Hospital Staff Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Staff Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Ayesha Siddiqa"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@daraldawa.pk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="super_admin">Super Admin (Full CMS)</option>
                    <option value="receptionist">Receptionist (OPD & Bills)</option>
                    <option value="doctor">Consultant Doctor</option>
                    <option value="lab_staff">Lab Staff (Reports)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Cardiology"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-[#2E9E5B]"
                />
                <span className="font-semibold">Account Active (Permit login)</span>
              </label>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Staff Account?"
        message={`Are you sure you want to delete the staff account for ${deleteTarget?.name}? This action cannot be undone.`}
        itemName={`${deleteTarget?.name} (${deleteTarget?.role})`}
        onConfirm={() => {
          if (deleteTarget) {
            deleteStaffUser(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
