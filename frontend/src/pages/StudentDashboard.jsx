import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { socket, joinStudentRoom } from '../services/socket';
import {
  Sparkles,
  FolderGit2,
  Award,
  Trophy,
  ShieldCheck,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Share2,
  ExternalLink,
  PlusCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [lanIp, setLanIp] = useState('');

  useEffect(() => {
    api.get('/network-info')
      .then(res => {
        if (res.data?.data?.lanIp && res.data.data.lanIp !== 'localhost') {
          setLanIp(res.data.data.lanIp);
        }
      })
      .catch(() => {});
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      setProfileData(res.data?.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (user?.id) {
      joinStudentRoom(user.id);
    }

    // Real-Time Socket.IO update handler
    const handleProfileUpdate = (updatedPayload) => {
      console.log('[Socket.IO] Real-time profile update received:', updatedPayload);
      setProfileData(updatedPayload);
    };

    socket.on('profileUpdated', handleProfileUpdate);

    return () => {
      socket.off('profileUpdated', handleProfileUpdate);
    };
  }, [user?.id]);

  const passportId = profileData?.profile?.passportId || user?.passportId || 'PASSPORT-PENDING';
  const scanHost = lanIp || (window.location.hostname !== 'localhost' ? window.location.hostname : '10.167.66.101');
  const port = window.location.port ? `:${window.location.port}` : '';
  const mobilePassportUrl = `${window.location.protocol}//${scanHost}${port}/passport/${passportId}`;
  const publicPassportUrl = `${window.location.origin}/passport/${passportId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobilePassportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name}'s Digital Skill Passport`,
          text: `Check out my verified digital skill credentials, projects, and certificates!`,
          url: mobilePassportUrl,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading && !profileData) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Calculating MongoDB stats & passport metrics...</p>
      </div>
    );
  }

  const stats = profileData?.stats || {
    profileCompletion: 0,
    checklist: [],
    totalSkills: 0,
    totalProjects: 0,
    totalCertificates: 0,
    totalAchievements: 0,
    verifiedCredentials: 0,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Phone Scan QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 p-7 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scan with Camera</h3>
                  <p className="text-[11px] text-slate-400">Opens real-time passport on phone</p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white rounded-2xl inline-block shadow-xl mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
                  mobilePassportUrl
                )}`}
                alt="Passport QR Code"
                className="w-56 h-56 mx-auto object-contain block"
              />
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block">
                {passportId}
              </span>
              <p className="text-[11px] text-slate-400 font-mono break-all px-2 select-all">
                {mobilePassportUrl}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied URL' : 'Copy URL'}</span>
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold border border-indigo-500/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Database Sync</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Your Digital Skill Passport is live. All metrics below are computed directly from MongoDB and update dynamically in real time.
            </p>
          </div>

          {/* QR Passport Hero Card */}
          <div className="bg-slate-950/90 p-5 rounded-2xl border border-indigo-500/30 flex items-center gap-4 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setShowQRModal(true)}
              title="Click to enlarge QR code for scanning"
              className="h-16 w-16 bg-white p-1 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer group"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  mobilePassportUrl
                )}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </button>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Official Passport ID
              </span>
              <p className="text-base font-mono font-extrabold text-white tracking-wider">
                {passportId}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Scan QR</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Profile Completion Meter (Section 28) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Profile Completion Status
            </h2>
            <p className="text-xs text-slate-400">
              Computed dynamically from your saved profile, projects, and credentials
            </p>
          </div>
          <span className="text-2xl font-extrabold text-indigo-400 font-mono">
            {stats.profileCompletion}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${stats.profileCompletion}%` }}
          />
        </div>

        {/* Checklist Breakdown */}
        {stats.checklist && stats.checklist.length > 0 && (
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stats.checklist.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  item.completed
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                )}
                <span className="truncate font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5 Real-Time Stat Cards (Section 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Skills */}
        <Link
          to="/student/skills"
          className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-sm space-y-2 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Skills</span>
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalSkills}</p>
          <p className="text-[11px] text-indigo-400 flex items-center gap-1 font-medium">
            Manage Skills <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Total Projects */}
        <Link
          to="/student/projects"
          className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-sm space-y-2 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            <FolderGit2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalProjects}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            View Projects <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Total Certificates */}
        <Link
          to="/student/certificates"
          className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-sm space-y-2 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Certificates</span>
            <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalCertificates}</p>
          <p className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
            Upload & Audit <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Total Achievements */}
        <Link
          to="/student/achievements"
          className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-sm space-y-2 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Achievements</span>
            <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalAchievements}</p>
          <p className="text-[11px] text-yellow-400 flex items-center gap-1 font-medium">
            Add Honors <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Verified Credentials */}
        <Link
          to="/student/credentials"
          className="p-5 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-500/30 shadow-sm space-y-2 transition-all group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified</span>
            <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.verifiedCredentials}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            ✓ Admin Verified <ArrowRight className="w-3 h-3" />
          </p>
        </Link>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/student/profile"
          className="p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group space-y-3"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
            Edit Student Profile
          </h3>
          <p className="text-xs text-slate-400">
            Update bio, contact phone, university degree, department, LinkedIn, and GitHub links.
          </p>
        </Link>

        <Link
          to="/student/skills"
          className="p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group space-y-3"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            Add Skills & Projects
          </h3>
          <p className="text-xs text-slate-400">
            Populate your technical skills and project repositories for your interactive Radar Chart.
          </p>
        </Link>

        <Link
          to="/student/qr"
          className="p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group space-y-3"
        >
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-violet-400 transition-colors">
            Preview QR Passport
          </h3>
          <p className="text-xs text-slate-400">
            Inspect what recruiters and employers see when they scan your physical or digital QR code.
          </p>
        </Link>
      </div>
    </div>
  );
}
