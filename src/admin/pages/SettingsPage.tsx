import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  Settings,
  Download,
  Upload,
  Clock,
  Shield,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw
} from 'lucide-react';
import { HOSPITAL_CONFIG } from '../../data/hospitalData';

interface SettingsPageProps {
  lang: 'en' | 'ur';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ lang }) => {
  const { settings, updateSettings, exportAllDataJSON, restoreFromJSON, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  const [slotDuration, setSlotDuration] = useState(settings.slotDurationMinutes);
  const [opdOpen, setOpdOpen] = useState(settings.opdOpenTime);
  const [opdClose, setOpdClose] = useState(settings.opdCloseTime);
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode);
  const [emailAlerts, setEmailAlerts] = useState(settings.emailNotifications);
  const [smsAlerts, setSmsAlerts] = useState(settings.smsNotifications);
  const [whatsappConfirm, setWhatsappConfirm] = useState(settings.whatsappConfirmation);

  const handleSaveOperational = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      slotDurationMinutes: Number(slotDuration),
      opdOpenTime: opdOpen,
      opdCloseTime: opdClose,
      maintenanceMode: maintenance,
      emailNotifications: emailAlerts,
      smsNotifications: smsAlerts,
      whatsappConfirmation: whatsappConfirm
    });
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DarAlDawa_Full_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Full hospital database exported as JSON!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        restoreFromJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
          {isUrdu ? 'سسٹم سیٹنگز، اوقاتِ کار اور ڈیٹا بیک اپ' : 'System Settings & Operational Parameters'}
        </h1>
        <p className="text-xs text-slate-500">
          {isUrdu ? 'او پی ڈی سلاٹ کے دورانیے، مینٹیننس موڈ، اور ہسپتال کا مکمل ڈیٹا JSON میں ڈاؤن لوڈ کریں۔' : 'Configure consultation durations, maintenance mode, WhatsApp gateways, and full JSON backup.'}
        </p>
      </div>

      {/* Operational Settings Form */}
      <form onSubmit={handleSaveOperational} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 text-xs">
        
        {/* Maintenance Mode Toggle */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          maintenance ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${maintenance ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>Public Website Maintenance Mode</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              When enabled, visitors will see a maintenance notice while staff can still access this admin panel.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D62828]"></div>
          </label>
        </div>

        {/* Timings & Slots */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1E5AA8]" />
            <span>OPD Scheduling Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Appointment Slot Duration</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value={15}>15 Minutes per patient</option>
                <option value={20}>20 Minutes per patient</option>
                <option value={30}>30 Minutes per patient</option>
                <option value={45}>45 Minutes per patient</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">OPD Opening Time</label>
              <input
                type="time"
                value={opdOpen}
                onChange={(e) => setOpdOpen(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">OPD Closing Time</label>
              <input
                type="time"
                value={opdClose}
                onChange={(e) => setOpdClose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Notification Gateways */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2E9E5B]" />
            <span>Automated Patient Alerts</span>
          </h3>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappConfirm}
                onChange={(e) => setWhatsappConfirm(e.target.checked)}
                className="rounded text-[#2E9E5B]"
              />
              <span className="font-medium text-slate-700">Send Instant WhatsApp Token Link upon web booking (+92 300 1234567)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded text-[#1E5AA8]"
              />
              <span className="font-medium text-slate-700">Enable 1-Click SMS confirmation clipboard generation</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-[#1E5AA8]"
              />
              <span className="font-medium text-slate-700">Send Daily OPD summary digest to administration email</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-[#1E5AA8] hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Operational Settings</span>
        </button>
      </form>

      {/* Database Backup & Disaster Recovery Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1E5AA8]" />
            <span>Hospital Disaster Recovery & Data Portability</span>
          </h3>
          <p className="text-slate-500 mt-1">
            Export a full JSON snapshot of all appointments, patients, doctors, lab reports, and billing records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex-1 py-3 px-4 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Database JSON Backup</span>
          </button>

          <label className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Restore / Import JSON File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

    </div>
  );
};
