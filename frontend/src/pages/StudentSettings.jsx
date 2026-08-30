import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Lock, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';

export default function StudentSettings() {
  const { user } = useAuth();
  const [notifyVerification, setNotifyVerification] = useState(true);
  const [notifyRecruiterView, setNotifyRecruiterView] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Passport Settings</h1>
        <p className="text-sm text-slate-400">
          Manage passport preferences, privacy visibility, and notification preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-indigo-400" />
            Real-Time Notifications
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Certificate Verification Alerts</p>
                <p className="text-xs text-slate-400">Receive instant push notice when an admin audits your certificate.</p>
              </div>
              <input
                type="checkbox"
                checked={notifyVerification}
                onChange={(e) => setNotifyVerification(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Recruiter Scan Notice</p>
                <p className="text-xs text-slate-400">Notify when a verified employer opens your public QR passport.</p>
              </div>
              <input
                type="checkbox"
                checked={notifyRecruiterView}
                onChange={(e) => setNotifyRecruiterView(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
