import React, { useState } from 'react';
import { useAdminData } from '../admin/context/AdminDataContext';
import {
  FileCheck2,
  Search,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  ShieldCheck,
  Clock,
  Printer
} from 'lucide-react';
import { LabReportRecord } from '../admin/types';

interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const ReportDownloadModal: React.FC<ReportDownloadModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const { lookupLabReport } = useAdminData();
  const isUrdu = lang === 'ur';

  const [reportIdInput, setReportIdInput] = useState('DAD-LAB-8921');
  const [phoneInput, setPhoneInput] = useState('0300-4123890');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<LabReportRecord | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportIdInput.trim() || !phoneInput.trim()) return;
    const found = lookupLabReport(reportIdInput, phoneInput);
    setResult(found);
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close report portal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E5AA8] mx-auto flex items-center justify-center mb-3 shadow-xs">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : 'font-heading'}`}>
            {isUrdu ? 'آن لائن تشخیصی لیب رپورٹ ڈاؤن لوڈ' : 'Download Your Lab Report'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isUrdu
              ? 'رپورٹ آئی ڈی اور رجسٹرڈ موبائل نمبر درج کر کے تصدیق شدہ پی ڈی ایف حاصل کریں۔'
              : 'Enter your Report ID from your SMS/token and registered mobile number to retrieve your verified PDF.'}
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4 text-xs mb-6">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isUrdu ? 'رپورٹ آئی ڈی (Report ID) *' : 'Report ID (from token or SMS) *'}
            </label>
            <input
              type="text"
              required
              value={reportIdInput}
              onChange={(e) => setReportIdInput(e.target.value)}
              placeholder="e.g. DAD-LAB-8921"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm outline-none focus:border-[#1E5AA8] uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isUrdu ? 'رجسٹرڈ موبائل نمبر (03XX-XXXXXXX) *' : 'Registered Mobile Number *'}
            </label>
            <input
              type="tel"
              required
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="0300-1234567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm outline-none focus:border-[#1E5AA8]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#1E5AA8] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{isUrdu ? 'رپورٹ تلاش کریں' : 'Search & Verify Report'}</span>
          </button>
        </form>

        {/* Search Results */}
        {searched && (
          <div>
            {result ? (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider mb-1">
                      {result.status.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{result.testName}</h3>
                    <div className="text-xs text-slate-600 font-medium">Patient: {result.patientName}</div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-[#2E9E5B] flex-shrink-0" />
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-emerald-100">
                  <div><strong>Date Tested:</strong> {result.reportDate}</div>
                  <div><strong>Department:</strong> {result.department}</div>
                  <div><strong>Key Findings:</strong> {result.resultSummary || 'Normal limits'}</div>
                  <div className="text-[11px] text-slate-500 italic mt-1">{result.remarks}</div>
                </div>

                <a
                  href={result.pdfUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF Document</span>
                </a>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-xs text-red-800 space-y-2">
                <AlertCircle className="w-6 h-6 mx-auto text-[#D62828]" />
                <div className="font-bold">No report found for {reportIdInput}</div>
                <p className="text-[11px] text-red-600">
                  Please verify that the Report ID and mobile number match your OPD invoice. If your test was taken today, it may still be processing.
                </p>
                <div className="pt-2 text-[11px] text-slate-600">
                  Need help? Contact pathology counter: <strong>042-111-327-227</strong>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E9E5B]" />
            <span>ISO 15189 Verified Digital Signatures</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
