import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  X,
  Stethoscope,
  HeartPulse,
  Baby,
  Smile,
  Activity,
  Sparkles,
  Ear,
  Eye,
  Flame,
  Scan,
  FlaskConical,
  Pill,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Department } from '../../data/hospitalData';

interface DepartmentsPageProps {
  lang: 'en' | 'ur';
}

const AVAILABLE_ICONS = [
  'ShieldAlert',
  'HeartPulse',
  'Baby',
  'Smile',
  'Activity',
  'Stethoscope',
  'Sparkles',
  'Ear',
  'Eye',
  'Flame',
  'Scan',
  'FlaskConical',
  'Pill'
];

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({ lang }) => {
  const { departments, addDepartment, updateDepartment, deleteDepartment, reorderDepartments } = useAdminData();
  const isUrdu = lang === 'ur';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [iconName, setIconName] = useState('Stethoscope');
  const [description, setDescription] = useState('');
  const [descriptionUrdu, setDescriptionUrdu] = useState('');
  const [headDoctor, setHeadDoctor] = useState('Senior Consultant');

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setTitleUrdu('');
    setIconName('Stethoscope');
    setDescription('');
    setDescriptionUrdu('');
    setHeadDoctor('Senior Consultant');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingId(dept.id);
    setTitle(dept.title);
    setTitleUrdu(dept.titleUrdu);
    setIconName(dept.iconName);
    setDescription(dept.description);
    setDescriptionUrdu(dept.descriptionUrdu);
    setHeadDoctor(dept.headDoctor);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      updateDepartment(editingId, {
        title,
        titleUrdu: titleUrdu || title,
        iconName,
        description,
        descriptionUrdu: descriptionUrdu || description,
        headDoctor
      });
    } else {
      addDepartment({
        title,
        titleUrdu: titleUrdu || title,
        iconName,
        description,
        descriptionUrdu: descriptionUrdu || description,
        headDoctor,
        features: ['24/7 Specialist Coverage', 'Advanced Diagnostics', 'Inpatient Facility'],
        featuresUrdu: ['24 گھنٹے ماہر ڈاکٹرز', 'جدید تشخیصی سہولیات', 'داخلہ وارڈ']
      });
    }
    setIsModalOpen(false);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= departments.length) return;
    const copy = [...departments];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    reorderDepartments(copy);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? 'شعبہ جات مینیجر' : 'Clinical Departments Manager'}
          </h1>
          <p className="text-xs text-slate-500">
            {isUrdu ? 'ہسپتال کے تمام طبی اور جراحی شعبہ جات، سربراہ ڈاکٹرز اور تفصیلات کا انتظام۔' : 'Manage medical departments, icon identifiers, head doctors, and website display order.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نیا شعبہ شامل کریں' : 'Add Department'}</span>
        </button>
      </div>

      {/* Grid of Departments with Reordering and Edit */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept, idx) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === departments.length - 1}
                    onClick={() => moveItem(idx, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className={`text-base font-bold text-slate-900 mb-0.5 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                {dept.title}
              </h3>
              <div className="text-xs font-urdu text-[#2E9E5B] mb-2">{dept.titleUrdu}</div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">{dept.description}</p>
              <div className="text-[11px] text-slate-500 font-medium">Head: {dept.headDoctor}</div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleOpenEdit(dept)}
                className="p-1.5 rounded-lg bg-blue-50 text-[#1E5AA8] hover:bg-[#1E5AA8] hover:text-white transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete department ${dept.title}?`)) {
                    deleteDepartment(dept.id);
                  }
                }}
                className="p-1.5 rounded-lg bg-red-50 text-[#D62828] hover:bg-[#D62828] hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Department' : 'Add Clinical Department'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Title (English) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neurology & Stroke Care"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Title (Urdu)</label>
                <input
                  type="text"
                  value={titleUrdu}
                  onChange={(e) => setTitleUrdu(e.target.value)}
                  placeholder="مثلاً: امراضِ اعصاب و فالج"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-urdu outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Icon Style</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Head Doctor</label>
                  <input
                    type="text"
                    value={headDoctor}
                    onChange={(e) => setHeadDoctor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none resize-none"
                />
              </div>

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
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
