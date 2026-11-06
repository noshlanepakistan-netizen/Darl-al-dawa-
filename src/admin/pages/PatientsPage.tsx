import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  X,
  Phone,
  FileText,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Upload,
  CheckCircle2,
  ShieldAlert,
  Ban,
  CheckCircle,
  Mail,
  UserCheck
} from 'lucide-react';
import { PatientRecord } from '../types';

interface PatientsPageProps {
  lang: 'en' | 'ur';
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ lang }) => {
  const { patients, addPatient, updatePatient, togglePatientBlock, appointments, labReports, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('Lahore, Punjab');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [allergies, setAllergies] = useState('None');

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.cnic && p.cnic.includes(q))
    );
  });

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Name and phone are required', 'error');
      return;
    }

    await addPatient({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      cnic: cnic.trim(),
      age: Number(age),
      gender,
      address,
      bloodGroup,
      allergies,
      isBlocked: false,
      visitHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          doctorName: 'Hospital OPD Triage',
          department: 'General OPD',
          diagnosis: 'Initial consultation registry'
        }
      ],
      documents: []
    });

    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setCnic('');
  };

  const handleToggleBlock = async (patientId: string, currentBlocked?: boolean) => {
    const newBlocked = !currentBlocked;
    const confirmMsg = newBlocked
      ? 'Are you sure you want to block this patient? They will not be able to log in or book appointments.'
      : 'Are you sure you want to unblock this patient?';

    if (window.confirm(confirmMsg)) {
      await togglePatientBlock(patientId, newBlocked);
      if (selectedPatient && selectedPatient.id === patientId) {
        setSelectedPatient({ ...selectedPatient, isBlocked: newBlocked });
      }
    }
  };

  // Find appointments linked to the selected patient
  const patientAppointments = selectedPatient
    ? appointments.filter(
        (a) =>
          (a.patientId && a.patientId === selectedPatient.id) ||
          (a.phone && selectedPatient.phone && a.phone.replace(/\D/g, '') === selectedPatient.phone.replace(/\D/g, ''))
      )
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? 'مریضوں کا میڈیکل ریکارڈ اور پورٹل صارفین' : 'Patients Registry & Portal Accounts'}
          </h1>
          <p className="text-xs text-slate-500">
            {isUrdu
              ? 'مریضوں کے بنیادی ریکارڈز، آن لائن پورٹل اکاؤنٹس، اپوائنٹمنٹ ہسٹری اور بلاک/ان بلاک کنٹرول۔'
              : 'Manage patient demographic profiles, online portal accounts, appointment history, and account access status.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نیا مریض درج کریں' : 'Register Patient'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name, phone (03XX-XXXXXXX), email, or CNIC..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8]"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((pat) => (
                <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{pat.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {pat.id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {pat.phone}
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                    {pat.email || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {pat.age ? `${pat.age} yrs` : '—'} / {pat.gender || 'Male'}
                  </td>
                  <td className="py-3 px-4">
                    {pat.isBlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                    {pat.address || 'Lahore'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPatient(pat)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#1E5AA8] hover:bg-[#1E5AA8] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="View Full Profile & Appointments"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleBlock(pat.id, pat.isBlocked)}
                        className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                          pat.isBlocked
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white'
                        }`}
                        title={pat.isBlocked ? 'Unblock Patient' : 'Block Patient'}
                      >
                        {pat.isBlocked ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        <span>{pat.isBlocked ? 'Unblock' : 'Block'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Dossier & Appointments History Drawer/Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedPatient.name}</h3>
                  {selectedPatient.isBlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                      Blocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Phone: {selectedPatient.phone} • Email: {selectedPatient.email || 'N/A'} • MRN: {selectedPatient.id}
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Medical Information Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold block">Blood Group:</span>
                  <span className="text-sm font-bold text-red-600 font-mono">{selectedPatient.bloodGroup || 'O+'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Gender:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedPatient.gender || 'Male'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">City:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedPatient.address || 'Lahore'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">CNIC:</span>
                  <span className="text-sm font-mono text-slate-800">{selectedPatient.cnic || '—'}</span>
                </div>
              </div>

              {/* Linked Appointments */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#1E5AA8]" />
                    <span>Hospital Appointments ({patientAppointments.length})</span>
                  </div>
                </h4>
                
                {patientAppointments.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 italic">
                    No appointments booked yet under this patient.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {patientAppointments.map((app) => (
                      <div key={app.id} className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="font-mono text-xs text-[#1E5AA8] bg-white px-2 py-0.5 rounded border border-blue-200">
                              {app.token}
                            </span>
                            <span className="capitalize">{app.status}</span>
                          </div>
                          <div className="text-slate-600 text-[11px] mt-0.5">
                            {app.appointmentDate} ({app.timeSlot}) • {app.departmentId}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{app.createdAt.split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Security Action */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleBlock(selectedPatient.id, selectedPatient.isBlocked)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    selectedPatient.isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {selectedPatient.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  <span>{selectedPatient.isBlocked ? 'Unblock Patient Account' : 'Block Patient Account'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Register New Patient</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kamran Akmal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNIC (Optional)</label>
                  <input
                    type="text"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    placeholder="35202-XXXXXXX-X"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Model Town, Lahore"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold cursor-pointer"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
