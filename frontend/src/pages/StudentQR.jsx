import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Smartphone, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function StudentQR() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/profile');
        setProfileData(res.data?.data);
      } catch (err) {
        console.error('Error fetching passport details:', err);
      }
    };
    loadProfile();
  }, []);

  const passportId = profileData?.profile?.passportId || user?.passportId || 'PASSPORT-PENDING';
  const publicPassportUrl = `${window.location.origin}/passport/${passportId}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    publicPassportUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicPassportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name}'s Digital Skill Passport`,
          text: `Scan my QR code or visit my live verified Digital Skill Passport:`,
          url: publicPassportUrl,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `SkillPassport-${passportId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(qrImageSrc, '_blank');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Your Unique QR Skill Passport</h1>
        <p className="text-sm text-slate-400">
          This single permanent QR code links recruiters directly to your live MongoDB profile. Any updates you make automatically reflect without requiring a new QR code.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Live Database Connected</span>
        </div>

        {/* QR Code Container */}
        <div className="p-5 bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 border-4 border-slate-800 flex items-center justify-center">
          <img
            src={qrImageSrc}
            alt="Digital Skill Passport QR Code"
            className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
          />
        </div>

        {/* Passport ID Chip */}
        <div className="space-y-1">
          <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Passport Identifier</p>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-widest text-indigo-400">
            {passportId}
          </p>
          <p className="text-xs text-slate-500 font-mono pt-1 break-all max-w-md">
            {publicPassportUrl}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownloadQR}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download QR</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Share Passport</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <a
            href={publicPassportUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview Public Passport</span>
          </a>
        </div>
      </div>

      {/* Real-Time Screen-to-Screen Demo Helper (Section 20) */}
      <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 space-y-4">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Section 20: Real-Time Cross-Window QR Sync Scenario</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Test live synchronization across separate devices or browser windows without page refreshing:
        </p>
        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 font-mono">
          <li>
            Open your public passport <a href={publicPassportUrl} target="_blank" rel="noreferrer" className="text-indigo-400 underline">{publicPassportUrl}</a> in an Incognito window or on your phone camera.
          </li>
          <li>
            In this window, navigate to <strong>Skills</strong> or <strong>Certificates</strong> and add an entry.
          </li>
          <li>
            Notice the incognito/phone screen update <span className="text-emerald-400 font-bold">instantly</span> via Socket.IO, redrawing the Radar Chart and updating credential badges!
          </li>
        </ol>
      </div>
    </div>
  );
}
