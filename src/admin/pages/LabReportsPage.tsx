import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  FileCheck2,
  Plus,
  Search,
  Download,
  Trash2,
  X,
  FileText,
  Clock,
  CheckCircle2,
  Phone,
  Upload,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { LabReportRecord } from '../types';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { formatWhatsAppLink } from '../../utils/phoneUtils';

interface LabReportsPageProps {
  lang: 'en' | 'ur';
}

export const LabReportsPage: React.FC<LabReportsPageProps> = ({ lang }) => {
  const { labReports, addLabReport, updateLabReport, deleteLabReport, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LabReportRecord | null>(null);

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [testName, setTestName] = useState('Complete Blood Count (CBC) with ESR');
  const [department, setDepartment] = useState('Pathology');
  const [referringDoctor, setReferringDoctor] = useState('Dr. Tariq Mahmood');
  const [status, setStatus] = useState<'ready' | 'pending' | 'processing'>('ready');
  const [remarks, setRemarks] = useState('Verified by Clinical Pathologist.');
  const [resultSummary, setResultSummary] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  const filteredReports = labReports.filter((rep) => {
    const q = search.toLowerCase();
    const matchSearch =
      rep.reportId.toLowerCase().includes(q) ||
      rep.patientName.toLowerCase().includes(q) ||
      rep.patientPhone.includes(q) ||
      rep.testName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || rep.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      showToast('Patient name and phone are required', 'error');
      return;
    }

    const reportId = `DAD-LAB-${Math.floor(1000 + Math.random() * 9000)}`;
    addLabReport({
      reportId,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      testName,
      department,
      referringDoctor,
      reportDate: new Date().toISOString().split('T')[0],
      status,
      remarks,
      resultSummary: resultSummary || 'Diagnostic testing verified by automated barcoded analyzer.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    });

    setIsModalOpen(false);
    setPatientName('');
    setPatientPhone('');
    setResultSummary('');
    setPdfFileName('');
  };

  const getWhatsAppAlertLink = (rep: LabReportRecord) => {
    const text =
      `*Dar al Dawa Medical Center - Lab Report Ready*\n` +
      `Dear ${rep.patientName},\n` +
      `Your diagnostic report for *${rep.testName}* is now READY.\n` +
      `• Report ID: *${rep.reportId}*\n` +
      `• Date: ${rep.reportDate}\n` +
      `You can download your verified PDF report directly from our portal using your Report ID (${rep.reportId}) and Mobile Number (${rep.patientPhone}).\n` +
      `Helpline: 042-111-327-227.`;

    return formatWhatsAppLink(rep.patientPhone, text);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? 'پیتھالوجی و ریڈیالوجی لیب رپورٹس پورٹل' : 'Diagnostic Lab Reports Portal'}
          </h1>
          <p className="text-xs text-slate-500">
            {isUrdu ? 'لیب رپورٹس اپ لوڈ کریں، رزلٹ کا جائزہ لیں اور مریضوں کو بذریعہ واٹس ایپ مطلع کریں۔' : 'Upload certified test PDFs with unique Report IDs for instant patient portal lookup.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نئی رپورٹ اپ لوڈ کریں' : 'Upload Lab Report'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Report ID (e.g. DAD-LAB-8921), Patient Name, Test..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8]"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8] bg-white"
          >
            <option value="all">All Report Statuses</option>
            <option value="ready">Ready for Download</option>
            <option value="processing">Processing / Testing</option>
            <option value="pending">Pending Sample</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Patient Name & Phone</th>
                <th className="py-3 px-4">Test Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Patient Alert</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono">
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-[#1E5AA8] font-bold border border-blue-200">
                      {rep.reportId}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{rep.patientName}</div>
                    <div className="font-mono text-[11px] text-slate-500">{rep.patientPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{rep.testName}</div>
                    <div className="text-[11px] text-slate-400">{rep.department}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {rep.reportDate}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rep.status === 'ready'
                          ? 'bg-emerald-100 text-[#2E9E5B]'
                          : rep.status === 'processing'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {rep.status === 'ready' && (
                      <a
                        href={getWhatsAppAlertLink(rep)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#2E9E5B] hover:bg-[#2E9E5B] hover:text-white font-semibold text-[11px] transition-colors"
                        title="Notify patient on WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Send Alert</span>
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <a
                        href={rep.pdfUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1E5AA8] hover:bg-blue-50 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(rep)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#D62828] hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete lab report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Upload Certified Lab Report</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Mrs. Shazia Rasheed"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Mobile Phone (For Verification) *</label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Test Name *</label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="ready">Ready (Published)</option>
                    <option value="processing">Processing Analyzer</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Result Summary / Key Findings</label>
                <textarea
                  rows={2}
                  value={resultSummary}
                  onChange={(e) => setResultSummary(e.target.value)}
                  placeholder="e.g. HbA1c: 6.8% | Plasma Glucose Fasting: 112 mg/dL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attach Signed Report PDF</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 cursor-pointer hover:border-[#1E5AA8]">
                  <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <span className="text-[11px] text-slate-500">
                    {pdfFileName ? pdfFileName : 'Click to select or drop report PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPdfFileName(e.target.files[0].name);
                      }
                    }}
                    className="hidden"
                    id="lab-pdf-upload"
                  />
                  <label htmlFor="lab-pdf-upload" className="block text-[#1E5AA8] font-bold text-xs mt-1 cursor-pointer">
                    Browse File
                  </label>
                </div>
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
                  Publish Lab Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Lab Report?"
        message={`Are you sure you want to permanently delete report ${deleteTarget?.reportId} for ${deleteTarget?.patientName}?`}
        itemName={`${deleteTarget?.reportId} - ${deleteTarget?.patientName}`}
        onConfirm={() => {
          if (deleteTarget) {
            deleteLabReport(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
