import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import { getFileUrl } from '../utils/fileUrl';
import {
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  FileText,
  UploadCloud,
  X,
  Search,
  Filter,
  Loader2,
  Download
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'PENDING', 'VERIFIED', 'REJECTED'];

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates');
      setCertificates(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();

    // Real-time Socket.IO listeners
    const onCertUploaded = (newCert) => {
      setCertificates((prev) => {
        if (prev.some((c) => c._id === newCert._id)) return prev;
        return [newCert, ...prev];
      });
    };

    const onCertUpdated = (updatedCert) => {
      setCertificates((prev) =>
        prev.map((c) => (c._id === updatedCert._id ? updatedCert : c))
      );
    };

    const onCertDeleted = (deletedId) => {
      setCertificates((prev) => prev.filter((c) => c._id !== deletedId));
    };

    socket.on('certificateUploaded', onCertUploaded);
    socket.on('certificateUpdated', onCertUpdated);
    socket.on('certificateDeleted', onCertDeleted);
    socket.on('certificateVerified', onCertUpdated);

    return () => {
      socket.off('certificateUploaded', onCertUploaded);
      socket.off('certificateUpdated', onCertUpdated);
      socket.off('certificateDeleted', onCertDeleted);
      socket.off('certificateVerified', onCertUpdated);
    };
  }, []);

  const openAddModal = () => {
    setFormData({
      title: '',
      issuer: '',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: '',
    });
    setSelectedFile(null);
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File exceeds 5MB size limit.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer) return;

    setSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('name', formData.title);
    data.append('issuer', formData.issuer);
    if (formData.issueDate) data.append('issueDate', formData.issueDate);
    if (formData.expirationDate) data.append('expirationDate', formData.expirationDate);
    if (formData.credentialId) data.append('credentialId', formData.credentialId);
    if (formData.credentialUrl) data.append('credentialUrl', formData.credentialUrl);
    if (selectedFile) {
      data.append('file', selectedFile);
    }

    try {
      const res = await api.post('/certificates', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCertificates((prev) => [res.data.data, ...prev]);
      setSuccess('Certificate uploaded! Submitted to admin verification queue (PENDING).');
      closeModal();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to upload certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (id, title) => {
    if (!window.confirm(`Delete certificate "${title}"?`)) return;

    try {
      await api.delete(`/certificates/${id}`);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
      setSuccess(`Certificate removed`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete certificate');
    }
  };

  const filteredCerts = certificates.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(search.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(search.toLowerCase()) ||
      (cert.credentialId && cert.credentialId.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status, rejectionReason) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 cursor-help"
            title={rejectionReason ? `Reason: ${rejectionReason}` : 'Rejected by Admin'}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING AUDIT</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Certificates & Verified Credentials Vault
          </h1>
          <p className="text-sm text-slate-400">
            Upload PDF/Image proofs with credential IDs. Verified credentials appear on your permanent QR passport.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Certificate</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && !modalOpen && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_FILTERS.map((status) => {
          const count =
            status === 'All'
              ? certificates.length
              : certificates.filter((c) => c.status === status).length;
          const active = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs uppercase font-semibold block">{status}</span>
              <span className="text-2xl font-extrabold font-mono text-white block mt-1">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by certificate title, issuer, credential ID..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-xs">Loading certificates from MongoDB...</p>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-3">
          <Award className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No certificates found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== 'All'
              ? 'No records match your filter criteria.'
              : 'Click "Upload Certificate" to submit your achievements for admin verification.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCerts.map((cert) => {
            const fileDownloadUrl = cert.fileUrl
              ? getFileUrl(cert.fileUrl)
              : null;

            return (
              <div
                key={cert._id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {cert.issuer}
                    </span>
                    {getStatusBadge(cert.status, cert.rejectionReason)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {cert.title}
                    </h3>
                    {cert.credentialId && (
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        ID: {cert.credentialId}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>
                      Issued:{' '}
                      <span className="text-slate-300">
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </p>
                    {cert.expirationDate && (
                      <p>
                        Expires:{' '}
                        <span className="text-slate-300">
                          {new Date(cert.expirationDate).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>

                  {cert.status === 'REJECTED' && cert.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      <p className="font-semibold">Rejection Feedback:</p>
                      <p className="text-[11px] mt-0.5">{cert.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {fileDownloadUrl && (
                      <a
                        href={fileDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Document</span>
                      </a>
                    )}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                        title="External Credential Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCertificate(cert._id, cert.title)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete Certificate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal with Multer Integration */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                Upload & Verify Certificate
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Certificate Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services, Coursera, HackerRank"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AWS-837492"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Credential URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Multer File Upload Drag & Drop Area */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Attach Certificate Proof (PDF, PNG, JPG • Max 5MB)
                </label>
                <div className="p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-emerald-400 text-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-slate-300 text-xs">
                        Click or drag document to upload
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        PDF or Images up to 5MB supported
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Uploading to Server...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
