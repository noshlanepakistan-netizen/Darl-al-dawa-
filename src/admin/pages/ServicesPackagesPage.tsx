import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Check,
  CreditCard,
  Clock,
  X,
  ShieldCheck,
  Building
} from 'lucide-react';
import { HealthPackage } from '../../data/hospitalData';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface ServicesPackagesPageProps {
  lang: 'en' | 'ur';
}

export const ServicesPackagesPage: React.FC<ServicesPackagesPageProps> = ({ lang }) => {
  const { packages, addPackage, updatePackage, deletePackage, services } = useAdminData();
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'packages' | 'services'>('packages');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HealthPackage | null>(null);

  // Package Form
  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [category, setCategory] = useState('General Health');
  const [categoryUrdu, setCategoryUrdu] = useState('عمومی صحت');
  const [originalPrice, setOriginalPrice] = useState<number>(5000);
  const [discountedPrice, setDiscountedPrice] = useState<number>(3500);
  const [testsText, setTestsText] = useState('Complete Blood Count (CBC)\nFasting Blood Sugar\nSerum Cholesterol\nUrine R/E');
  const [fasting, setFasting] = useState('10-12 hours fasting');
  const [reportTime, setReportTime] = useState('Same Day (6 Hours)');
  const [popular, setPopular] = useState(false);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setTitleUrdu('');
    setCategory('General Wellness');
    setCategoryUrdu('عمومی تندرستی');
    setOriginalPrice(6000);
    setDiscountedPrice(4200);
    setTestsText('Complete Blood Count\nSerum Creatinine\nFasting Glucose\nUric Acid');
    setFasting('10 hours fasting');
    setReportTime('Same Day (4 Hours)');
    setPopular(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: HealthPackage) => {
    setEditingId(pkg.id);
    setTitle(pkg.title);
    setTitleUrdu(pkg.titleUrdu);
    setCategory(pkg.category);
    setCategoryUrdu(pkg.categoryUrdu);
    setOriginalPrice(pkg.originalPrice);
    setDiscountedPrice(pkg.discountedPrice);
    setTestsText(pkg.testsIncluded.join('\n'));
    setFasting(pkg.fastingRequired);
    setReportTime(pkg.reportTime);
    setPopular(!!pkg.popular);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const testList = testsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updatePackage(editingId, {
        title,
        titleUrdu: titleUrdu || title,
        category,
        categoryUrdu: categoryUrdu || category,
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        testsIncluded: testList,
        fastingRequired: fasting,
        reportTime,
        popular
      });
    } else {
      addPackage({
        title,
        titleUrdu: titleUrdu || title,
        category,
        categoryUrdu: categoryUrdu || category,
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        testsIncluded: testList,
        testsIncludedUrdu: testList,
        fastingRequired: fasting,
        fastingRequiredUrdu: fasting,
        reportTime,
        reportTimeUrdu: reportTime,
        popular
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
            {isUrdu ? 'ہیلتھ پیکیجز، لیب ٹیسٹ ریٹس اور ہسپتال سروسز' : 'Services & Health Packages CMS'}
          </h1>
          <p className="text-xs text-slate-500">
            {isUrdu ? 'لیب ٹیسٹ پیکیجز کے نرخ نامے، رعایت اور ٹیسٹوں کی فہرست کا انتظام۔' : 'Manage discounted test packages in PKR, included diagnostic parameters, and hospital facilities.'}
          </p>
        </div>

        {activeTab === 'packages' && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'نیا پیکیج بنائیں' : 'Create Package'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'packages'
              ? 'border-[#1E5AA8] text-[#1E5AA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Health Packages & Lab Pricing ({packages.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'services'
              ? 'border-[#1E5AA8] text-[#1E5AA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hospital Infrastructure Services ({services.length})
        </button>
      </div>

      {activeTab === 'packages' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const savings = pkg.originalPrice - pkg.discountedPrice;
            const savingsPct = Math.round((savings / pkg.originalPrice) * 100);

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow relative"
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-6 bg-[#2E9E5B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Popular
                  </span>
                )}

                <div>
                  <div className="text-xs font-bold text-[#1E5AA8] uppercase tracking-wider mb-1">
                    {pkg.category}
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold text-slate-900 mb-2 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
                    {pkg.title}
                  </h3>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-[#1E5AA8] font-mono">
                      Rs. {pkg.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-mono">
                      Rs. {pkg.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-[#2E9E5B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 ml-auto">
                      {savingsPct}% OFF
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mb-3 space-y-1">
                    <div><strong>Fasting:</strong> {pkg.fastingRequired}</div>
                    <div><strong>Turnaround:</strong> {pkg.reportTime}</div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                      Included Tests ({pkg.testsIncluded.length}):
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {pkg.testsIncluded.slice(0, 4).map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#2E9E5B] mt-0.5 flex-shrink-0" />
                          <span className="truncate">{t}</span>
                        </li>
                      ))}
                      {pkg.testsIncluded.length > 4 && (
                        <li className="text-[11px] text-slate-400 pl-5">
                          + {pkg.testsIncluded.length - 4} more parameters
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-1.5 rounded-lg bg-blue-50 text-[#1E5AA8] hover:bg-[#1E5AA8] hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(pkg)}
                    className="p-1.5 rounded-lg bg-red-50 text-[#D62828] hover:bg-[#D62828] hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Services tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs"
            >
              <div className="h-40 bg-slate-100 relative">
                <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                {srv.badge && (
                  <span className="absolute top-3 left-3 bg-[#1E5AA8] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {srv.badge}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-1">{srv.title}</h3>
                <div className="text-xs font-urdu text-[#2E9E5B] mb-2">{srv.titleUrdu}</div>
                <p className="text-xs text-slate-600 line-clamp-2">{srv.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Health Package' : 'Create Health Screening Package'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Package Title (English) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Executive Checkup"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Package Title (Urdu)</label>
                <input
                  type="text"
                  value={titleUrdu}
                  onChange={(e) => setTitleUrdu(e.target.value)}
                  placeholder="مثلاً: ماسٹر ہیلتھ پیکیج"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-urdu outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Original Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discounted Rate (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none text-[#1E5AA8] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Included Diagnostic Tests (1 per line)</label>
                <textarea
                  rows={4}
                  value={testsText}
                  onChange={(e) => setTestsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fasting Condition</label>
                  <input
                    type="text"
                    value={fasting}
                    onChange={(e) => setFasting(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Report Delivery Time</label>
                  <input
                    type="text"
                    value={reportTime}
                    onChange={(e) => setReportTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded text-[#2E9E5B]"
                />
                <span className="font-semibold">Highlight with "Most Popular" Ribbon</span>
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
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Health Package?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        itemName={deleteTarget?.title}
        onConfirm={() => {
          if (deleteTarget) {
            deletePackage(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
