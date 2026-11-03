import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Clock,
  Calendar,
  CreditCard,
  BadgeCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DEPARTMENTS, Doctor } from '../../data/hospitalData';

interface DoctorsPageProps {
  lang: 'en' | 'ur';
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ lang }) => {
  const { doctors, addDoctor, updateDoctor, deleteDoctor, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);

  // Doctor Form Fields
  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [departmentId, setDepartmentId] = useState(DEPARTMENTS[0].id);
  const [specialty, setSpecialty] = useState('');
  const [specialtyUrdu, setSpecialtyUrdu] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('10+ Years Experience');
  const [opdTimings, setOpdTimings] = useState('05:00 PM – 09:00 PM');
  const [opdTimingsUrdu, setOpdTimingsUrdu] = useState('شام 5 تا رات 9 بجے');
  const [days, setDays] = useState('Monday to Friday');
  const [daysUrdu, setDaysUrdu] = useState('پیر تا جمعہ');
  const [feePKR, setFeePKR] = useState<number>(2500);
  const [image, setImage] = useState('');
  const [about, setAbout] = useState('');
  const [aboutUrdu, setAboutUrdu] = useState('');
  const [pmdcNo, setPmdcNo] = useState('24000-P');

  const filteredDoctors = doctors.filter((doc) => {
    const q = search.toLowerCase();
    const matchSearch =
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.pmdcNo.toLowerCase().includes(q);
    const matchDept = selectedDept === 'all' || doc.departmentId === selectedDept;
    return matchSearch && matchDept;
  });

  const handleOpenAdd = () => {
    setEditingDoctorId(null);
    setName('');
    setNameUrdu('');
    setDepartmentId(DEPARTMENTS[0].id);
    setSpecialty('');
    setSpecialtyUrdu('');
    setQualification('MBBS, FCPS');
    setExperience('10+ Years Experience');
    setOpdTimings('05:00 PM – 09:00 PM');
    setOpdTimingsUrdu('شام 5 تا رات 9 بجے');
    setDays('Monday to Friday');
    setDaysUrdu('پیر تا جمعہ');
    setFeePKR(2500);
    setImage('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80');
    setAbout('Senior clinical specialist dedicated to patient wellness and ethical healthcare.');
    setAboutUrdu('مریضوں کے بہترین اور محفوظ علاج کے لیے پرعزم سینئر معالج۔');
    setPmdcNo('29500-P');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setName(doc.name);
    setNameUrdu(doc.nameUrdu);
    setDepartmentId(doc.departmentId);
    setSpecialty(doc.specialty);
    setSpecialtyUrdu(doc.specialtyUrdu);
    setQualification(doc.qualification);
    setExperience(doc.experience);
    setOpdTimings(doc.opdTimings);
    setOpdTimingsUrdu(doc.opdTimingsUrdu);
    setDays(doc.days);
    setDaysUrdu(doc.daysUrdu);
    setFeePKR(doc.feePKR);
    setImage(doc.image);
    setAbout(doc.about);
    setAboutUrdu(doc.aboutUrdu);
    setPmdcNo(doc.pmdcNo);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingDoctorId) {
      updateDoctor(editingDoctorId, {
        name,
        nameUrdu: nameUrdu || name,
        departmentId,
        specialty,
        specialtyUrdu: specialtyUrdu || specialty,
        qualification,
        experience,
        opdTimings,
        opdTimingsUrdu,
        days,
        daysUrdu,
        feePKR: Number(feePKR),
        image: image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
        about,
        aboutUrdu,
        pmdcNo
      });
    } else {
      addDoctor({
        name,
        nameUrdu: nameUrdu || name,
        departmentId,
        specialty,
        specialtyUrdu: specialtyUrdu || specialty,
        qualification,
        experience,
        opdTimings,
        opdTimingsUrdu,
        days,
        daysUrdu,
        feePKR: Number(feePKR),
        image: image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
        about,
        aboutUrdu,
        pmdcNo
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? 'ڈاکٹرز و میڈیکل فیکلٹی مینیجر' : 'Doctors & Consultant Faculty'}
          </h1>
          <p className="text-xs text-slate-500">
            {isUrdu ? 'نئے کنسلٹنٹ شامل کریں، او پی ڈی اوقات اور فیس کی تفصیلات تبدیل کریں۔' : 'Add or edit specialist doctors. All updates automatically reflect on public website.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نیا ڈاکٹر شامل کریں' : 'Add New Consultant'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name, specialty, PMDC number..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8]"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8] bg-white"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => {
          const dept = DEPARTMENTS.find((d) => d.id === doc.departmentId);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all"
            >
              <div>
                {/* Photo & PMDC */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-[#1E5AA8] shadow-xs flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-[#2E9E5B]" />
                    <span>PMDC: {doc.pmdcNo}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#1E5AA8] text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                    {dept?.title || doc.departmentId}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className={`text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                    {doc.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#2E9E5B] mb-2">{doc.specialty}</div>

                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3 font-mono">
                    {doc.qualification}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#1E5AA8]" />
                      <span>{doc.opdTimings}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#1E5AA8]" />
                      <span>{doc.days}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-[#2E9E5B]" />
                      <span className="font-bold text-[#1E5AA8] font-mono">Rs. {doc.feePKR.toLocaleString()} PKR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Live on Public Site
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(doc)}
                    className="p-2 rounded-lg bg-blue-50 text-[#1E5AA8] hover:bg-[#1E5AA8] hover:text-white transition-colors cursor-pointer"
                    title="Edit Doctor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${doc.name} from faculty?`)) {
                        deleteDoctor(doc.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-red-50 text-[#D62828] hover:bg-[#D62828] hover:text-white transition-colors cursor-pointer"
                    title="Delete Doctor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className={`text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {editingDoctorId ? 'Edit Doctor Profile' : 'Add New Consultant Specialist'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Tariq Mahmood"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1E5AA8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Name (Urdu)</label>
                  <input
                    type="text"
                    value={nameUrdu}
                    onChange={(e) => setNameUrdu(e.target.value)}
                    placeholder="مثلاً: ڈاکٹر طارق محمود"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1E5AA8] font-urdu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PMDC Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={pmdcNo}
                    onChange={(e) => setPmdcNo(e.target.value)}
                    placeholder="12894-P"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization Designation *</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Consultant Interventional Cardiologist"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualifications (Degrees) *</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="MBBS, FCPS, MRCP (UK)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Fee (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={feePKR}
                    onChange={(e) => setFeePKR(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">OPD Timings</label>
                  <input
                    type="text"
                    value={opdTimings}
                    onChange={(e) => setOpdTimings(e.target.value)}
                    placeholder="05:00 PM – 09:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Days</label>
                  <input
                    type="text"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="Monday to Friday"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Photo URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Clinical Bio</label>
                <textarea
                  rows={2}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
