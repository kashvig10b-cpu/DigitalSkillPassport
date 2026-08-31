import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../utils/fileUrl';
import {
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
  Search,
  Check,
  X,
  Building,
  GraduationCap,
  LogOut,
  ShieldAlert,
  Globe,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('certs'); // 'certs' | 'recruiters'
  const [stats, setStats] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [recruiterFilter, setRecruiterFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [search, setSearch] = useState('');
  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingCert, setRejectingCert] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, certsRes, recruitersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/certificates'),
        api.get('/admin/recruiters').catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data?.data || null);
      setCertificates(certsRes.data?.data || []);
      setRecruiters(recruitersRes.data?.data || []);
      setActionError(null);
    } catch (err) {
      setActionError(err.message || 'Failed to load admin verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecruiter = async (recruiterId) => {
    try {
      setProcessingId(recruiterId);
      const res = await api.put(`/admin/recruiters/${recruiterId}/approve`);
      setRecruiters((prev) =>
        prev.map((r) => (r._id === recruiterId ? { ...r, recruiterStatus: 'APPROVED', isVerifiedRecruiter: true } : r))
      );
      setStats((prev) =>
        prev ? { ...prev, pendingRecruiters: Math.max(0, (prev.pendingRecruiters || 1) - 1) } : prev
      );
      setActionSuccess(res.data?.message || 'Recruiter verified and approved!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to approve recruiter');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRecruiter = async (recruiterId) => {
    try {
      setProcessingId(recruiterId);
      const res = await api.put(`/admin/recruiters/${recruiterId}/reject`);
      setRecruiters((prev) =>
        prev.map((r) => (r._id === recruiterId ? { ...r, recruiterStatus: 'REJECTED', isVerifiedRecruiter: false } : r))
      );
      setStats((prev) =>
        prev ? { ...prev, pendingRecruiters: Math.max(0, (prev.pendingRecruiters || 1) - 1) } : prev
      );
      setActionSuccess(res.data?.message || 'Recruiter rejected.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to reject recruiter');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchAdminData();

    // Join admin room for real-time submissions
    socket.emit('joinRoom', 'admin_room');

    const handleCertUploaded = (newCert) => {
      setCertificates((prev) => [newCert, ...prev.filter((c) => c._id !== newCert._id)]);
      setStats((prev) => (prev ? { ...prev, pendingCerts: prev.pendingCerts + 1 } : prev));
      setActionSuccess(`New certificate submitted: "${newCert.title}"`);
      setTimeout(() => setActionSuccess(null), 4000);
    };

    const handleCertUpdated = (updatedCert) => {
      setCertificates((prev) =>
        prev.map((c) => (c._id === updatedCert._id ? updatedCert : c))
      );
    };

    const handleCertDeleted = (id) => {
      setCertificates((prev) => prev.filter((c) => c._id !== id));
    };

    const handleRecruiterUpdated = (updatedRecruiter) => {
      setRecruiters((prev) => [updatedRecruiter, ...prev.filter((r) => r._id !== updatedRecruiter._id)]);
    };

    socket.on('certificateUploaded', handleCertUploaded);
    socket.on('certificateUpdated', handleCertUpdated);
    socket.on('certificateDeleted', handleCertDeleted);
    socket.on('recruiterUpdated', handleRecruiterUpdated);

    return () => {
      socket.off('certificateUploaded', handleCertUploaded);
      socket.off('certificateUpdated', handleCertUpdated);
      socket.off('certificateDeleted', handleCertDeleted);
      socket.off('recruiterUpdated', handleRecruiterUpdated);
    };
  }, []);

  const handleVerify = async (cert) => {
    setProcessingId(cert._id);
    setActionError(null);
    try {
      const res = await api.put(`/admin/certificates/${cert._id}/verify`);
      const updated = res.data.data;
      setCertificates((prev) =>
        prev.map((c) => (c._id === cert._id ? { ...c, ...updated } : c))
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pendingCerts: Math.max(0, prev.pendingCerts - 1),
              verifiedCerts: prev.verifiedCerts + 1,
            }
          : prev
      );
      setActionSuccess(`Verified & stamped "${cert.title}" for ${cert.studentId?.name || 'student'}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Verification failed');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (cert) => {
    setRejectingCert(cert);
    setRejectReason('Unable to verify credential against issuing organization database.');
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectingCert(null);
    setRejectReason('');
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!rejectingCert) return;

    setProcessingId(rejectingCert._id);
    setActionError(null);
    try {
      const res = await api.put(`/admin/certificates/${rejectingCert._id}/reject`, {
        reason: rejectReason,
      });
      const updated = res.data.data;
      setCertificates((prev) =>
        prev.map((c) => (c._id === rejectingCert._id ? { ...c, ...updated } : c))
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pendingCerts: Math.max(0, prev.pendingCerts - 1),
            }
          : prev
      );
      setActionSuccess(`Certificate marked REJECTED with feedback`);
      closeRejectModal();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Rejection update failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = certificates.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(q) ||
      c.issuer.toLowerCase().includes(q) ||
      (c.studentId?.name && c.studentId.name.toLowerCase().includes(q)) ||
      (c.credentialId && c.credentialId.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const filteredRecruiters = recruiters.filter((r) => {
    const matchesStatus = recruiterFilter === 'ALL' || r.recruiterStatus === recruiterFilter;
    const q = recruiterSearch.toLowerCase();
    const matchesSearch =
      !recruiterSearch ||
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      (r.company || r.college)?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Accreditation & Verification Authority
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as <span className="text-slate-200 font-semibold">{user?.name}</span> ({user?.email}) • Real-Time Administrative Audit
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Live Audit Socket Active
              </span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Action Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('certs')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'certs'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Student Certificate Accreditations</span>
            {stats?.pendingCerts > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px]">
                {stats.pendingCerts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recruiters')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'recruiters'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Recruiter Security & Verification</span>
            {stats?.pendingRecruiters > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] animate-pulse">
                {stats.pendingRecruiters} Pending
              </span>
            )}
          </button>
        </div>

        {activeTab === 'certs' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-amber-500/20 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Audit</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold font-mono text-white">
              {stats ? stats.pendingCerts : '...'}
            </p>
            <p className="text-[11px] text-slate-500">Awaiting official review</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/20 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Badges</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold font-mono text-white">
              {stats ? stats.verifiedCerts : '...'}
            </p>
            <p className="text-[11px] text-slate-500">Live verified passports</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-indigo-500/20 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold font-mono text-white">
              {stats ? stats.totalStudents : '...'}
            </p>
            <p className="text-[11px] text-slate-500">Registered candidate profiles</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Recruiters</span>
              <Building className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold font-mono text-white">
              {stats ? stats.totalRecruiters : '...'}
            </p>
            <p className="text-[11px] text-slate-500">Talent scouts searching candidates</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {['PENDING', 'VERIFIED', 'REJECTED', 'All'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status === 'PENDING' ? 'Pending Queue' : status}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, certificate, issuer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Verification Queue Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-xs">Loading certificate audit queue...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No certificates in this filter</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submissions in the selected category have been addressed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((cert) => {
              const fileDownloadUrl = cert.fileUrl
                ? getFileUrl(cert.fileUrl)
                : null;
              const isProcessing = processingId === cert._id;

              return (
                <div
                  key={cert._id}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all"
                >
                  {/* Student & Cert Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {cert.issuer}
                      </span>
                      {cert.status === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED BY ADMIN
                        </span>
                      )}
                      {cert.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                      {cert.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          <Clock className="w-3 h-3" /> PENDING AUDIT
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white">{cert.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold text-slate-200">
                          {cert.studentId?.name || 'Student Candidate'}
                        </span>
                        {cert.studentId?.college && (
                          <span className="text-slate-500 font-mono">
                            ({cert.studentId.college})
                          </span>
                        )}
                      </div>

                      {cert.credentialId && (
                        <span className="font-mono text-slate-400">
                          ID: <span className="text-slate-300">{cert.credentialId}</span>
                        </span>
                      )}

                      <span>
                        Submitted:{' '}
                        <span className="text-slate-300 font-mono">
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                    </div>

                    {cert.status === 'REJECTED' && cert.rejectionReason && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                        <span className="font-semibold">Rejection Note: </span>
                        <span>{cert.rejectionReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Proof Links */}
                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                    {fileDownloadUrl && (
                      <a
                        href={fileDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 transition-all"
                      >
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Inspect Document</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}

                    {cert.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(cert)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve & Verify</span>
                        </button>

                        <button
                          onClick={() => openRejectModal(cert)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}

        {/* RECRUITER VERIFICATION TAB */}
        {activeTab === 'recruiters' && (
          <div className="space-y-6">
            {/* Recruiter Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-amber-500/20 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending Recruiter Reviews</span>
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold font-mono text-white">
                  {recruiters.filter((r) => r.recruiterStatus === 'PENDING').length}
                </p>
                <p className="text-[11px] text-slate-500">Awaiting identity & company verification</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/20 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Verified Recruiters</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold font-mono text-white">
                  {recruiters.filter((r) => r.recruiterStatus === 'APPROVED').length}
                </p>
                <p className="text-[11px] text-slate-500">Authorized to browse candidates and resumes</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-indigo-500/20 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-indigo-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Registered Employers</span>
                  <Building className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold font-mono text-white">
                  {recruiters.length}
                </p>
                <p className="text-[11px] text-slate-500">Total employer accounts created</p>
              </div>
            </div>

            {/* Recruiter Filter & Search Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                {[
                  { id: 'ALL', label: 'All Recruiters' },
                  { id: 'PENDING', label: 'Pending Review' },
                  { id: 'APPROVED', label: 'Verified' },
                  { id: 'REJECTED', label: 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRecruiterFilter(tab.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      recruiterFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recruiterSearch}
                  onChange={(e) => setRecruiterSearch(e.target.value)}
                  placeholder="Search recruiter, company, or email..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Recruiter List */}
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <p className="text-xs">Loading recruiter verification records...</p>
              </div>
            ) : filteredRecruiters.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
                <Building className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Recruiters Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No recruiter accounts match the selected filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredRecruiters.map((rec) => {
                  const isProcessing = processingId === rec._id;
                  const isPending = rec.recruiterStatus === 'PENDING';
                  const isApproved = rec.recruiterStatus === 'APPROVED';

                  return (
                    <div
                      key={rec._id}
                      className={`p-6 rounded-3xl bg-slate-900/60 border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                        isPending
                          ? 'border-amber-500/40 shadow-lg shadow-amber-950/20'
                          : isApproved
                          ? 'border-slate-800 hover:border-emerald-500/30'
                          : 'border-rose-500/30 opacity-75'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base font-bold text-white">{rec.name}</h3>
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                              ● Pending University Approval
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified Employer
                            </span>
                          )}
                          {rec.recruiterStatus === 'REJECTED' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                              ✕ Access Rejected
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5 text-white font-medium">
                            <Building className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{rec.company || rec.college || 'No Company Provided'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-slate-300">
                            <span>{rec.email}</span>
                          </div>

                          {rec.companyWebsite && (
                            <a
                              href={rec.companyWebsite.startsWith('http') ? rec.companyWebsite : `https://${rec.companyWebsite}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-mono"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Website / Profile</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <div className="text-[11px] text-slate-500">
                            Registered: {new Date(rec.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end lg:self-center">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApproveRecruiter(rec._id)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Approve & Grant Access</span>
                            </button>

                            <button
                              onClick={() => handleRejectRecruiter(rec._id)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => handleRejectRecruiter(rec._id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Revoke Access</span>
                          </button>
                        )}

                        {rec.recruiterStatus === 'REJECTED' && (
                          <button
                            onClick={() => handleApproveRecruiter(rec._id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Re-Approve</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reject Reason Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  Reject Certificate
                </h3>
                <button
                  onClick={closeRejectModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Rejecting <span className="font-semibold text-white">{rejectingCert?.title}</span>. Provide detailed feedback so the student can rectify and resubmit:
              </p>

              <form onSubmit={handleRejectConfirm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Reason / Instructions for Student
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs resize-y"
                    placeholder="Explain why the certificate is rejected..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeRejectModal}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === rejectingCert?._id}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {processingId === rejectingCert?._id ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
