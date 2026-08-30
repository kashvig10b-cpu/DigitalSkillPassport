import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import {
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  XCircle,
  Clock,
  X,
  Radio
} from 'lucide-react';

export default function RealTimeNotificationToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep at most 4 toasts

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const onCertVerified = (cert) => {
      addToast({
        title: 'Certificate Verified!',
        message: `"${cert.title || 'Credential'}" was officially approved and stamped by the admin.`,
        type: 'success',
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      });
    };

    const onCertRejected = (cert) => {
      addToast({
        title: 'Certificate Audit Update',
        message: `"${cert.title || 'Credential'}" was marked REJECTED. Check feedback in vault.`,
        type: 'error',
        icon: <XCircle className="w-5 h-5 text-rose-400" />,
      });
    };

    const onCertUploaded = (cert) => {
      addToast({
        title: 'New Credential Queued',
        message: `"${cert.title || 'Document'}" entered the administrative verification queue.`,
        type: 'info',
        icon: <Clock className="w-5 h-5 text-amber-400" />,
      });
    };

    const onSkillAdded = (skill) => {
      addToast({
        title: 'Skill Matrix Updated',
        message: `Added skill "${skill.name}" (${skill.level || 'Beginner'}). Radar recalculating.`,
        type: 'info',
        icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
      });
    };

    const onPassportViewers = ({ count, passportId }) => {
      if (count > 1) {
        addToast({
          title: 'Live Passport Audience',
          message: `${count} viewers/recruiters are currently inspecting passport ${passportId}!`,
          type: 'live',
          icon: <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />,
        });
      }
    };

    socket.on('certificateVerified', onCertVerified);
    socket.on('certificateRejected', onCertRejected);
    socket.on('certificateUploaded', onCertUploaded);
    socket.on('skillAdded', onSkillAdded);
    socket.on('passportViewersUpdated', onPassportViewers);

    return () => {
      socket.off('certificateVerified', onCertVerified);
      socket.off('certificateRejected', onCertRejected);
      socket.off('certificateUploaded', onCertUploaded);
      socket.off('skillAdded', onSkillAdded);
      socket.off('passportViewersUpdated', onPassportViewers);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Real-time notifications" className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none print:hidden">
      {toasts.map((toast) => {
        let borderClass = 'border-indigo-500/30 bg-slate-900/95';
        if (toast.type === 'success') borderClass = 'border-emerald-500/40 bg-slate-900/95';
        if (toast.type === 'error') borderClass = 'border-rose-500/40 bg-slate-900/95';
        if (toast.type === 'live') borderClass = 'border-emerald-500/50 bg-slate-900/95 shadow-emerald-500/20';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 text-white transition-all transform animate-in slide-in-from-bottom-3 duration-300 ${borderClass}`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 flex-shrink-0">{toast.icon}</div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-white">{toast.title}</p>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
