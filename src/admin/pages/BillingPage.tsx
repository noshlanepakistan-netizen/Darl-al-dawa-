import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  Receipt,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  DollarSign,
  Calendar,
  Phone,
  FileText,
  Trash2
} from 'lucide-react';
import { InvoiceRecord, InvoiceItem, PaymentMethod } from '../types';
import { HOSPITAL_CONFIG } from '../../data/hospitalData';

interface BillingPageProps {
  lang: 'en' | 'ur';
}

export const BillingPage: React.FC<BillingPageProps> = ({ lang }) => {
  const { invoices, addInvoice, updateInvoiceStatus, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<InvoiceRecord | null>(null);

  // New Invoice State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientCnic, setPatientCnic] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('JazzCash');
  const [discountPKR, setDiscountPKR] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consultant Specialist OPD Consultation', quantity: 1, unitPricePKR: 2500, amountPKR: 2500 }
  ]);

  const subtotal = items.reduce((acc, item) => acc + item.amountPKR, 0);
  const total = Math.max(0, subtotal - Number(discountPKR || 0));

  // Revenue metrics
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.totalPKR, 0);
  const cashTotal = invoices.filter((i) => i.paymentMethod === 'Cash' && i.status === 'paid').reduce((acc, i) => acc + i.totalPKR, 0);
  const digitalTotal = invoices.filter((i) => i.paymentMethod !== 'Cash' && i.status === 'paid').reduce((acc, i) => acc + i.totalPKR, 0);

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.patientPhone.includes(q)
    );
  });

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: '', quantity: 1, unitPricePKR: 1000, amountPKR: 1000 }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, val: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPricePKR') {
          updated.amountPKR = Number(updated.quantity) * Number(updated.unitPricePKR);
        }
        return updated;
      })
    );
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('Patient name is required', 'error');
      return;
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    addInvoice({
      invoiceNumber,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientCnic: patientCnic.trim(),
      items,
      subtotalPKR: subtotal,
      discountPKR: Number(discountPKR),
      totalPKR: total,
      paymentMethod,
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      notes
    });

    setIsModalOpen(false);
    setPatientName('');
    setPatientPhone('');
    setDiscountPKR(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
            {isUrdu ? 'ہسپتال بلنگ، رسیدیں اور فنانشل ریکارڈز' : 'Hospital Billing & Invoices'}
          </h1>
          <p className="text-xs text-slate-500">
            {isUrdu ? 'کیش، جیز کیش، ایزی پیسہ اور بینک کارڈ کی ادائیگیوں کا انتظام اور پرنٹ انوائس۔' : 'Issue official hospital invoices, record JazzCash/Easypaisa/Card payments, and print clinical bills.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نئی انوائس بنائیں' : 'Create Invoice'}</span>
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Total Hospital Collections</div>
          <div className="text-2xl font-extrabold text-[#1E5AA8] font-mono">Rs. {totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All verified payments</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Digital (JazzCash, Easypaisa, Card)</div>
          <div className="text-2xl font-extrabold text-[#2E9E5B] font-mono">Rs. {digitalTotal.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Online & mobile transactions</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Cash at Reception Counter</div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">Rs. {cashTotal.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Physical till collection</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number (e.g. INV-2026-1041), patient name, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8]"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total Amount (PKR)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#1E5AA8]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{inv.patientName}</div>
                    <div className="font-mono text-[11px] text-slate-500">{inv.patientPhone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {inv.date}
                  </td>
                  <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                    Rs. {inv.totalPKR.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => updateInvoiceStatus(inv.id, inv.status === 'paid' ? 'unpaid' : 'paid')}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                        inv.status === 'paid' ? 'bg-emerald-100 text-[#2E9E5B]' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {inv.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#1E5AA8] hover:bg-[#1E5AA8] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Bill</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create Official Hospital Invoice</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Asad Qureshi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (03XX-XXXXXXX)</label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700">Services & Lab Test Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#1E5AA8] font-bold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Service / Test name..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-center"
                      />
                      <input
                        type="number"
                        min={0}
                        value={item.unitPricePKR}
                        onChange={(e) => handleItemChange(idx, 'unitPricePKR', e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 font-mono"
                      />
                      <span className="w-24 font-mono font-bold text-slate-800 text-right">
                        Rs. {item.amountPKR}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-mono font-bold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Special Discount (PKR):</span>
                  <input
                    type="number"
                    min={0}
                    value={discountPKR}
                    onChange={(e) => setDiscountPKR(Number(e.target.value))}
                    className="w-28 px-2 py-1 rounded border border-slate-300 font-mono text-right"
                  />
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#1E5AA8] pt-2 border-t border-slate-200">
                  <span>Total Payable:</span>
                  <span className="font-mono">Rs. {total.toLocaleString()} PKR</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['Cash', 'JazzCash', 'Easypaisa', 'Bank Transfer', 'Card'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-blue-50 border-[#1E5AA8] text-[#1E5AA8] font-bold ring-1 ring-[#1E5AA8]'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
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
                  Save & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal with Hospital Logo & PKR breakdown */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative animate-in fade-in printable-invoice max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 no-print"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bill Header */}
            <div className="border-b border-slate-200 pb-5 mb-5 flex justify-between items-start">
              <div>
                <div className="text-xl font-bold text-[#1E5AA8] font-heading">{HOSPITAL_CONFIG.name}</div>
                <div className="text-xs text-[#2E9E5B] font-urdu">{HOSPITAL_CONFIG.nameUrdu}</div>
                <div className="text-[11px] text-slate-500 mt-1 max-w-xs">{HOSPITAL_CONFIG.contact.address}</div>
                <div className="text-[11px] text-slate-500 font-mono">PHC Regular Lic # PHC-LHR-9921 • NTN: 4120934-2</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase">Cash Receipt</div>
                <div className="text-base font-extrabold text-slate-900 font-mono">{selectedInvoiceForPrint.invoiceNumber}</div>
                <div className="text-xs text-slate-500 font-mono">{selectedInvoiceForPrint.date}</div>
              </div>
            </div>

            {/* Patient details */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Patient Name:</span>
                <span className="font-bold text-slate-800 text-sm">{selectedInvoiceForPrint.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Contact / CNIC:</span>
                <span className="font-mono text-slate-800">{selectedInvoiceForPrint.patientPhone} {selectedInvoiceForPrint.patientCnic ? `(${selectedInvoiceForPrint.patientCnic})` : ''}</span>
              </div>
            </div>

            {/* Table of items */}
            <table className="w-full text-left text-xs mb-5">
              <thead className="border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price (PKR)</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {selectedInvoiceForPrint.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 font-sans font-medium text-slate-800">{item.description}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{item.unitPricePKR.toLocaleString()}</td>
                    <td className="py-2 text-right font-bold">{item.amountPKR.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>Rs. {selectedInvoiceForPrint.subtotalPKR.toLocaleString()}</span>
              </div>
              {selectedInvoiceForPrint.discountPKR > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- Rs. {selectedInvoiceForPrint.discountPKR.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#1E5AA8] pt-2 border-t border-slate-200 font-mono">
                <span>Total Paid:</span>
                <span>Rs. {selectedInvoiceForPrint.totalPKR.toLocaleString()} PKR</span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans pt-1">
                Payment Channel: <strong>{selectedInvoiceForPrint.paymentMethod}</strong> • Status: <strong>{selectedInvoiceForPrint.status.toUpperCase()}</strong>
              </div>
            </div>

            {/* Print actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#1E5AA8] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
